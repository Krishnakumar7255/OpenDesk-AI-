const API_BASE = (import.meta.env.VITE_API_URL || 'http://localhost:8000').replace(/\/$/, '');

async function request(path, options = {}) {
  let response;
  try {
    response = await fetch(`${API_BASE}${path}`, options);
  } catch {
    throw new Error(`Cannot connect to the backend at ${API_BASE}. Start the backend with backend\run.bat.`);
  }
  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    const detail = typeof body.detail === 'string' ? body.detail : `Request failed (${response.status}).`;
    throw new Error(detail);
  }
  return body;
}

export const api = {
  baseUrl: API_BASE,
  health: () => request('/api/health'),
  documents: () => request('/api/documents'),
  upload: (files) => {
    const form = new FormData();
    files.forEach((file) => form.append('files', file));
    return request('/api/upload', { method: 'POST', body: form });
  },
  ask: (question) => request('/api/chat', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ question }),
  }),
  clear: () => request('/api/documents', { method: 'DELETE' }),
};
