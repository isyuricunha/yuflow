import React from 'react';
import { motion } from 'framer-motion';
import { TaskItem } from './TaskItem';
import { Task } from '../../types';

interface TaskGridProps {
  tasks: Task[];
  viewMode: 'list' | 'grid' | 'compact';
}

export const TaskGrid: React.FC<TaskGridProps> = ({ tasks, viewMode }) => {
  if (viewMode === 'list') {
    return (
      <div className="space-y-3">
        {tasks.map((task) => (
          <TaskItem key={task.id} task={task} />
        ))}
      </div>
    );
  }

  if (viewMode === 'grid') {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {tasks.map((task) => (
          <motion.div
            key={task.id}
            layout
            className="h-fit"
          >
            <TaskItem task={task} />
          </motion.div>
        ))}
      </div>
    );
  }

  // Compact view
  return (
    <div className="space-y-1">
      {tasks.map((task) => (
        <motion.div
          key={task.id}
          layout
          className="bg-white/5 border border-white/10 rounded-md p-2 hover:bg-white/10 transition-colors"
        >
          <div className="flex items-center space-x-3">
            <input
              type="checkbox"
              checked={task.completed}
              className="rounded border-white/20 bg-transparent text-orange focus:ring-orange/50"
              readOnly
            />
            <span className={`flex-1 text-sm ${task.completed ? 'line-through text-white/50' : 'text-white'}`}>
              {task.title}
            </span>
            <div className="flex items-center space-x-2 text-xs text-white/50">
              <span className={`px-2 py-1 rounded-full text-xs ${
                task.priority === 'high' ? 'bg-red-600' :
                task.priority === 'medium' ? 'bg-yellow-600' : 'bg-blue-600'
              }`}>
                {task.priority}
              </span>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
};
