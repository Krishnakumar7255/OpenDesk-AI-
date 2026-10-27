import { useEffect, useRef, useState } from 'react';
import { CircleHelp, FileText, Search, Send, ShieldCheck, Sparkles } from 'lucide-react';

const PROMPTS = ['How do I run this project locally?', 'What are the main features?', 'What information is missing?'];

export default function ChatPanel({ documents, onAsk, busy, messages, error, setError }) {
  const [question, setQuestion] = useState('');
  const bottomRef = useRef(null);

  // scrollIntoView returns undefined. This effect therefore has no cleanup return value.
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, busy]);

  async function submit(event) {
    event.preventDefault();
    const value = question.trim();
    if (!value || busy) return;
    setQuestion('');
    setError('');
    await onAsk(value);
  }

  return <section className="chat-panel">
    <div className="chat-header"><div className="chat-header-icon"><Sparkles size={18} /></div><div><h2>Ask your knowledge base</h2><p>{documents.length ? `${documents.length} document(s) ready to search` : 'Upload a document to get started'}</p></div><div className="model-pill"><span /> LOCAL RAG</div></div>
    <div className="conversation">
      {messages.length === 0 ? <div className="welcome"><div className="welcome-orb"><Sparkles size={23} /></div><h3>Your documents have answers.</h3><p>Ask a question in plain language. OpenDesk finds relevant passages and shows you where they came from.</p><div className="suggestions-label">TRY ASKING</div><div className="suggestions">{PROMPTS.map((prompt) => <button key={prompt} onClick={() => { setQuestion(prompt); }}>{prompt} <span>↗</span></button>)}</div></div> : messages.map((message, index) => <div className={`message ${message.role}`} key={`${message.role}-${index}`}><div className="message-avatar">{message.role === 'user' ? 'You' : <Sparkles size={15} />}</div><div className="message-body"><div className="message-label">{message.role === 'user' ? 'YOU' : 'OPENDESK AI'}{message.mode && <span className="mode-label">{message.mode}</span>}</div><div className="message-text">{message.text}</div>{message.sources?.length > 0 && <div className="sources-wrap"><div className="sources-heading"><ShieldCheck size={14} /> SOURCES USED <span>{message.sources.length}</span></div>{message.sources.map((source, sourceIndex) => <div className="source-card" key={`${source.filename}-${sourceIndex}`}><div className="source-file"><FileText size={15} /><b>{source.filename}</b><span>{source.page ? `Page ${source.page}` : source.section}</span><span className="score">{Math.round((source.score || 0) * 100)}% match</span></div><p>{source.excerpt}</p></div>)}</div>}{message.grounded === false && message.role === 'assistant' && <div className="not-grounded"><CircleHelp size={14} /> No supporting evidence found</div>}</div></div>)}
      {busy && <div className="message assistant"><div className="message-avatar"><Sparkles size={15} /></div><div className="message-body"><div className="message-label">OPENDESK AI</div><div className="thinking"><span /><span /><span /> Searching your documents…</div></div></div>}
      <div ref={bottomRef} />
    </div>
    {error && <div className="error-box chat-error">{error}</div>}
    <form className="composer" onSubmit={submit}><div className="composer-input"><Search size={17} /><input value={question} onChange={(event) => setQuestion(event.target.value)} placeholder="Ask anything about your documents…" aria-label="Question" /><span className="shortcut">↵</span></div><button className="send-btn" disabled={!question.trim() || busy} aria-label="Send question"><Send size={16} /></button></form>
    <div className="disclaimer">OpenDesk AI can make mistakes. Verify important details against the cited source.</div>
  </section>;
}
