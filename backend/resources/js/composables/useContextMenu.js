import { ref, onMounted, onUnmounted } from 'vue';

export function useContextMenu() {
  const contextMenu = ref({ visible: false, x: 0, y: 0, row: null, column: null });
  const contextMenuRef = ref(null);

  const closeContextMenu = () => {
    contextMenu.value = { visible: false, x: 0, y: 0, row: null, column: null };
  };

  const handleRowContextMenu = (e, candidate, column) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Dispatch event to close all other context menus
    window.dispatchEvent(new CustomEvent('closeAllContextMenus'));
    
    setTimeout(() => {
      contextMenu.value = {
        visible: true,
        x: e.clientX,
        y: e.clientY,
        row: candidate,
        column
      };
    }, 0);
  };

  // Close on click outside
  const handleClick = (e) => {
    if (!contextMenu.value.visible) return;
    if (contextMenuRef.value && contextMenuRef.value.contains(e.target)) return;
    closeContextMenu();
  };

  // Close on scroll
  const handleScroll = () => {
    if (contextMenu.value.visible) closeContextMenu();
  };

  // Close on escape
  const handleEscape = (e) => {
    if (e.key === 'Escape' && contextMenu.value.visible) closeContextMenu();
  };

  // Listen for global close event
  const handleCloseAllMenus = () => {
    closeContextMenu();
  };

  onMounted(() => {
    document.addEventListener('click', handleClick);
    document.addEventListener('scroll', handleScroll, true);
    document.addEventListener('keydown', handleEscape);
    window.addEventListener('closeAllContextMenus', handleCloseAllMenus);
  });

  onUnmounted(() => {
    document.removeEventListener('click', handleClick);
    document.removeEventListener('scroll', handleScroll, true);
    document.removeEventListener('keydown', handleEscape);
    window.removeEventListener('closeAllContextMenus', handleCloseAllMenus);
  });

  return {
    contextMenu,
    contextMenuRef,
    closeContextMenu,
    handleRowContextMenu
  };
}
