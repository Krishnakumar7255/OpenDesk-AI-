# Troubleshooting

## `ERR_CONNECTION_REFUSED` at `localhost:8000`
Backend is stopped, crashed, or listening on a different port. Run `backend\run.bat`, wait for `Application startup complete.`, then open `http://localhost:8000/api/health`.

## `useEffect must not return anything besides a function` / `destroy is not a function`
Search the frontend for `useEffect(async` and `useEffect(() => refresh()`. Do not return a Promise from an effect. Use `useEffect(() => { void refresh(); }, [refresh]);`. If you just changed files, stop the old Vite terminal with Ctrl+C, restart it and hard-refresh the browser with Ctrl+Shift+R.

## `Module not found` in frontend
Open a terminal in `frontend` and run `npm install`, then `npm run dev`.

## `No module named fastapi` or `uvicorn`
Run `backend\run.bat`, or activate `backend\.venv` and run `pip install -r requirements.txt`.

## Port already in use
Stop the older process using Ctrl+C in its terminal. Backend default is 8000; frontend default is 5173. If you change the backend port, update `frontend/.env` (`VITE_API_URL`) and restart Vite.

## CORS error
Check `backend/.env.example`. Set `CORS_ORIGINS` to the exact frontend origin, e.g. `http://localhost:5173`. Restart the backend after changing environment variables.

## PDF uploads but no text found
The PDF may be scanned/image-only. OCR is not implemented in this starter; use a text-based PDF or add an OCR pipeline as a separate task.

## Reset uploaded data
Use the Clear knowledge base button or `DELETE /api/documents`. Current session data is also cleared when the backend restarts.
