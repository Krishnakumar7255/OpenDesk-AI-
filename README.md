# OpenDesk AI — modular hackathon starter

**Your documents. Answers you can verify.** OpenDesk AI is a local document assistant that accepts PDF, TXT, and Markdown files, retrieves relevant passages, and displays source details. It prefers saying “I couldn't find evidence” instead of guessing.

## Feature checklist

- [x] Upload multiple PDF/TXT/MD files (12 MB per file)
- [x] Extract PDF page text and Markdown headings
- [x] Chunk text with overlap
- [x] TF-IDF retrieval (works locally; no model key required)
- [x] Show source filename, page/section, excerpt and similarity score
- [x] Ask questions and show an honest no-evidence response
- [x] List uploaded documents and clear the knowledge base
- [x] Health endpoint, CORS configuration, tests and evaluation examples
- [ ] Persistent storage (current data resets when backend restarts)
- [ ] OCR for scanned PDFs
- [ ] Authentication / multi-user workspaces

## Run on Windows

**Requirements:** Python 3.10+ and Node.js 18+.

1. Extract the ZIP into a normal writable folder.
2. Double-click `backend\run.bat`. The first run creates a virtual environment and installs Python dependencies. Keep this terminal open. Wait for `Application startup complete.`
3. Double-click `frontend\run.bat` in a second terminal. First run installs npm packages.
4. Open `http://localhost:5173`.
5. Verify API at `http://localhost:8000/api/health` and interactive docs at `http://localhost:8000/docs`.

You can also run `start-windows.bat` for the quick checklist. Backend and frontend must both be running.

## Debugging map — find each feature fast

| Task | Frontend file | Backend file | Test / verification |
|---|---|---|---|
| App entry / React mount | `frontend/src/main.jsx` | — | Browser console |
| Layout and page composition | `frontend/src/App.jsx` | — | `npm run build` |
| Upload selection / file-size checks | `frontend/src/components/UploadPanel.jsx` | `backend/app/main.py` (`/api/upload`) | `test_upload_txt_then_search_and_clear` |
| Chat composer / source cards | `frontend/src/components/ChatPanel.jsx` | `backend/app/main.py` (`/api/chat`) | Ask a question after upload |
| Sidebar / document list / clear button | `frontend/src/components/Sidebar.jsx` | `backend/app/main.py` (`/api/documents`, DELETE) | upload then clear |
| HTTP requests and connection errors | `frontend/src/services/api.js` | `backend/app/main.py` | `/api/health` |
| React data loading | `frontend/src/hooks/useWorkspace.js` | `/api/health`, `/api/documents` | Keep effects non-async |
| PDF/TXT/MD extraction and chunking | — | `backend/app/documents.py` | Upload sample docs |
| Search ranking | — | `backend/app/retrieval.py` | `evaluation/cases.json` |
| API settings and file limits | — | `backend/app/config.py` | `.env.example` |
| Automated API checks | — | `backend/tests/test_api.py` | `pytest -q` |
| Styling | `frontend/src/style.css` | — | browser responsive view |

## React useEffect rule (important)

Never write `useEffect(async () => { ... })` or `useEffect(() => refresh(), [])` when `refresh` is async. The effect callback must return `undefined` or a cleanup function, not a Promise. Use:

```jsx
useEffect(() => {
  void refresh();
}, [refresh]);
```

If you need cleanup, return a synchronous function from the effect. The `destroy is not a function` React error often follows when an effect accidentally returns a Promise.

## API endpoints

- `GET /api/health` — status and document/chunk counts
- `GET /api/documents` — current document list
- `POST /api/upload` — multipart form field `files` (repeat for multiple files)
- `POST /api/chat` — JSON: `{"question":"...", "top_k":4}`
- `DELETE /api/documents` — clear current session

## Tests

```bat
cd backend
.venv\Scripts\activate
pytest -q
```

Frontend production build:

```bat
cd frontend
npm install
npm run build
```

## Data and privacy limitations

The current MVP stores uploads in backend memory only. Restarting the API clears them. Scanned/image-only PDFs are not OCR'd. TF-IDF is lexical retrieval, not a neural semantic embedding model. Do not expose this unauthenticated development server publicly or upload sensitive files.

## Optional future tasks

See `docs/TASKS.md` for task-by-task extension ideas and `docs/TROUBLESHOOTING.md` for common issues.
