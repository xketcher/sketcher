from fastapi import FastAPI, Query
from transformers import AutoModelForCausalLM, AutoTokenizer
import torch

app = FastAPI()

# Local model load (CPU friendly version: 1B~3B recommended for free server)
MODEL_NAME = "mosaicml/mpt-7b-instruct"  # GPU ရှိရင် 7B run, CPU only: smaller model recommend
tokenizer = AutoTokenizer.from_pretrained(MODEL_NAME)
model = AutoModelForCausalLM.from_pretrained(MODEL_NAME, device_map="auto")  # GPU မရှိရင် device_map=None

def generate_response(prompt_text: str) -> str:
    inputs = tokenizer(prompt_text, return_tensors="pt").to("cuda" if torch.cuda.is_available() else "cpu")
    outputs = model.generate(**inputs, max_new_tokens=100)
    return tokenizer.decode(outputs[0], skip_special_tokens=True)

@app.get("/generate")
def generate(message: str = Query(..., description="Message to generate response for")):
    response = generate_response(message)
    return {"input": message, "response": response}
