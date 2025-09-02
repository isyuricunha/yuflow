import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Modal, Button } from '../ui';
import { useTaskStore } from '../../stores';
import { CreateTaskInput } from '../../types';

interface CreateTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CreateTaskModal: React.FC<CreateTaskModalProps> = ({ isOpen, onClose }) => {
  const { addTask, loading } = useTaskStore();
  const [formData, setFormData] = useState<CreateTaskInput>({
    title: '',
    description: '',
    priority: 'medium',
    due_date: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) return;

    await addTask(formData);
    setFormData({
      title: '',
      description: '',
      priority: 'medium',
      due_date: '',
    });
    onClose();
  };

  const handleChange = (field: keyof CreateTaskInput, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create New Task">
      <motion.form 
        onSubmit={handleSubmit} 
        className="space-y-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1, duration: 0.3 }}
      >
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2, duration: 0.3 }}
        >
          <label className="block text-sm font-medium text-white/90 mb-2">
            Title *
          </label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => handleChange('title', e.target.value)}
            className="w-full px-4 py-3 glass-input rounded-xl text-white placeholder-white/50 focus:ring-2 focus:ring-orange/50 focus:border-orange transition-all duration-200"
            placeholder="Enter task title..."
            required
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.25, duration: 0.3 }}
        >
          <label className="block text-sm font-medium text-white/90 mb-2">
            Description
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => handleChange('description', e.target.value)}
            className="w-full px-4 py-3 glass-input rounded-xl text-white placeholder-white/50 focus:ring-2 focus:ring-orange/50 focus:border-orange transition-all duration-200 resize-none"
            placeholder="Enter task description..."
            rows={3}
          />
        </motion.div>

        <div className="grid grid-cols-2 gap-4">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3, duration: 0.3 }}
          >
            <label className="block text-sm font-medium text-white/90 mb-2">
              Priority
            </label>
            <select
              value={formData.priority}
              onChange={(e) => handleChange('priority', e.target.value)}
              className="w-full px-4 py-3 glass-input rounded-xl text-white focus:ring-2 focus:ring-orange/50 focus:border-orange transition-all duration-200"
            >
              <option value="low" className="bg-black">Low</option>
              <option value="medium" className="bg-black">Medium</option>
              <option value="high" className="bg-black">High</option>
            </select>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3, duration: 0.3 }}
          >
            <label className="block text-sm font-medium text-white/90 mb-2">
              Due Date
            </label>
            <input
              type="date"
              value={formData.due_date}
              onChange={(e) => handleChange('due_date', e.target.value)}
              className="w-full px-4 py-3 glass-input rounded-xl text-white focus:ring-2 focus:ring-orange/50 focus:border-orange transition-all duration-200"
            />
          </motion.div>
        </div>

        <motion.div 
          className="flex justify-end space-x-3 pt-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.3 }}
        >
          <Button
            type="button"
            variant="ghost"
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            loading={loading}
          >
            Create Task
          </Button>
        </motion.div>
      </motion.form>
    </Modal>
  );
};
