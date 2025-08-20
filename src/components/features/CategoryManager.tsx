import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Edit, Trash2, Palette, X, Save } from 'lucide-react';
import { useTaskStore } from '../../stores';
import { Button, Input, Modal } from '../ui';
import { Category, CreateCategoryInput } from '../../types';

interface CategoryManagerProps {
  isOpen: boolean;
  onClose: () => void;
}

const DEFAULT_COLORS = [
  '#F97316', // Orange (default)
  '#EF4444', // Red
  '#10B981', // Green
  '#3B82F6', // Blue
  '#8B5CF6', // Purple
  '#F59E0B', // Amber
  '#EC4899', // Pink
  '#6B7280', // Gray
];

export const CategoryManager: React.FC<CategoryManagerProps> = ({ isOpen, onClose }) => {
  const { categories, loadCategories, addCategory, updateCategory, deleteCategory } = useTaskStore();
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [selectedColor, setSelectedColor] = useState(DEFAULT_COLORS[0]);
  const [showColorPicker, setShowColorPicker] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadCategories();
    }
  }, [isOpen, loadCategories]);

  const handleCreateCategory = async () => {
    if (newCategoryName.trim()) {
      const categoryInput: CreateCategoryInput = {
        name: newCategoryName.trim(),
        color: selectedColor,
      };
      
      await addCategory(categoryInput);
      setNewCategoryName('');
      setSelectedColor(DEFAULT_COLORS[0]);
    }
  };

  const handleUpdateCategory = async (category: Category) => {
    if (editingCategory && newCategoryName.trim()) {
      await updateCategory(category.id, {
        name: newCategoryName.trim(),
        color: selectedColor,
      });
      setEditingCategory(null);
      setNewCategoryName('');
      setSelectedColor(DEFAULT_COLORS[0]);
    }
  };

  const handleDeleteCategory = async (categoryId: number) => {
    await deleteCategory(categoryId);
  };

  const startEditing = (category: Category) => {
    setEditingCategory(category);
    setNewCategoryName(category.name);
    setSelectedColor(category.color);
  };

  const cancelEditing = () => {
    setEditingCategory(null);
    setNewCategoryName('');
    setSelectedColor(DEFAULT_COLORS[0]);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Manage Categories" size="md">
      <div className="space-y-6">
        {/* Create New Category */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-white">Create New Category</h3>
          <div className="space-y-3">
            <Input
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              placeholder="Category name"
              className="w-full"
            />
            
            {/* Color Picker */}
            <div className="space-y-2">
              <label className="text-sm text-white/70">Color</label>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setShowColorPicker(!showColorPicker)}
                  className="w-8 h-8 rounded-full border-2 border-white/20 flex items-center justify-center"
                  style={{ backgroundColor: selectedColor }}
                >
                  <Palette className="h-4 w-4 text-white" />
                </button>
                <span className="text-sm text-white/70">{selectedColor}</span>
              </div>
              
              {showColorPicker && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="grid grid-cols-4 gap-2 p-3 bg-gray-800 rounded-lg border border-white/10"
                >
                  {DEFAULT_COLORS.map((color) => (
                    <button
                      key={color}
                      onClick={() => {
                        setSelectedColor(color);
                        setShowColorPicker(false);
                      }}
                      className={`w-8 h-8 rounded-full border-2 transition-all ${
                        selectedColor === color ? 'border-white scale-110' : 'border-white/20'
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </motion.div>
              )}
            </div>

            <Button
              onClick={handleCreateCategory}
              disabled={!newCategoryName.trim()}
              className="w-full"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Category
            </Button>
          </div>
        </div>

        {/* Existing Categories */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-white">Existing Categories</h3>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            <AnimatePresence>
              {categories.map((category) => (
                <motion.div
                  key={category.id}
                  layout
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/10"
                >
                  {editingCategory?.id === category.id ? (
                    <div className="flex items-center space-x-3 flex-1">
                      <div
                        className="w-4 h-4 rounded-full flex-shrink-0"
                        style={{ backgroundColor: selectedColor }}
                      />
                      <Input
                        value={newCategoryName}
                        onChange={(e) => setNewCategoryName(e.target.value)}
                        className="flex-1"
                        autoFocus
                      />
                      <div className="flex items-center space-x-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleUpdateCategory(category)}
                          className="p-1 hover:text-green-400"
                        >
                          <Save className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={cancelEditing}
                          className="p-1 hover:text-red-400"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center space-x-3">
                        <div
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: category.color }}
                        />
                        <span className="text-white">{category.name}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => startEditing(category)}
                          className="p-1"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteCategory(category.id)}
                          className="p-1 hover:text-red-400"
                          disabled={category.name === 'General'} // Prevent deleting default category
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </Modal>
  );
};
