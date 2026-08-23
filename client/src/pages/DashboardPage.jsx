import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar.jsx';
import ErrorBanner from '../components/ErrorBanner.jsx';
import { api } from '../services/api.js';

function upsertBoard(list, incoming) {
  return list.some((board) => board.id === incoming.id)
    ? list.map((board) => board.id === incoming.id ? incoming : board)
    : [incoming, ...list];
}

export default function DashboardPage() {
  const [boards, setBoards] = useState([]);
  const [form, setForm] = useState({ name: '', description: '' });
  const [editing, setEditing] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getBoards().then(setBoards).catch((err) => setError(err.message)).finally(() => setLoading(false));
  }, []);

  async function submit(event) {
    event.preventDefault();
    if (!form.name.trim()) return;
    try {
      const saved = editing ? await api.updateBoard(editing.id, form) : await api.createBoard(form);
      setBoards((current) => upsertBoard(current, saved));
      setForm({ name: '', description: '' });
      setEditing(null);
    } catch (err) {
      setError(err.message);
    }
  }

  function beginEdit(board) {
    setEditing(board);
    setForm({ name: board.name, description: board.description || '' });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async function remove(boardId) {
    if (!window.confirm('Delete this board and all of its tasks?')) return;
    try {
      await api.deleteBoard(boardId);
      setBoards((current) => current.filter((board) => board.id !== boardId));
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <>
      <Navbar />
      <main className="page-shell">
        <div className="page-heading">
          <div>
            <p className="eyebrow">Milestone 2 workspace</p>
            <h1>Project boards</h1>
            <p>The React client is connected to the Express REST API.</p>
          </div>
        </div>
        <ErrorBanner message={error} onClose={() => setError('')} />
        <section className="dashboard-grid">
          <form className="panel form-grid" onSubmit={submit}>
            <h2>{editing ? 'Edit board' : 'Create a board'}</h2>
            <label>Board name<input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} maxLength="100" required /></label>
            <label>Description<textarea rows="4" value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} maxLength="300" /></label>
            <button className="primary-button">{editing ? 'Save changes' : 'Create board'}</button>
            {editing && <button type="button" className="secondary-button" onClick={() => { setEditing(null); setForm({ name: '', description: '' }); }}>Cancel</button>}
          </form>
          <section>
            <div className="section-heading"><h2>Boards</h2><span>{boards.length}</span></div>
            {loading ? <div className="panel">Loading boards…</div> : boards.length === 0
              ? <div className="empty-state"><h3>No boards yet</h3><p>Create your first project board using the form.</p></div>
              : <div className="board-list">{boards.map((board) => (
                <article className="board-card" key={board.id}>
                  <div><p className="eyebrow">Kanban board</p><h3>{board.name}</h3><p>{board.description || 'No description provided.'}</p></div>
                  <div className="board-actions">
                    <Link className="primary-button button-link" to={`/boards/${board.id}`}>Open board</Link>
                    <button className="secondary-button" onClick={() => beginEdit(board)}>Rename</button>
                    <button className="danger-button" onClick={() => remove(board.id)}>Delete</button>
                  </div>
                </article>
              ))}</div>}
          </section>
        </section>
      </main>
    </>
  );
}


