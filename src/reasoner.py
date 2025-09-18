import os
from google import genai
import chromadb
import requests
from dotenv import load_dotenv
# --- CONFIG ---
load_dotenv()
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
VECTOR_DB_DIR = "./patient_vectors"
PUBMED_API = "https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi"
PUBMED_SUMMARY = "https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi"

# --- Init Gemini client ---
client = genai.Client(api_key=GEMINI_API_KEY)

# --- Init Chroma ---
chroma_client = chromadb.PersistentClient(path=VECTOR_DB_DIR)
collection = chroma_client.get_collection("patient_chunks")

# --- Retrieval ---
def retrieve_patient_context(patient_id: str, query: str, top_k: int = 5):
    results = collection.query(
        query_texts=[query],
        n_results=top_k,
        where={"patient_id": str(patient_id)}  # ensure string
    )
    # Flatten documents list
    docs = results.get("documents", [])
    if docs and docs[0]:
        return docs[0]  # list of docs for first query
    return []


def fetch_pubmed(query: str, max_results: int = 3):
    params = {"db": "pubmed", "term": query, "retmax": max_results, "retmode": "json"}
    r = requests.get(PUBMED_API, params=params)
    ids = r.json()["esearchresult"]["idlist"]
    summaries = []
    for pmid in ids:
        s = requests.get(PUBMED_SUMMARY, params={"db": "pubmed", "id": pmid, "retmode": "json"}).json()
        doc = s["result"][pmid]
        summaries.append(f"{doc.get('title')} ({pmid})")
    return summaries

# --- RAG-style Reasoner ---
def reason(patient_id: str, doctor_query: str):
    # Retrieve patient context
    patient_chunks = retrieve_patient_context(patient_id, doctor_query)
    context_str = "\n".join([f"[{i}] {c}" for i, c in enumerate(patient_chunks)])

    # Retrieve evidence
    evidence = fetch_pubmed(doctor_query)
    evidence_str = "\n".join([f"[PubMed] {e}" for e in evidence])

    # Build full prompt (system + user)
    system_prompt = """You are a clinical decision support assistant.
Given patient data and research evidence, propose 3 possible care options.
Each option must include:
- Suggested treatment/diagnostic step
- Why it is relevant (using patient context)
- Evidence citation (PubMed ID or link)
Keep it short, precise, and clinically useful.
"""

    user_prompt = f"Doctor query: {doctor_query}\n\nPatient Context:\n{context_str}\n\nRelevant Evidence:\n{evidence_str}"

    full_prompt = system_prompt + "\n\n" + user_prompt
    print("Full Prompt:\n", full_prompt)  # Debugging
    # Call Gemini model
    # response = client.models.generate_content(
    #     model="gemini-2.5-flash",
    #     contents=[full_prompt], 
    # )

    # return response.text

# --- Example ---
if __name__ == "__main__":
    result = reason("8c2d5e9b-0717-9616-beb9-21296a5b547d", "blood pressure")
    print(result)
