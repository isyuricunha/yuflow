import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowUpDown, Clock, Flag, Calendar, X } from 'lucide-react';
import { useUIStore, useTaskStore } from '../../stores';
import { Button } from '../ui';

interface SortMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SortMenu: React.FC<SortMenuProps> = ({ isOpen, onClose }) => {
  const { sortBy, setSortBy } = useUIStore();
  const { sortTasksByPriority, sortTasksByDueDate, sortTasksByCreated, sortTasksAlphabetically } = useTaskStore();

  const sortOptions = [
    {
      key: 'priority' as const,
      label: 'Priority',
      icon: Flag,
      action: sortTasksByPriority,
    },
    {
      key: 'dueDate' as const,
      label: 'Due Date',
      icon: Calendar,
      action: sortTasksByDueDate,
    },
    {
      key: 'created' as const,
      label: 'Created Date',
      icon: Clock,
      action: sortTasksByCreated,
    },
    {
      key: 'alphabetical' as const,
      label: 'Alphabetical',
      icon: ArrowUpDown,
      action: sortTasksAlphabetically,
    },
  ];

  const handleSort = (option: typeof sortOptions[0]) => {
    setSortBy(option.key);
    option.action();
    onClose();
  };

  const clearSort = () => {
    setSortBy(null);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="absolute top-full right-0 mt-2 bg-gray-900 border border-white/10 rounded-lg shadow-lg z-20 min-w-[180px]"
        >
          <div className="p-2">
            <div className="flex items-center justify-between px-3 py-2 border-b border-white/10">
              <span className="text-sm font-medium text-white">Sort by</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="p-1"
              >
                <X className="h-3 w-3" />
              </Button>
            </div>

            <div className="space-y-1 mt-2">
              {sortOptions.map((option) => {
                const IconComponent = option.icon;
                const isActive = sortBy === option.key;
                
                return (
                  <button
                    key={option.key}
                    onClick={() => handleSort(option)}
                    className={`w-full flex items-center space-x-3 px-3 py-2 text-sm rounded-md hover:bg-white/10 transition-colors ${
                      isActive ? 'bg-orange/20 text-orange' : 'text-white'
                    }`}
                  >
                    <IconComponent className="h-4 w-4" />
                    <span>{option.label}</span>
                    {isActive && (
                      <ArrowUpDown className="h-3 w-3 ml-auto" />
                    )}
                  </button>
                );
              })}

              {sortBy && (
                <>
                  <div className="border-t border-white/10 my-2" />
                  <button
                    onClick={clearSort}
                    className="w-full flex items-center space-x-3 px-3 py-2 text-sm rounded-md hover:bg-white/10 transition-colors text-white/70"
                  >
                    <X className="h-4 w-4" />
                    <span>Clear Sort</span>
                  </button>
                </>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
