# OpenDesk AI sample document

OpenDesk AI is a local document assistant. It accepts PDF, TXT and Markdown documents up to 12 MB per file.

## How to run
Start the FastAPI backend on port 8000 and the Vite frontend on port 5173. The API health endpoint is `/api/health`.

## Retrieval
The starter uses TF-IDF to rank relevant passages. Answers show source excerpts and do not make claims when no matching evidence is found.
