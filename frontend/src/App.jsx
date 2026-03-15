import { useState, useEffect } from 'react';
import LandingPage from './LandingPage';
import Dashboard from './Dashboard';
import MyPDFs from './MyPDFs';
import Settings from './Settings';

export const API = import.meta.env.VITE_API_BASE || 'http://localhost:8000/automation';

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState('overview');

  useEffect(() => {
    // Load user from Django client API — use stored clientId in localStorage
    const clientId = localStorage.getItem('mailbot_client_id');
    if (!clientId) {
      setLoading(false);
      return;
    }
    fetch(`${API}/api/clients/`, { credentials: 'include' })
      .then(r => r.ok ? r.json() : [])
      .then(clients => {
        const found = clients.find(c => String(c.id) === String(clientId));
        if (found) setUser(found);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleLogin = (client) => {
    localStorage.setItem('mailbot_client_id', client.id);
    setUser(client);
    setPage('overview');
  };

  const handleLogout = () => {
    localStorage.removeItem('mailbot_client_id');
    setUser(null);
    setPage('overview');
  };

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh', display: 'flex', alignItems: 'center',
        justifyContent: 'center', background: '#0a0a0f'
      }}>
        <div style={{
          width: 40, height: 40, border: '3px solid #1e1e2e',
          borderTop: '3px solid #e8c84a', borderRadius: '50%',
          animation: 'spin 0.8s linear infinite'
        }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (!user) {
    return <LandingPage onLogin={handleLogin} />;
  }

  const navProps = { user, page, setPage, onLogout: handleLogout };

  return (
    <>
      {page === 'overview' && <Dashboard {...navProps} />}
      {page === 'pdfs'     && <MyPDFs    {...navProps} />}
      {page === 'settings' && <Settings  {...navProps} />}
    </>
  );
}