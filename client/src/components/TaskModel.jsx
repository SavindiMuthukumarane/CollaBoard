import { useEffect, useRef, useState } from 'react';

const emptyTask = { title: '', description: '', status: 'todo', priority: 'medium', assignee: '' };

export default function TaskModal({ open, task, boardId, onClose, onSave }) {
  const [form, setForm] = useState(emptyTask);
  const [saving, setSaving] = useState(false);
  const initialisedKey = useRef(null);
  const storageKey = boardId ? `collabboard_task_draft:${boardId}:${task?.id || 'new'}` : null;

  useEffect(() => {
    if (!open || !storageKey) return;
    const base = task ? { ...emptyTask, ...task } : emptyTask;
    let restored = base;
    try {
      const saved = JSON.parse(localStorage.getItem(storageKey));
      if (saved) restored = { ...base, ...saved };
    } catch (_error) {
      // Ignore a malformed draft and use the server version.
    }
    setForm(restored);
    initialisedKey.current = storageKey;
  }, [task, open, storageKey]);

  useEffect(() => {
    if (!open || !storageKey || initialisedKey.current !== storageKey) return;
    localStorage.setItem(storageKey, JSON.stringify({
      title: form.title, description: form.description, status: form.status,
      priority: form.priority, assignee: form.assignee
    }));
  }, [form, open, storageKey]);

  if (!open) return null;

  async function submit(event) {
    event.preventDefault();
    if (!form.title.trim()) return;
    setSaving(true);
    try {
      await onSave({
        title: form.title.trim(), description: form.description.trim(), status: form.status,
        priority: form.priority, assignee: form.assignee.trim(), version: task?.version
      });
      if (storageKey) localStorage.removeItem(storageKey);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="modal-backdrop" onMouseDown={onClose}>
      <div className="modal" role="dialog" aria-modal="true" aria-labelledby="task-modal-title" onMouseDown={(event) => event.stopPropagation()}>
        <div className="modal-heading"><h2 id="task-modal-title">{task ? 'Edit task' : 'Add task'}</h2><button className="icon-button" onClick={onClose} aria-label="Close">×</button></div>
        <p className="draft-note">Draft fields are saved locally while this window is open.</p>
        <form onSubmit={submit} className="form-grid">
          <label>Title<input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} maxLength="100" required autoFocus /></label>
          <label>Description<textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows="4" maxLength="500" /></label>
          <div className="two-fields">
            <label>Status<select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}><option value="todo">To Do</option><option value="doing">Doing</option><option value="done">Done</option></select></label>
            <label>Priority<select value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })}><option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option></select></label>
          </div>
          <label>Assignee<input value={form.assignee} onChange={(e) => setForm({ ...form, assignee: e.target.value })} maxLength="80" placeholder="Team member name" /></label>
          <div className="modal-actions"><button type="button" className="secondary-button" onClick={onClose}>Cancel</button><button className="primary-button" disabled={saving}>{saving ? 'Saving…' : 'Save task'}</button></div>
        </form>
      </div>
    </div>
  );
}
