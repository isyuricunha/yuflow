import React from 'react';
import { motion } from 'framer-motion';
import { List, Grid3X3, AlignJustify } from 'lucide-react';
import { useUIStore } from '../../stores';
import { Button } from '../ui';

export const ViewModeSelector: React.FC = () => {
  const { viewMode, setViewMode } = useUIStore();

  const viewModes = [
    { key: 'list' as const, icon: List, label: 'List View' },
    { key: 'grid' as const, icon: Grid3X3, label: 'Grid View' },
    { key: 'compact' as const, icon: AlignJustify, label: 'Compact View' },
  ];

  return (
    <div className="flex items-center bg-white/5 rounded-lg p-1">
      {viewModes.map((mode) => {
        const IconComponent = mode.icon;
        const isActive = viewMode === mode.key;
        
        return (
          <Button
            key={mode.key}
            variant="ghost"
            size="sm"
            onClick={() => setViewMode(mode.key)}
            className={`relative px-3 py-2 transition-all ${
              isActive ? 'text-orange' : 'text-white/70 hover:text-white'
            }`}
            title={mode.label}
          >
            {isActive && (
              <motion.div
                layoutId="activeViewMode"
                className="absolute inset-0 bg-orange/20 rounded-md"
                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
              />
            )}
            <IconComponent className="h-4 w-4 relative z-10" />
          </Button>
        );
      })}
    </div>
  );
};
