import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import Navbar from '../components/Navbar.jsx';
import Column from '../components/Column.jsx';
import TaskModal from '../components/TaskModal.jsx';
import ErrorBanner from '../components/ErrorBanner.jsx';
import { api } from '../services/api.js';

const columns = [
  { title: 'To Do', status: 'todo' },
  { title: 'Doing', status: 'doing' },
  { title: 'Done', status: 'done' }
];

function upsertTask(list, incoming) {
  return list.some((task) => task.id === incoming.id)
    ? list.map((task) => task.id === incoming.id ? incoming : task)
    : [...list, incoming];
}

export default function BoardPage() {
  const { boardId } = useParams();
  const [board, setBoard] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [modal, setModal] = useState({ open: false, task: null });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.getBoard(boardId), api.getTasks(boardId)])
      .then(([boardData, taskData]) => { setBoard(boardData); setTasks(taskData); })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [boardId]);

  function dragStart(event, taskId) {
    event.dataTransfer.setData('text/plain', taskId);
    event.dataTransfer.effectAllowed = 'move';
  }

  async function moveTask(taskId, status) {
    const existing = tasks.find((task) => task.id === taskId);
    if (!existing || existing.status === status) return;
    try {
      const saved = await api.moveTask(taskId, status);
      setTasks((current) => upsertTask(current, saved));
    } catch (err) {
      setError(err.message);
    }
  }

  async function saveTask(payload) {
    try {
      const saved = modal.task
        ? await api.updateTask(modal.task.id, payload)
        : await api.createTask(boardId, payload);
      setTasks((current) => upsertTask(current, saved));
      setModal({ open: false, task: null });
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }

  async function deleteTask(taskId) {
    if (!window.confirm('Delete this task?')) return;
    try {
      await api.deleteTask(taskId);
      setTasks((current) => current.filter((task) => task.id !== taskId));
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <>
      <Navbar />
      <main className="page-shell">
        {loading ? <div className="panel">Loading board…</div> : (
          <>
            <Link className="back-link" to="/dashboard">← Back to boards</Link>
            <div className="page-heading">
              <div><p className="eyebrow">REST-connected task board</p><h1>{board?.name || 'Board'}</h1><p>{board?.description || 'Create and move tasks through the Express API.'}</p></div>
              <button className="primary-button" onClick={() => setModal({ open: true, task: null })}>+ Add task</button>
            </div>
            <ErrorBanner message={error} onClose={() => setError('')} />
            <div className="board-grid">
              {columns.map((column) => (
                <Column
                  key={column.status}
                  {...column}
                  tasks={tasks.filter((task) => task.status === column.status)}
                  onDropTask={(event, status) => moveTask(event.dataTransfer.getData('text/plain'), status)}
                  onDragStart={dragStart}
                  onEdit={(task) => setModal({ open: true, task })}
                  onDelete={deleteTask}
                  onMove={moveTask}
                />
              ))}
            </div>
          </>
        )}
      </main>
      <TaskModal open={modal.open} task={modal.task} onClose={() => setModal({ open: false, task: null })} onSave={saveTask} />
    </>
  );
}
