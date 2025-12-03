import { useState, useEffect, useMemo } from 'react';
import Swal from 'sweetalert2';
import axios from 'axios';
import {
  ColorPaletteContextMenu,
  loadColors,
  saveColors,
  applyColumnColor,
  getColumnColor
} from 'nachtify';
import { criteriaAPI } from '../../../api/services';

export default function CategoriesTab() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [contextMenu, setContextMenu] = useState({ visible: false, x: 0, y: 0, row: null, column: null });
  const [colorScrollIndex, setColorScrollIndex] = useState(0);
  const [categoryColors, setCategoryColors] = useState(() => loadColors());

  const apiBase = useMemo(() => {
    const url = new URL(window.location.href);
    return `${url.protocol}//${url.hostname}:8000`;
  }, []);

  // Load categories from API
  useEffect(() => {
    const loadCategories = async (showLoadingSpinner = true) => {
      try {
        if (showLoadingSpinner) {
          setLoading(true);
        }
        const response = await criteriaAPI.getAll();
        setCategories(response.data || []);
      } catch (error) {
        console.error('Error loading categories:', error);
        if (showLoadingSpinner) {
          Swal.fire({
            icon: 'error',
            title: 'Error', 
            text: 'Failed to load categories',
            confirmButtonColor: '#EF4444'
          });
        }
      } finally {
        if (showLoadingSpinner) {
          setLoading(false);
        }
      }
    };

    // Initial load with spinner
    loadCategories(true);

    // Refresh every 2 seconds silently (no spinner, no error alerts)
    const interval = setInterval(() => loadCategories(false), 2000);
    return () => clearInterval(interval);
  }, []);

  const handleRowContextMenu = (e, category, column) => {
    e.preventDefault();
    e.stopPropagation();
    setContextMenu({
      visible: true,
      x: e.clientX,
      y: e.clientY,
      row: category,
      column
    });
  };

  const closeContextMenu = () => {
    setContextMenu({ visible: false, x: 0, y: 0, row: null, column: null });
  };

  // Save colors to localStorage whenever they change
  useEffect(() => {
    saveColors(categoryColors);
  }, [categoryColors]);

  // Close context menu when clicking elsewhere
  useEffect(() => {
    const handleClick = () => closeContextMenu();
    if (contextMenu.visible) {
      document.addEventListener('click', handleClick);
      return () => document.removeEventListener('click', handleClick);
    }
  }, [contextMenu.visible]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-sm text-gray-600">Loading categories...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      <table className="w-full min-w-max border-collapse">
        <thead>
          <tr className="bg-white border-b border-gray-300">
            <th className="px-4 py-2.5 text-center text-xs font-medium text-gray-900 border-r border-gray-300 w-12">
              #
            </th>
            <th className="px-4 py-2.5 text-left text-xs font-medium text-gray-900 border-r border-gray-300 min-w-[200px]">
              Category Name
            </th>
            <th className="px-4 py-2.5 text-left text-xs font-medium text-gray-900 border-r border-gray-300 min-w-[250px]">
              Description
            </th>
            <th className="px-4 py-2.5 text-center text-xs font-medium text-gray-900 min-w-[100px]">
              Order
            </th>
          </tr>
        </thead>
        <tbody>
          {categories && categories.length > 0 ? (
            categories.map((category, index) => (
              <tr 
                key={category.id} 
                className="group border-b border-gray-200 hover:bg-gray-50 cursor-context-menu"
                style={{ backgroundColor: getColumnColor(categoryColors, category.id, 'row', 'transparent') }}
                title="Right-click for color options"
              >
                <td 
                  className="px-4 py-2.5 text-center text-sm text-gray-700 border-r border-gray-200"
                  onContextMenu={(e) => handleRowContextMenu(e, category, 'number')}
                  style={{ color: getColumnColor(categoryColors, category.id, 'number', '#374151') }}
                >
                  {index + 1}.
                </td>
                <td 
                  className="px-4 py-2.5 text-left text-sm text-gray-900 border-r border-gray-200"
                  onContextMenu={(e) => handleRowContextMenu(e, category, 'name')}
                  style={{ backgroundColor: getColumnColor(categoryColors, category.id, 'name', 'transparent') }}
                  title="Right-click to color"
                >
                  {category.name}
                </td>
                <td 
                  className="px-4 py-2.5 text-left text-sm text-gray-700 border-r border-gray-200"
                  onContextMenu={(e) => handleRowContextMenu(e, category, 'description')}
                  style={{ backgroundColor: getColumnColor(categoryColors, category.id, 'description', 'transparent') }}
                  title="Right-click to color"
                >
                  {category.description || '-'}
                </td>
                <td 
                  className="px-4 py-2.5 text-center text-sm text-gray-900"
                  onContextMenu={(e) => handleRowContextMenu(e, category, 'order')}
                >
                  <strong>{category.id}</strong>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="4" className="px-4 py-8 text-center text-sm text-gray-500">
                No categories found
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* Nachtify Color Palette Context Menu */}
      <ColorPaletteContextMenu
        visible={contextMenu.visible}
        x={contextMenu.x}
        y={contextMenu.y}
        colorScrollIndex={colorScrollIndex}
        onColorScrollChange={setColorScrollIndex}
        onColorSelect={(color) => {
          setCategoryColors(prev => applyColumnColor(prev, contextMenu.row.id, contextMenu.column, color));
          closeContextMenu();
          Swal.fire({
            icon: 'success',
            title: 'Color Applied',
            text: `${contextMenu.column} color changed to ${color.name}`,
            timer: 1000,
            showConfirmButton: false
          });
        }}
        onClose={closeContextMenu}
        menuItems={[]}
      />
    </div>
  );
}
