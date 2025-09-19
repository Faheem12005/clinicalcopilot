from flask import Flask, request, jsonify
import json
from datetime import datetime
from typing import Dict, Any

app = Flask(__name__)

DATA_STORE = {}

# --------------------------
# FHIR Ingester
# --------------------------
class FHIRIngester:
    """
    Simplified FHIR R4 Bundle ingester.
    Extracts clinically relevant info and deduplicates.
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

    def extract_all_patient_resources(self, bundle: Dict[str, Any]) -> Dict[str, Any]:
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

        for entry in bundle.get("entry", []):
            resource = entry.get("resource", {})
            resource_type = resource.get("resourceType")
            if resource_type in self.supported_resources:
                try:
                    simplified = self.supported_resources[resource_type](resource)
                    key = self.map_resource_to_key(resource_type)
                    if key == "patient":
                        simplified_data[key].append(simplified)
                    elif isinstance(simplified, (str, tuple)):
                        simplified_data[key].add(simplified)
                    elif isinstance(simplified, list):
                        simplified_data[key].update(simplified)
                    else:
                        simplified_data[key].add(tuple(simplified.items()))
                except Exception as e:
                    print(f"Warning: Failed to extract {resource_type}: {e}")

        # Convert sets to lists
        for k, v in simplified_data.items():
            if isinstance(v, set):
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

    def extract_condition(self, r): return r.get("code", {}).get("text")
    def extract_observation(self, r):
        value, unit = None, None
        if "valueQuantity" in r:
            value = r["valueQuantity"].get("value")
            unit = r["valueQuantity"].get("unit")
        elif "valueString" in r:
            value = r.get("valueString")
        elif "valueCodeableConcept" in r:
            value = r["valueCodeableConcept"].get("text")
        code = r.get("code", {}).get("text")
        return f"{code}: {value} {unit if unit else ''}".strip() if value else code
    def extract_medication_request(self, r): return r.get("medicationCodeableConcept", {}).get("text")
    def extract_procedure(self, r): return r.get("code", {}).get("text")
    def extract_allergy_intolerance(self, r): return r.get("code", {}).get("text")
    def extract_diagnostic_report(self, r): return r.get("code", {}).get("text")
    def extract_patient(self, r):
        name_obj = r.get("name", [{}])[0]
        name = " ".join(name_obj.get("given", []) + [name_obj.get("family", "")])
        return {"name": name, "gender": r.get("gender"), "birthDate": r.get("birthDate")}
    def extract_immunization(self, r): return r.get("vaccineCode", {}).get("text")
    def extract_encounter(self, r): return r.get("type", [{}])[0].get("text")
    def extract_careplan(self, r): return r.get("description") or r.get("title")
    def extract_claim(self, r):
        return [item.get("diagnosisCodeableConcept", {}).get("text")
                for item in r.get("diagnosis", []) if item.get("diagnosisCodeableConcept", {}).get("text")]

# --------------------------
# Helper functions for API
# --------------------------
def calculate_age(birthdate_str):
    try:
        birthdate = datetime.strptime(birthdate_str, "%Y-%m-%d")
        today = datetime.today()
        return today.year - birthdate.year - ((today.month, today.day) < (birthdate.month, birthdate.day))
    except:
        return 0

def parse_patient(data):
    p = data.get("patient", [{}])[0]
    return {
        "id": "1",
        "name": p.get("name", ""),
        "age": calculate_age(p.get("birthDate", "")),
        "gender": p.get("gender", ""),
        "mrn": "",
        "dob": p.get("birthDate", ""),
        "phone": "",
        "address": "",
        "emergencyContact": ""
    }

def parse_conditions(data): return [{"name": c, "onset": ""} for c in data.get("conditions", [])]
def parse_medications(data): return [{"name": m, "dose": ""} for m in data.get("medications", [])]
def parse_allergies(data): return [{"name": a, "reaction": ""} for a in data.get("allergies", [])]

def parse_vitals(data):
    vitals = []
    for obs in data.get("observations", []):
        obs_lower = obs.lower()
        if "heart rate" in obs_lower:
            try:
                hr = int(obs.split(":")[1].strip().split()[0])
                vitals.append({"time": "", "systolic": 0, "heartRate": hr})
            except:
                continue
    return vitals

def parse_lab_results(data):
    results = []
    for obs in data.get("observations", []):
        if ":" in obs:
            try:
                test, value = obs.split(":", 1)
                results.append({"test": test.strip(), "value": value.strip(), "status": "normal"})
            except:
                continue
    return results

# --------------------------
# API Endpoints
# --------------------------
@app.route("/upload", methods=["POST"])
def upload():
    global DATA_STORE
    if "file" not in request.files:
        return jsonify({"error": "No file part"}), 400
    
    file = request.files["file"]

    if file.filename == "":
        return jsonify({"error": "No file selected"}), 400

    try:
        content = file.read().decode("utf-8")  # read file bytes and decode
        bundle = json.loads(content)           # parse JSON from string
        ingester = FHIRIngester()
        DATA_STORE = ingester.extract_all_patient_resources(bundle)
        return jsonify({"status": "success"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 400

  

@app.route("/patient", methods=["GET"])
def get_patient(): return jsonify(parse_patient(DATA_STORE)) if DATA_STORE else jsonify({"error": "No data uploaded"}), 400
@app.route("/conditions", methods=["GET"])
def get_conditions(): return jsonify(parse_conditions(DATA_STORE)) if DATA_STORE else jsonify({"error": "No data uploaded"}), 400
@app.route("/medications", methods=["GET"])
def get_medications(): return jsonify(parse_medications(DATA_STORE)) if DATA_STORE else jsonify({"error": "No data uploaded"}), 400
@app.route("/allergies", methods=["GET"])
def get_allergies(): return jsonify(parse_allergies(DATA_STORE)) if DATA_STORE else jsonify({"error": "No data uploaded"}), 400
@app.route("/vitals", methods=["GET"])
def get_vitals(): return jsonify(parse_vitals(DATA_STORE)) if DATA_STORE else jsonify({"error": "No data uploaded"}), 400
@app.route("/lab-results", methods=["GET"])
def get_lab_results(): return jsonify(parse_lab_results(DATA_STORE)) if DATA_STORE else jsonify({"error": "No data uploaded"}), 400

# --------------------------
# Run server
# --------------------------
if __name__ == "__main__":
    app.run(debug=True)
