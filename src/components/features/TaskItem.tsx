import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, Clock, AlertCircle, MoreHorizontal, Trash2, Edit, Save, X, ChevronDown, Flag } from 'lucide-react';
import { Task, Priority } from '../../types';
import { useTaskStore, useUIStore } from '../../stores';
import { Button, Input, ConfirmDialog } from '../ui';

interface TaskItemProps {
  task: Task;
}

export const TaskItem: React.FC<TaskItemProps> = ({ task }) => {
  const { toggleTask, deleteTask, updateTask } = useTaskStore();
  const { selectedTasks, bulkMode, toggleTaskSelection } = useUIStore();
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(task.title);
  const [editDescription, setEditDescription] = useState(task.description || '');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showPriorityMenu, setShowPriorityMenu] = useState(false);
  const [showTaskMenu, setShowTaskMenu] = useState(false);

  const isSelected = selectedTasks.has(task.id);

  const priorityConfig = {
    low: {
      color: 'text-blue-400',
      bgColor: 'bg-blue-600',
      icon: Clock,
      label: 'Low',
    },
    medium: {
      color: 'text-yellow-400',
      bgColor: 'bg-yellow-600',
      icon: AlertCircle,
      label: 'Medium',
    },
    high: {
      color: 'text-red-400',
      bgColor: 'bg-red-600',
      icon: Flag,
      label: 'High',
    },
  };

  const currentPriority = priorityConfig[task.priority as Priority];
  const PriorityIcon = currentPriority.icon;

  const handleToggle = () => {
    toggleTask(task.id);
  };

  const handleDelete = () => {
    setShowDeleteConfirm(true);
  };

  const confirmDelete = () => {
    deleteTask(task.id);
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = async () => {
    if (editTitle.trim()) {
      await updateTask({
        id: task.id,
        title: editTitle.trim(),
        description: editDescription.trim() || undefined,
      });
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    setEditTitle(task.title);
    setEditDescription(task.description || '');
    setIsEditing(false);
  };

  const handleTaskClick = () => {
    if (bulkMode) {
      toggleTaskSelection(task.id);
    }
  };

  const handlePriorityChange = async (newPriority: Priority) => {
    await updateTask({
      id: task.id,
      priority: newPriority,
    });
    setShowPriorityMenu(false);
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className={`group bg-white/5 border rounded-lg p-4 hover:bg-white/10 transition-colors cursor-pointer ${
        task.completed ? 'opacity-60' : ''
      } ${
        isSelected ? 'border-orange bg-orange/10' : 'border-white/10'
      } ${
        bulkMode ? 'hover:border-orange/50' : ''
      }`}
      onClick={handleTaskClick}
    >
      <div className="flex items-start space-x-3">
        {/* Checkbox or Selection */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            if (bulkMode) {
              toggleTaskSelection(task.id);
            } else {
              handleToggle();
            }
          }}
          className={`flex-shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
            bulkMode
              ? isSelected
                ? 'bg-orange border-orange'
                : 'border-white/30 hover:border-orange/50'
              : task.completed
              ? 'bg-orange border-orange'
              : 'border-white/30 hover:border-orange/50'
          }`}
        >
          {(bulkMode && isSelected) || (!bulkMode && task.completed) ? (
            <Check className="h-3 w-3 text-black" />
          ) : null}
        </button>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              {isEditing ? (
                <div className="space-y-2">
                  <Input
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className="text-sm"
                    placeholder="Task title"
                    autoFocus
                  />
                  <Input
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                    className="text-sm"
                    placeholder="Description (optional)"
                  />
                </div>
              ) : (
                <>
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
                </>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
              {isEditing ? (
                <>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="p-1 hover:text-green-400"
                    onClick={handleSave}
                  >
                    <Save className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="p-1 hover:text-red-400"
                    onClick={handleCancel}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </>
              ) : (
                <>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="p-1"
                    onClick={handleEdit}
                  >
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
                  <div className="relative">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="p-1"
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowTaskMenu(!showTaskMenu);
                      }}
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                    
                    {/* Task Menu */}
                    {showTaskMenu && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="absolute top-full right-0 mt-1 bg-gray-900 border border-white/10 rounded-lg shadow-lg z-10 min-w-[140px]"
                      >
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEdit();
                            setShowTaskMenu(false);
                          }}
                          className="w-full flex items-center space-x-2 px-3 py-2 text-sm hover:bg-white/10 transition-colors text-white"
                        >
                          <Edit className="h-3 w-3" />
                          <span>Edit Task</span>
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete();
                            setShowTaskMenu(false);
                          }}
                          className="w-full flex items-center space-x-2 px-3 py-2 text-sm hover:bg-white/10 transition-colors text-red-400"
                        >
                          <Trash2 className="h-3 w-3" />
                          <span>Delete Task</span>
                        </button>
                      </motion.div>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Meta information */}
          <div className="flex items-center space-x-4 mt-2">
            {/* Priority */}
            <div className="relative">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowPriorityMenu(!showPriorityMenu);
                }}
                className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium transition-all hover:scale-105 ${currentPriority.bgColor} text-white`}
              >
                <PriorityIcon className="h-3 w-3" />
                <span className="capitalize">{currentPriority.label}</span>
                <ChevronDown className="h-3 w-3" />
              </button>

              {/* Priority Menu */}
              {showPriorityMenu && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="absolute top-full left-0 mt-1 bg-gray-900 border border-white/10 rounded-lg shadow-lg z-10 min-w-[120px]"
                >
                  {Object.entries(priorityConfig).map(([priority, config]) => {
                    const IconComponent = config.icon;
                    return (
                      <button
                        key={priority}
                        onClick={(e) => {
                          e.stopPropagation();
                          handlePriorityChange(priority as Priority);
                        }}
                        className={`w-full flex items-center space-x-2 px-3 py-2 text-sm hover:bg-white/10 transition-colors ${
                          priority === task.priority ? 'bg-white/5' : ''
                        }`}
                      >
                        <IconComponent className={`h-3 w-3 ${config.color}`} />
                        <span className="text-white">{config.label}</span>
                      </button>
                    );
                  })}
                </motion.div>
              )}
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

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={confirmDelete}
        title="Delete Task"
        message={`Are you sure you want to delete "${task.title}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
      />
    </motion.div>
  );
};
