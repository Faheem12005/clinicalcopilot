# index_patient.py
import json
import uuid
from pathlib import Path
from typing import Dict, List
import chromadb
from chromadb.utils import embedding_functions

# --- CONFIG ---
OPENAI_API_KEY = "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"
VECTOR_DB_DIR = "./patient_vectors"

# --- Chroma Init ---
chroma_client = chromadb.PersistentClient(path=VECTOR_DB_DIR)
embedding_fn = embedding_functions.OpenAIEmbeddingFunction(
    api_key=OPENAI_API_KEY,
    model_name="text-embedding-3-large"
)

collection = chroma_client.get_or_create_collection(
    name="patient_chunks",
    embedding_function=embedding_fn # type: ignore
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
        val = obs.get("value") if not isinstance(obs.get("value"), dict) else obs["value"].get("value") or obs["value"].get("text")
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
