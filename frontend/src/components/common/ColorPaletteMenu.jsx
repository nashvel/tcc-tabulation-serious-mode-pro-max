/**
 * Color Palette Menu Component
 * Reusable context menu with color palette
 * 
 * Usage:
 * <ColorPaletteMenu 
 *   visible={contextMenu.visible}
 *   x={contextMenu.x}
 *   y={contextMenu.y}
 *   onColorSelect={handleColorSelect}
 *   onClose={closeContextMenu}
 *   menuItems={[...]}
 * />
 */

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { THEME_COLORS } from '../../lib/colorPalette';

export default function ColorPaletteMenu({
  visible = false,
  x = 0,
  y = 0,
  onColorSelect = () => {},
  onClose = () => {},
  menuItems = [],
  showColorPalette = true,
  colorScrollIndex = 0,
  onColorScrollChange = () => {}
}) {
  if (!visible) return null;

  return (
    <div
      className="fixed bg-white rounded-lg shadow-xl border border-gray-200 z-50 overflow-hidden"
      style={{ top: y, left: x, minWidth: '280px' }}
    >
      {/* Color Palette Section */}
      {showColorPalette && (
        <div className="px-3 py-3 border-b border-gray-200">
          <p className="text-xs font-semibold text-gray-600 mb-2 uppercase tracking-wide">Theme Color</p>
          <div className="flex items-center justify-center gap-2">
            {/* Left Arrow */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onColorScrollChange(Math.max(0, colorScrollIndex - 1));
              }}
              disabled={colorScrollIndex === 0}
              className="p-1 hover:bg-gray-100 rounded disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft size={16} className="text-gray-600" />
            </button>

            {/* Color Palette - Circular */}
            <div className="flex gap-2 overflow-hidden">
              {THEME_COLORS.slice(colorScrollIndex, colorScrollIndex + 4).map((color) => (
                <button
                  key={color.value}
                  onClick={(e) => {
                    e.stopPropagation();
                    onColorSelect(color);
                  }}
                  className="w-8 h-8 rounded-full border-2 border-gray-300 hover:border-gray-500 transition-colors cursor-pointer shadow-sm"
                  style={{ backgroundColor: color.primary }}
                  title={color.name}
                />
              ))}
            </div>

            {/* Right Arrow */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onColorScrollChange(Math.min(THEME_COLORS.length - 4, colorScrollIndex + 1));
              }}
              disabled={colorScrollIndex >= THEME_COLORS.length - 4}
              className="p-1 hover:bg-gray-100 rounded disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight size={16} className="text-gray-600" />
            </button>
          </div>
        </div>
      )}

      {/* Menu Items */}
      {menuItems.map((item, index) => (
        <div key={index}>
          <button
            onClick={(e) => {
              e.stopPropagation();
              item.onClick?.();
            }}
            className={`w-full px-4 py-2 text-left text-sm flex items-center gap-3 transition-colors ${
              item.isDanger
                ? 'text-red-500 hover:bg-red-50'
                : 'text-gray-700 hover:bg-gray-100'
            } ${item.hasBorder ? 'border-b border-gray-200' : ''}`}
          >
            {item.icon}
            {item.label}
          </button>
        </div>
      ))}
    </div>
  );
}
