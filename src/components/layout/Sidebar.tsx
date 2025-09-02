import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  Search, 
  Filter, 
  Settings, 
  Menu, 
  X,
  Home,
  Calendar,
  Archive
} from 'lucide-react';
import { Button } from '../ui/Button';
import { useUIStore } from '../../stores';

interface SidebarProps {
  onCreateTask: () => void;
  onOpenSettings: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  onCreateTask, 
  onOpenSettings 
}) => {
  const { sidebarCollapsed, toggleSidebar } = useUIStore();

  const sidebarVariants = {
    expanded: {
      width: 280,
      transition: {
        type: "spring" as const,
        damping: 25,
        stiffness: 300,
        duration: 0.4
      }
    },
    collapsed: {
      width: 80,
      transition: {
        type: "spring" as const,
        damping: 25,
        stiffness: 300,
        duration: 0.4
      }
    }
  };

  const contentVariants = {
    expanded: {
      opacity: 1,
      x: 0,
      transition: {
        delay: 0.1,
        duration: 0.3
      }
    },
    collapsed: {
      opacity: 0,
      x: -20,
      transition: {
        duration: 0.2
      }
    }
  };

  return (
    <motion.aside
      initial="expanded"
      animate={sidebarCollapsed ? "collapsed" : "expanded"}
      variants={sidebarVariants}
      className="fixed left-0 top-0 h-full glass-panel border-r border-white/10 z-30 flex flex-col"
    >
      {/* Header */}
      <div className="p-4 border-b border-white/10">
        <div className="flex items-center justify-between">
          <AnimatePresence mode="wait">
            {!sidebarCollapsed && (
              <motion.h1
                variants={contentVariants}
                initial="collapsed"
                animate="expanded"
                exit="collapsed"
                className="text-heading text-gradient font-bold"
              >
                Yuflow
              </motion.h1>
            )}
          </AnimatePresence>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleSidebar}
            className="touch-target"
          >
            <motion.div
              animate={{ rotate: sidebarCollapsed ? 180 : 0 }}
              transition={{ duration: 0.3 }}
            >
              {sidebarCollapsed ? <Menu size={20} /> : <X size={20} />}
            </motion.div>
          </Button>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {/* Create Task Button */}
        <motion.div
          whileHover={{ scale: sidebarCollapsed ? 1.05 : 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Button
            variant="primary"
            onClick={onCreateTask}
            className={`w-full touch-button ${sidebarCollapsed ? 'px-3' : 'px-4'}`}
          >
            <Plus size={20} />
            <AnimatePresence>
              {!sidebarCollapsed && (
                <motion.span
                  variants={contentVariants}
                  initial="collapsed"
                  animate="expanded"
                  exit="collapsed"
                  className="ml-3"
                >
                  New Task
                </motion.span>
              )}
            </AnimatePresence>
          </Button>
        </motion.div>

        {/* Navigation Items */}
        <div className="space-y-1">
          {[
            { icon: Home, label: 'All Tasks', active: true },
            { icon: Calendar, label: 'Today' },
            { icon: Archive, label: 'Completed' },
            { icon: Search, label: 'Search' },
            { icon: Filter, label: 'Filters' }
          ].map((item, index) => (
            <motion.button
              key={item.label}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1, duration: 0.3 }}
              whileHover={{ x: 4 }}
              className={`w-full flex items-center p-3 rounded-lg transition-colors touch-target ${
                item.active 
                  ? 'bg-orange/20 text-orange border border-orange/30' 
                  : 'text-white/70 hover:text-white hover:bg-white/5'
              }`}
            >
              <item.icon size={20} />
              <AnimatePresence>
                {!sidebarCollapsed && (
                  <motion.span
                    variants={contentVariants}
                    initial="collapsed"
                    animate="expanded"
                    exit="collapsed"
                    className="ml-3 text-sm font-medium"
                  >
                    {item.label}
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>
          ))}
        </div>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-white/10">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onOpenSettings}
          className="w-full flex items-center p-3 rounded-lg text-white/70 hover:text-white hover:bg-white/5 transition-colors touch-target"
        >
          <Settings size={20} />
          <AnimatePresence>
            {!sidebarCollapsed && (
              <motion.span
                variants={contentVariants}
                initial="collapsed"
                animate="expanded"
                exit="collapsed"
                className="ml-3 text-sm font-medium"
              >
                Settings
              </motion.span>
            )}
          </AnimatePresence>
        </motion.button>
      </div>
    </motion.aside>
  );
};
