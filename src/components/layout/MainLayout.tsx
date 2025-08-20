import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Menu, X, Plus, Filter, Settings, CheckSquare, Tag } from 'lucide-react';
import { useUIStore } from '../../stores';
import { Button } from '../ui';
import { CategoryManager, SortMenu, SettingsModal, SearchBar, AdvancedFilters, ViewModeSelector } from '../features';

interface MainLayoutProps {
  children: React.ReactNode;
  onCreateTask?: () => void;
}

export const MainLayout: React.FC<MainLayoutProps> = ({ children, onCreateTask }) => {
  const { sidebarOpen, setSidebarOpen, setBulkMode } = useUIStore();
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
            <a href="#" className="block px-3 py-2 rounded-lg hover:bg-white/10 transition-colors">
              All Tasks
            </a>
            <a href="#" className="block px-3 py-2 rounded-lg hover:bg-white/10 transition-colors">
              Today
            </a>
            <a href="#" className="block px-3 py-2 rounded-lg hover:bg-white/10 transition-colors">
              Upcoming
            </a>
            <a href="#" className="block px-3 py-2 rounded-lg hover:bg-white/10 transition-colors">
              Completed
            </a>
          </nav>
          
          <div className="border-t border-white/10 pt-4">
            <h3 className="text-sm font-medium text-white/70 mb-2">Categories</h3>
            <div className="space-y-1">
              <div className="flex items-center px-3 py-1 rounded hover:bg-white/10 transition-colors">
                <div className="w-3 h-3 rounded-full bg-orange mr-2"></div>
                <span className="text-sm">General</span>
              </div>
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
                  onClick={() => setShowSortMenu(!showSortMenu)}
                >
                  <Filter className="h-4 w-4" />
                </Button>
                <SortMenu 
                  isOpen={showSortMenu} 
                  onClose={() => setShowSortMenu(false)} 
                />
              </div>
              
              <div className="relative">
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                >
                  <Filter className="h-4 w-4" />
                </Button>
                <AdvancedFilters 
                  isOpen={showAdvancedFilters} 
                  onClose={() => setShowAdvancedFilters(false)} 
                />
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