export default function TaskCard({ task, onDragStart }) {
  return (
    <article className="task-card" draggable onDragStart={(event) => onDragStart(event, task.id)}>
      <div className="task-card-top">
        <span className={`priority ${task.priority}`}>{task.priority}</span>
        <span className="drag-hint" aria-label="Drag task">⋮⋮</span>
      </div>
      <h3>{task.title}</h3>
      <p>{task.description}</p>
      <div className="task-meta"><span className="avatar">{task.assignee[0]}</span>{task.assignee}</div>
    </article>
  );
}