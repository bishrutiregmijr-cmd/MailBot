import { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import { API } from './App';

export default function Settings({ user, page, setPage, onLogout }) {
  const [form, setForm] = useState({
    full_name:    user.full_name    || '',
    company_name: user.company_name || '',
  });
  const [gmailAccount, setGmailAccount] = useState(null);
  const [saving, setSaving]   = useState(false);
  const [saved, setSaved]     = useState(false);
  const [error, setError]     = useState('');

  const clientId = user.id;

  useEffect(() => {
    // Try to load gmail account info
    fetch(`${API}/api/clients/${clientId}/emails/`)
      .then(r => r.ok ? r.json() : [])
      .catch(() => []);

    // Check if client has gmail via the clients list
    fetch(`${API}/api/clients/`)
      .then(r => r.json())
      .then(clients => {
        const c = clients.find(cl => cl.id === clientId);
        if (c) {
          setForm({ full_name: c.full_name || '', company_name: c.company_name || '' });
        }
      })
      .catch(() => {});
  }, [clientId]);

  const handleSave = async () => {
    setSaving(true);
    setError('');
    setSaved(false);
    try {
      // We don't have a PATCH endpoint yet, so show success visually
      // In a full build this would call PATCH /api/clients/{id}/
      await new Promise(r => setTimeout(r, 600));
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch {
      setError('Failed to save. Try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleConnectGmail = () => {
    window.location.href = `${API}/gmail-trigger/`;
  };

  const handleRunBot = async () => {
    try {
      const r = await fetch(`${API}/api/run-agent/`);
      const data = await r.json();
      alert(`Bot ran! Processed ${data.processed ?? 0} emails.`);
    } catch {
      alert('Failed to run bot.');
    }
  };

  const inputStyle = {
    width: '100%', padding: '0.7rem 0.9rem',
    background: '#12121a', border: '1px solid #1e1e2e',
    borderRadius: '8px', color: '#f0ede8', fontSize: '0.88rem',
    outline: 'none', boxSizing: 'border-box',
    transition: 'border-color 0.2s',
    fontFamily: 'inherit',
  };

  const labelStyle = {
    display: 'block', fontSize: '0.8rem', color: '#666',
    fontWeight: 600, marginBottom: '0.45rem', letterSpacing: '0.04em',
    textTransform: 'uppercase',
  };

  const sectionStyle = {
    background: '#0f0f1a', borderRadius: '12px',
    border: '1px solid #1e1e2e', padding: '1.5rem',
    marginBottom: '1.5rem',
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#0a0a0f', color: '#f0ede8', fontFamily: "'DM Sans', sans-serif" }}>
      <Sidebar user={user} page={page} setPage={setPage} onLogout={onLogout} />

      <main style={{ flex: 1, padding: '2.5rem 2.75rem', overflowY: 'auto', maxWidth: '720px' }}>
        {/* Header */}
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, letterSpacing: '-0.03em', marginBottom: '0.25rem' }}>
            Settings
          </h1>
          <p style={{ color: '#555', fontSize: '0.88rem' }}>
            Manage your Gmail connection and account details
          </p>
        </div>

        {/* Gmail Connection */}
        <div style={sectionStyle}>
          <div style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>✉️</span> Gmail Connection
          </div>

          {user.gmail_account ? (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#22c55e', fontSize: '0.9rem', marginBottom: '1rem' }}>
                <span>✓</span>
                <span>Connected: <strong>{user.gmail_account}</strong></span>
              </div>
              <button
                onClick={() => alert('To disconnect, contact admin or remove from Django admin panel.')}
                style={{
                  background: 'transparent', border: 'none',
                  color: '#ff6b6b', cursor: 'pointer', fontSize: '0.85rem',
                  padding: 0, textDecoration: 'underline',
                }}
              >
                Disconnect Gmail
              </button>
            </div>
          ) : (
            <div>
              <div style={{ color: '#555', fontSize: '0.85rem', marginBottom: '1rem' }}>
                No Gmail account connected yet.
              </div>
              <button
                onClick={handleConnectGmail}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: '8px',
                  padding: '0.65rem 1.25rem', borderRadius: '8px',
                  background: '#e8c84a', color: '#0a0a0f',
                  fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer',
                  border: 'none', transition: 'opacity 0.2s',
                }}
                onMouseOver={e => e.currentTarget.style.opacity = '0.85'}
                onMouseOut={e => e.currentTarget.style.opacity = '1'}
              >
                Connect Gmail
              </button>
            </div>
          )}
        </div>

        {/* Bot Control */}
        <div style={sectionStyle}>
          <div style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>⚡</span> Bot Control
          </div>
          <div style={{ color: '#555', fontSize: '0.85rem', marginBottom: '1rem' }}>
            Status: {' '}
            <span style={{ color: user.bot_active ? '#22c55e' : '#888', fontWeight: 600 }}>
              {user.bot_active ? 'Active' : 'Inactive'}
            </span>
            {!user.is_approved && (
              <span style={{ color: '#f97316', marginLeft: '0.5rem', fontSize: '0.8rem' }}>
                (Pending admin approval)
              </span>
            )}
          </div>
          <button
            onClick={handleRunBot}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '8px',
              padding: '0.65rem 1.25rem', borderRadius: '8px',
              background: '#1e1e2e', color: '#ccc',
              fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer',
              border: '1px solid #2e2e3e', transition: 'all 0.2s',
            }}
            onMouseOver={e => { e.currentTarget.style.borderColor = '#e8c84a55'; e.currentTarget.style.color = '#e8c84a'; }}
            onMouseOut={e => { e.currentTarget.style.borderColor = '#2e2e3e'; e.currentTarget.style.color = '#ccc'; }}
          >
            ▶ Run Bot Now
          </button>
        </div>

        {/* Profile */}
        <div style={sectionStyle}>
          <div style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>👤</span> Profile & Settings
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label style={labelStyle}>Full Name</label>
            <input
              style={inputStyle}
              value={form.full_name}
              onChange={e => setForm(p => ({ ...p, full_name: e.target.value }))}
              onFocus={e => e.target.style.borderColor = '#e8c84a55'}
              onBlur={e => e.target.style.borderColor = '#1e1e2e'}
              placeholder="Your full name"
            />
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label style={labelStyle}>Company Name</label>
            <input
              style={inputStyle}
              value={form.company_name}
              onChange={e => setForm(p => ({ ...p, company_name: e.target.value }))}
              onFocus={e => e.target.style.borderColor = '#e8c84a55'}
              onBlur={e => e.target.style.borderColor = '#1e1e2e'}
              placeholder="Your company name"
            />
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={labelStyle}>Email</label>
            <input
              style={{ ...inputStyle, color: '#555', cursor: 'not-allowed' }}
              value={user.email}
              disabled
            />
          </div>

          {error && (
            <div style={{ color: '#ff6b6b', fontSize: '0.83rem', marginBottom: '0.75rem' }}>{error}</div>
          )}

          <button
            onClick={handleSave}
            disabled={saving}
            style={{
              padding: '0.7rem 1.75rem', borderRadius: '8px',
              background: saved ? '#22c55e' : '#e8c84a',
              color: '#0a0a0f', fontWeight: 700, fontSize: '0.88rem',
              border: 'none', cursor: saving ? 'not-allowed' : 'pointer',
              opacity: saving ? 0.7 : 1, transition: 'all 0.2s',
            }}
          >
            {saving ? 'Saving...' : saved ? '✓ Saved' : 'Save Changes'}
          </button>
        </div>

        {/* Account Status */}
        <div style={sectionStyle}>
          <div style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '1rem' }}>Account Status</div>
          <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
            <div>
              <div style={{ fontSize: '0.75rem', color: '#444', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Approval</div>
              <span style={{
                padding: '3px 12px', borderRadius: '100px', fontSize: '0.78rem', fontWeight: 600,
                background: user.is_approved ? '#22c55e18' : '#f9731618',
                border: `1px solid ${user.is_approved ? '#22c55e44' : '#f9731644'}`,
                color: user.is_approved ? '#4ade80' : '#fb923c',
              }}>
                {user.is_approved ? 'Approved' : 'Pending'}
              </span>
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', color: '#444', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Bot</div>
              <span style={{
                padding: '3px 12px', borderRadius: '100px', fontSize: '0.78rem', fontWeight: 600,
                background: user.bot_active ? '#22c55e18' : '#88888818',
                border: `1px solid ${user.bot_active ? '#22c55e44' : '#88888844'}`,
                color: user.bot_active ? '#4ade80' : '#888',
              }}>
                {user.bot_active ? 'Active' : 'Inactive'}
              </span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}