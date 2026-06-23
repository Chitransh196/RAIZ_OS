"""
RAG Retriever: FAISS vector store for DSA knowledge base.
Uses sentence-transformers for embeddings.
"""
from __future__ import annotations
import os
from pathlib import Path
import faiss
import numpy as np

_retriever: "DSARetriever | None" = None

KB_PATH = Path(__file__).parent / "dsa_knowledge_base.txt"


def _chunk_knowledge_base(path: Path, chunk_size: int = 300) -> list[str]:
    """Split knowledge base into chunks by section (## headers)."""
    text = path.read_text()
    sections = [s.strip() for s in text.split("##") if s.strip()]
    chunks = []
    for sec in sections:
        # Split long sections into ~chunk_size char pieces
        words = sec.split()
        current = []
        char_count = 0
        for word in words:
            current.append(word)
            char_count += len(word) + 1
            if char_count >= chunk_size:
                chunks.append(" ".join(current))
                current = []
                char_count = 0
        if current:
            chunks.append(" ".join(current))
    return chunks


class DSARetriever:
    def __init__(self):
        self.chunks: list[str] = []
        self.index: faiss.IndexFlatIP | None = None
        self._loaded = False

    def load(self):
        if self._loaded:
            return
        try:
            from sentence_transformers import SentenceTransformer
            self.model = SentenceTransformer("all-MiniLM-L6-v2")
            self.chunks = _chunk_knowledge_base(KB_PATH)
            embeddings = self.model.encode(self.chunks, normalize_embeddings=True)
            dim = embeddings.shape[1]
            self.index = faiss.IndexFlatIP(dim)
            self.index.add(embeddings.astype(np.float32))
            self._loaded = True
        except Exception as e:
            print(f"[RAG] Warning: Could not load FAISS/sentence-transformers: {e}")
            self._loaded = False

    def retrieve(self, query: str, top_k: int = 3) -> list[str]:
        if not self._loaded or self.index is None:
            return self._keyword_fallback(query)
        try:
            q_vec = self.model.encode([query], normalize_embeddings=True).astype(np.float32)
            scores, idxs = self.index.search(q_vec, top_k)
            return [self.chunks[i] for i in idxs[0] if i < len(self.chunks)]
        except Exception:
            return self._keyword_fallback(query)

    def _keyword_fallback(self, query: str) -> list[str]:
        """Simple keyword matching when FAISS unavailable."""
        query_lower = query.lower()
        scored = []
        for chunk in self.chunks:
            score = sum(1 for word in query_lower.split() if word in chunk.lower())
            if score > 0:
                scored.append((score, chunk))
        scored.sort(reverse=True)
        return [c for _, c in scored[:3]]


def get_retriever() -> DSARetriever:
    global _retriever
    if _retriever is None:
        _retriever = DSARetriever()
        _retriever.load()
    return _retriever


def retrieve_context(query: str, top_k: int = 3) -> str:
    """Retrieve relevant DSA context as a single string."""
    retriever = get_retriever()
    chunks = retriever.retrieve(query, top_k)
    return "\n\n---\n\n".join(chunks)
