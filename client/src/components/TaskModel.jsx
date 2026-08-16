import { useEffect, useState } from 'react';

const emptyTask = { title: '', description: '', status: 'todo', priority: 'medium', assignee: '' };

export default function TaskModal({ open, task, onClose, onSave }) {
  const [form, setForm] = useState(emptyTask);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) setForm(task ? { ...emptyTask, ...task } : emptyTask);
  }, [open, task]);

  if (!open) return null;

  async function submit(event) {
    event.preventDefault();
    if (!form.title.trim()) return;
    setSaving(true);
    try {
      await onSave({
        title: form.title.trim(),
        description: form.description.trim(),
        status: form.status,
        priority: form.priority,
        assignee: form.assignee.trim()
      });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="modal-backdrop" onMouseDown={onClose}>
      <div className="modal" role="dialog" aria-modal="true" aria-labelledby="task-modal-title" onMouseDown={(event) => event.stopPropagation()}>
        <div className="modal-heading"><h2 id="task-modal-title">{task ? 'Edit task' : 'Add task'}</h2><button className="icon-button" onClick={onClose} aria-label="Close">×</button></div>
        <form onSubmit={submit} className="form-grid">
          <label>Title<input value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} maxLength="100" required autoFocus /></label>
          <label>Description<textarea value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} rows="4" maxLength="500" /></label>
          <div className="two-fields">
            <label>Status<select value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value })}><option value="todo">To Do</option><option value="doing">Doing</option><option value="done">Done</option></select></label>
            <label>Priority<select value={form.priority} onChange={(event) => setForm({ ...form, priority: event.target.value })}><option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option></select></label>
          </div>
          <label>Assignee<input value={form.assignee} onChange={(event) => setForm({ ...form, assignee: event.target.value })} maxLength="80" placeholder="Team member name" /></label>
          <div className="modal-actions"><button type="button" className="secondary-button" onClick={onClose}>Cancel</button><button className="primary-button" disabled={saving}>{saving ? 'Saving…' : 'Save task'}</button></div>
        </form>
      </div>
    </div>
  );
}
