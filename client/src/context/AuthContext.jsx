import { createContext, useContext, useMemo, useState } from 'react';
import { api } from '../services/api.js';

const AuthContext = createContext(null);
const TOKEN_KEY = 'collabboard_token';
const USER_KEY = 'collabboard_user';
function readStoredUser() { try { return JSON.parse(localStorage.getItem(USER_KEY)) || null; } catch { return null; } }

export function AuthProvider({ children }) {
  const [user, setUser] = useState(readStoredUser);
  function saveSession(data) {
    localStorage.setItem(TOKEN_KEY, data.token);
    localStorage.setItem(USER_KEY, JSON.stringify(data.user));
    setUser(data.user);
  }
  async function login(credentials) { const data = await api.login(credentials); saveSession(data); }
  async function register(details) { const data = await api.register(details); saveSession(data); }
  function logout() { localStorage.removeItem(TOKEN_KEY); localStorage.removeItem(USER_KEY); setUser(null); }
  const value = useMemo(() => ({ user, isAuthenticated: Boolean(user && localStorage.getItem(TOKEN_KEY)), login, register, logout }), [user]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
export function useAuth() { const value = useContext(AuthContext); if (!value) throw new Error('useAuth must be used inside AuthProvider'); return value; }
