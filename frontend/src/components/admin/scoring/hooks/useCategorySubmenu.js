import { useState, useRef, useCallback, useEffect } from 'react';
import { showSuccess, showError } from '../../../../utils/alerts';
import { getApiBase } from '../../../../config/api';

export const useCategorySubmenu = (eventId, eventSequence, activeRound) => {
  const [categorySubmenu, setCategorySubmenu] = useState({ visible: false, x: 0, y: 0, position: 'right' });
  const [selectedCategoryIndex, setSelectedCategoryIndex] = useState(0);
  const [isSwitchingCategory, setIsSwitchingCategory] = useState(false);
  const submenuRef = useRef(null);

  // Sync selectedCategoryIndex with activeRound when it changes
  useEffect(() => {
    if (activeRound && eventSequence.length > 0) {
      const activeIndex = eventSequence.findIndex(cat => cat.id === activeRound.id);
      if (activeIndex !== -1) {
        setSelectedCategoryIndex(activeIndex);
      }
    }
  }, [activeRound, eventSequence]);

  // Calculate best submenu position to avoid being cut off
  const calculateSubmenuPosition = useCallback((switchCategoryButton) => {
    if (!switchCategoryButton) return 'right';
    
    const rect = switchCategoryButton.getBoundingClientRect();
    const submenuWidth = 240; // min-w-[220px] + padding
    const spaceOnRight = window.innerWidth - rect.right;
    const spaceOnLeft = rect.left;
    
    // If not enough space on right, try left
    if (spaceOnRight < submenuWidth && spaceOnLeft > submenuWidth) {
      return 'left';
    }
    return 'right';
  }, []);

  // Handle submenu hover with position detection
  const handleCategoryHover = useCallback((e) => {
    const position = calculateSubmenuPosition(e.currentTarget);
    setCategorySubmenu({ visible: true, x: 200, y: 0, position });
  }, [calculateSubmenuPosition]);

  // Switch to selected category handler
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
      setCategorySubmenu({ visible: false, x: 0, y: 0, position: 'right' });
    }
  };

  return {
    categorySubmenu,
    setCategorySubmenu,
    selectedCategoryIndex,
    isSwitchingCategory,
    submenuRef,
    handleCategoryHover,
    handleSwitchCategory
  };
};
