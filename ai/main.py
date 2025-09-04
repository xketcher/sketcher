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


# ----------------------
# Helper functions
# ----------------------
def normalize(text: str) -> str:
    text = text.replace("\u200b", "")
    text = re.sub(r"[ \t]+", " ", text)
    text = re.sub(r"\n{2,}", "\n", text)
    return text.strip()

def split_into_sentences(text: str) -> List[str]:
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


# ----------------------
# Load data (from GitHub raw)
# ----------------------
DATA_URL = "https://raw.githubusercontent.com/xketcher/sketcher/main/data.txt"
RAW_TEXT = requests.get(DATA_URL).text

chunks = chunk_text(RAW_TEXT, chunk_size=600, overlap=140)
vectorizer = TfidfVectorizer(analyzer="char", ngram_range=(2, 5))
matrix = vectorizer.fit_transform(chunks)


# ----------------------
# FastAPI
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

    # အနည်းဆုံး တစ်ကြောင်း ထုတ်
    best = candidates[0]
    sentences = split_into_sentences(best)
    answer = sentences[0] if sentences else best[:300]

    return AnswerResponse(
        answer=answer,
        matches=[c[:150] + "…" for c in candidates]
    )
