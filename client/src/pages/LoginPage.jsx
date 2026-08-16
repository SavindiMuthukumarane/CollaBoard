import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import ErrorBanner from '../components/ErrorBanner.jsx';

export default function LoginPage() {
  const { login } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function submit(event) {
    event.preventDefault(); setError(''); setLoading(true);
    try { await login(form); } catch (err) { setError(err.message); } finally { setLoading(false); }
  }

  return (
    <main className="auth-shell"><section className="auth-panel"><div className="brand auth-brand"><span className="brand-mark">C</span>CollabBoard</div><p className="eyebrow">Welcome back</p><h1>Sign in to your team board</h1><p className="muted">Use your account to create boards and manage tasks.</p><ErrorBanner message={error} />
      <form className="form-grid" onSubmit={submit}><label>Email<input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required /></label><label>Password<input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required /></label><button className="primary-button full-button" disabled={loading}>{loading ? 'Signing in…' : 'Sign in'}</button></form>
      <p className="auth-switch">New to CollabBoard? <Link to="/register">Create an account</Link></p></section><section className="auth-visual"><div><span className="visual-tag">Milestone 2</span><h2>React + Express + JWT</h2><p>A working REST API connected to a reusable Kanban interface.</p></div></section></main>
  );
}



