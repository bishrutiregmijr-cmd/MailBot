import { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import { API } from './App';

function StatCard({ value, label, color }) {
  return (
    <div style={{
      flex: 1, padding: '1.5rem 1.75rem',
      background: '#0f0f1a', borderRadius: '12px',
      border: '1px solid #1e1e2e', minWidth: '150px',
      position: 'relative', overflow: 'hidden',
    }}>
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', background: `linear-gradient(90deg, transparent, ${color}, transparent)` }} />
      <div style={{ fontSize: '2.2rem', fontWeight: 800, color, marginBottom: '0.4rem', letterSpacing: '-0.03em' }}>
        {value}
      </div>
      <div style={{ fontSize: '0.82rem', color: '#555', fontWeight: 500 }}>{label}</div>
    </div>
  );
}

const ACTION_STYLE = {
  replied:   { bg: '#22c55e18', border: '#22c55e44', text: '#4ade80',  label: 'Replied' },
  forwarded: { bg: '#4285F418', border: '#4285F444', text: '#6fa8ff',  label: 'Forwarded' },
  ignored:   { bg: '#88888818', border: '#88888844', text: '#888',     label: 'Ignored' },
  error:     { bg: '#ff4d4d18', border: '#ff4d4d44', text: '#ff6b6b',  label: 'Error' },
};

function ActionBadge({ action }) {
  const s = ACTION_STYLE[action] || ACTION_STYLE.ignored;
  return (
    <span style={{
      padding: '3px 10px', borderRadius: '100px', fontSize: '0.72rem',
      fontWeight: 600, background: s.bg, border: `1px solid ${s.border}`, color: s.text,
      flexShrink: 0,
    }}>
      {s.label}
    </span>
  );
}

function EmailPreview({ email, onClose }) {
  if (!email) return null;
  const formatDate = (d) => new Date(d).toLocaleString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
  const initials = email.sender?.split('@')[0].slice(0, 2).toUpperCase() || '??';
  const avatarColors = ['#a855f7', '#4285F4', '#22c55e', '#f97316', '#22d3ee'];
  const avatarColor = avatarColors[email.sender?.charCodeAt(0) % avatarColors.length] || '#a855f7';

  return (
    <div style={{
      width: '400px', flexShrink: 0, background: '#0c0c1a',
      borderLeft: '1px solid #1e1e2e', display: 'flex',
      flexDirection: 'column', height: '100vh',
      overflowY: 'auto', position: 'sticky', top: 0,
    }}>
      {/* Header */}
      <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #1e1e2e', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
        <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>Email Detail</span>
        <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid #1e1e2e', color: '#888', cursor: 'pointer', fontSize: '1rem', width: 28, height: 28, borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.15s' }}
          onMouseOver={e => { e.currentTarget.style.background = '#ff4d4d18'; e.currentTarget.style.color = '#ff6b6b'; }}
          onMouseOut={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.color = '#888'; }}>
          ×
        </button>
      </div>

      <div style={{ padding: '1.5rem', flex: 1 }}>
        {/* Sender avatar + info */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '1.25rem' }}>
          <div style={{ width: 44, height: 44, borderRadius: '50%', background: avatarColor, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.85rem', color: '#0a0a0f', flexShrink: 0, boxShadow: `0 0 16px ${avatarColor}44` }}>
            {initials}
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontWeight: 600, fontSize: '0.88rem', color: '#ccc', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {email.sender}
            </div>
            <div style={{ fontSize: '0.74rem', color: '#444', marginTop: '2px' }}>
              {formatDate(email.processed_at)}
            </div>
          </div>
        </div>

        {/* Subject */}
        <div style={{ fontWeight: 700, fontSize: '1.05rem', color: '#e0ddd8', marginBottom: '1rem', lineHeight: 1.35 }}>
          {email.subject || '(no subject)'}
        </div>

        {/* Action badge */}
        <div style={{ marginBottom: '1.25rem' }}>
          <ActionBadge action={email.action} />
        </div>

        <div style={{ height: '1px', background: '#1a1a2e', marginBottom: '1.25rem' }} />

        {/* AI Reply sent */}
        {email.action === 'replied' && (
          <div style={{ marginBottom: '1.25rem' }}>
            <div style={{ fontSize: '0.73rem', fontWeight: 700, color: '#4ade80', letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: '0.65rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#22c55e', boxShadow: '0 0 6px #22c55e', display: 'inline-block' }} />
              AI Reply Sent
            </div>
            <div style={{ background: '#071510', border: '1px solid #22c55e28', borderRadius: '10px', padding: '1rem 1.1rem', fontSize: '0.84rem', color: '#7a8a7a', lineHeight: 1.75, whiteSpace: 'pre-wrap' }}>
              {email.details || 'Reply was sent successfully.'}
            </div>
          </div>
        )}

        {/* Forwarded */}
        {email.action === 'forwarded' && (
          <div style={{ marginBottom: '1.25rem' }}>
            <div style={{ fontSize: '0.73rem', fontWeight: 700, color: '#6fa8ff', letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: '0.65rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#4285F4', display: 'inline-block' }} />
              Forwarded to Manager
            </div>
            <div style={{ background: '#070d18', border: '1px solid #4285F428', borderRadius: '10px', padding: '1rem 1.1rem', fontSize: '0.84rem', color: '#5a6a8a', lineHeight: 1.75 }}>
              {email.details || 'Question was outside the PDF knowledge base scope and was forwarded to your team.'}
            </div>
          </div>
        )}

        {/* Ignored */}
        {email.action === 'ignored' && (
          <div style={{ marginBottom: '1.25rem' }}>
            <div style={{ fontSize: '0.73rem', fontWeight: 700, color: '#666', letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: '0.65rem' }}>
              Ignored
            </div>
            <div style={{ background: '#0e0e14', border: '1px solid #33333333', borderRadius: '10px', padding: '1rem 1.1rem', fontSize: '0.84rem', color: '#4a4a5a', lineHeight: 1.75 }}>
              {email.details || 'Identified as spam, promotional, or auto-reply. No response was sent.'}
            </div>
          </div>
        )}

        {/* Error */}
        {email.action === 'error' && (
          <div style={{ marginBottom: '1.25rem' }}>
            <div style={{ fontSize: '0.73rem', fontWeight: 700, color: '#ff6b6b', letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: '0.65rem' }}>
              Error
            </div>
            <div style={{ background: '#150808', border: '1px solid #ff4d4d28', borderRadius: '10px', padding: '1rem 1.1rem', fontSize: '0.84rem', color: '#7a4a4a', lineHeight: 1.75 }}>
              {email.details || 'An error occurred while processing this email.'}
            </div>
          </div>
        )}

        {/* Meta info */}
        <div style={{ background: '#0f0f1a', border: '1px solid #1a1a2e', borderRadius: '10px', padding: '1rem 1.1rem' }}>
          <div style={{ fontSize: '0.73rem', fontWeight: 700, color: '#333', letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: '0.75rem' }}>Info</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
              <span style={{ color: '#444' }}>Action</span>
              <ActionBadge action={email.action} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
              <span style={{ color: '#444' }}>Processed</span>
              <span style={{ color: '#666' }}>{formatDate(email.processed_at)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Dashboard({ user, page, setPage, onLogout }) {
  const [emails, setEmails]     = useState([]);
  const [loading, setLoading]   = useState(true);
  const [selected, setSelected] = useState(null);
  const [filter, setFilter]     = useState('all');

  useEffect(() => {
    fetch(`${API}/api/clients/${user.id}/emails/`)
      .then(r => r.json())
      .then(data => Array.isArray(data) ? setEmails(data) : setEmails([]))
      .catch(() => setEmails([]))
      .finally(() => setLoading(false));
  }, [user.id]);

  const today        = new Date().toDateString();
  const todayEmails  = emails.filter(e => new Date(e.processed_at).toDateString() === today);
  const repliedToday   = todayEmails.filter(e => e.action === 'replied').length;
  const forwardedToday = todayEmails.filter(e => e.action === 'forwarded').length;
  const totalReplied   = emails.filter(e => e.action === 'replied').length;
  const totalForwarded = emails.filter(e => e.action === 'forwarded').length;

  const filtered     = filter === 'all' ? emails : emails.filter(e => e.action === filter);
  const selectedEmail = emails.find(e => e.id === selected) || null;

  const formatDate = (d) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  const avatarColors = ['#a855f7', '#4285F4', '#22c55e', '#f97316', '#22d3ee'];

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#0a0a0f', color: '#f0ede8', fontFamily: "'DM Sans', sans-serif" }}>
      <Sidebar user={user} page={page} setPage={setPage} onLogout={onLogout} />

      <main style={{ flex: 1, padding: '2.5rem 2.75rem', overflowY: 'auto', minWidth: 0 }}>

        {/* Header */}
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, letterSpacing: '-0.03em', marginBottom: '0.25rem' }}>Dashboard</h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#555', fontSize: '0.88rem' }}>
            <span>{user.company_name || user.full_name || user.email}</span>
            <span>—</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: user.bot_active ? '#22c55e' : '#555', display: 'inline-block', boxShadow: user.bot_active ? '0 0 6px #22c55e' : 'none' }} />
              {user.bot_active ? 'Bot is running' : 'Bot is inactive'}
            </span>
          </div>
        </div>

        {/* Stats */}
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '2rem' }}>
          <StatCard value={repliedToday}   label="Replied Today"   color="#a855f7" />
          <StatCard value={forwardedToday} label="Forwarded Today" color="#4285F4" />
          <StatCard value={totalReplied}   label="Total Replied"   color="#a855f7" />
          <StatCard value={totalForwarded} label="Total Forwarded" color="#f97316" />
        </div>

        {/* Bot Status */}
        <div style={{ background: '#0f0f1a', borderRadius: '12px', border: '1px solid #1e1e2e', padding: '1.25rem 1.5rem', marginBottom: '2rem' }}>
          <div style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: '0.6rem' }}>Bot Status</div>
          {user.bot_active ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#22c55e', fontWeight: 600, fontSize: '0.88rem' }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#22c55e', boxShadow: '0 0 8px #22c55e', display: 'inline-block' }} />
              Active — replying to emails automatically
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#555', fontWeight: 600, fontSize: '0.88rem' }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#555', display: 'inline-block' }} />
              {!user.is_approved ? 'Pending admin approval' : 'Inactive — connect Gmail and upload PDFs'}
            </div>
          )}
        </div>

        {/* Email list */}
        <div style={{ background: '#0f0f1a', borderRadius: '12px', border: '1px solid #1e1e2e', overflow: 'hidden' }}>
          {/* Toolbar */}
          <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid #1e1e2e', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
            <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>
              Recent Activity
              <span style={{ marginLeft: '8px', background: '#e8c84a18', color: '#e8c84a', padding: '2px 8px', borderRadius: '100px', fontSize: '0.72rem', fontWeight: 600 }}>
                {filtered.length}
              </span>
            </span>
            <div style={{ display: 'flex', gap: '0.4rem' }}>
              {['all', 'replied', 'forwarded', 'ignored'].map(f => (
                <button key={f} onClick={() => setFilter(f)}
                  style={{ padding: '4px 12px', borderRadius: '100px', border: `1px solid ${filter === f ? '#a855f766' : '#1e1e2e'}`, background: filter === f ? '#a855f718' : 'transparent', color: filter === f ? '#c084fc' : '#555', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 600, textTransform: 'capitalize', transition: 'all 0.15s', fontFamily: 'inherit' }}>
                  {f}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: '#444', fontSize: '0.88rem' }}>Loading...</div>
          ) : filtered.length === 0 ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: '#333', fontSize: '0.88rem' }}>
              {filter === 'all' ? 'No emails processed yet. Make sure your bot is active.' : `No ${filter} emails yet.`}
            </div>
          ) : (
            filtered.slice(0, 20).map(e => {
              const isSelected = selected === e.id;
              return (
                <div key={e.id} onClick={() => setSelected(isSelected ? null : e.id)}
                  style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.9rem 1.5rem', borderBottom: '1px solid #12121a', cursor: 'pointer', background: isSelected ? '#a855f70a' : 'transparent', borderLeft: `3px solid ${isSelected ? '#a855f7' : 'transparent'}`, transition: 'all 0.15s' }}
                  onMouseOver={ev => { if (!isSelected) ev.currentTarget.style.background = '#0f0f1a'; }}
                  onMouseOut={ev => { if (!isSelected) ev.currentTarget.style.background = 'transparent'; }}>

                  <div style={{ width: 34, height: 34, borderRadius: '50%', background: avatarColors[e.sender?.charCodeAt(0) % 5] || '#a855f7', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.72rem', color: '#0a0a0f', flexShrink: 0 }}>
                    {e.sender?.split('@')[0].slice(0, 2).toUpperCase() || '??'}
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '0.85rem', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: '#ccc' }}>
                      {e.subject || '(no subject)'}
                    </div>
                    <div style={{ fontSize: '0.74rem', color: '#444', marginTop: '2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {e.sender}
                    </div>
                  </div>

                  <ActionBadge action={e.action} />

                  <div style={{ fontSize: '0.72rem', color: '#333', flexShrink: 0 }}>
                    {formatDate(e.processed_at)}
                  </div>

                  <div style={{ color: isSelected ? '#a855f7' : '#2a2a3a', fontSize: '0.85rem', flexShrink: 0, transition: 'color 0.15s' }}>
                    {isSelected ? '◀' : '▶'}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </main>

      {/* Slide-in preview panel */}
      {selectedEmail && (
        <EmailPreview email={selectedEmail} onClose={() => setSelected(null)} />
      )}
    </div>
  );
}