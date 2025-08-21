import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Menu, X, Plus, Filter, Settings, CheckSquare, Tag } from 'lucide-react';
import { useUIStore, useTaskStore } from '../../stores';
import { Button } from '../ui';
import { CategoryManager, SortMenu, SettingsModal, SearchBar, AdvancedFilters, ViewModeSelector } from '../features';

interface MainLayoutProps {
  children: React.ReactNode;
  onCreateTask?: () => void;
}

export const MainLayout: React.FC<MainLayoutProps> = ({ children, onCreateTask }) => {
  const { sidebarOpen, setSidebarOpen, setBulkMode, currentView, setCurrentView } = useUIStore();
  const { categories, setFilters, clearFilters, resetFilters } = useTaskStore();
  const [showCategoryManager, setShowCategoryManager] = useState(false);
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  return (
    <div className="h-screen bg-black text-white flex overflow-hidden">
      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{ width: sidebarOpen ? 280 : 0 }}
        className="bg-white/5 border-r border-white/10 flex-shrink-0 overflow-hidden"
      >
        <div className="p-4 space-y-4 w-full">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl font-bold text-orange">Yuflow</h1>
            <Button variant="ghost" size="sm" onClick={() => setSidebarOpen(false)}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          <Button
            variant="ghost"
            className="w-full justify-start"
            onClick={() => setShowCategoryManager(true)}
          >
            <Tag className="h-4 w-4 mr-3" />
            Categories
          </Button>
          
          <Button className="w-full" size="md" onClick={onCreateTask}>
            <Plus className="h-4 w-4 mr-2" />
            New Task
          </Button>
          
          <nav className="space-y-2">
            <button 
              onClick={() => {
                setCurrentView('all');
                resetFilters();
              }}
              className={`w-full text-left px-3 py-2 rounded-lg hover:bg-white/10 transition-colors ${
                currentView === 'all' ? 'bg-orange/20 text-orange' : ''
              }`}
            >
              All Tasks
            </button>
            <button 
              onClick={() => {
                setCurrentView('today');
                resetFilters();
                setFilters({ dateRange: 'today' });
              }}
              className={`w-full text-left px-3 py-2 rounded-lg hover:bg-white/10 transition-colors ${
                currentView === 'today' ? 'bg-orange/20 text-orange' : ''
              }`}
            >
              Today
            </button>
            <button 
              onClick={() => {
                setCurrentView('upcoming');
                resetFilters();
                setFilters({ dateRange: 'week' });
              }}
              className={`w-full text-left px-3 py-2 rounded-lg hover:bg-white/10 transition-colors ${
                currentView === 'upcoming' ? 'bg-orange/20 text-orange' : ''
              }`}
            >
              Upcoming
            </button>
            <button 
              onClick={() => {
                setCurrentView('completed');
                resetFilters();
                setFilters({ completed: true });
              }}
              className={`w-full text-left px-3 py-2 rounded-lg hover:bg-white/10 transition-colors ${
                currentView === 'completed' ? 'bg-orange/20 text-orange' : ''
              }`}
            >
              Completed
            </button>
          </nav>
          
          <div className="border-t border-white/10 pt-4">
            <h3 className="text-sm font-medium text-white/70 mb-2">Categories</h3>
            <div className="space-y-1">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => {
                    setCurrentView('category');
                    resetFilters();
                    setFilters({ category_id: category.id });
                  }}
                  className={`w-full flex items-center px-3 py-1 rounded hover:bg-white/10 transition-colors ${
                    currentView === 'category' ? 'bg-orange/20' : ''
                  }`}
                >
                  <div 
                    className="w-3 h-3 rounded-full mr-2" 
                    style={{ backgroundColor: category.color }}
                  ></div>
                  <span className="text-sm">{category.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </motion.aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white/5 border-b border-white/10 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {!sidebarOpen && (
                <Button variant="ghost" size="sm" onClick={() => setSidebarOpen(true)}>
                  <Menu className="h-4 w-4" />
                </Button>
              )}
              <h2 className="text-lg font-semibold">All Tasks</h2>
            </div>
            
            <div className="flex items-center space-x-2">
              <SearchBar className="w-64" />
              
              <ViewModeSelector />
              
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setBulkMode(true)}
              >
                <CheckSquare className="h-4 w-4" />
              </Button>
              
              <div className="relative">
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                  title="Filters & Sort"
                >
                  <Filter className="h-4 w-4" />
                </Button>
                {showAdvancedFilters && (
                  <div className="absolute top-full right-0 mt-1 bg-gray-900 border border-white/10 rounded-lg shadow-lg z-20 min-w-[280px]">
                    <div className="p-4 space-y-4">
                      <h3 className="text-sm font-medium text-white mb-3">Filters & Sort</h3>
                      
                      {/* Sort Options */}
                      <div>
                        <label className="block text-xs font-medium text-white/70 mb-2">Sort By</label>
                        <SortMenu 
                          isOpen={true} 
                          onClose={() => {}} 
                          inline={true}
                        />
                      </div>
                      
                      {/* Advanced Filters */}
                      <div>
                        <label className="block text-xs font-medium text-white/70 mb-2">Advanced Filters</label>
                        <AdvancedFilters 
                          isOpen={true} 
                          onClose={() => {}} 
                          inline={true}
                        />
                      </div>
                      
                      <div className="flex justify-end pt-2 border-t border-white/10">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => setShowAdvancedFilters(false)}
                        >
                          Close
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setShowSettings(true)}
              >
                <Settings className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-auto p-4">
          {children}
        </main>
      </div>

      {/* Category Manager Modal */}
      <CategoryManager
        isOpen={showCategoryManager}
        onClose={() => setShowCategoryManager(false)}
      />

      {/* Settings Modal */}
      <SettingsModal
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
      />
    </div>
  );
};