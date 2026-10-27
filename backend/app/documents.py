"""Document extraction and chunking. Keep file parsing isolated for easy debugging."""
from __future__ import annotations
import io
import re
from pathlib import Path
from typing import Any
from fastapi import HTTPException
from pypdf import PdfReader
from .config import ALLOWED_EXTENSIONS, MAX_FILE_BYTES


def extract_pages(filename: str, data: bytes) -> list[dict[str, Any]]:
    extension = Path(filename).suffix.lower()
    if extension not in ALLOWED_EXTENSIONS:
        raise HTTPException(status_code=415, detail=f'{filename}: unsupported file type. Use PDF, TXT, or MD.')
    if not data:
        raise HTTPException(status_code=400, detail=f'{filename}: file is empty.')
    if len(data) > MAX_FILE_BYTES:
        raise HTTPException(status_code=413, detail=f'{filename}: file exceeds 12 MB limit.')
    if extension == '.pdf':
        try:
            reader = PdfReader(io.BytesIO(data))
            pages = []
            for page_number, page in enumerate(reader.pages, start=1):
                text = page.extract_text() or ''
                if text.strip():
                    pages.append({'text': text, 'page': page_number, 'section': f'Page {page_number}'})
            return pages
        except Exception as exc:
            raise HTTPException(status_code=400, detail=f'Could not read {filename}. Scanned PDFs are not OCR-processed.') from exc
    text = data.decode('utf-8', errors='replace')
    if extension == '.txt':
        return [{'text': text, 'page': None, 'section': 'Document'}] if text.strip() else []
    sections: list[dict[str, Any]] = []
    heading = 'Document'
    buffer: list[str] = []
    for line in text.splitlines():
        match = re.match(r'^#{1,6}\s+(.+)', line)
        if match:
            if buffer and '\n'.join(buffer).strip():
                sections.append({'text': '\n'.join(buffer), 'page': None, 'section': heading})
            heading, buffer = match.group(1).strip(), [line]
        else:
            buffer.append(line)
    if buffer and '\n'.join(buffer).strip():
        sections.append({'text': '\n'.join(buffer), 'page': None, 'section': heading})
    return sections


def chunk_text(text: str, size: int = 900, overlap: int = 140) -> list[str]:
    text = re.sub(r'\s+', ' ', text).strip()
    if not text:
        return []
    if size <= 0 or overlap < 0 or overlap >= size:
        raise ValueError('Require size > overlap >= 0.')
    result: list[str] = []
    start = 0
    while start < len(text):
        end = min(len(text), start + size)
        if end < len(text):
            boundary = text.rfind(' ', start + size // 2, end)
            if boundary > start:
                end = boundary
        part = text[start:end].strip()
        if part:
            result.append(part)
        if end >= len(text):
            break
        start = max(start + 1, end - overlap)
    return result
