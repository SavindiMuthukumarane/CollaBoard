import TaskCard from './TaskCard.jsx';

export default function Column({ title, status, tasks, onDropTask, onDragStart, onMove }) {
  return (
    <section className="column" onDragOver={(event) => event.preventDefault()} onDrop={(event) => onDropTask(event, status)}>
      <div className="column-title"><h2>{title}</h2><span>{tasks.length}</span></div>
      <div className="task-list">
        {tasks.map((task) => <TaskCard key={task.id} task={task} onDragStart={onDragStart} onMove={onMove} />)}
        {tasks.length === 0 && <div className="empty-column">Drop a task here</div>}
      </div>
    </section>
  );
}