import { useRef, useState } from 'react';
import { LoaderCircle, ShieldCheck, UploadCloud } from 'lucide-react';
import { formatBytes } from '../utils/format.js';

const MAX_FILE_BYTES = 12 * 1024 * 1024;
const ALLOWED_EXTENSIONS = /\.(pdf|txt|md)$/i;

export default function UploadPanel({ onUpload, uploading, error, setError }) {
  const inputRef = useRef(null);
  const [files, setFiles] = useState([]);

  function selectFiles(event) {
    const selected = Array.from(event.target.files || []);
    const invalid = selected.find((file) => !ALLOWED_EXTENSIONS.test(file.name));
    const tooLarge = selected.find((file) => file.size > MAX_FILE_BYTES);
    if (invalid || tooLarge) {
      setFiles([]);
      setError(invalid ? `${invalid.name}: choose PDF, TXT, or MD.` : `${tooLarge.name}: file exceeds 12 MB.`);
      event.target.value = '';
      return;
    }
    setError('');
    setFiles(selected);
  }

  async function submitUpload() {
    if (!files.length || uploading) return;
    const success = await onUpload(files);
    if (success) {
      setFiles([]);
      if (inputRef.current) inputRef.current.value = '';
    }
  }

  return <section className="upload-card">
    <div className="upload-title"><div className="upload-symbol"><UploadCloud size={19} /></div><div><h2>Add to your knowledge base</h2><p>Upload project docs, README files, manuals, or research PDFs.</p></div><span className="file-types">PDF · TXT · MD</span></div>
    <label className={`dropzone ${files.length ? 'has-files' : ''}`}>
      <input id="opendesk-file-input" ref={inputRef} type="file" multiple accept=".pdf,.txt,.md,application/pdf,text/plain,text/markdown" onChange={selectFiles} />
      <div className="drop-icon"><UploadCloud size={22} /></div><div><b>{files.length ? `${files.length} file(s) selected` : 'Drop files here or browse'}</b><small>{files.length ? files.map((file) => `${file.name} (${formatBytes(file.size)})`).join(' · ') : 'Up to 12 MB per file · PDF, TXT, Markdown'}</small></div><span className="browse-btn">Browse files</span>
    </label>
    <div className="upload-footer"><span><ShieldCheck size={13} /> Processed by your local API session</span><button className="primary-btn" disabled={!files.length || uploading} onClick={submitUpload}>{uploading ? <LoaderCircle className="spin" size={15} /> : <UploadCloud size={15} />}{uploading ? ' Indexing…' : ' Index documents'}</button></div>
    {error && <div className="error-box">{error}</div>}
  </section>;
}
