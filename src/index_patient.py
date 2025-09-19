import json
import uuid
from pathlib import Path
import chromadb
from chromadb.utils import embedding_functions
import os
from dotenv import load_dotenv
from typing import Dict, List
from sentence_transformers import SentenceTransformer

# --- CONFIG ---
load_dotenv()
VECTOR_DB_DIR = "./patient_vectors"


# --- Chroma Init ---
chroma_client = chromadb.PersistentClient(path=VECTOR_DB_DIR)
collection = chroma_client.get_or_create_collection(
    name="patient_chunks",
    embedding_function=embedding_functions.SentenceTransformerEmbeddingFunction(
        model_name="all-MiniLM-L6-v2" 
    ) # type: ignore
)

def flatten_simplified_data(data: Dict) -> List[Dict]:
    chunks = []
    patient_id = str(uuid.uuid4())
    
    # Patient info
    if "patient" in data and data["patient"]:
        patient = data["patient"][0]
        patient_text = f"Patient: {patient.get('name')}, Gender: {patient.get('gender')}, Birth Date: {patient.get('birthDate')}"
        chunks.append({
            "text": patient_text,
            "type": "patient",
            "id": f"patient_{patient_id}"
        })
    
    # Conditions
    for i, condition in enumerate(data.get("conditions", [])):
        chunks.append({
            "text": f"Condition: {condition}",
            "type": "condition",
            "id": f"condition_{i}_{patient_id}"
        })
    
    # Observations
    for i, observation in enumerate(data.get("observations", [])):
        chunks.append({
            "text": f"Observation: {observation}",
            "type": "observation",
            "id": f"observation_{i}_{patient_id}"
        })
    
    # Medications
    for i, medication in enumerate(data.get("medications", [])):
        chunks.append({
            "text": f"Medication: {medication}",
            "type": "medication",
            "id": f"medication_{i}_{patient_id}"
        })
    
    # Procedures
    for i, procedure in enumerate(data.get("procedures", [])):
        chunks.append({
            "text": f"Procedure: {procedure}",
            "type": "procedure",
            "id": f"procedure_{i}_{patient_id}"
        })
    
    # Allergies
    for i, allergy in enumerate(data.get("allergies", [])):
        chunks.append({
            "text": f"Allergy: {allergy}",
            "type": "allergy",
            "id": f"allergy_{i}_{patient_id}"
        })
    
    # Diagnostic Reports
    for i, report in enumerate(data.get("diagnostic_reports", [])):
        chunks.append({
            "text": f"Diagnostic Report: {report}",
            "type": "diagnostic_report",
            "id": f"report_{i}_{patient_id}"
        })
    
    # Immunizations
    for i, immunization in enumerate(data.get("immunizations", [])):
        chunks.append({
            "text": f"Immunization: {immunization}",
            "type": "immunization",
            "id": f"immunization_{i}_{patient_id}"
        })
    
    # Encounters
    for i, encounter in enumerate(data.get("encounters", [])):
        chunks.append({
            "text": f"Encounter: {encounter}",
            "type": "encounter",
            "id": f"encounter_{i}_{patient_id}"
        })
    
    return chunks, patient_id

def index_simplified_data(data: Dict):
    chunks, patient_id = flatten_simplified_data(data)
    
    collection.add(
        documents=[c["text"] for c in chunks],
        metadatas=[{"patient_id": patient_id, "type": c["type"]} for c in chunks],
        ids=[c["id"] for c in chunks]
    )
    
    print(f"Indexed {len(chunks)} chunks for patient with ID {patient_id}")
    return patient_id

if __name__ == "__main__":
    json_path = "simplified_patient_data.json"
    if not Path(json_path).exists():
        print(f"File not found: {json_path}")
        exit(1)

    with open(json_path, "r", encoding="utf-8") as f:
        data = json.load(f)
    
    patient_id = index_simplified_data(data)
    
    # Show what's in the database
    print("\nCollections:", chroma_client.list_collections())
    print("\nSample documents:")
    sample = collection.peek(limit=5)
    for i, doc in enumerate(sample['documents']):
        print(f"{i+1}. {doc}")
    
    print(f"\nYou can query the patient data using patient_id: {patient_id}")
