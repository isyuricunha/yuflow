import React, { useState, useEffect } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { MainLayout } from './components/layout/MainLayout';
import { TaskList, CreateTaskModal, BulkActions } from './components/features';
import { Button } from './components/ui';
import { Plus } from 'lucide-react';
import { isDesktop } from './services/platform';
import './styles/globals.css';

function App() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  useEffect(() => {
    // Initialize database on desktop
    if (isDesktop()) {
      invoke('init_database').catch(console.error);
    }
  }, []);

  return (
    <MainLayout onCreateTask={() => setIsCreateModalOpen(true)}>
      <div className="space-y-6">
        {/* Quick Actions */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Tasks</h1>
            <p className="text-white/70">Manage your tasks efficiently</p>
          </div>
          <Button onClick={() => setIsCreateModalOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Task
          </Button>
        </div>

        {/* Task List */}
        <TaskList />

        {/* Create Task Modal */}
        <CreateTaskModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
        />

        {/* Bulk Actions */}
        <BulkActions />
      </div>
    </MainLayout>
  );
}

export default App;
