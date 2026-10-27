import { BookOpen, FileText, ShieldCheck, Sparkles, Trash2 } from 'lucide-react';
import { formatBytes } from '../utils/format.js';

export default function Sidebar({ documents, health, onAddFiles, onClear }) {
  return <aside className="sidebar">
    <div className="brand"><div className="brand-mark"><BookOpen size={22} /></div><div><b>OpenDesk<span> AI</span></b><small>KNOWLEDGE, UNLOCKED</small></div></div>
    <div className="workspace-label">WORKSPACE <span>PERSONAL</span></div>
    <div className="nav-active"><Sparkles size={17} /> Document chat <span className="live-dot" /></div>
    <div className="side-section">
      <div className="section-heading">YOUR KNOWLEDGE <button onClick={onAddFiles} title="Add files" aria-label="Add files">+</button></div>
      {documents.length ? documents.map((doc) => <div className="doc-row" key={doc.id}>
        <div className="doc-icon"><FileText size={16} /></div><div className="doc-info"><span title={doc.filename}>{doc.filename}</span><small>{doc.chunks} passages · {formatBytes(doc.characters || 0)} text</small></div>
      </div>) : <div className="empty-docs"><div className="empty-icon"><FileText size={19} /></div><p>No documents yet</p><small>Upload a PDF, TXT, or Markdown file to begin.</small></div>}
    </div>
    <div className="sidebar-bottom">
      <div className="privacy-card"><ShieldCheck size={18} /><div><b>Evidence first</b><p>Answers are tied to your sources. No evidence, no guessing.</p></div></div>
      <button className="clear-btn" onClick={onClear}><Trash2 size={14} /> Clear knowledge base</button>
      <div className="profile"><div className="avatar">OD</div><div><b>OpenDesk workspace</b><small>{health ? `${health.chunks} indexed passages` : 'API disconnected'}</small></div><span className={health ? 'status-on' : 'status-off'} /></div>
    </div>
  </aside>;
}
