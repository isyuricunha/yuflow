import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
        <AnimatePresence>
          <TaskGrid tasks={tasks} viewMode={viewMode} />
        </AnimatePresence>
        
        {tasks.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <div className="text-white/50 mb-4">
              <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-white mb-2">No tasks yet</h3>
            <p className="text-white/70">Create your first task to get started</p>
          </motion.div>
        )}
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
