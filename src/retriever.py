from typing import List, Dict
from query_expander import expand_query
import chromadb
from chromadb.utils import embedding_functions
from sentence_transformers import SentenceTransformer
import os

# --------------------------
# Chroma / SentenceTransformer Setup
# --------------------------
VECTOR_DB_DIR = "./patient_vectors"



chroma_client = chromadb.PersistentClient(path=VECTOR_DB_DIR)
collection = chroma_client.get_or_create_collection(
    name="patient_chunks",
    embedding_function=embedding_functions.SentenceTransformerEmbeddingFunction(
        model_name="all-MiniLM-L6-v2"
    ) # type: ignore
)

# --------------------------
# Retrieval Function
# --------------------------
def retrieve_patient_chunks(
    query: str,
    n_results: int = 10,
    expansion_method: str = "heuristic"
) -> List[Dict]:
    """
    Retrieve top patient chunks from Chroma using expanded queries.
    
    Returns:
        List of dicts: [
            {"text": ..., "type": ..., "patient_id": ..., "score": ...},
            ...
        ]
    """
    # 1. Expand the query
    sub_queries = expand_query(query, method=expansion_method)
    
    all_results = []

    # 2. Search Chroma for each sub-query
    for sub_query in sub_queries:
        res = collection.query(
            query_texts=[sub_query],
            n_results=n_results,
            include=['documents', 'metadatas', 'distances']
        )
        # Chroma returns lists inside lists because query_texts is a list
        docs = res['documents'][0]
        metas = res['metadatas'][0]
        distances = res['distances'][0]
        
        for doc, meta, score in zip(docs, metas, distances):
            all_results.append({
                "text": doc,
                "type": meta.get("type"),
                "patient_id": meta.get("patient_id"),
                "score": score
            })
    
    # 3. Optional: remove duplicates (same text)
    seen_texts = set()
    unique_results = []
    for r in all_results:
        if r["text"] not in seen_texts:
            unique_results.append(r)
            seen_texts.add(r["text"])
    
    # 4. Sort by similarity score (descending)
    unique_results.sort(key=lambda x: x["score"], reverse=True)
    
    return unique_results

# --------------------------
# Demo / Test
# --------------------------
if __name__ == "__main__":
    query = "leg pain after fall"
    results = retrieve_patient_chunks(query, n_results=5, expansion_method="heuristic")
    
    print(f"Retrieved {len(results)} chunks for query: '{query}'\n")
    for i, r in enumerate(results, 1):
        print(f"{i}. [{r['type']}] {r['text']} (score: {r['score']:.4f})")
