# fhir_ingester_extended.py
import json
from typing import Dict, List, Any, Set

class FHIRIngester:
    """
    Extended FHIR R4 Bundle ingester.
    Extracts clinically relevant information from key FHIR resources,
    removes duplicates, and outputs a simplified JSON structure.
    """

    def __init__(self):
        self.supported_resources = {
            "Condition": self.extract_condition,
            "Observation": self.extract_observation,
            "MedicationRequest": self.extract_medication_request,
            "Procedure": self.extract_procedure,
            "AllergyIntolerance": self.extract_allergy_intolerance,
            "DiagnosticReport": self.extract_diagnostic_report,
            "Patient": self.extract_patient,
            "Immunization": self.extract_immunization,
            "Encounter": self.extract_encounter,
            "CarePlan": self.extract_careplan,
            "Claim": self.extract_claim
        }

    def extract_all_patient_resources(self, bundle: Dict[str, Any]) -> Dict[str, List[Any]]:
        """
        Iterates through all entries in a FHIR Bundle and extracts simplified resources.
        Uses sets to remove duplicates.
        """
        simplified_data = {
            "conditions": set(),
            "observations": set(),
            "medications": set(),
            "procedures": set(),
            "allergies": set(),
            "diagnostic_reports": set(),
            "immunizations": set(),
            "encounters": set(),
            "careplans": set(),
            "claims_diagnoses": set(),
            "patient": []
        }

        entries = bundle.get("entry", [])
        for entry in entries:
            resource = entry.get("resource", {})
            resource_type = resource.get("resourceType")
            if resource_type in self.supported_resources:
                try:
                    simplified = self.supported_resources[resource_type](resource)
                    if simplified:
                        key = self.map_resource_to_key(resource_type)
                        # Handle patient separately (list)
                        if key == "patient":
                            simplified_data[key].append(simplified)
                        # For other types, use sets to deduplicate
                        elif isinstance(simplified, (str, tuple)):
                            simplified_data[key].add(simplified)
                        elif isinstance(simplified, list):
                            simplified_data[key].update(simplified)
                        else:
                            simplified_data[key].add(tuple(simplified.items()))
                except Exception as e:
                    print(f"Warning: Failed to extract {resource_type}: {e}")
            else:
                continue

        # Convert sets back to lists for JSON serialization
        for k, v in simplified_data.items():
            if isinstance(v, set):
                # Convert tuple back to dict if needed
                new_list = []
                for item in v:
                    if isinstance(item, tuple):
                        new_list.append(dict(item))
                    else:
                        new_list.append(item)
                simplified_data[k] = new_list

        return simplified_data

    @staticmethod
    def map_resource_to_key(resource_type: str) -> str:
        mapping = {
            "Condition": "conditions",
            "Observation": "observations",
            "MedicationRequest": "medications",
            "Procedure": "procedures",
            "AllergyIntolerance": "allergies",
            "DiagnosticReport": "diagnostic_reports",
            "Patient": "patient",
            "Immunization": "immunizations",
            "Encounter": "encounters",
            "CarePlan": "careplans",
            "Claim": "claims_diagnoses"
        }
        return mapping.get(resource_type, "unknown")

    # ------------------- Resource-specific extractors -------------------

    def extract_condition(self, resource: Dict[str, Any]) -> str:
        code = resource.get("code", {}).get("text")
        return code

    def extract_observation(self, resource: Dict[str, Any]) -> str:
        # Keep value and unit for uniqueness
        value = None
        unit = None
        if "valueQuantity" in resource:
            value = resource["valueQuantity"].get("value")
            unit = resource["valueQuantity"].get("unit")
        elif "valueString" in resource:
            value = resource.get("valueString")
        elif "valueCodeableConcept" in resource:
            value = resource["valueCodeableConcept"].get("text")
        code = resource.get("code", {}).get("text")
        if value:
            return f"{code}: {value} {unit if unit else ''}".strip()
        return code

    def extract_medication_request(self, resource: Dict[str, Any]) -> str:
        med = resource.get("medicationCodeableConcept", {}).get("text")
        return med

    def extract_procedure(self, resource: Dict[str, Any]) -> str:
        return resource.get("code", {}).get("text")

    def extract_allergy_intolerance(self, resource: Dict[str, Any]) -> str:
        return resource.get("code", {}).get("text")

    def extract_diagnostic_report(self, resource: Dict[str, Any]) -> str:
        return resource.get("code", {}).get("text")

    def extract_patient(self, resource: Dict[str, Any]) -> Dict[str, Any]:
        name_obj = resource.get("name", [{}])[0]
        name = None
        if name_obj:
            name = " ".join(name_obj.get("given", []) + [name_obj.get("family", "")])
        return {"name": name, "gender": resource.get("gender"), "birthDate": resource.get("birthDate")}

    def extract_immunization(self, resource: Dict[str, Any]) -> str:
        return resource.get("vaccineCode", {}).get("text")

    def extract_encounter(self, resource: Dict[str, Any]) -> str:
        # Keep encounter type as unique identifier
        type_text = resource.get("type", [{}])[0].get("text")
        return type_text

    def extract_careplan(self, resource: Dict[str, Any]) -> str:
        # Keep only the summary or title
        return resource.get("description") or resource.get("title") # type: ignore

    def extract_claim(self, resource: Dict[str, Any]) -> List[str]:
        # Extract diagnoses from claim items
        diagnoses = set()
        for item in resource.get("diagnosis", []):
            code = item.get("diagnosisCodeableConcept", {}).get("text")
            if code:
                diagnoses.add(code)
        return list(diagnoses)


if __name__ == "__main__":
    # Load a sample FHIR Bundle JSON
    with open("../fhir/Abdul218_Harris789_b0a06ead-cc42-aa48-dad6-841d4aa679fa.json", "r", encoding="utf-8") as f:
        bundle = json.load(f)

    ingester = FHIRIngester()
    simplified = ingester.extract_all_patient_resources(bundle)

    # Save simplified JSON
    with open("simplified_patient_data.json", "w", encoding="utf-8") as f:
        json.dump(simplified, f, indent=2)

    print("✅ Simplified FHIR data saved to simplified_patient_data.json")
