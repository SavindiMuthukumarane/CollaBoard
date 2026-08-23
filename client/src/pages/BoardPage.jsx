import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import Navbar from '../components/Navbar.jsx';
import Column from '../components/Column.jsx';
import TaskModal from '../components/TaskModal.jsx';
import ConflictModal from '../components/ConflictModal.jsx';
import ErrorBanner from '../components/ErrorBanner.jsx';
import { api } from '../services/api.js';
import { readCache, writeCache } from '../services/cache.js';

const columns = [{ title: 'To Do', status: 'todo' }, { title: 'Doing', status: 'doing' }, { title: 'Done', status: 'done' }];
function upsertTask(list, incoming) { return list.some((task) => task.id === incoming.id) ? list.map((task) => task.id === incoming.id ? incoming : task) : [...list, incoming]; }

export default function BoardPage() {
  const { boardId } = useParams();
  const [board, setBoard] = useState(() => readCache(`board:${boardId}`, null));
  const [tasks, setTasks] = useState(() => readCache(`tasks:${boardId}`, []));
  const [modal, setModal] = useState({ open: false, task: null });
  const [conflict, setConflict] = useState(null); const [error, setError] = useState(''); const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    Promise.all([api.getBoard(boardId), api.getTasks(boardId)])
      .then(([boardData, taskData]) => { if (active) { setBoard(boardData); setTasks(taskData); } })
      .catch((err) => { if (active) setError(`${err.message} Showing the most recently cached board.`); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [boardId]);
  useEffect(() => { if (board) writeCache(`board:${boardId}`, board); }, [board, boardId]);
  useEffect(() => { writeCache(`tasks:${boardId}`, tasks); }, [tasks, boardId]);

  function dragStart(event, taskId) { event.dataTransfer.setData('text/plain', taskId); event.dataTransfer.effectAllowed = 'move'; }
  async function dropTask(event, status) { const taskId = event.dataTransfer.getData('text/plain'); if (taskId) await moveTask(taskId, status); }
  async function moveTask(taskId, status) {
    const existing = tasks.find((task) => task.id === taskId); if (!existing || existing.status === status) return;
    setTasks((current) => current.map((task) => task.id === taskId ? { ...task, status } : task));
    try { const saved = await api.moveTask(taskId, status, existing.version); setTasks((current) => upsertTask(current, saved)); }
    catch (err) { setTasks((current) => current.map((task) => task.id === taskId ? existing : task)); if (err.status === 409) setConflict(err.data); else setError(err.message); }
  }
  async function saveTask(payload) {
    try {
      const saved = modal.task ? await api.updateTask(modal.task.id, payload) : await api.createTask(boardId, payload);
      setTasks((current) => upsertTask(current, saved)); setModal({ open: false, task: null });
    } catch (err) { if (err.status === 409) { setConflict(err.data); setModal({ open: false, task: null }); } else setError(err.message); throw err; }
  }
  async function deleteTask(taskId) {
    if (!window.confirm('Delete this task?')) return;
    try { await api.deleteTask(taskId); setTasks((current) => current.filter((task) => task.id !== taskId)); }
    catch (err) { setError(err.message); }
  }
  function loadLatestConflict() {
    const latest = conflict?.latestTask;
    if (latest) { setTasks((current) => upsertTask(current, latest)); setModal({ open: true, task: latest }); }
    setConflict(null);
  }

  return <><Navbar /><main className="page-shell">{loading && !board ? <div className="panel">Loading board…</div> : <><Link className="back-link" to="/dashboard">← Back to boards</Link><div className="page-heading"><div><p className="eyebrow">Persistent task board</p><h1>{board?.name || 'Cached board'}</h1><p>{board?.description || 'Tasks are stored in MongoDB and cached locally for recovery.'}</p></div><div className="heading-actions"><button className="primary-button" onClick={() => setModal({ open: true, task: null })}>+ Add task</button></div></div><ErrorBanner message={error} onClose={() => setError('')} /><div className="board-grid">{columns.map((column) => <Column key={column.status} {...column} tasks={tasks.filter((task) => task.status === column.status)} onDropTask={dropTask} onDragStart={dragStart} onEdit={(task) => setModal({ open: true, task })} onDelete={deleteTask} onMove={moveTask} />)}</div></>}
    </main><TaskModal open={modal.open} task={modal.task} boardId={boardId} onClose={() => setModal({ open: false, task: null })} onSave={saveTask} /><ConflictModal conflict={conflict} onLoadLatest={loadLatestConflict} onClose={() => setConflict(null)} /></>;
}