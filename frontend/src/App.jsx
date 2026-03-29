import { useEffect, useState } from 'react';
import { api, clearToken, getToken, setToken } from './api';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import UserDashboardPage from './pages/UserDashboardPage';
import SupportDashboardPage from './pages/SupportDashboardPage';
import TicketDetailsPage from './pages/TicketDetailsPage';

export default function App() {
  const [page, setPage] = useState('home');
  const [user, setUser] = useState(null);
  const [authError, setAuthError] = useState('');
  const [loading, setLoading] = useState(false);
  const [ticketId, setTicketId] = useState(null);
  const [supportMode, setSupportMode] = useState('all');
  const [theme, setTheme] = useState(localStorage.getItem('helpdesk_theme') || 'light');

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    localStorage.setItem('helpdesk_theme', theme);
  }, [theme]);

  useEffect(() => {
    const token = getToken();
    if (!token) return;

    api('/api/auth/me')
      .then((me) => {
        setUser(me);
        setPage(me.role === 'support' ? 'support' : 'user');
      })
      .catch(() => {
        clearToken();
      });
  }, []);

  const login = async (credentials) => {
    try {
      setLoading(true);
      setAuthError('');
      const result = await api('/api/auth/login', { method: 'POST', body: JSON.stringify(credentials) });
      setToken(result.token);
      setUser(result.user);
      setPage(result.user.role === 'support' ? 'support' : 'user');
      setSupportMode('all');
    } catch (err) {
      setAuthError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const register = async (data) => {
    try {
      setLoading(true);
      setAuthError('');
      const result = await api('/api/auth/register', { method: 'POST', body: JSON.stringify(data) });
      setToken(result.token);
      setUser(result.user);
      setPage(result.user.role === 'support' ? 'support' : 'user');
      setSupportMode('all');
    } catch (err) {
      setAuthError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    clearToken();
    setUser(null);
    setTicketId(null);
    setPage('home');
    setSupportMode('all');
  };

  const openTicket = (id) => setTicketId(id);

  const handleStatusApplied = () => {
    setTicketId(null);
    if (user?.role === 'support') {
      setSupportMode('my');
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 transition-colors dark:bg-slate-950">
      <button
        onClick={() => setTheme((t) => (t === 'dark' ? 'light' : 'dark'))}
        className="fixed right-4 top-4 z-50 rounded-full border border-slate-300 bg-white px-3 py-2 text-sm shadow dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
      >
        {theme === 'dark' ? '☀️ Светлая' : '🌙 Тёмная'}
      </button>

      {page === 'home' ? <HomePage goLogin={() => setPage('login')} goRegister={() => setPage('register')} /> : null}
      {page === 'login' ? <LoginPage onSubmit={login} onBack={() => setPage('home')} loading={loading} error={authError} /> : null}
      {page === 'register' ? <RegisterPage onSubmit={register} onBack={() => setPage('home')} loading={loading} error={authError} /> : null}

      {!['home', 'login', 'register'].includes(page) && !user ? <HomePage goLogin={() => setPage('login')} goRegister={() => setPage('register')} /> : null}

      {ticketId && user ? <TicketDetailsPage ticketId={ticketId} user={user} onBack={() => setTicketId(null)} onStatusApplied={handleStatusApplied} /> : null}

      {!ticketId && user?.role === 'support' ? <SupportDashboardPage user={user} onLogout={logout} onOpenTicket={openTicket} forcedMode={supportMode} /> : null}
      {!ticketId && user?.role === 'user' ? <UserDashboardPage user={user} onLogout={logout} onOpenTicket={openTicket} /> : null}
    </div>
  );
}
