import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Filter, Calendar, CheckCircle, Flag, Tag, X, RotateCcw } from 'lucide-react';
import { useUIStore, useTaskStore } from '../../stores';
import { Button } from '../ui';
import { TaskFilters, Priority } from '../../types';

interface AdvancedFiltersProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AdvancedFilters: React.FC<AdvancedFiltersProps> = ({ isOpen, onClose }) => {
  const { activeFilters, setActiveFilters } = useUIStore();
  const { categories, applyAdvancedFilters, loadTasks } = useTaskStore();
  const [localFilters, setLocalFilters] = useState<TaskFilters>(activeFilters);

  const dateRangeOptions = [
    { value: 'all', label: 'All Time' },
    { value: 'today', label: 'Today' },
    { value: 'week', label: 'This Week' },
    { value: 'month', label: 'This Month' },
  ];

  const statusOptions = [
    { value: 'all', label: 'All Tasks' },
    { value: 'pending', label: 'Pending' },
    { value: 'completed', label: 'Completed' },
  ];

  const priorityOptions: { value: Priority | 'all'; label: string }[] = [
    { value: 'all', label: 'All Priorities' },
    { value: 'high', label: 'High Priority' },
    { value: 'medium', label: 'Medium Priority' },
    { value: 'low', label: 'Low Priority' },
  ];

  const handleFilterChange = (key: keyof TaskFilters, value: any) => {
    const newFilters = { ...localFilters };
    if (value === 'all' || value === '') {
      delete newFilters[key];
    } else {
      newFilters[key] = value;
    }
    setLocalFilters(newFilters);
  };

  const applyFilters = () => {
    setActiveFilters(localFilters);
    applyAdvancedFilters(localFilters);
    onClose();
  };

  const clearAllFilters = () => {
    const emptyFilters = {};
    setLocalFilters(emptyFilters);
    setActiveFilters(emptyFilters);
    loadTasks();
    onClose();
  };

  const getActiveFilterCount = () => {
    return Object.keys(localFilters).length;
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="absolute top-full right-0 mt-2 bg-gray-900 border border-white/10 rounded-lg shadow-lg z-20 min-w-[320px]"
        >
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <Filter className="h-4 w-4 text-orange" />
                <span className="font-medium text-white">Advanced Filters</span>
                {getActiveFilterCount() > 0 && (
                  <span className="bg-orange text-black text-xs px-2 py-1 rounded-full">
                    {getActiveFilterCount()}
                  </span>
                )}
              </div>
              <Button variant="ghost" size="sm" onClick={onClose} className="p-1">
                <X className="h-3 w-3" />
              </Button>
            </div>

            <div className="space-y-4">
              {/* Date Range Filter */}
              <div>
                <label className="flex items-center space-x-2 text-sm font-medium text-white mb-2">
                  <Calendar className="h-4 w-4" />
                  <span>Date Range</span>
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {dateRangeOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => handleFilterChange('dateRange', option.value)}
                      className={`px-3 py-2 text-sm rounded-md border transition-colors ${
                        (localFilters.dateRange || 'all') === option.value
                          ? 'bg-orange/20 border-orange text-orange'
                          : 'bg-white/5 border-white/10 text-white hover:bg-white/10'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Status Filter */}
              <div>
                <label className="flex items-center space-x-2 text-sm font-medium text-white mb-2">
                  <CheckCircle className="h-4 w-4" />
                  <span>Status</span>
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {statusOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => handleFilterChange('status', option.value)}
                      className={`px-3 py-2 text-sm rounded-md border transition-colors ${
                        (localFilters.status || 'all') === option.value
                          ? 'bg-orange/20 border-orange text-orange'
                          : 'bg-white/5 border-white/10 text-white hover:bg-white/10'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Priority Filter */}
              <div>
                <label className="flex items-center space-x-2 text-sm font-medium text-white mb-2">
                  <Flag className="h-4 w-4" />
                  <span>Priority</span>
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {priorityOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => handleFilterChange('priority', option.value === 'all' ? undefined : option.value)}
                      className={`px-3 py-2 text-sm rounded-md border transition-colors ${
                        (localFilters.priority || 'all') === option.value
                          ? 'bg-orange/20 border-orange text-orange'
                          : 'bg-white/5 border-white/10 text-white hover:bg-white/10'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Category Filter */}
              {categories.length > 0 && (
                <div>
                  <label className="flex items-center space-x-2 text-sm font-medium text-white mb-2">
                    <Tag className="h-4 w-4" />
                    <span>Category</span>
                  </label>
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    <button
                      onClick={() => handleFilterChange('category_id', undefined)}
                      className={`w-full flex items-center space-x-2 px-3 py-2 text-sm rounded-md border transition-colors ${
                        !localFilters.category_id
                          ? 'bg-orange/20 border-orange text-orange'
                          : 'bg-white/5 border-white/10 text-white hover:bg-white/10'
                      }`}
                    >
                      <span>All Categories</span>
                    </button>
                    {categories.map((category) => (
                      <button
                        key={category.id}
                        onClick={() => handleFilterChange('category_id', category.id)}
                        className={`w-full flex items-center space-x-2 px-3 py-2 text-sm rounded-md border transition-colors ${
                          localFilters.category_id === category.id
                            ? 'bg-orange/20 border-orange text-orange'
                            : 'bg-white/5 border-white/10 text-white hover:bg-white/10'
                        }`}
                      >
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: category.color }}
                        />
                        <span>{category.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-between mt-6 pt-4 border-t border-white/10">
              <Button
                variant="ghost"
                size="sm"
                onClick={clearAllFilters}
                className="flex items-center space-x-2 text-white/70 hover:text-white"
              >
                <RotateCcw className="h-3 w-3" />
                <span>Clear All</span>
              </Button>
              <div className="flex items-center space-x-2">
                <Button variant="ghost" size="sm" onClick={onClose}>
                  Cancel
                </Button>
                <Button onClick={applyFilters} size="sm">
                  Apply Filters
                </Button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
