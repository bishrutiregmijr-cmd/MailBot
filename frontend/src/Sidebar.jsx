export default function Sidebar({ user, page, setPage, onLogout }) {
  const navItems = [
    { id: 'overview', icon: '⚡', label: 'Overview' },
    { id: 'pdfs',     icon: '📄', label: 'My PDFs' },
    { id: 'settings', icon: '✉️', label: 'Settings' },
  ];

  return (
    <aside style={{
      width: '240px', background: '#0a0a0f',
      borderRight: '1px solid #1e1e2e',
      display: 'flex', flexDirection: 'column',
      flexShrink: 0, minHeight: '100vh'
    }}>
      {/* Logo */}
      <div style={{ padding: '1.5rem 1.25rem', borderBottom: '1px solid #1e1e2e' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <svg width="30" height="30" viewBox="0 0 32 32" fill="none">
            <rect width="32" height="32" rx="10" fill="#e8c84a" />
            <path d="M7 12l9-5 9 5-9 5-9-5z" fill="#0a0a0f" />
            <path d="M7 12v8l9 5V17L7 12z" fill="#2a2000" opacity=".6" />
            <path d="M25 12v8l-9 5V17l9-5z" fill="#0a0a0f" opacity=".3" />
          </svg>
          <span style={{ fontWeight: 700, fontSize: '1.1rem', letterSpacing: '-0.02em', color: '#f0ede8' }}>
            MailBot
          </span>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ padding: '1rem 0.75rem', flex: 1 }}>
        {navItems.map(item => {
          const active = page === item.id;
          return (
            <div
              key={item.id}
              onClick={() => setPage(item.id)}
              style={{
                display: 'flex', alignItems: 'center', gap: '10px',
                padding: '0.65rem 0.85rem', borderRadius: '8px', marginBottom: '4px',
                cursor: 'pointer', fontSize: '0.88rem', fontWeight: active ? 600 : 400,
                background: active ? '#e8c84a18' : 'transparent',
                color: active ? '#e8c84a' : '#666',
                transition: 'all 0.15s',
                userSelect: 'none',
              }}
              onMouseOver={e => { if (!active) e.currentTarget.style.background = '#1e1e2e'; }}
              onMouseOut={e => { if (!active) e.currentTarget.style.background = 'transparent'; }}
            >
              <span style={{ fontSize: '1rem' }}>{item.icon}</span>
              {item.label}
            </div>
          );
        })}
      </nav>

      {/* User + logout */}
      <div style={{ padding: '1rem 0.75rem', borderTop: '1px solid #1e1e2e' }}>
        <div style={{ marginBottom: '0.75rem', padding: '0 0.1rem' }}>
          <div style={{ fontSize: '0.82rem', fontWeight: 600, color: '#ccc', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {user.company_name || user.full_name || 'My Account'}
          </div>
          <div style={{ fontSize: '0.74rem', color: '#444', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {user.email}
          </div>
        </div>
        <button
          onClick={onLogout}
          style={{
            width: '100%', padding: '0.55rem', borderRadius: '8px',
            border: '1px solid #1e1e2e', background: 'transparent',
            color: '#555', cursor: 'pointer', fontSize: '0.82rem',
            transition: 'all 0.2s',
          }}
          onMouseOver={e => { e.currentTarget.style.borderColor = '#ff4d4d66'; e.currentTarget.style.color = '#ff6b6b'; }}
          onMouseOut={e => { e.currentTarget.style.borderColor = '#1e1e2e'; e.currentTarget.style.color = '#555'; }}
        >
          Sign out
        </button>
      </div>
    </aside>
  );
}