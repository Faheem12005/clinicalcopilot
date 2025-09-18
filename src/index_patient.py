# index_patient.py
import json
from pathlib import Path
from typing import List, Dict
from openai import OpenAI
import chromadb
from chromadb.utils import embedding_functions
import uuid

# --- CONFIG ---
OPENAI_API_KEY = "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"
VECTOR_DB_DIR = "./patient_vectors"  # folder to persist vector DB

# --- Initialize OpenAI client ---
client = OpenAI(api_key=OPENAI_API_KEY)

# --- Initialize Chroma DB (new API) ---
chroma_client = chromadb.PersistentClient(path=VECTOR_DB_DIR)

embedding_fn = embedding_functions.OpenAIEmbeddingFunction(
    api_key=OPENAI_API_KEY,
    model_name="text-embedding-3-large"
)

collection_name = "patient_chunks"
if collection_name in [c.name for c in chroma_client.list_collections()]:
    collection = chroma_client.get_collection(collection_name)
else:
    collection = chroma_client.create_collection(
        name=collection_name,
        embedding_function=embedding_fn
    )

# --- Flatten snapshot into chunks ---

def flatten_snapshot(snapshot: Dict) -> List[Dict]:
    chunks = []

    # demographics
    demo_text = f"Name: {snapshot['demographics'].get('name')}, " \
                f"Gender: {snapshot['demographics'].get('gender')}, " \
                f"BirthDate: {snapshot['demographics'].get('birthDate')}, " \
                f"Address: {snapshot['demographics'].get('address')}, " \
                f"Race: {snapshot['demographics'].get('race')}, " \
                f"Ethnicity: {snapshot['demographics'].get('ethnicity')}"
    chunks.append({
        "text": demo_text,
        "type": "demographics",
        "id": snapshot.get("patient_id") or str(uuid.uuid4())
    })

    # observations
    for obs in snapshot.get("observations", []):
    # Extract value
        if isinstance(obs.get("value"), dict):
            val = obs["value"].get("value") or obs["value"].get("text") or str(obs["value"])
        else:
            val = obs.get("value") or "N/A"
        
        obs_text = f"{obs.get('code')}: {val} on {obs.get('date') or obs.get('issued')}"
        chunks.append({
            "text": obs_text,
            "type": "observation",
            "id": obs.get("id") or f"{snapshot.get('patient_id')}_{obs.get('code')}_{obs.get('date')}"
        })

    # medications
    for med in snapshot.get("medications", []):
        med_name = med.get("medication", {}).get("text") if isinstance(med.get("medication"), dict) else str(med.get("medication"))
        med_text = f"{med_name} ({med.get('status')})"
        chunks.append({
            "text": med_text,
            "type": "medication",
            "id": med.get("id") or str(uuid.uuid4())
        })

    # encounters
    for enc in snapshot.get("encounters", []):
        enc_text = f"Encounter {enc.get('id')}: status {enc.get('status')}, type {', '.join(enc.get('type', []))}, from {enc.get('start')} to {enc.get('end')}"
        chunks.append({
            "text": enc_text,
            "type": "encounter",
            "id": enc.get("id") or str(uuid.uuid4())
        })

    return chunks


# --- Index chunks into Chroma ---
def index_snapshot(snapshot: Dict):
    chunks = flatten_snapshot(snapshot)
    texts = [c["text"] for c in chunks]
    ids = [c["id"] for c in chunks]
    metadatas = [{"patient_id": snapshot.get("patient_id"), "type": c["type"], "text": c["text"]} for c in chunks]

    collection.add(
        documents=texts,
        metadatas=metadatas,
        ids=ids
    )
    # No persist() needed with PersistentClient
    print(f"Indexed {len(chunks)} chunks for patient {snapshot.get('patient_id')}")

# --- Query helper ---
def query_patient(patient_id: str, query_text: str, top_k: int = 5):
    results = collection.query(
        query_texts=[query_text],
        n_results=top_k,
        where={"patient_id": patient_id}
    )
    return results

# --- MAIN ---
def main():
    snapshot_file = Path("patient_snapshot.json")  # output from ingester.py
    if not snapshot_file.exists():
        print(f"{snapshot_file} not found. Please run ingester.py first.")
        return

    with snapshot_file.open() as f:
        snapshot = json.load(f)

    # Index snapshot
    index_snapshot(snapshot)

    # Optional test query
    test_results = query_patient(snapshot.get("patient_id"), "tobacco usage")
    print("Top retrievals:")
    for doc, score in zip(test_results['documents'][0], test_results['distances'][0]):
        print(f"- {doc} (score={score})")

if __name__ == "__main__":
    main()
