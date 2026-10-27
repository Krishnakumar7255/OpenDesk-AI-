from fastapi.testclient import TestClient
from app.main import app, chunks, documents, index

client = TestClient(app)

def setup_function():
    documents.clear()
    chunks.clear()
    index.rebuild(chunks)

def test_health_endpoint():
    response = client.get('/api/health')
    assert response.status_code == 200
    assert response.json()['status'] == 'ok'

def test_documents_empty_at_start():
    response = client.get('/api/documents')
    assert response.status_code == 200
    assert response.json()['documents'] == []

def test_chat_without_documents_is_honest():
    response = client.post('/api/chat', json={'question': 'What is in the project?'})
    assert response.status_code == 200
    assert response.json()['grounded'] is False
    assert response.json()['sources'] == []

def test_upload_txt_then_search_and_clear():
    text = b'OpenDesk AI is a document assistant. It uses TF-IDF retrieval to find relevant passages in uploaded files.'
    response = client.post('/api/upload', files=[('files', ('notes.txt', text, 'text/plain'))])
    assert response.status_code == 200, response.text
    assert response.json()['total_documents'] == 1
    chat = client.post('/api/chat', json={'question': 'What retrieval method does OpenDesk use?'})
    assert chat.status_code == 200
    assert chat.json()['grounded'] is True
    assert chat.json()['sources'][0]['filename'] == 'notes.txt'
    cleared = client.delete('/api/documents')
    assert cleared.json()['status'] == 'cleared'
    assert client.get('/api/documents').json()['documents'] == []

def test_rejects_unsupported_extension():
    response = client.post('/api/upload', files=[('files', ('secret.exe', b'not allowed', 'application/octet-stream'))])
    assert response.status_code == 415
