import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { votingAPI, eventSequenceAPI } from '../api/services';

export const useEventSequence = (continuingEvent, setActiveCategory) => {
  const [eventSequence, setEventSequence] = useState([]);
  const [currentSequenceIndex, setCurrentSequenceIndex] = useState(0);
  const [availableCategories, setAvailableCategories] = useState([]);
  const [currentEventId, setCurrentEventId] = useState(null);
  
  // Load rounds/categories from event on mount
  useEffect(() => {
    loadAvailableCategories();
    loadSequence();
  }, [continuingEvent]);
  
  const loadAvailableCategories = async () => {
    try {
      // Get event ID - if no continuingEvent, fetch the most recent active event
      let eventId = continuingEvent?.id;
      
      if (!eventId) {
        try {
          const eventsResponse = await fetch('http://localhost:8000/api/events');
          const events = await eventsResponse.json();
          // Get the most recent event (highest ID)
          const latestEvent = events.sort((a, b) => b.id - a.id)[0];
          eventId = latestEvent?.id || 1;
          console.log('Using latest event ID:', eventId);
        } catch (err) {
          console.error('Error fetching events:', err);
          eventId = 1;
        }
      }
      
      setCurrentEventId(eventId); // Store the event ID for other functions
      
      // Load rounds created from the event's categories
      const response = await fetch(`http://localhost:8000/api/rounds?event_id=${eventId}`);
      const rounds = await response.json();
      
      console.log(`Loaded rounds/categories for event ${eventId}:`, rounds);
      
      // Map rounds to category format
      const categories = rounds.map(round => ({
        id: round.id,
        name: round.name,
        spot: round.spot,
        icon: '735768.png' // Default icon
      }));
      
      setAvailableCategories(categories);
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };
  
  const loadSequence = async () => {
    try {
      // Get event ID - if no continuingEvent, fetch the most recent active event
      let eventId = continuingEvent?.id;
      
      if (!eventId) {
        try {
          const eventsResponse = await fetch('http://localhost:8000/api/events');
          const events = await eventsResponse.json();
          const latestEvent = events.sort((a, b) => b.id - a.id)[0];
          eventId = latestEvent?.id || 1;
        } catch (err) {
          eventId = 1;
        }
      }
      
      const response = await eventSequenceAPI.getAll({ 
        event_id: eventId 
      });
      
      console.log(`Loaded sequence from database for event ${eventId}:`, response.data);
      
      // Map database sequence to category format
      const mappedSequence = response.data.map(seq => {
        const round = seq.round || {};
        return {
          id: seq.round_id,
          name: round.name || 'Unknown',
          sequenceId: seq.id,
          order: seq.order,
          isCompleted: seq.is_completed,
          icon: '735768.png'
        };
      });
      
      setEventSequence(mappedSequence);
    } catch (error) {
      console.error('Error loading sequence:', error);
    }
  };

  const handleAddToSequence = async (category) => {
    if (eventSequence.find(c => c.id === category.id)) {
      toast.error('Category already in sequence!', { duration: 2000 });
      return;
    }
    
    try {
      await eventSequenceAPI.add({
        event_id: currentEventId || continuingEvent?.id || 1,
        round_id: category.id
      });
      
      await loadSequence(); // Reload from database
      toast.success(`${category.name} added to sequence!`, { duration: 2000 });
    } catch (error) {
      console.error('Error adding to sequence:', error);
      const errorMsg = error.response?.data?.error || 'Failed to add to sequence';
      toast.error(errorMsg, { duration: 3000 });
    }
  };

  const handleRemoveFromSequence = async (categoryId) => {
    const item = eventSequence.find(c => c.id === categoryId);
    if (!item?.sequenceId) {
      console.error('No sequenceId found for category:', categoryId, item);
      toast.error('Cannot remove: Invalid sequence item', { duration: 2000 });
      return;
    }
    
    try {
      console.log('Removing sequence item:', item.sequenceId);
      await eventSequenceAPI.remove(item.sequenceId);
      await loadSequence(); // Reload from database
      toast('Category removed from sequence', { 
        duration: 2000,
        style: {
          background: '#fee2e2',
          color: '#dc2626',
          border: '1px solid #fca5a5'
        }
      });
    } catch (error) {
      console.error('Error removing from sequence:', error);
      const errorMsg = error.response?.data?.error || error.message || 'Failed to remove from sequence';
      toast.error(errorMsg, { duration: 3000 });
      // Still reload to sync with database state
      await loadSequence();
    }
  };

  const handleMoveSequenceUp = async (index) => {
    if (index <= 0) return;
    
    const item = eventSequence[index];
    if (!item?.sequenceId) return;
    
    try {
      await eventSequenceAPI.moveUp(item.sequenceId);
      await loadSequence(); // Reload from database
    } catch (error) {
      console.error('Error moving up:', error);
      toast.error('Failed to move up', { duration: 2000 });
    }
  };

  const handleMoveSequenceDown = async (index) => {
    if (index >= eventSequence.length - 1) return;
    
    const item = eventSequence[index];
    if (!item?.sequenceId) return;
    
    try {
      await eventSequenceAPI.moveDown(item.sequenceId);
      await loadSequence(); // Reload from database
    } catch (error) {
      console.error('Error moving down:', error);
      toast.error('Failed to move down', { duration: 2000 });
    }
  };

  const handleNextCategory = async () => {
    if (eventSequence.length === 0) {
      toast.error('Please add categories to the sequence first!', { duration: 3000 });
      return;
    }

    const nextIndex = currentSequenceIndex + 1;
    if (nextIndex >= eventSequence.length) {
      toast('You have reached the end of the sequence!', { 
        duration: 3000,
        icon: '🏁'
      });
      return;
    }

    const nextCategory = eventSequence[nextIndex];
    setCurrentSequenceIndex(nextIndex);
    
    try {
      const roundMapping = {
        1: 1, 2: 2, 3: 3, 4: 4, 5: 5, 6: 6
      };
      const roundId = roundMapping[nextCategory.id] || nextCategory.id;
      
      await votingAPI.activateRound({ 
        event_id: continuingEvent?.id || 1,
        round_id: roundId
      });
      
      setActiveCategory(nextCategory);
      toast.success(`Now processing: ${nextCategory.name}`, { duration: 4000 });
    } catch (error) {
      console.error('Error activating next category:', error);
      toast.error('Failed to activate next category', { duration: 3000 });
    }
  };

  return {
    eventSequence,
    currentSequenceIndex,
    availableCategories,
    handleAddToSequence,
    handleRemoveFromSequence,
    handleMoveSequenceUp,
    handleMoveSequenceDown,
    handleNextCategory,
  };
};
