# OpenDesk AI — Hackathon Submission Draft

## What it does
OpenDesk AI is a source-grounded document assistant. Users upload PDF, TXT, and Markdown files, ask natural-language questions, and receive relevant excerpts with file and page/section references. If retrieval finds no evidence, the app says so instead of guessing.

## Stack
React, Vite, FastAPI, pypdf, scikit-learn TF-IDF retrieval, pytest.

## What makes it useful
- Evidence-first answers with source snippets.
- Local retrieval works without a paid model/API key.
- Modular feature files make debugging and future contributions easier.
- Health endpoint, API tests, evaluation cases and troubleshooting guide included.

## Known limitations
In-memory data resets when backend restarts; scanned PDFs are not OCR'd; TF-IDF is lexical retrieval; no authentication; no measured evaluation results are claimed in this draft.

## Demo steps
1. Start backend and frontend.
2. Upload `sample_docs/START_HERE.md`.
3. Ask: “What file types can I upload?”
4. Show source excerpt and file reference.
5. Ask an unrelated question to demonstrate no-evidence behavior.
