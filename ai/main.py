# main.py
# -*- coding: utf-8 -*-
"""
FastAPI app for Pyay Ti Oo QA
"""

import re
import requests
from typing import List
from fastapi import FastAPI, Query
from pydantic import BaseModel
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from pythainlp.tokenize import word_tokenize


# ----------------------
# Helper functions
# ----------------------
def normalize(text: str) -> str:
    text = text.replace("\u200b", "")
    text = re.sub(r"[ \t]+", " ", text)
    text = re.sub(r"\n{2,}", "\n", text)
    return text.strip()

def split_into_sentences(text: str) -> List[str]:
    # Myanmar punctuation: ၊ (U+104A), ။ (U+104B), . ? ! \n
    parts = re.split(r"(?<=[\u104A\u104B\.\?\!\n])", text)
    return [s.strip() for s in parts if s.strip()]

def chunk_text(text: str, chunk_size=600, overlap=140) -> List[str]:
    text = normalize(text)
    sents = split_into_sentences(text)
    if not sents:
        sents = [text]
    chunks, cur = [], ""
    for s in sents:
        if len(cur) + len(s) <= chunk_size:
            cur += ("" if cur == "" else " ") + s
        else:
            if cur:
                chunks.append(cur)
            tail = cur[-overlap:] if len(cur) > overlap else cur
            cur = tail + " " + s
    if cur:
        chunks.append(cur)
    return chunks

def myanmar_tokenizer(text: str):
    # use safe, built-in engine (not attacut)
    return word_tokenize(text, engine="newmm")  


# ----------------------
# Load data from GitHub raw
# ----------------------
DATA_URL = "https://raw.githubusercontent.com/xketcher/sketcher/main/data.txt"
try:
    RAW_TEXT = requests.get(DATA_URL, timeout=10).text
except requests.RequestException as e:
    RAW_TEXT = ""
    print("Failed to load data:", e)

chunks = chunk_text(RAW_TEXT, chunk_size=600, overlap=140)
if not chunks:  # fallback
    chunks = ["ဒေတာမရရှိပါ။"]

vectorizer = TfidfVectorizer(tokenizer=myanmar_tokenizer, ngram_range=(1,2))
matrix = vectorizer.fit_transform(chunks)


# ----------------------
# FastAPI app
# ----------------------
app = FastAPI(title="Pyay Ti Oo QA API")

class AnswerResponse(BaseModel):
    answer: str
    matches: List[str]

@app.get("/ask", response_model=AnswerResponse)
def ask(query: str = Query(..., description="မေးချင်တဲ့မေးခွန်း (မြန်မာ)")):
    qv = vectorizer.transform([query])
    sims = cosine_similarity(qv, matrix)[0]

    ranked = sorted(zip(sims, chunks), key=lambda x: x[0], reverse=True)[:5]
    candidates = [c for _, c in ranked]

    best_sentence = ""
    best_score = 0.0
    for c in candidates:
        for s in split_into_sentences(c):
            if not s.strip():
                continue
            sv = vectorizer.transform([s])
            score = cosine_similarity(qv, sv)[0][0]
            if score > best_score:
                best_score = score
                best_sentence = s

    return AnswerResponse(
        answer=best_sentence if best_sentence else candidates[0],
        matches=[c[:150] + "…" for c in candidates]
    )
