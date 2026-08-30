import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TaskCard from '../components/TaskCard.jsx';

const task = { id: 'task-1', title: 'Prepare presentation', description: 'Complete final slides', status: 'todo', priority: 'high', assignee: 'Maya' };

test('renders task details and requests a status move', async () => {
  const onMove = jest.fn();
  render(<TaskCard task={task} onDragStart={jest.fn()} onEdit={jest.fn()} onDelete={jest.fn()} onMove={onMove} />);
  expect(screen.getByText('Prepare presentation')).toBeInTheDocument();
  expect(screen.getByText('Maya')).toBeInTheDocument();
  await userEvent.selectOptions(screen.getByLabelText(/move prepare presentation/i), 'doing');
  expect(onMove).toHaveBeenCalledWith('task-1', 'doing');
});
