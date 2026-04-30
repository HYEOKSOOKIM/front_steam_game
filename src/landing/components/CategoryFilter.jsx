import React from 'react';
import { categories } from '../data';

const CategoryFilter = ({ activeCategory, onSelect }) => {
  return (
    <div className="flex flex-wrap gap-3 mb-10">
      {categories.map((category) => (
        <button
          key={category}
          onClick={() => onSelect(category)}
          className={`px-5 py-2 border rounded-full text-sm font-medium transition-all duration-300 ${
            (activeCategory === category || (category === '전체' && !activeCategory))
              ? 'bg-highlight border-highlight text-steam-dark shadow-[0_0_15px_rgba(102,192,244,0.4)]'
              : 'bg-white/5 border-white/10 text-primary hover:border-highlight hover:text-highlight hover:bg-highlight/5'
          }`}
        >
          {category}
        </button>
      ))}
    </div>
  );
};

export default CategoryFilter;
