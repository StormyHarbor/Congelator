import React from 'react';
import { Category, CATEGORIES } from '../types';
import { THEME } from '../constants';

interface CategoryNavProps {
  selectedCategory: Category;
  onSelect: (cat: Category) => void;
}

export const CategoryNav: React.FC<CategoryNavProps> = ({ selectedCategory, onSelect }) => {
  return (
    <div className="w-full overflow-x-auto hide-scrollbar py-4 mb-2">
      <div className="flex space-x-6 px-6">
        {CATEGORIES.map((cat) => {
          const isActive = selectedCategory === cat;
          return (
            <button
              key={cat}
              onClick={() => onSelect(cat)}
              className={`whitespace-nowrap text-lg font-medium transition-colors duration-200 relative
                ${isActive ? THEME.text : 'text-gray-400 hover:text-gray-500'}
              `}
            >
              {cat}
              {isActive && (
                <span className={`absolute -bottom-2 left-0 w-1/2 h-1 ${THEME.accent} rounded-full`} />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};