
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar.jsx';
import ErrorBanner from '../components/ErrorBanner.jsx';
import { api } from '../services/api.js';
import { readCache, writeCache } from '../services/cache.js';

const CACHE_KEY = 'boards';
function upsertBoard(list, incoming) { return list.some((board) => board.id === incoming.id) ? list.map((board) => board.id === incoming.id ? incoming : board) : [incoming, ...list]; }

export default function DashboardPage() {
  const [boards, setBoards] = useState(() => readCache(CACHE_KEY, []));
  const [form, setForm] = useState({ name: '', description: '' });
  const [editing, setEditing] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadBoards(); }, []);
  useEffect(() => { writeCache(CACHE_KEY, boards); }, [boards]);

  async function loadBoards() { try { setBoards(await api.getBoards()); } catch (err) { setError(`${err.message} Showing the most recently cached boards.`); } finally { setLoading(false); } }
  async function submit(event) {
    event.preventDefault(); if (!form.name.trim()) return;
    try {
      const saved = editing ? await api.updateBoard(editing.id, form) : await api.createBoard(form);
      setBoards((current) => upsertBoard(current, saved));
      setForm({ name: '', description: '' }); setEditing(null);
    } catch (err) { setError(err.message); }
  }
  function beginEdit(board) { setEditing(board); setForm({ name: board.name, description: board.description || '' }); window.scrollTo({ top: 0, behavior: 'smooth' }); }
  function cancelEdit() { setEditing(null); setForm({ name: '', description: '' }); }
  async function remove(boardId) {
    if (!window.confirm('Delete this board and all of its tasks?')) return;
    try { await api.deleteBoard(boardId); setBoards((current) => current.filter((board) => board.id !== boardId)); }
    catch (err) { setError(err.message); }
  }

  return <><Navbar /><main className="page-shell"><div className="page-heading"><div><p className="eyebrow">Persistent workspace</p><h1>Project boards</h1><p>MongoDB persists boards and tasks across server restarts.</p></div></div><ErrorBanner message={error} onClose={() => setError('')} />
    <section className="dashboard-grid"><form className="panel form-grid" onSubmit={submit}><h2>{editing ? 'Edit board' : 'Create a board'}</h2><label>Board name<input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} maxLength="100" required /></label><label>Description<textarea rows="4" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} maxLength="300" /></label><button className="primary-button">{editing ? 'Save changes' : 'Create board'}</button>{editing && <button type="button" className="secondary-button" onClick={cancelEdit}>Cancel</button>}</form>
      <section><div className="section-heading"><h2>Boards</h2><span>{boards.length}</span></div>{loading && boards.length === 0 ? <div className="panel">Loading boards…</div> : boards.length === 0 ? <div className="empty-state"><h3>No boards yet</h3><p>Create your first project board using the form.</p></div> : <div className="board-list">{boards.map((board) => <article className="board-card" key={board.id}><div><p className="eyebrow">Kanban board</p><h3>{board.name}</h3><p>{board.description || 'No description provided.'}</p></div><div className="board-actions"><Link className="primary-button button-link" to={`/boards/${board.id}`}>Open board</Link><button className="secondary-button" onClick={() => beginEdit(board)}>Rename</button><button className="danger-button" onClick={() => remove(board.id)}>Delete</button></div></article>)}</div>}</section>
    </section></main></>;
}



