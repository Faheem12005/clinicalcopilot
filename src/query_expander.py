from typing import List
from sentence_transformers import SentenceTransformer, util

# --------------------------
# Model Setup
# --------------------------
MODEL_NAME = "all-MiniLM-L6-v2"  # small, fast, decent quality
model = SentenceTransformer(MODEL_NAME)

# --------------------------
# Static synonym pool (seed concepts)
# --------------------------
STATIC_SYNONYMS = {
    "pain": ["ache", "discomfort", "tenderness", "soreness"],
    "fall": ["trauma", "injury", "accident"],
    "leg": ["limb", "lower extremity", "thigh", "knee", "calf"],
    "fracture": ["broken bone", "crack", "break"],
    "swelling": ["edema", "inflammation"]
}
# Flatten pool into one list for semantic search
SYNONYM_POOL = [word for group in STATIC_SYNONYMS.values() for word in group]

# Precompute embeddings for synonym pool
pool_embeddings = model.encode(SYNONYM_POOL, convert_to_tensor=True, normalize_embeddings=True)

# --------------------------
# Semantic Expansion
# --------------------------
def semantic_expand(query: str, top_k: int = 8) -> List[str]:
    """
    Expand a query using semantic similarity against synonym pool.
    Returns a list of sub-queries including the original.
    """
    query_embedding = model.encode(query, convert_to_tensor=True, normalize_embeddings=True)
    
    # Find most similar candidates
    hits = util.semantic_search(query_embedding, pool_embeddings, top_k=top_k)[0]
    
    # Collect expansions
    expansions = [SYNONYM_POOL[hit['corpus_id']] for hit in hits]
    
    # Always include original query
    expansions.insert(0, query)
    
    # Deduplicate
    return list(dict.fromkeys(expansions))

# --------------------------
# Unified Interface
# --------------------------
def expand_query(query: str, method: str = "semantic") -> List[str]:
    """
    Unified function to expand a query using the selected method.
    method: 'semantic' (default)
    """
    if method == "semantic":
        return semantic_expand(query)
    else:
        raise ValueError(f"Unknown method: {method}")

# --------------------------
# Demo / Test
# --------------------------
if __name__ == "__main__":
    test_query = "leg pain after fall"
    print("Semantic expansion:")
    print(expand_query(test_query, method="semantic"))
