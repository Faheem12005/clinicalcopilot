# clinicalcopilot.py
import json
import sys
from pathlib import Path
from typing import List
import os
from google import genai  # Gemini API client

# --------------------------
# Local modules
# --------------------------
from ingester import FHIRIngester
from index_patient import chroma_client, index_simplified_data
from query_expander import expand_query

# --------------------------
# Gemini Client Setup
# --------------------------
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
if not GEMINI_API_KEY:
    raise ValueError("Set the GEMINI_API_KEY environment variable")
client = genai.Client(api_key=GEMINI_API_KEY)


# --------------------------
# Pipeline Orchestrator
# --------------------------

def process_fhir_file(fhir_path: str) -> str:
    """
    Step 1: Load FHIR bundle -> Step 2: Simplify -> Step 3: Index into Chroma.
    Returns the patient_id used for indexing.
    """
    if not Path(fhir_path).exists():
        raise FileNotFoundError(f"FHIR file not found: {fhir_path}")

    with open(fhir_path, "r", encoding="utf-8") as f:
        bundle = json.load(f)

    ingester = FHIRIngester()
    simplified = ingester.extract_all_patient_resources(bundle)

    # Save simplified patient JSON
    out_path = Path(f"simplified_patient.json")
    with open(out_path, "w", encoding="utf-8") as f:
        json.dump(simplified, f, indent=2)
    print(f"✅ Simplified FHIR data saved to {out_path}")

    # Index into ChromaDB
    patient_id_idx = index_simplified_data(simplified)
    print(f"✅ Patient {patient_id_idx} indexed into ChromaDB")

    return patient_id_idx


def retrieve_chunks(patient_id: str, query: str, top_k: int = 10) -> List[str]:
    """
    Step 4: Expand query -> Step 5: Retrieve relevant chunks from Chroma.
    """
    expanded_queries = expand_query(query, method="semantic")
    print(f"🔎 Expanded queries: {expanded_queries}")

    collection = chroma_client.get_or_create_collection("patient_chunks")
    results = []

    for q in expanded_queries:
        hits = collection.query(
            query_texts=[q],
            n_results=top_k,
            where={"patient_id": patient_id},
            include=["documents"]
        )
        for doc in hits.get("documents", [[]])[0]:
            print("Doc", doc)
            results.append(doc)

    # Deduplicate while preserving order
    unique_chunks = list(dict.fromkeys(results))
    return unique_chunks[:top_k]
import re

def answer_query_gemini(patient_id: str, query: str) -> dict:
    """
    Generate a structured JSON answer using retrieved chunks with Gemini API.
    Output includes:
      - care_options: list of recommendations with reasoning, citations, and relevant data
      - conflicts: list of detected conflicts (e.g., MRI + metal implant)
    """
    chunks = retrieve_chunks(patient_id, query)
    print(f"📄 Retrieved {len(chunks)} chunks")

    context_text = "\n".join(chunks[:8]) if chunks else "No patient-specific data available."

    prompt = f"""
You are a clinical assistant. Use the following patient data and query to provide
structured, machine-readable output in strict JSON format.

Patient Data:
{context_text}

Query: {query}

Respond ONLY with a valid JSON object in the following schema:

{{
  "care_options": [
    {{
      "recommendation": "string",
      "reasoning": "string",
      "citations": ["list of references or empty"],
      "relevant_patient_data": ["list of data points"]
    }}
  ],
  "conflicts": [
    {{
      "issue": "string",
      "reasoning": "string",
      "conflicting_data": ["list of conflicting patient data"]
    }}
  ]
}}

- If no conflicts exist, return "conflicts": [].
- Ensure JSON is valid and can be parsed directly.
"""

    try:
        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=prompt
        )
        raw_text = response.text.strip()
        print("🔧 Raw LLM output:", raw_text)

        # --- Fix: strip Markdown fences if present ---
        cleaned = re.sub(r"^```(?:json)?", "", raw_text, flags=re.IGNORECASE).strip()
        cleaned = re.sub(r"```$", "", cleaned).strip()

        return json.loads(cleaned)
    except json.JSONDecodeError as je:
        print("⚠️ Failed to parse JSON:", je)
        return {"care_options": [], "conflicts": [], "error": f"Invalid JSON returned by LLM: {je}"}
    except Exception as e:
        print("⚠️ Gemini API call failed:", e)
        return {"care_options": [], "conflicts": [], "error": f"API call failed: {e}"}

# --------------------------
# CLI Entry
# --------------------------
if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage:")
        print("  python clinicalcopilot.py <FHIR_JSON_PATH>")
        sys.exit(1)

    fhir_path = sys.argv[1]

    # Steps 1-3: Ingest and index, get indexed patient ID
    patient_id_idx = process_fhir_file(fhir_path)

    # Steps 4-6: Interactive querying
    while True:
        query = input("\n❓ Enter your clinical query (or 'exit'): ").strip()
        if query.lower() in ["exit", "quit"]:
            print("👋 Exiting Clinical Copilot.")
            break
        answer = answer_query_gemini(patient_id_idx, query)
        print("\n💡 Answer:\n")
        print(json.dumps(answer, indent=2))
        print()
