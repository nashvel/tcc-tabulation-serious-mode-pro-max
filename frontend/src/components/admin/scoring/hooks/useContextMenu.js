import { useState, useRef, useEffect, useCallback } from 'react';

export const useContextMenu = () => {
  const [contextMenu, setContextMenu] = useState({ visible: false, x: 0, y: 0, row: null, column: null });
  const contextMenuRef = useRef(null);

  const closeContextMenu = useCallback(() => {
    setContextMenu({ visible: false, x: 0, y: 0, row: null, column: null });
  }, []);

  // Listen for global close event
  useEffect(() => {
    const handleCloseAllMenus = () => {
      closeContextMenu();
    };

    window.addEventListener('closeAllContextMenus', handleCloseAllMenus);
    return () => window.removeEventListener('closeAllContextMenus', handleCloseAllMenus);
  }, [closeContextMenu]);

  // Close context menu when clicking elsewhere or scrolling
  useEffect(() => {
    const handleClick = (e) => {
      if (!contextMenu.visible) return;
      
      // Check if click is inside the context menu or submenu
      if (contextMenuRef.current && contextMenuRef.current.contains(e.target)) {
        return;
      }
      
      // Close if clicking outside
      closeContextMenu();
    };

    const handleScroll = () => {
      if (contextMenu.visible) {
        closeContextMenu();
      }
    };
    
    if (contextMenu.visible) {
      document.addEventListener('click', handleClick);
      document.addEventListener('scroll', handleScroll, true);
      return () => {
        document.removeEventListener('click', handleClick);
        document.removeEventListener('scroll', handleScroll, true);
      };
    }
  }, [contextMenu.visible]);

  const handleRowContextMenu = (e, candidate, column) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Dispatch event to close all other context menus (including global menu)
    window.dispatchEvent(new CustomEvent('closeAllContextMenus'));
    
    // Small delay to ensure other menus close first
    const timeoutId = setTimeout(() => {
      setContextMenu({
        visible: true,
        x: e.clientX,
        y: e.clientY,
        row: candidate,
        column
      });
    }, 0);
    
    // Return cleanup function to clear timeout if needed
    return () => clearTimeout(timeoutId);
  };

  return {
    contextMenu,
    setContextMenu,
    contextMenuRef,
    closeContextMenu,
    handleRowContextMenu
  };
};
