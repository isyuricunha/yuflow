import React from 'react';
import { motion } from 'framer-motion';
import { Check, Clock, AlertCircle, MoreHorizontal, Trash2, Edit } from 'lucide-react';
import { Task, Priority } from '../../types';
import { useTaskStore } from '../../stores';
import { Button } from '../ui';

interface TaskItemProps {
  task: Task;
}

export const TaskItem: React.FC<TaskItemProps> = ({ task }) => {
  const { toggleTask, deleteTask } = useTaskStore();

  const priorityColors = {
    low: 'text-blue-400',
    medium: 'text-yellow-400',
    high: 'text-red-400',
  };

  const priorityIcons = {
    low: Clock,
    medium: AlertCircle,
    high: AlertCircle,
  };

  const PriorityIcon = priorityIcons[task.priority as Priority];

  const handleToggle = () => {
    toggleTask(task.id);
  };

  const handleDelete = () => {
    deleteTask(task.id);
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className={`group bg-white/5 border border-white/10 rounded-lg p-4 hover:bg-white/10 transition-colors ${
        task.completed ? 'opacity-60' : ''
      }`}
    >
      <div className="flex items-start space-x-3">
        {/* Checkbox */}
        <button
          onClick={handleToggle}
          className={`flex-shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
            task.completed
              ? 'bg-orange border-orange'
              : 'border-white/30 hover:border-orange/50'
          }`}
        >
          {task.completed && <Check className="h-3 w-3 text-black" />}
        </button>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3
                className={`text-sm font-medium ${
                  task.completed ? 'line-through text-white/50' : 'text-white'
                }`}
              >
                {task.title}
              </h3>
              {task.description && (
                <p
                  className={`mt-1 text-sm ${
                    task.completed ? 'text-white/30' : 'text-white/70'
                  }`}
                >
                  {task.description}
                </p>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button variant="ghost" size="sm" className="p-1">
                <Edit className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="p-1 hover:text-red-400"
                onClick={handleDelete}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" className="p-1">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Meta information */}
          <div className="flex items-center space-x-4 mt-2">
            {/* Priority */}
            <div className={`flex items-center space-x-1 ${priorityColors[task.priority as Priority]}`}>
              <PriorityIcon className="h-3 w-3" />
              <span className="text-xs capitalize">{task.priority}</span>
            </div>

            {/* Due date */}
            {task.due_date && (
              <div className="flex items-center space-x-1 text-white/50">
                <Clock className="h-3 w-3" />
                <span className="text-xs">
                  {new Date(task.due_date).toLocaleDateString()}
                </span>
              </div>
            )}

            {/* Category */}
            {task.category_id && (
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 rounded-full bg-orange"></div>
                <span className="text-xs text-white/50">General</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};
