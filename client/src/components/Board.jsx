import Column from './Column.jsx';

const columns = [
  { title: 'To Do', status: 'todo' },
  { title: 'Doing', status: 'doing' },
  { title: 'Done', status: 'done' }
];

export default function Board({ tasks, onDropTask, onDragStart }) {
  return (
    <div className="board-grid">
      {columns.map((column) => (
        <Column key={column.status} {...column} tasks={tasks.filter((task) => task.status === column.status)} onDropTask={onDropTask} onDragStart={onDragStart} />
      ))}
    </div>
  );
}