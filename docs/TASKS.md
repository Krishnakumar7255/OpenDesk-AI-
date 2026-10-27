# Development task map

Use one task at a time; avoid changing the entire application when debugging one feature.

## Task 1 — Upload documents
Files: `frontend/src/components/UploadPanel.jsx`, `frontend/src/services/api.js`, `backend/app/main.py`, `backend/app/documents.py`.
Definition of done: valid PDF/TXT/MD can be uploaded; unsupported extensions and files over 12 MB show readable errors; sidebar count refreshes.

## Task 2 — Parse and chunk
File: `backend/app/documents.py`.
Definition of done: text files parse as UTF-8, markdown headings are kept as section labels, PDF pages retain page numbers, empty/scanned documents fail with a useful message.

## Task 3 — Retrieval and sources
Files: `backend/app/retrieval.py`, `backend/app/main.py`, `frontend/src/components/ChatPanel.jsx`.
Definition of done: relevant excerpts show filename, page/section and score; unrelated questions do not invent an answer.

## Task 4 — API status and connection handling
Files: `frontend/src/services/api.js`, `frontend/src/hooks/useWorkspace.js`, `backend/app/config.py`.
Definition of done: UI indicates offline status, backend health URL responds, CORS includes the frontend origin.

## Task 5 — Clear knowledge base
Files: `frontend/src/App.jsx`, `frontend/src/components/Sidebar.jsx`, `backend/app/main.py`.
Definition of done: confirmation appears, API deletes all current session documents/chunks, UI refreshes.

## Task 6 — UI changes
Files: `frontend/src/components/` and `frontend/src/style.css`.
Rule: keep API calls out of visual components when practical; reuse `services/api.js`.

## Task 7 — Tests and evaluation
Files: `backend/tests/test_api.py`, `evaluation/cases.json`.
Run `pytest -q`. Do not claim evaluation metrics until you have run a real evaluation and recorded the results.
