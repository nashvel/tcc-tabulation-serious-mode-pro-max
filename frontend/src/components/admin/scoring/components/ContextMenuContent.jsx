import React from 'react';
import { Lock, Unlock, SkipForward, Copy, ChevronRight } from 'lucide-react';
import { THEME_COLORS, applyColumnColor } from 'nachtify';
import CategorySubmenu from './CategorySubmenu';

export default function ContextMenuContent({
  isLocked,
  onLockToggle,
  colorScrollIndex,
  onColorScrollChange,
  scoreColors,
  onColorSelect,
  contextMenu,
  categorySubmenu,
  selectedCategoryIndex,
  isSwitchingCategory,
  eventSequence,
  onCategoryHover,
  onCategoryLeave,
  onSwitchCategory,
  onCopyCandidate
}) {
  return (
    <>
      {/* Theme Color Section */}
      <div className="px-4 py-2 border-b border-gray-200">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Theme Color</p>
        <div className="flex items-center justify-center gap-1">
          <button
            onClick={(e) => { e.stopPropagation(); onColorScrollChange(Math.max(0, colorScrollIndex - 1)); }}
            disabled={colorScrollIndex === 0}
            className="p-1 hover:bg-gray-100 rounded disabled:opacity-30 transition-colors"
          >
            ‹
          </button>
          {THEME_COLORS?.slice(colorScrollIndex, colorScrollIndex + 4).map((color) => (
            <button
              key={color.value}
              onClick={(e) => {
                e.stopPropagation();
                onColorSelect(color);
              }}
              className="w-8 h-8 rounded-full border-2 border-white shadow-sm hover:scale-110 transition-transform"
              style={{ backgroundColor: color.value }}
              title={color.name}
            />
          ))}
          <button
            onClick={(e) => { e.stopPropagation(); onColorScrollChange(Math.min((THEME_COLORS?.length || 4) - 4, colorScrollIndex + 1)); }}
            disabled={colorScrollIndex >= (THEME_COLORS?.length || 4) - 4}
            className="p-1 hover:bg-gray-100 rounded disabled:opacity-30 transition-colors"
          >
            ›
          </button>
        </div>
      </div>

      {/* Lock/Unlock */}
      <button
        onClick={onLockToggle}
        className="w-full px-4 py-2 text-left text-sm flex items-center gap-3 text-gray-700 hover:bg-gray-100 border-b border-gray-200"
      >
        {isLocked ? <Unlock size={16} /> : <Lock size={16} />}
        {isLocked ? 'Unlock Judges' : 'Lock Judges'}
      </button>

      {/* Switch Category with Submenu */}
      <div
        className="relative"
        onMouseEnter={onCategoryHover}
        onMouseLeave={onCategoryLeave}
      >
        <button
          className="w-full px-4 py-2 text-left text-sm flex items-center justify-between gap-3 text-gray-700 hover:bg-gray-100 border-b border-gray-200"
        >
          <span className="flex items-center gap-3">
            <SkipForward size={16} />
            Switch Category
          </span>
          <ChevronRight size={14} className="text-gray-400" />
        </button>

        {/* Category Submenu */}
        {categorySubmenu.visible && eventSequence.length > 0 && (
          <CategorySubmenu
            eventSequence={eventSequence}
            selectedCategoryIndex={selectedCategoryIndex}
            isSwitchingCategory={isSwitchingCategory}
            categorySubmenu={categorySubmenu}
            onSwitchCategory={onSwitchCategory}
          />
        )}
      </div>

      {/* Copy Candidate */}
      <button
        onClick={onCopyCandidate}
        className="w-full px-4 py-2 text-left text-sm flex items-center gap-3 text-gray-700 hover:bg-gray-100"
      >
        <Copy size={16} />
        Copy Candidate
      </button>
    </>
  );
}
