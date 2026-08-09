import { useState } from 'react';
import Navbar from './components/Navbar.jsx';
import Board from './components/Board.jsx';
import { initialTasks } from './data/mockData.js';

export default function App() {
  const [tasks, setTasks] = useState(initialTasks);

  function handleDragStart(event, taskId) {
    event.dataTransfer.setData('text/plain', taskId);
    event.dataTransfer.effectAllowed = 'move';
  }

  function handleDropTask(event, status) {
    const taskId = event.dataTransfer.getData('text/plain');
    setTasks((current) => current.map((task) => task.id === taskId ? { ...task, status } : task));
  }

  return (
    <>
      <Navbar />
      <main className="page-shell">
        <div className="page-heading">
          <div><p className="eyebrow">M1 · Static Front-End Skeleton</p><h1>Website Redesign</h1><p>Move the mock task cards between columns.</p></div>
          <button className="primary-button">+ Add task</button>
        </div>
        <Board tasks={tasks} onDropTask={handleDropTask} onDragStart={handleDragStart} />
      </main>
    </>
  );
}