import json
from collections import defaultdict

def _format_value_from_element(elem) -> str:
    """Return human-readable string for a FHIR observation element."""
    if not isinstance(elem, dict):
        return str(elem)

    if "valueQuantity" in elem:
        q = elem["valueQuantity"]
        val = q.get("value")
        unit = q.get("unit") or q.get("code") or ""
        return f"{val} {unit}".strip()

    if "valueCodeableConcept" in elem:
        vcc = elem["valueCodeableConcept"]
        if vcc.get("text"):
            return str(vcc.get("text"))
        coding = vcc.get("coding", [])
        if coding and isinstance(coding, list) and coding:
            return coding[0].get("display") or coding[0].get("code") or str(coding[0])
        return json.dumps(vcc)

    if "valueCoding" in elem:
        vc = elem["valueCoding"]
        return vc.get("display") or vc.get("code") or str(vc)

    for key in ("valueString", "valueBoolean", "valueDecimal", "valueInteger"):
        if key in elem:
            return str(elem.get(key))

    if "value" in elem:
        return str(elem.get("value"))

    return json.dumps(elem)


def extract_patient_snapshot_latest(bundle: dict) -> dict:
    resources = defaultdict(list)
    
    # Organize resources
    if bundle.get("resourceType") == "Bundle":
        for entry in bundle.get("entry", []):
            res = entry.get("resource", {})
            if "resourceType" in res:
                resources[res["resourceType"]].append(res)
    else:
        resources[bundle.get("resourceType", "Unknown")].append(bundle)
    
    # Demographics
    patient_res = resources.get("Patient", [{}])[0]
    extensions = {ext.get("url"): ext for ext in patient_res.get("extension", [])}

    given_names = " ".join(patient_res.get("name", [{}])[0].get("given", []) or [])
    family_name = patient_res.get("name", [{}])[0].get("family", "") or ""
    full_name = f"{given_names} {family_name}".strip() or None

    address_parts = []
    for k in ["line", "city", "state", "postalCode", "country"]:
        val = patient_res.get("address", [{}])[0].get(k)
        if isinstance(val, list):
            address_parts.append(" ".join([str(x) for x in val if x is not None]))
        elif val:
            address_parts.append(str(val))
    address_str = ", ".join(address_parts) if address_parts else None

    demographics = {
        "name": full_name,
        "gender": patient_res.get("gender"),
        "birthDate": patient_res.get("birthDate"),
        "address": address_str,
        "phone": (patient_res.get("telecom", [{}])[0].get("value") if patient_res.get("telecom") else None),
        "race": None,
        "ethnicity": None
    }
    race_ext = extensions.get("http://hl7.org/fhir/us/core/StructureDefinition/us-core-race")
    if race_ext:
        for sub in race_ext.get("extension", []):
            if sub.get("url") == "text" and sub.get("valueString"):
                demographics["race"] = sub["valueString"]
                break
    eth_ext = extensions.get("http://hl7.org/fhir/us/core/StructureDefinition/us-core-ethnicity")
    if eth_ext:
        for sub in eth_ext.get("extension", []):
            if sub.get("url") == "text" and sub.get("valueString"):
                demographics["ethnicity"] = sub["valueString"]
                break

    # --- Latest encounters per type ---
    latest_encounters = {}
    for enc in resources.get("Encounter", []):
        enc_types = [t.get("text") for t in enc.get("type", []) if t.get("text")]
        date = enc.get("period", {}).get("start")
        provider = enc.get("serviceProvider", {}).get("display")
        
        for t in enc_types:
            if t not in latest_encounters or (date and date > latest_encounters[t]["date"]):
                latest_encounters[t] = {"type": t, "date": date, "provider": provider}
    encounters = list(latest_encounters.values())

    # Observations (all retained)
    observations = []
    for obs in resources.get("Observation", []):
        code = obs.get("code", {}).get("text") or obs.get("code", {}).get("coding", [{}])[0].get("display")
        date = obs.get("effectiveDateTime") or obs.get("issued")
        value = None

        if "component" in obs and isinstance(obs["component"], list) and obs["component"]:
            components = {}
            for comp in obs["component"]:
                comp_code = comp.get("code", {}).get("text") or comp.get("code", {}).get("coding", [{}])[0].get("display") or "component"
                comp_val = _format_value_from_element(comp)
                components[comp_code] = comp_val
            value = components
        else:
            raw_value = None
            for key in ["valueQuantity", "valueCodeableConcept", "valueString", "valueBoolean", "valueDecimal", "valueInteger", "valueCoding"]:
                if key in obs:
                    raw_value = _format_value_from_element({key: obs[key]})
                    break
            if raw_value and isinstance(raw_value, str) and (";" in raw_value or "?" in raw_value):
                qa_dict = {}
                parts = [p.strip() for p in raw_value.split(";") if p.strip()]
                for p in parts:
                    if ": " in p:
                        q, a = p.split(": ", 1)
                        qa_dict[q.strip()] = a.strip()
                value = qa_dict if qa_dict else raw_value
            else:
                value = raw_value

        observations.append({
            "id": obs.get("id"),
            "code": code,
            "date": date,
            "status": obs.get("status"),
            "value": value
        })

    # Medications (all retained)
    medications = []
    for med in resources.get("MedicationRequest", []):
        med_name = med.get("medicationCodeableConcept", {}).get("text") or (med.get("medicationReference") or {}).get("display")
        medications.append({"medication": med_name, "status": med.get("status")})

    snapshot = {
        "patient_id": patient_res.get("id"),
        "demographics": demographics,
        "encounters": encounters,
        "observations": observations,
        "medications": medications
    }

    return snapshot


# Example usage
with open("../fhir/Zelda766_Ernser583_8c2d5e9b-0717-9616-beb9-21296a5b547d.json") as f:
    bundle = json.load(f)

import pprint
snapshot = extract_patient_snapshot_latest(bundle)

with open("patient_snapshot.json", "w") as f:
    json.dump(snapshot, f, indent=4)

pprint.pprint(snapshot)
