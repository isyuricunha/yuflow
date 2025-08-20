import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, History } from 'lucide-react';
import { useUIStore, useTaskStore } from '../../stores';
import { Button } from '../ui';

interface SearchBarProps {
  className?: string;
}

interface SearchSuggestion {
  id: string;
  text: string;
  type: 'history' | 'suggestion';
}

export const SearchBar: React.FC<SearchBarProps> = ({ className = '' }) => {
  const { searchQuery, setSearchQuery } = useUIStore();
  const { searchTasks, tasks } = useTaskStore();
  const [isOpen, setIsOpen] = useState(false);
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Load search history from localStorage
  useEffect(() => {
    const history = localStorage.getItem('yuflow-search-history');
    if (history) {
      setSearchHistory(JSON.parse(history));
    }
  }, []);

  // Generate suggestions based on input
  useEffect(() => {
    if (!searchQuery.trim()) {
      // Show search history when no query
      const historySuggestions: SearchSuggestion[] = searchHistory
        .slice(0, 5)
        .map((item, index) => ({
          id: `history-${index}`,
          text: item,
          type: 'history'
        }));
      setSuggestions(historySuggestions);
      return;
    }

    // Generate suggestions from task titles and descriptions
    const taskSuggestions = new Set<string>();
    tasks.forEach(task => {
      const title = task.title.toLowerCase();
      const description = task.description?.toLowerCase() || '';
      const query = searchQuery.toLowerCase();

      // Add matching words from titles
      if (title.includes(query)) {
        const words = title.split(' ');
        words.forEach(word => {
          if (word.includes(query) && word.length > 2) {
            taskSuggestions.add(word);
          }
        });
      }

      // Add matching words from descriptions
      if (description.includes(query)) {
        const words = description.split(' ');
        words.forEach(word => {
          if (word.includes(query) && word.length > 2) {
            taskSuggestions.add(word);
          }
        });
      }
    });

    const suggestionList: SearchSuggestion[] = Array.from(taskSuggestions)
      .slice(0, 5)
      .map((item, index) => ({
        id: `suggestion-${index}`,
        text: item,
        type: 'suggestion'
      }));

    setSuggestions(suggestionList);
  }, [searchQuery, tasks, searchHistory]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    searchTasks(query);
    
    if (query.trim()) {
      // Add to search history
      const newHistory = [query, ...searchHistory.filter(item => item !== query)].slice(0, 10);
      setSearchHistory(newHistory);
      localStorage.setItem('yuflow-search-history', JSON.stringify(newHistory));
    }
    
    setIsOpen(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    setIsOpen(true);
  };

  const handleSuggestionClick = (suggestion: SearchSuggestion) => {
    handleSearch(suggestion.text);
  };

  const clearSearch = () => {
    setSearchQuery('');
    searchTasks('');
    setIsOpen(false);
    inputRef.current?.focus();
  };

  const clearHistory = () => {
    setSearchHistory([]);
    localStorage.removeItem('yuflow-search-history');
    setSuggestions([]);
  };

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-white/50" />
        <input
          ref={inputRef}
          type="text"
          placeholder="Search tasks..."
          value={searchQuery}
          onChange={handleInputChange}
          onFocus={() => setIsOpen(true)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              handleSearch(searchQuery);
            } else if (e.key === 'Escape') {
              setIsOpen(false);
            }
          }}
          className="w-full pl-10 pr-10 py-2 bg-white/5 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-orange/80 transition-all"
        />
        {searchQuery && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearSearch}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 hover:bg-white/10"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Search Suggestions Dropdown */}
      <AnimatePresence>
        {isOpen && suggestions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full left-0 right-0 mt-2 bg-gray-900 border border-white/10 rounded-lg shadow-lg z-50 max-h-64 overflow-y-auto"
          >
            <div className="p-2">
              {searchHistory.length > 0 && !searchQuery && (
                <div className="flex items-center justify-between px-3 py-2 border-b border-white/10">
                  <span className="text-xs font-medium text-white/70">Recent Searches</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearHistory}
                    className="text-xs text-white/50 hover:text-white p-1"
                  >
                    Clear
                  </Button>
                </div>
              )}
              
              <div className="space-y-1 mt-2">
                {suggestions.map((suggestion) => (
                  <button
                    key={suggestion.id}
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="w-full flex items-center space-x-3 px-3 py-2 text-sm rounded-md hover:bg-white/10 transition-colors text-left"
                  >
                    {suggestion.type === 'history' ? (
                      <History className="h-4 w-4 text-white/40" />
                    ) : (
                      <Search className="h-4 w-4 text-white/40" />
                    )}
                    <span className="text-white">{suggestion.text}</span>
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
