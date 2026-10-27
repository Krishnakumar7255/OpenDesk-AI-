import { useState } from 'react';
import { ExternalLink, Menu } from 'lucide-react';
import Sidebar from './components/Sidebar.jsx';
import UploadPanel from './components/UploadPanel.jsx';
import ChatPanel from './components/ChatPanel.jsx';
import { useWorkspace } from './hooks/useWorkspace.js';
import { api } from './services/api.js';
import { getErrorMessage } from './utils/format.js';

export default function App() {
  const { documents, health, error: workspaceError, setError: setWorkspaceError, refresh } = useWorkspace();
  const [messages, setMessages] = useState([]);
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [chatError, setChatError] = useState('');
  const [uploadError, setUploadError] = useState('');

  async function uploadFiles(files) {
    setUploading(true); setUploadError('');
    try {
      const result = await api.upload(files);
      setMessages((current) => [...current, { role: 'assistant', text: `Added ${result.added?.length || 0} file(s) to your knowledge base. Indexed ${result.total_chunks || 0} passage(s). Ask a question about them.` }]);
      await refresh({ quiet: true });
      return true;
    } catch (error) {
      setUploadError(getErrorMessage(error, 'Upload failed.'));
      return false;
    } finally { setUploading(false); }
  }

  async function askQuestion(question) {
    if (busy) return;
    setBusy(true); setChatError('');
    setMessages((current) => [...current, { role: 'user', text: question }]);
    try {
      const result = await api.ask(question);
      setMessages((current) => [...current, { role: 'assistant', text: result.answer || 'The API returned an empty answer.', sources: result.sources || [], grounded: result.grounded, mode: result.mode }]);
    } catch (error) {
      setChatError(getErrorMessage(error, 'Question failed.'));
    } finally { setBusy(false); }
  }

  async function clearKnowledge() {
    if (!window.confirm('Remove all uploaded documents from this session?')) return;
    setWorkspaceError(''); setUploadError(''); setChatError('');
    try {
      await api.clear();
      setMessages([]);
      await refresh({ quiet: true });
    } catch (error) {
      setWorkspaceError(getErrorMessage(error, 'Could not clear documents.'));
    }
  }

  return <div className="app-shell">
    <Sidebar documents={documents} health={health} onAddFiles={() => document.getElementById('opendesk-file-input')?.click()} onClear={clearKnowledge} />
    <main className="main"><header className="topbar"><div className="mobile-brand"><Menu size={18} /> OpenDesk AI</div><div className="breadcrumb">Workspace <span>/</span> <b>Document chat</b></div><div className="top-right"><div className={`api-status ${health ? '' : 'offline'}`}><span /> {health ? 'API connected' : 'API offline'}</div><a className="github-link" href="https://github.com/Krishnakumar7255" target="_blank" rel="noreferrer">Open source <ExternalLink size={13} /></a></div></header>
      <div className="content"><div className="page-heading"><div className="eyebrow"><span className="eyebrow-line" /> YOUR DOCUMENTS, UNDERSTOOD</div><h1>Find the answer.<br /><span>See the evidence.</span></h1><p className="subhead">A knowledge assistant that answers from your files — with sources you can verify.</p><div className="trust-row"><div>◇ Source-grounded</div><div>⌕ Searchable knowledge</div><div>◎ Honest when unsure</div></div></div>
        {(workspaceError || (!health && !workspaceError)) && <div className="error-box connection-banner">{workspaceError || `Backend offline. Start the backend from the backend folder (run.bat). API: ${api.baseUrl}`}</div>}
        <UploadPanel onUpload={uploadFiles} uploading={uploading} error={uploadError} setError={setUploadError} />
        <ChatPanel documents={documents} onAsk={askQuestion} busy={busy} messages={messages} error={chatError} setError={setChatError} />
        <footer><span>OPENDESK AI <span className="footer-dot">·</span> OPEN SOURCE KNOWLEDGE</span><span>Built for transparency, not guesswork.</span></footer>
      </div>
    </main>
  </div>;
}
