import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Trash2, X, Archive, Tag, Calendar } from 'lucide-react';
import { useTaskStore, useUIStore } from '../../stores';
import { Button, ConfirmDialog } from '../ui';

export const BulkActions: React.FC = () => {
  const { deleteTask, updateTask } = useTaskStore();
  const { selectedTasks, bulkMode, clearSelection, setBulkMode } = useUIStore();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const selectedCount = selectedTasks.size;

  const handleBulkDelete = async () => {
    for (const taskId of selectedTasks) {
      await deleteTask(taskId);
    }
    clearSelection();
    setShowDeleteConfirm(false);
  };

  const handleBulkComplete = async () => {
    for (const taskId of selectedTasks) {
      await updateTask({
        id: taskId,
        completed: true,
      });
    }
    clearSelection();
  };

  const handleBulkIncomplete = async () => {
    for (const taskId of selectedTasks) {
      await updateTask({
        id: taskId,
        completed: false,
      });
    }
    clearSelection();
  };

  const handleExitBulkMode = () => {
    clearSelection();
    setBulkMode(false);
  };

  if (!bulkMode || selectedCount === 0) {
    return null;
  }

  return (
    <>
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 100 }}
          className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50"
        >
          <div className="bg-gray-900 border border-white/10 rounded-lg p-4 shadow-lg backdrop-blur-sm">
            <div className="flex items-center space-x-4">
              {/* Selection count */}
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 rounded-full bg-orange"></div>
                <span className="text-sm text-white">
                  {selectedCount} task{selectedCount !== 1 ? 's' : ''} selected
                </span>
              </div>

              {/* Actions */}
              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleBulkComplete}
                  className="hover:text-green-400"
                >
                  <Check className="h-4 w-4" />
                  <span className="ml-1">Complete</span>
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleBulkIncomplete}
                  className="hover:text-blue-400"
                >
                  <Archive className="h-4 w-4" />
                  <span className="ml-1">Incomplete</span>
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowDeleteConfirm(true)}
                  className="hover:text-red-400"
                >
                  <Trash2 className="h-4 w-4" />
                  <span className="ml-1">Delete</span>
                </Button>

                <div className="w-px h-6 bg-white/20"></div>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleExitBulkMode}
                  className="hover:text-white"
                >
                  <X className="h-4 w-4" />
                  <span className="ml-1">Cancel</span>
                </Button>
              </div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleBulkDelete}
        title="Delete Selected Tasks"
        message={`Are you sure you want to delete ${selectedCount} task${selectedCount !== 1 ? 's' : ''}? This action cannot be undone.`}
        confirmText="Delete All"
        cancelText="Cancel"
        variant="danger"
      />
    </>
  );
};
