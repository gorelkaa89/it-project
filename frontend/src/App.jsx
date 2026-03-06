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
  };

  if (page === 'home') {
    return <HomePage goLogin={() => setPage('login')} goRegister={() => setPage('register')} />;
  }

  if (page === 'login') {
    return <LoginPage onSubmit={login} onBack={() => setPage('home')} loading={loading} error={authError} />;
  }

  if (page === 'register') {
    return <RegisterPage onSubmit={register} onBack={() => setPage('home')} loading={loading} error={authError} />;
  }

  if (!user) {
    return <HomePage goLogin={() => setPage('login')} goRegister={() => setPage('register')} />;
  }

  if (ticketId) {
    return <TicketDetailsPage ticketId={ticketId} user={user} onBack={() => setTicketId(null)} />;
  }

  if (user.role === 'support') {
    return <SupportDashboardPage user={user} onLogout={logout} onOpenTicket={setTicketId} />;
  }

  return <UserDashboardPage user={user} onLogout={logout} />;
}
