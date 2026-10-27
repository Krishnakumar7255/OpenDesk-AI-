
"""FastAPI endpoints for OpenDesk AI."""

from __future__ import annotations

import re
import uuid
from pathlib import Path
from typing import Any

from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from .config import APP_NAME, CORS_ORIGINS
from .documents import chunk_text, extract_pages
from .retrieval import RetrievalIndex

app = FastAPI(
    title=APP_NAME,
    version="1.1.0",
    description="Local, source-grounded document assistant",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=False,
    allow_methods=["GET", "POST", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

documents: dict[str, dict[str, Any]] = {}
chunks: list[dict[str, Any]] = []
index = RetrievalIndex()


class ChatRequest(BaseModel):
    question: str = Field(min_length=2, max_length=1500)
    top_k: int = Field(default=4, ge=1, le=8)


class ChatResponse(BaseModel):
    answer: str
    grounded: bool
    sources: list[dict[str, Any]]
    mode: str



def make_direct_answer(question: str, sources: list[dict[str, Any]]) -> str:
    """Extract concise answers from retrieved document evidence."""
    text = " ".join(source["excerpt"] for source in sources)
    q = question.lower().strip()

    patterns = [
        (
            r"\b(?:what is|what's|tell me)\s+(?:my\s+)?(?:current\s+)?cgpa\b|\bmy cgpa\b",
            r"\b(?:current\s+)?cgpa\s*(?:is|of|:|-)?\s*([0-9]+(?:\.[0-9]+)?)",
            "Your CGPA is {}.",
        ),
        (
            r"\b(?:what is|what's|tell me)\s+(?:my\s+)?name\b|\bmy name\b",
            r"\bmy name is\s+([^.,;\n]+)",
            "Your name is {}.",
        ),
        (
            r"\b(?:what is|what's|tell me)\s+(?:my\s+)?college(?: name)?\b"
            r"|\bwhich college\b|\bwhat college\b|\bname of my college\b"
            r"|\bwhere\s+(?:am i|do i)\s+studying\b|\bwhere do i study\b",
            r"\b(?:at|from|attend(?:ing)?)\s+"
            r"((?:Government|National|Indian|Institute|College|University)"
            r"[^.\n]{0,100})",
            "You are studying at {}.",
        ),
        (
            r"\bwhat am i studying\b|\bwhat is my (?:degree|course|major)\b"
            r"|\bwhich (?:course|degree)\b",
            r"\b(?:student studying|studying|specializing in|specialising in)"
            r"\s+([^.,;\n]{2,80})",
            "The document says you are studying {}.",
        ),
    ]

    for question_pattern, evidence_pattern, answer_template in patterns:
        if re.search(question_pattern, q):
            match = re.search(evidence_pattern, text, re.IGNORECASE)
            if match:
                value = match.group(1).strip(" \t.:#*-")
                if value:
                    return answer_template.format(value)

    return (
        "I found relevant information in your documents:\n\n"
        + sources[0]["excerpt"]
    )



@app.get("/api/health")
def health() -> dict[str, Any]:
    return {
        "status": "ok",
        "app": APP_NAME,
        "documents": len(documents),
        "chunks": len(chunks),
        "cors_origins": CORS_ORIGINS,
    }


@app.get("/api/documents")
def list_documents() -> dict[str, Any]:
    return {"documents": list(documents.values())}


@app.post("/api/upload")
async def upload_files(files: list[UploadFile] = File(...)) -> dict[str, Any]:
    if not files:
        raise HTTPException(
            status_code=400,
            detail="Choose at least one file to upload.",
        )

    staged_docs: list[dict[str, Any]] = []
    staged_chunks: list[dict[str, Any]] = []

    for file in files:
        filename = Path(file.filename or "upload").name
        data = await file.read()
        pages = extract_pages(filename, data)
        file_chunks: list[dict[str, Any]] = []

        for page in pages:
            for piece in chunk_text(page["text"]):
                file_chunks.append(
                    {
                        "id": uuid.uuid4().hex[:8],
                        "document_id": "",
                        "filename": filename,
                        "page": page.get("page"),
                        "section": page.get("section") or "Document",
                        "text": piece,
                    }
                )

        if not file_chunks:
            raise HTTPException(
                status_code=400,
                detail=f"{filename}: no readable text found.",
            )

        document_id = uuid.uuid4().hex[:8]

        for item in file_chunks:
            item["document_id"] = document_id

        staged_docs.append(
            {
                "id": document_id,
                "filename": filename,
                "chunks": len(file_chunks),
                "characters": sum(len(page["text"]) for page in pages),
            }
        )
        staged_chunks.extend(file_chunks)

    chunks.extend(staged_chunks)

    for document in staged_docs:
        documents[document["id"]] = document

    index.rebuild(chunks)

    return {
        "added": staged_docs,
        "total_documents": len(documents),
        "total_chunks": len(chunks),
    }


@app.post("/api/chat", response_model=ChatResponse)
def chat(request: ChatRequest) -> ChatResponse:
    if not chunks:
        return ChatResponse(
            answer="Upload a PDF, TXT, or Markdown document first.",
            grounded=False,
            sources=[],
            mode="no-documents",
        )

    sources = index.search(
        request.question,
        top_k=request.top_k,
        threshold=0.0,
    )

    if not sources:
        return ChatResponse(
            answer=(
                "I couldn't find evidence for that in your uploaded documents, "
                "so I won't guess. Try rephrasing your question."
            ),
            grounded=False,
            sources=[],
            mode="evidence-not-found",
        )

    answer = make_direct_answer(request.question, sources)

    return ChatResponse(
        answer=answer,
        grounded=True,
        sources=sources,
        mode="local extractive answer",
    )


@app.delete("/api/documents")
def clear_documents() -> dict[str, str]:
    documents.clear()
    chunks.clear()
    index.rebuild(chunks)
    return {"status": "cleared"}
