import { render, screen } from '@testing-library/react';
import Column from '../components/Column.jsx';

const handlers = { onDropTask: jest.fn(), onDragStart: jest.fn(), onEdit: jest.fn(), onDelete: jest.fn(), onMove: jest.fn() };

test('shows its task count and an empty drop area', () => {
  render(<Column title="Done" status="done" tasks={[]} {...handlers} />);
  expect(screen.getByRole('heading', { name: 'Done' })).toBeInTheDocument();
  expect(screen.getByText('Drop a task here')).toBeInTheDocument();
  expect(screen.getByText('0')).toBeInTheDocument();
});