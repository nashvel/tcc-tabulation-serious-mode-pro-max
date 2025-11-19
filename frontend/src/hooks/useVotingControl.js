import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { votingAPI } from '../api/services';

export const useVotingControl = (continuingEvent) => {
  const [isVotingActive, setIsVotingActive] = useState(false);
  const [showCategoryGrid, setShowCategoryGrid] = useState(false);
  const [activeCategory, setActiveCategory] = useState(null);
  const [isCategoryGridCollapsed, setIsCategoryGridCollapsed] = useState(false);
  const [showStartStopModal, setShowStartStopModal] = useState(false);

  // Available categories for mapping
  const availableCategories = [
    { id: 1, icon: '2095628.png', name: 'Intergalactic Attire' },
    { id: 2, icon: '3365992.png', name: 'Best in Swimwear & Trunks' },
    { id: 3, icon: '3669556.png', name: 'Preliminary Question and Answer' },
    { id: 4, icon: '3409564.png', name: 'Barong Tagalog & Modern Filipiana' },
    { id: 5, icon: '735768.png', name: 'Final Question and Answer' },
    { id: 6, icon: '735768.png', name: 'Display Criteria 06' }
  ];

  // Load voting state on mount
  useEffect(() => {
    loadVotingState();
  }, [continuingEvent]);

  const loadVotingState = async () => {
    try {
      const response = await votingAPI.getState({ 
        event_id: continuingEvent?.id || 1 
      });
      
      console.log('Voting state response:', response.data);
      
      if (response.data) {
        const { is_active, active_round } = response.data;
        setIsVotingActive(is_active || false);
        
        // If there's an active round, find and set the corresponding category
        if (active_round && active_round.id) {
          const category = availableCategories.find(cat => cat.id === active_round.id);
          if (category) {
            setActiveCategory(category);
            console.log('Active category set:', category);
          }
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
        await votingAPI.start({
          event_id: continuingEvent?.id || 1,
          day_number: 1,
          day_name: 'Day 1',
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
      const roundMapping = {
        1: 1, 2: 2, 3: 3, 4: 4, 5: 5, 6: 6
      };

      const roundId = roundMapping[category.id] || category.id;

      await votingAPI.activateRound({ 
        event_id: continuingEvent?.id || 1,
        round_id: roundId
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
