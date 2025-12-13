import { ref, onMounted, onUnmounted } from 'vue';

// Global state for the context menu
const contextMenu = ref({ visible: false, x: 0, y: 0, data: null });

export function useGlobalContextMenu() {
  const closeContextMenu = () => {
    contextMenu.value = { visible: false, x: 0, y: 0, data: null };
  };

  const openContextMenu = (x, y, data = null) => {
    // Dispatch event to close all other context menus
    window.dispatchEvent(new CustomEvent('closeAllContextMenus'));
    
    setTimeout(() => {
      contextMenu.value = { visible: true, x, y, data };
    }, 0);
  };

  // Global right-click handler - only for elements with data-global-context-menu="true"
  const handleGlobalContextMenu = (e) => {
    const target = e.target.closest('[data-global-context-menu="true"]');
    if (!target) return;

    // Check if clicking on an element that has its own context menu
    const hasOwnMenu = e.target.closest('[data-context-menu="true"]') || 
                       e.target.closest('[data-has-context-menu="true"]');
    if (hasOwnMenu) return;

    e.preventDefault();
    e.stopPropagation();

    openContextMenu(e.clientX, e.clientY, target.dataset);
  };

  // Listen for global close event
  const handleCloseAllMenus = () => {
    closeContextMenu();
  };

  const setupGlobalContextMenu = () => {
    document.addEventListener('contextmenu', handleGlobalContextMenu);
    window.addEventListener('closeAllContextMenus', handleCloseAllMenus);
  };

  const cleanupGlobalContextMenu = () => {
    document.removeEventListener('contextmenu', handleGlobalContextMenu);
    window.removeEventListener('closeAllContextMenus', handleCloseAllMenus);
  };

  return {
    contextMenu,
    closeContextMenu,
    openContextMenu,
    setupGlobalContextMenu,
    cleanupGlobalContextMenu
  };
}
