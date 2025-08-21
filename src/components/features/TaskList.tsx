import React, { useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import { TaskItem } from './TaskItem';
import { TaskGrid } from './TaskGrid';
import { useTaskStore, useUIStore } from '../../stores';

export const TaskList: React.FC = () => {
  const { tasks, loading, error, loadTasks, loadCategories } = useTaskStore();
  const { viewMode } = useUIStore();

  useEffect(() => {
    loadTasks();
    loadCategories();
  }, [loadTasks, loadCategories]);

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-white/5 rounded-lg p-4 h-20"></div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-400 mb-4">{error}</p>
        <button
          onClick={() => loadTasks()}
          className="text-orange hover:text-orange/80 underline"
        >
          Try again
        </button>
      </div>
    );
  }

  if (tasks.length === 0) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-white/70 mb-2">No tasks yet</h3>
        <p className="text-white/50 mb-4">Create your first task to get started</p>
      </div>
    );
  }

  // Render based on view mode
  if (viewMode === 'grid') {
    return <TaskGrid tasks={tasks} viewMode={viewMode} />;
  }

  if (viewMode === 'compact') {
    return (
      <div className="space-y-1">
        <AnimatePresence>
          {tasks.map((task) => (
            <div key={task.id} className="bg-white/5 border border-white/10 rounded p-2 hover:bg-white/10 transition-colors">
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => {}}
                  className={`flex-shrink-0 w-4 h-4 rounded border flex items-center justify-center ${
                    task.completed ? 'bg-orange border-orange' : 'border-white/30'
                  }`}
                >
                  {task.completed && <span className="text-black text-xs">✓</span>}
                </button>
                <span className={`flex-1 text-sm ${task.completed ? 'line-through text-white/50' : 'text-white'}`}>
                  {task.title}
                </span>
                <span className="text-xs text-white/50">
                  {task.priority}
                </span>
              </div>
            </div>
          ))}
        </AnimatePresence>
      </div>
    );
  }

  // Default list view
  return (
    <div className="space-y-3">
      <AnimatePresence>
        {tasks.map((task) => (
          <TaskItem key={task.id} task={task} />
        ))}
      </AnimatePresence>
    </div>
  );
};
