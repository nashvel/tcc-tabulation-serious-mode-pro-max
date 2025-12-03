import { Lock, Edit3, Trash2, Copy } from 'lucide-react';
import { useState, useEffect, useMemo } from 'react';
import Swal from 'sweetalert2';
import axios from 'axios';
import {
  ColorPaletteContextMenu,
  loadColors,
  saveColors,
  applyColumnColor,
  getColumnColor,
  applyGroupColor,
  getGroupColor
} from 'nachtify';

export default function CandidatesTab({ candidates, isLocked = false, onCandidateUpdated }) {
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({});
  const [contextMenu, setContextMenu] = useState({ visible: false, x: 0, y: 0, row: null, column: null });
  const [saving, setSaving] = useState(false);
  const [colorScrollIndex, setColorScrollIndex] = useState(0);
  const [candidateColors, setCandidateColors] = useState(() => loadColors());

  const apiBase = useMemo(() => {
    const url = new URL(window.location.href);
    return `${url.protocol}//${url.hostname}:8000`;
  }, []);

  const handleEdit = (candidate) => {
    setEditingId(candidate.id);
    setEditData({ ...candidate });
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditData({});
  };

  const handleSave = async (candidateId) => {
    try {
      setSaving(true);
      const adminToken = localStorage.getItem('adminToken');
      
      if (!adminToken) {
        throw new Error('Not authenticated. Please login again.');
      }
      
      // Use axios with proper auth header
      const response = await axios.put(
        `${apiBase}/api/candidates/${candidateId}`,
        {
          name: editData.name,
          number: editData.number,
          gender: editData.gender
        },
        {
          headers: {
            'Authorization': `Bearer ${adminToken}`,
            'Accept': 'application/json'
          }
        }
      );

      Swal.fire({
        icon: 'success',
        title: 'Saved!',
        text: 'Candidate updated successfully',
        timer: 1500,
        showConfirmButton: false
      });
      setEditingId(null);
      setEditData({});
      
      // Update local candidates state immediately
      const updatedCandidates = candidates.map(c => 
        c.id === candidateId ? { ...c, name: response.data.name } : c
      );
      
      // Trigger parent refresh if callback provided
      if (onCandidateUpdated) {
        onCandidateUpdated();
      }
    } catch (error) {
      console.error('Error saving candidate:', error);
      const errorMsg = error.response?.data?.message || error.message || 'Failed to save candidate';
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: errorMsg,
        confirmButtonColor: '#EF4444'
      });
    } finally {
      setSaving(false);
    }
  };

  const handleRowContextMenu = (e, candidate, column) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Close all other context menus first
    window.dispatchEvent(new CustomEvent('closeAllContextMenus'));
    
    setTimeout(() => {
      setContextMenu({
        visible: true,
        x: e.clientX,
        y: e.clientY,
        row: candidate,
        column
      });
    }, 0);
  };

  const closeContextMenu = () => {
    setContextMenu({ visible: false, x: 0, y: 0, row: null, column: null });
  };

  // Save colors to localStorage whenever they change
  useEffect(() => {
    saveColors(candidateColors);
  }, [candidateColors]);

  // Listen for global close event
  useEffect(() => {
    const handleCloseAllMenus = () => closeContextMenu();
    window.addEventListener('closeAllContextMenus', handleCloseAllMenus);
    return () => window.removeEventListener('closeAllContextMenus', handleCloseAllMenus);
  }, [closeContextMenu]);

  // Close context menu when clicking elsewhere
  useEffect(() => {
    const handleClick = () => closeContextMenu();
    const handleScroll = () => closeContextMenu();
    if (contextMenu.visible) {
      document.addEventListener('click', handleClick);
      document.addEventListener('scroll', handleScroll, true);
      return () => {
        document.removeEventListener('click', handleClick);
        document.removeEventListener('scroll', handleScroll, true);
      };
    }
  }, [contextMenu.visible]);

  const handleContextEdit = () => {
    if (contextMenu.row && !isLocked) {
      handleEdit(contextMenu.row);
    } else if (isLocked) {
      Swal.fire({
        icon: 'warning',
        title: 'Editing Locked',
        text: 'Unlock from the sidebar to edit candidates',
        confirmButtonColor: '#3B82F6'
      });
    }
    closeContextMenu();
  };

  const handleContextCopy = () => {
    if (contextMenu.row) {
      navigator.clipboard.writeText(`#${contextMenu.row.number} - ${contextMenu.row.name}`);
      Swal.fire({
        icon: 'success',
        title: 'Copied!',
        text: 'Candidate info copied to clipboard',
        timer: 1500,
        showConfirmButton: false
      });
    }
    closeContextMenu();
  };

  const handleContextDelete = () => {
    closeContextMenu();
    if (isLocked) {
      Swal.fire({
        icon: 'warning',
        title: 'Editing Locked',
        text: 'Unlock from the sidebar to delete candidates',
        confirmButtonColor: '#3B82F6'
      });
      return;
    }
    
    Swal.fire({
      icon: 'warning',
      title: 'Delete Candidate?',
      html: `Are you sure you want to delete <strong>#${contextMenu.row?.number} - ${contextMenu.row?.name}</strong>?`,
      showCancelButton: true,
      confirmButtonColor: '#EF4444',
      cancelButtonColor: '#6B7280',
      confirmButtonText: 'Yes, delete',
      cancelButtonText: 'Cancel'
    }).then((result) => {
      if (result.isConfirmed) {
        Swal.fire({
          icon: 'info',
          title: 'Delete - Beta',
          text: 'This feature is still in development',
          confirmButtonColor: '#3B82F6'
        });
      }
    });
  };

  // Group candidates by number
  const groupedCandidates = candidates?.reduce((acc, candidate) => {
    const key = candidate.number;
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(candidate);
    return acc;
  }, {}) || {};

  // Track which number cells have been rendered
  const renderedNumbers = new Set();

  return (
    <div className="relative">
      {/* Lock Overlay */}
      {isLocked && (
        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-40 rounded-lg">
          <div className="bg-white rounded-lg p-6 shadow-xl text-center">
            <Lock size={32} className="text-slate-600 mx-auto mb-3" />
            <p className="text-sm font-semibold text-slate-900">Editing Locked</p>
            <p className="text-xs text-slate-600 mt-1">Unlock from the sidebar to edit candidates</p>
          </div>
        </div>
      )}

      <table className="w-full min-w-max border-collapse">
        <thead>
          <tr className="bg-white border-b border-gray-300">
            <th className="px-4 py-2.5 text-center text-xs font-medium text-gray-900 border-r border-gray-300 min-w-[80px]">
              Number
            </th>
            <th className="px-4 py-2.5 text-left text-xs font-medium text-gray-900 border-r border-gray-300 min-w-[200px]">
              Name
            </th>
            <th className="px-4 py-2.5 text-center text-xs font-medium text-gray-900 min-w-[100px]">
              Gender
            </th>
          </tr>
        </thead>
        <tbody>
          {candidates && candidates.length > 0 ? (
            candidates.map((candidate, index) => {
              const shouldRenderNumber = !renderedNumbers.has(candidate.number);
              const groupSize = groupedCandidates[candidate.number]?.length || 1;
              
              if (shouldRenderNumber) {
                renderedNumbers.add(candidate.number);
              }

              return (
                <tr 
                  key={candidate.id} 
                  data-has-context-menu="true"
                  className="group border-b border-gray-200 hover:bg-gray-50 cursor-context-menu"
                  style={{ backgroundColor: getGroupColor(candidateColors, `gender-${candidate.gender}`) }}
                  title="Right-click for color options"
                >
                  {shouldRenderNumber && (
                    <td 
                      rowSpan={groupSize} 
                      className="px-4 py-2.5 text-center text-4xl font-bold border-r border-gray-200 align-middle bg-white"
                      onContextMenu={(e) => handleRowContextMenu(e, candidate, 'number')}
                      style={{ 
                        fontFamily: 'Georgia, "Garamond", "Times New Roman", serif', 
                        letterSpacing: '0.05em',
                        color: getColumnColor(candidateColors, candidate.id, 'number', '#000000')
                      }}
                    >
                      {candidate.number}
                    </td>
                  )}
                  <td 
                    className="px-4 py-2.5 text-left text-sm border-r border-gray-200 relative group/name"
                    onContextMenu={(e) => handleRowContextMenu(e, candidate, 'name')}
                    style={{ 
                      backgroundColor: getColumnColor(candidateColors, candidate.id, 'name', 'transparent'),
                      color: '#000000'
                    }}
                    title="Right-click to color"
                  >
                    {editingId === candidate.id ? (
                      <>
                        <span className="invisible">{candidate.name}</span>
                        <div className="absolute inset-0 flex items-center px-2 gap-1 bg-white">
                          <input
                            type="text"
                            value={editData.name}
                            onChange={(e) => setEditData({ ...editData, name: e.target.value.toUpperCase() })}
                            className="flex-1 min-w-0 px-2 py-1 border border-slate-300 rounded text-sm uppercase"
                            autoFocus
                          />
                          <button
                            onClick={() => handleSave(candidate.id)}
                            disabled={saving}
                            className="px-2 py-1 bg-green-500 hover:bg-green-600 text-white text-xs rounded font-semibold transition-colors disabled:opacity-50 whitespace-nowrap"
                          >
                            {saving ? '...' : '✓'}
                          </button>
                          <button
                            onClick={handleCancel}
                            className="px-2 py-1 bg-slate-400 hover:bg-slate-500 text-white text-xs rounded font-semibold transition-colors"
                          >
                            ✕
                          </button>
                        </div>
                      </>
                    ) : (
                      candidate.name
                    )}
                  </td>
                  <td 
                    className="px-4 py-2.5 text-center align-middle cursor-context-menu"
                    onContextMenu={(e) => handleRowContextMenu(e, candidate, 'gender')}
                  >
                    {candidate.gender === 'Female' ? (
                      <i className="bi bi-person-fill" style={{ fontSize: '2.5rem', color: '#EC4899' }}></i>
                    ) : (
                      <i className="bi bi-person-fill" style={{ fontSize: '2.5rem', color: '#3B82F6' }}></i>
                    )}
                  </td>
                </tr>
              );
            })
          ) : (
            <tr>
              <td colSpan="3" className="px-4 py-8 text-center text-sm text-gray-500">
                No candidates found
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
          if (contextMenu.column === 'number') {
            setCandidateColors(prev => applyColumnColor(prev, contextMenu.row.id, 'number', color));
          } else if (contextMenu.column === 'name') {
            setCandidateColors(prev => applyColumnColor(prev, contextMenu.row.id, 'name', color));
          } else if (contextMenu.column === 'gender') {
            setCandidateColors(prev => applyGroupColor(prev, `gender-${contextMenu.row.gender}`, color));
          }
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
        menuItems={[
          {
            label: 'Edit Candidate',
            icon: <Edit3 size={16} />,
            onClick: handleContextEdit,
            hasBorder: true
          },
          {
            label: 'Copy Info',
            icon: <Copy size={16} />,
            onClick: handleContextCopy,
            hasBorder: true
          },
          {
            label: 'Delete',
            icon: <Trash2 size={16} />,
            onClick: handleContextDelete,
            isDanger: true
          }
        ]}
      />
    </div>
  );
}
