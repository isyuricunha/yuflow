import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Settings, Moon, Sun, Database, Shield, Info } from 'lucide-react';
import { useUIStore } from '../../stores';
import { Modal, Button } from '../ui';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const { darkMode, setDarkMode } = useUIStore();
  const [activeTab, setActiveTab] = useState<'general' | 'privacy' | 'about'>('general');

  const tabs = [
    { key: 'general' as const, label: 'General', icon: Settings },
    { key: 'privacy' as const, label: 'Privacy', icon: Shield },
    { key: 'about' as const, label: 'About', icon: Info },
  ];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Settings" size="lg">
      <div className="flex h-96">
        {/* Sidebar */}
        <div className="w-48 border-r border-white/10 pr-4">
          <nav className="space-y-1">
            {tabs.map((tab) => {
              const IconComponent = tab.icon;
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                    activeTab === tab.key
                      ? 'bg-orange/20 text-orange'
                      : 'text-white/70 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <IconComponent className="h-4 w-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Content */}
        <div className="flex-1 pl-6">
          {activeTab === 'general' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-white mb-4">Appearance</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium text-white">Theme</label>
                      <p className="text-xs text-white/60">Choose your preferred theme</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setDarkMode(!darkMode)}
                      className="flex items-center space-x-2"
                    >
                      {darkMode ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
                      <span>{darkMode ? 'Dark' : 'Light'}</span>
                    </Button>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-white mb-4">Data</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium text-white">Storage</label>
                      <p className="text-xs text-white/60">All data is stored locally</p>
                    </div>
                    <div className="flex items-center space-x-2 text-green-400">
                      <Database className="h-4 w-4" />
                      <span className="text-sm">Local Only</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'privacy' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-white mb-4">Privacy First</h3>
                <div className="space-y-4">
                  <div className="p-4 bg-green-900/20 border border-green-500/20 rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <Shield className="h-5 w-5 text-green-400" />
                      <span className="font-medium text-green-400">100% Private</span>
                    </div>
                    <ul className="text-sm text-white/80 space-y-1">
                      <li>• No data sent to external servers</li>
                      <li>• No telemetry or analytics</li>
                      <li>• All data stored locally on your device</li>
                      <li>• No account registration required</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'about' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-white mb-4">Yuflow</h3>
                <div className="space-y-4">
                  <div>
                    <p className="text-white/80 mb-4">
                      A privacy-first, local-only task management application built with modern web technologies.
                    </p>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-white/60">Version:</span>
                        <span className="text-white">1.0.0</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/60">Built with:</span>
                        <span className="text-white">React + TypeScript</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/60">Platform:</span>
                        <span className="text-white">Web + Desktop</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
};
