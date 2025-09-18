# index_patient.py
import json
import uuid
from pathlib import Path
from typing import Dict, List
import chromadb
from chromadb.utils import embedding_functions
import os
from dotenv import load_dotenv

# --- CONFIG ---
load_dotenv()
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
VECTOR_DB_DIR = "./patient_vectors"

# --- Chroma Init ---
chroma_client = chromadb.PersistentClient(path=VECTOR_DB_DIR)
# embedding_fn = embedding_functions.OpenAIEmbeddingFunction(
#     api_key=OPENAI_API_KEY,
#     model_name="text-embedding-3-large"
# )

collection = chroma_client.get_or_create_collection(
    name="patient_chunks",
    embedding_function=embedding_functions.DefaultEmbeddingFunction()# type: ignore
)

def flatten_snapshot(snapshot: Dict) -> List[Dict]:
    chunks = []
    # demographics
    demo = snapshot.get("demographics", {})
    demo_text = f"Demographics: {demo}"
    chunks.append({
        "text": demo_text,
        "type": "demographics",
        "id": snapshot.get("patient_id") or str(uuid.uuid4())
    })
    # observations
    for obs in snapshot.get("observations", []):
        val = obs.get("value")
        if isinstance(val, dict):
            # Join key/value pairs like "Systolic = 112 mmHg, Diastolic = 90 mmHg"
            val = ", ".join(f"{k}: {v}" for k, v in val.items())
        chunks.append({
            "text": f"Observation: {obs.get('code')} = {val} on {obs.get('date')}",
            "type": "observation",
            "id": obs.get("id") or str(uuid.uuid4())
        })

    # meds
    for med in snapshot.get("medications", []):
        chunks.append({
            "text": f"Medication: {med}",
            "type": "medication",
            "id": med.get("id") or str(uuid.uuid4())
        })
    return chunks

def index_snapshot(snapshot: Dict):
    chunks = flatten_snapshot(snapshot)
    collection.add(
        documents=[c["text"] for c in chunks],
        metadatas=[{"patient_id": snapshot.get("patient_id"), "type": c["type"]} for c in chunks],
        ids=[c["id"] for c in chunks]
    )
    print(f"Indexed {len(chunks)} chunks for patient {snapshot.get('patient_id')}")

if __name__ == "__main__":
    snapshot = json.load(open("patient_snapshot.json"))
    index_snapshot(snapshot)

    chroma_client = chromadb.PersistentClient(path="./patient_vectors")
    collection = chroma_client.get_or_create_collection("patient_chunks")

    # See what’s inside
    print("Collections:", chroma_client.list_collections())
    print("Sample docs:", collection.peek())
