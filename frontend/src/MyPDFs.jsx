import { useState, useEffect, useRef } from 'react';
import Sidebar from './Sidebar';
import { API } from './App';

export default function MyPDFs({ user, page, setPage, onLogout }) {
  const [pdfs, setPdfs]       = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError]     = useState('');
  const [success, setSuccess] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef();

  const clientId = user.id;

  const loadPDFs = () => {
    setLoading(true);
    fetch(`${API}/api/clients/${clientId}/pdfs/`)
      .then(r => r.json())
      .then(data => Array.isArray(data) ? setPdfs(data) : setPdfs([]))
      .catch(() => setPdfs([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadPDFs(); }, [clientId]);

  const uploadFile = async (file) => {
    if (!file || !file.name.endsWith('.pdf')) {
      setError('Only PDF files are allowed.');
      return;
    }
    setUploading(true);
    setError('');
    setSuccess('');

    const formData = new FormData();
    formData.append('file', file);
    formData.append('title', file.name.replace('.pdf', ''));

    try {
      const r = await fetch(`${API}/api/clients/${clientId}/pdfs/`, {
        method: 'POST',
        body: formData,
      });
      if (!r.ok) throw new Error('Upload failed');
      setSuccess('PDF uploaded successfully!');
      loadPDFs();
      setTimeout(() => setSuccess(''), 3000);
    } catch (e) {
      setError('Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) uploadFile(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) uploadFile(file);
  };

  const handleDelete = async (pdfId) => {
    if (!confirm('Delete this PDF?')) return;
    try {
      await fetch(`${API}/api/clients/${clientId}/pdfs/${pdfId}/`, { method: 'DELETE' });
      setPdfs(prev => prev.filter(p => p.id !== pdfId));
    } catch {
      setError('Delete failed.');
    }
  };

  const formatDate = (d) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#0a0a0f', color: '#f0ede8', fontFamily: "'DM Sans', sans-serif" }}>
      <Sidebar user={user} page={page} setPage={setPage} onLogout={onLogout} />

      <main style={{ flex: 1, padding: '2.5rem 2.75rem', overflowY: 'auto' }}>
        {/* Header */}
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, letterSpacing: '-0.03em', marginBottom: '0.25rem' }}>
            My PDFs
          </h1>
          <p style={{ color: '#555', fontSize: '0.88rem' }}>
            Upload your company documents. The AI uses these to reply to customer emails.
          </p>
        </div>

        {/* Upload zone */}
        <div
          onClick={() => fileRef.current?.click()}
          onDragOver={e => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          style={{
            border: `2px dashed ${dragOver ? '#e8c84a' : '#1e1e2e'}`,
            borderRadius: '12px', padding: '2.5rem',
            textAlign: 'center', cursor: 'pointer',
            background: dragOver ? '#e8c84a08' : '#0f0f1a',
            transition: 'all 0.2s', marginBottom: '1.5rem',
          }}
        >
          <input ref={fileRef} type="file" accept=".pdf" style={{ display: 'none' }} onChange={handleFileChange} />
          <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>📄</div>
          <div style={{ fontWeight: 600, fontSize: '0.95rem', marginBottom: '0.35rem', color: '#ccc' }}>
            {uploading ? 'Uploading...' : 'Drop a PDF here or click to upload'}
          </div>
          <div style={{ color: '#444', fontSize: '0.8rem' }}>PDF files only</div>
        </div>

        {/* Messages */}
        {error && (
          <div style={{ padding: '0.75rem 1rem', background: '#ff4d4d18', border: '1px solid #ff4d4d44', borderRadius: '8px', color: '#ff6b6b', fontSize: '0.85rem', marginBottom: '1rem' }}>
            {error}
          </div>
        )}
        {success && (
          <div style={{ padding: '0.75rem 1rem', background: '#22c55e18', border: '1px solid #22c55e44', borderRadius: '8px', color: '#4ade80', fontSize: '0.85rem', marginBottom: '1rem' }}>
            ✓ {success}
          </div>
        )}

        {/* PDF list */}
        <div style={{ background: '#0f0f1a', borderRadius: '12px', border: '1px solid #1e1e2e', overflow: 'hidden' }}>
          <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #1e1e2e', fontWeight: 700, fontSize: '0.95rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>Uploaded Documents</span>
            <span style={{ background: '#e8c84a22', color: '#e8c84a', padding: '2px 10px', borderRadius: '100px', fontSize: '0.75rem', fontWeight: 600 }}>
              {pdfs.length} file{pdfs.length !== 1 ? 's' : ''}
            </span>
          </div>

          {loading ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: '#444', fontSize: '0.88rem' }}>Loading...</div>
          ) : pdfs.length === 0 ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: '#333', fontSize: '0.88rem' }}>
              No PDFs uploaded yet. Upload your first document above.
            </div>
          ) : (
            pdfs.map((pdf, i) => (
              <div key={pdf.id} style={{
                display: 'flex', alignItems: 'center', gap: '1rem',
                padding: '1rem 1.5rem',
                borderBottom: i < pdfs.length - 1 ? '1px solid #12121a' : 'none',
              }}>
                <div style={{
                  width: 36, height: 36, borderRadius: '8px',
                  background: '#e8c84a18', border: '1px solid #e8c84a33',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '1rem', flexShrink: 0,
                }}>
                  📄
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: '0.88rem', color: '#ccc', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {pdf.title}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#444', marginTop: '2px' }}>
                    Uploaded {formatDate(pdf.uploaded_at)}
                  </div>
                </div>
                <a
                  href={pdf.file_url}
                  target="_blank"
                  rel="noreferrer"
                  style={{ color: '#4285F4', fontSize: '0.78rem', textDecoration: 'none', flexShrink: 0 }}
                  onMouseOver={e => e.target.style.textDecoration = 'underline'}
                  onMouseOut={e => e.target.style.textDecoration = 'none'}
                >
                  View
                </a>
                <button
                  onClick={() => handleDelete(pdf.id)}
                  style={{
                    background: 'transparent', border: '1px solid #1e1e2e',
                    borderRadius: '6px', color: '#555', cursor: 'pointer',
                    padding: '4px 10px', fontSize: '0.75rem', transition: 'all 0.2s', flexShrink: 0,
                  }}
                  onMouseOver={e => { e.currentTarget.style.borderColor = '#ff4d4d66'; e.currentTarget.style.color = '#ff6b6b'; }}
                  onMouseOut={e => { e.currentTarget.style.borderColor = '#1e1e2e'; e.currentTarget.style.color = '#555'; }}
                >
                  Delete
                </button>
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  );
}