import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { Lock, Unlock, SkipForward, Copy, ChevronRight } from 'lucide-react';
import { showSuccess, showError } from '../utils/alerts';
import { getApiBase } from '../config/api';
import { useVotingWebSocket } from '../hooks/useVotingWebSocket';

// ===== GLOBAL CONTEXT MENU CONTEXT =====
// This provides a global context menu for the admin section
// It does NOT override existing context menus - only activates on elements with data-global-context-menu="true"

const GlobalContextMenuContext = createContext(null);

export const useGlobalContextMenu = () => {
  const context = useContext(GlobalContextMenuContext);
  if (!context) {
    throw new Error('useGlobalContextMenu must be used within GlobalContextMenuProvider');
  }
  return context;
};

export const GlobalContextMenuProvider = ({ children, eventId, eventSequence = [], activeRound = null }) => {
  
  const [contextMenu, setContextMenu] = useState({ visible: false, x: 0, y: 0, data: null });
  const [categorySubmenu, setCategorySubmenu] = useState({ visible: false, position: 'right' });
  const [selectedCategoryIndex, setSelectedCategoryIndex] = useState(0);
  const [isSwitchingCategory, setIsSwitchingCategory] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const contextMenuRef = useRef(null);
  
  // Get eventId from prop or localStorage
  const resolvedEventId = eventId || (() => {
    try {
      const continuingEvent = localStorage.getItem('continuingEvent');
      if (continuingEvent) {
        const event = JSON.parse(continuingEvent);
        return event?.unique_id || event?.id;
      }
    } catch (error) {
      console.error('Error reading continuingEvent from localStorage:', error);
    }
    return null;
  })();

  // WebSocket handler for real-time lock state updates
  const handleVotingStateChange = useCallback((data) => {
    const votingState = data.voting_state || data;
    if (typeof votingState.is_locked !== 'undefined') {
      setIsLocked(votingState.is_locked);
    }
  }, []);

  useVotingWebSocket(resolvedEventId, handleVotingStateChange);

  // Sync selectedCategoryIndex with activeRound
  useEffect(() => {
    if (activeRound && eventSequence.length > 0) {
      const activeIndex = eventSequence.findIndex(cat => cat.id === activeRound.id);
      if (activeIndex !== -1) {
        setSelectedCategoryIndex(activeIndex);
      }
    }
  }, [activeRound, eventSequence]);

  // Load initial lock state and poll every 2 seconds
  useEffect(() => {
    if (!resolvedEventId) return; // Don't fetch if eventId is not available yet
    
    const loadLockState = async () => {
      try {
        const apiBase = getApiBase();
        const response = await fetch(`${apiBase}/api/voting/state?event_id=${resolvedEventId}`);
        if (response.ok) {
          const data = await response.json();
          setIsLocked(data.is_locked ?? false);
        } else if (response.status === 400 || response.status === 404) {
          // Event not found or invalid event_id - don't retry
          console.warn('Invalid event_id or event not found');
        }
      } catch (error) {
        console.error('Error loading lock state:', error);
      }
    };
    
    // Load immediately
    loadLockState();
    
    // Then poll every 2 seconds
    const interval = setInterval(loadLockState, 2000);
    
    return () => clearInterval(interval);
  }, [resolvedEventId]);

  const closeContextMenu = useCallback(() => {
    setContextMenu({ visible: false, x: 0, y: 0, data: null });
    setCategorySubmenu({ visible: false, position: 'right' });
  }, []);

  // Close on click outside, scroll, or escape
  useEffect(() => {
    const handleClick = (e) => {
      if (!contextMenu.visible) return;
      if (contextMenuRef.current && contextMenuRef.current.contains(e.target)) return;
      closeContextMenu();
    };

    const handleScroll = () => {
      if (contextMenu.visible) closeContextMenu();
    };

    const handleEscape = (e) => {
      if (e.key === 'Escape' && contextMenu.visible) closeContextMenu();
    };

    if (contextMenu.visible) {
      document.addEventListener('click', handleClick);
      document.addEventListener('scroll', handleScroll, true);
      document.addEventListener('keydown', handleEscape);
      return () => {
        document.removeEventListener('click', handleClick);
        document.removeEventListener('scroll', handleScroll, true);
        document.removeEventListener('keydown', handleEscape);
      };
    }
  }, [contextMenu.visible, closeContextMenu]);

  // Listen for custom event to close this menu when other menus open
  useEffect(() => {
    const handleCloseAllMenus = () => {
      closeContextMenu();
    };

    window.addEventListener('closeAllContextMenus', handleCloseAllMenus);
    return () => window.removeEventListener('closeAllContextMenus', handleCloseAllMenus);
  }, [closeContextMenu]);

  // Global right-click handler - only for elements with data-global-context-menu="true"
  useEffect(() => {
    const handleGlobalContextMenu = (e) => {
      // Check if the clicked element or its parent has data-global-context-menu="true"
      const target = e.target.closest('[data-global-context-menu="true"]');
      if (!target) return; // Don't interfere with other context menus

      // Check if clicking on an element that has its own context menu
      const hasOwnMenu = e.target.closest('[data-context-menu="true"]') || 
                         e.target.closest('[data-has-context-menu="true"]');
      if (hasOwnMenu) return; // Let the element's own menu handle it

      e.preventDefault();
      e.stopPropagation();

      // Dispatch event to close all other context menus
      window.dispatchEvent(new CustomEvent('closeAllContextMenus'));

      // Small delay to ensure other menus close first
      setTimeout(() => {
        setContextMenu({
          visible: true,
          x: e.clientX,
          y: e.clientY,
          data: target.dataset
        });
      }, 0);
    };

    document.addEventListener('contextmenu', handleGlobalContextMenu);
    return () => document.removeEventListener('contextmenu', handleGlobalContextMenu);
  }, [setContextMenu]);

  // Lock/Unlock handler
  const handleLockToggle = async () => {
    if (!eventId) {
      showError('Event not loaded yet');
      closeContextMenu();
      return;
    }
    
    try {
      const apiBase = getApiBase();
      const endpoint = isLocked ? 'unlock' : 'lock';
      const response = await fetch(`${apiBase}/api/voting/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ event_id: eventId })
      });

      if (response.ok) {
        setIsLocked(!isLocked);
        showSuccess(isLocked ? 'Screen Unlocked!' : 'Screen Locked!', { duration: 2000 });
      } else {
        console.error('Lock toggle failed:', response.status, response.statusText);
        showError('Failed to toggle lock');
      }
    } catch (error) {
      console.error('Lock toggle error:', error);
      showError('Failed to toggle lock');
    }
    closeContextMenu();
  };

  // Switch category handler
  const handleSwitchCategory = async (categoryIndex) => {
    const selectedCategory = eventSequence[categoryIndex];
    if (!selectedCategory) return;

    setIsSwitchingCategory(true);
    try {
      const apiBase = getApiBase();
      const response = await fetch(`${apiBase}/api/voting/activate-round`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event_id: eventId,
          round_id: selectedCategory.id
        })
      });

      if (response.ok) {
        showSuccess(`Switched to: ${selectedCategory.name}`, { duration: 2000 });
        setSelectedCategoryIndex(categoryIndex);
      } else {
        const data = await response.json();
        showError(data.message || 'Failed to switch category');
      }
    } catch (error) {
      showError('Failed to switch category');
    } finally {
      setIsSwitchingCategory(false);
      closeContextMenu();
    }
  };

  // Calculate submenu position
  const handleCategoryHover = useCallback((e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const submenuWidth = 240;
    const spaceOnRight = window.innerWidth - rect.right;
    const position = spaceOnRight < submenuWidth ? 'left' : 'right';
    setCategorySubmenu({ visible: true, position });
  }, []);

  const value = {
    contextMenu,
    closeContextMenu,
    isLocked,
    eventSequence,
    selectedCategoryIndex,
    isSwitchingCategory
  };

  return (
    <GlobalContextMenuContext.Provider value={value}>
      {children}

      {/* ===== GLOBAL CONTEXT MENU ===== */}
      {contextMenu.visible && (
        <div
          ref={contextMenuRef}
          data-global-menu-container="true"
          className="fixed z-[9999] bg-white rounded-lg shadow-xl border border-gray-200 py-2 min-w-[200px]"
          style={{ left: contextMenu.x, top: contextMenu.y }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Lock/Unlock */}
          <button
            onClick={handleLockToggle}
            className="w-full px-4 py-2 text-left text-sm flex items-center gap-3 text-gray-700 hover:bg-gray-100 border-b border-gray-200"
          >
            {isLocked ? <Unlock size={16} /> : <Lock size={16} />}
            {isLocked ? 'Unlock Judges' : 'Lock Judges'}
          </button>

          {/* Switch Category with Submenu */}
          {eventSequence.length > 0 && (
            <div
              className="relative"
              onMouseEnter={handleCategoryHover}
              onMouseLeave={() => setCategorySubmenu({ visible: false, position: 'right' })}
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
              {categorySubmenu.visible && (
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
                    className="overflow-y-auto global-submenu-scroll"
                    style={{
                      scrollbarWidth: 'thin',
                      scrollbarColor: 'transparent transparent',
                      maxHeight: 'calc(100vh - 150px)'
                    }}
                  >
                    <style>{`
                      .global-submenu-scroll::-webkit-scrollbar {
                        width: 6px;
                      }
                      .global-submenu-scroll::-webkit-scrollbar-track,
                      .global-submenu-scroll::-webkit-scrollbar-thumb {
                        background: transparent;
                      }
                    `}</style>
                    {eventSequence.map((category, idx) => (
                      <button
                        key={category.id}
                        onClick={() => handleSwitchCategory(idx)}
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
              )}
            </div>
          )}

          {/* Copy - only show if there's copyable data */}
          {contextMenu.data?.copyText && (
            <button
              onClick={() => {
                navigator.clipboard.writeText(contextMenu.data.copyText);
                showSuccess('Copied to clipboard!', { duration: 1500 });
                closeContextMenu();
              }}
              className="w-full px-4 py-2 text-left text-sm flex items-center gap-3 text-gray-700 hover:bg-gray-100"
            >
              <Copy size={16} />
              Copy
            </button>
          )}
        </div>
      )}
    </GlobalContextMenuContext.Provider>
  );
};

export default GlobalContextMenuProvider;
