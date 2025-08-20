import { render, screen, fireEvent } from '@testing-library/react';
import { TaskItem } from '../TaskItem';
import { useTaskStore } from '../../../stores/taskStore';
import type { Task } from '../../../types';

// Mock the task store
vi.mock('../../../stores/taskStore');

const mockTask: Task = {
  id: 1,
  title: 'Test Task',
  description: 'Test Description',
  completed: false,
  priority: 'high',
  category_id: 1,
  due_date: '2024-12-31T23:59:59Z',
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
};

const mockToggleTask = vi.fn();
const mockDeleteTask = vi.fn();

describe('TaskItem Component', () => {
  beforeEach(() => {
    vi.mocked(useTaskStore).mockReturnValue({
      toggleTask: mockToggleTask,
      deleteTask: mockDeleteTask,
      tasks: [],
      categories: [],
      tags: [],
      filters: {},
      loading: false,
      error: null,
      setLoading: vi.fn(),
      setError: vi.fn(),
      loadTasks: vi.fn(),
      addTask: vi.fn(),
      updateTask: vi.fn(),
      loadCategories: vi.fn(),
      addCategory: vi.fn(),
      updateCategory: vi.fn(),
      deleteCategory: vi.fn(),
      setFilters: vi.fn(),
      clearFilters: vi.fn(),
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders task information correctly', () => {
    render(<TaskItem task={mockTask} />);
    
    expect(screen.getByText('Test Task')).toBeInTheDocument();
    expect(screen.getByText('Test Description')).toBeInTheDocument();
    expect(screen.getByText('HIGH')).toBeInTheDocument();
  });

  it('handles task completion toggle', () => {
    render(<TaskItem task={mockTask} />);
    
    const checkbox = screen.getByRole('checkbox');
    fireEvent.click(checkbox);
    
    expect(mockToggleTask).toHaveBeenCalledWith(1);
  });

  it('handles task deletion', () => {
    render(<TaskItem task={mockTask} />);
    
    const deleteButton = screen.getByRole('button', { name: /delete/i });
    fireEvent.click(deleteButton);
    
    expect(mockDeleteTask).toHaveBeenCalledWith(1);
  });

  it('displays completed task with different styling', () => {
    const completedTask = { ...mockTask, completed: true };
    render(<TaskItem task={completedTask} />);
    
    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).toBeChecked();
    
    const title = screen.getByText('Test Task');
    expect(title).toHaveClass('line-through');
  });

  it('shows priority badge with correct color', () => {
    const { rerender } = render(<TaskItem task={mockTask} />);
    expect(screen.getByText('HIGH')).toHaveClass('bg-red-600');

    const mediumTask = { ...mockTask, priority: 'medium' };
    rerender(<TaskItem task={mediumTask} />);
    expect(screen.getByText('MEDIUM')).toHaveClass('bg-yellow-600');

    const lowTask = { ...mockTask, priority: 'low' };
    rerender(<TaskItem task={lowTask} />);
    expect(screen.getByText('LOW')).toHaveClass('bg-green-600');
  });

  it('displays due date when present', () => {
    render(<TaskItem task={mockTask} />);
    expect(screen.getByText(/Dec 31, 2024/)).toBeInTheDocument();
  });

  it('handles task without description', () => {
    const taskWithoutDesc = { ...mockTask, description: null };
    render(<TaskItem task={taskWithoutDesc} />);
    
    expect(screen.getByText('Test Task')).toBeInTheDocument();
    expect(screen.queryByText('Test Description')).not.toBeInTheDocument();
  });
});
