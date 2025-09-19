from transformers import AutoModelForSeq2SeqLM, AutoTokenizer, pipeline

# --------------------------
# Load Local Model
# --------------------------
MODEL_NAME = "google/flan-t5-base"  # swap with a med-specific one if available
tokenizer = AutoTokenizer.from_pretrained(MODEL_NAME)
model = AutoModelForSeq2SeqLM.from_pretrained(MODEL_NAME)

# Q&A pipeline
qa_pipeline = pipeline(
    "text2text-generation",
    model=model,
    tokenizer=tokenizer,
    device=0  # set -1 for CPU, 0 for GPU
)

# --------------------------
# Answer Generator
# --------------------------
def generate_answer(query: str, retrieved_chunks: list[str]) -> str:
    """
    Takes a query and retrieved text chunks, and generates a concise, 
    evidence-grounded answer.
    """
    # Join top retrieved chunks into context
    context = "\n".join(retrieved_chunks[:8])  # keep it short for model
    prompt = f"Answer the question using the context only.\n\nContext:\n{context}\n\nQuestion: {query}\nAnswer:"

    # Generate
    output = qa_pipeline(prompt, max_length=2000,, num_beams=4, early_stopping=True)
    return output[0]["generated_text"]

# --------------------------
# Demo
# --------------------------
if __name__ == "__main__":
    query = "What test should be done for skin issues?"
    retrieved = [
        "Patient reports severe pain in the left leg after fall.",
        "Swelling and tenderness observed near knee.",
        "Fracture suspected based on clinical exam.",
        "Standard procedure involves X-ray imaging to confirm bone fracture."
    ]
    
    answer = generate_answer(query, retrieved)
    print("Answer:", answer)
