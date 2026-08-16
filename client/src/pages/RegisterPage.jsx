import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import ErrorBanner from '../components/ErrorBanner.jsx';

export default function RegisterPage() {
  const { register } = useAuth();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function submit(event) {
    event.preventDefault(); setError(''); setLoading(true);
    try { await register(form); } catch (err) { setError(err.message); } finally { setLoading(false); }
  }

  return (
    <main className="auth-shell"><section className="auth-panel"><div className="brand auth-brand"><span className="brand-mark">C</span>CollabBoard</div><p className="eyebrow">Create account</p><h1>Start organising team work</h1><p className="muted">Passwords must contain at least six characters.</p><ErrorBanner message={error} />
      <form className="form-grid" onSubmit={submit}><label>Name<input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required maxLength="80" /></label><label>Email<input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required /></label><label>Password<input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required minLength="6" /></label><button className="primary-button full-button" disabled={loading}>{loading ? 'Creating…' : 'Create account'}</button></form>
      <p className="auth-switch">Already registered? <Link to="/login">Sign in</Link></p></section><section className="auth-visual"><div><span className="visual-tag">Protected routes</span><h2>Authentication included</h2><p>JWT-protected board and task endpoints distinguish users.</p></div></section></main>
  );
}

