import React from 'react';

export default function CategorySubmenu({
  eventSequence,
  selectedCategoryIndex,
  isSwitchingCategory,
  categorySubmenu,
  onSwitchCategory
}) {
  return (
    <div
      className={`absolute top-1/2 -translate-y-1/2 bg-white rounded-lg shadow-xl border border-gray-200 py-2 min-w-[220px] z-50 max-h-[calc(100vh-100px)] ${
        categorySubmenu.position === 'left' ? 'right-full mr-1' : 'left-full ml-1'
      }`}
      onClick={(e) => e.stopPropagation()}
    >
      <p className="px-4 py-1 text-xs font-semibold text-gray-500 uppercase tracking-wider">
        Available Categories
      </p>
      <div 
        className="overflow-y-auto category-submenu-scroll"
        style={{
          scrollbarWidth: 'thin',
          scrollbarColor: 'transparent transparent',
          maxHeight: 'calc(100vh - 150px)'
        }}
      >
        <style>{`
          .category-submenu-scroll::-webkit-scrollbar {
            width: 6px;
          }
          .category-submenu-scroll::-webkit-scrollbar-track {
            background: transparent;
          }
          .category-submenu-scroll::-webkit-scrollbar-thumb {
            background: transparent;
          }
        `}</style>
        {eventSequence.map((category, idx) => (
          <button
            key={category.id}
            onClick={() => onSwitchCategory(idx)}
            disabled={isSwitchingCategory}
            className={`w-full px-4 py-2 text-left text-sm flex items-center gap-2 transition-colors ${
              selectedCategoryIndex === idx
                ? 'bg-blue-50 text-blue-700 font-medium'
                : 'text-gray-700 hover:bg-gray-100'
            } ${isSwitchingCategory ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <span className={`w-2 h-2 rounded-full ${selectedCategoryIndex === idx ? 'bg-blue-500' : 'bg-gray-300'}`} />
            {category.name}
          </button>
        ))}
      </div>
      {isSwitchingCategory && (
        <div className="px-4 py-2 text-xs text-gray-500 flex items-center gap-2">
          <span className="animate-spin">⟳</span>
          Switching...
        </div>
      )}
    </div>
  );
}
