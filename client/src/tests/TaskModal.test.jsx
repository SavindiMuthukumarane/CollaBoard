import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TaskModal from '../components/TaskModal.jsx';

test('submits a trimmed new task and clears its saved draft', async () => {
  const onSave = jest.fn().mockResolvedValue(undefined);
  render(<TaskModal open task={null} boardId="board-1" onClose={jest.fn()} onSave={onSave} />);
  await userEvent.type(screen.getByLabelText('Title'), '  Write report  ');
  await userEvent.type(screen.getByLabelText('Description'), '  Draft findings  ');
  await userEvent.click(screen.getByRole('button', { name: 'Save task' }));
  expect(onSave).toHaveBeenCalledWith(expect.objectContaining({ title: 'Write report', description: 'Draft findings', status: 'todo', priority: 'medium' }));
  expect(localStorage.getItem('collabboard_task_draft:board-1:new')).toBeNull();
});

