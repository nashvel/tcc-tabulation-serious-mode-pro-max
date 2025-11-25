import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { votingAPI } from '../api/services';

export const useVotingControl = (continuingEvent) => {
  const [isVotingActive, setIsVotingActive] = useState(false);
  const [showCategoryGrid, setShowCategoryGrid] = useState(false);
  const [activeCategory, setActiveCategory] = useState(null);
  const [isCategoryGridCollapsed, setIsCategoryGridCollapsed] = useState(false);
  const [showStartStopModal, setShowStartStopModal] = useState(false);

  // NOTE: availableCategories are now loaded dynamically from the database via useEventSequence hook
  // This hook is deprecated - use useEventSequence instead for dynamic category loading

  // Load voting state on mount
  useEffect(() => {
    loadVotingState();
  }, [continuingEvent]);

  const loadVotingState = async () => {
    try {
      const response = await votingAPI.getState({ 
        event_id: continuingEvent?.id || 1 
      });
      
      // Voting state loaded
      
      if (response.data) {
        const { is_active, active_round } = response.data;
        setIsVotingActive(is_active || false);
        
        // If there's an active round, set it directly from the response
        if (active_round && active_round.id) {
          const category = {
            id: active_round.id,
            name: active_round.name,
            spot: active_round.spot
          };
          setActiveCategory(category);
          // Active category updated
        }
      }
    } catch (error) {
      console.error('Error loading voting state:', error);
    }
  };

  const handleStartStopClick = () => {
    setShowStartStopModal(true);
  };

  const handleStartStopConfirm = async () => {
    try {
      if (isVotingActive) {
        // Stop voting
        await votingAPI.stop({
          event_id: continuingEvent?.id || 1,
        });
        setIsVotingActive(false);
        setShowCategoryGrid(false);
        setActiveCategory(null);
        
        toast.success('Event Documented! 📋', {
          duration: 4000,
          style: {
            background: '#10b981',
            color: '#fff',
            fontWeight: '600',
          },
        });
      } else {
        // Start voting - show category grid
        // Get current day from event or default to Day 1
        const dayNumber = continuingEvent?.current_day || 1;
        const dayName = `Day ${dayNumber}`;
        
        // Starting voting session
        
        await votingAPI.start({
          event_id: continuingEvent?.id || 1,
          day_number: dayNumber,
          day_name: dayName,
        });
        setIsVotingActive(true);
        setShowCategoryGrid(true);
        
        toast.success('Event Started! 🎯', {
          duration: 4000,
          style: {
            background: '#16a34a',
            color: '#fff',
            fontWeight: '600',
          },
        });
      }
      setShowStartStopModal(false);
    } catch (error) {
      console.error('Error toggling voting:', error);
      toast.error('Failed to toggle voting status: ' + (error.response?.data?.error || error.message), {
        duration: 5000,
      });
    }
  };

  const handleCategorySelect = async (category) => {
    try {
      // Use the actual category ID directly - no mapping needed
      // Activating category

      await votingAPI.activateRound({ 
        event_id: continuingEvent?.id || 1,
        round_id: category.id
      });
      setActiveCategory(category);
      setShowCategoryGrid(false);
      toast.success(`Category "${category.name}" activated!`, { duration: 3000 });
    } catch (error) {
      console.error('Error activating category:', error);
      toast.error('Failed to activate category: ' + (error.response?.data?.error || error.message));
    }
  };

  return {
    isVotingActive,
    showCategoryGrid,
    activeCategory,
    isCategoryGridCollapsed,
    setIsCategoryGridCollapsed,
    showStartStopModal,
    setShowStartStopModal,
    handleStartStopClick,
    handleStartStopConfirm,
    handleCategorySelect,
  };
};
