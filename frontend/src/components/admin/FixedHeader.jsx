import React, { useState, useCallback, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useVotingWebSocket } from '../../hooks/useVotingWebSocket';

export default function FixedHeader({
  onEditClick,
  activeCategory,
  continuingEvent,
  judges = []
}) {
  const navigate = useNavigate();
  const location = useLocation();
  const [nextCategory, setNextCategory] = useState(activeCategory?.name || 'Loading...');
  const [isHoveringTitle, setIsHoveringTitle] = useState(false);

  // WebSocket handler for real-time category changes
  const handleVotingStateChange = useCallback((data) => {
    // Check for active_round (can be at root level or nested in voting_state)
    const activeRound = data.active_round || data.voting_state?.active_round;

    if (activeRound?.name) {
      setNextCategory(activeRound.name);
    } else if (data.voting_state?.active_round_name) {
      setNextCategory(data.voting_state.active_round_name);
    }
  }, []);

  // Setup WebSocket connection
  useVotingWebSocket(activeCategory?.event_id || continuingEvent?.id, handleVotingStateChange);

  // Update when prop changes
  useEffect(() => {
    if (activeCategory?.name) {
      setNextCategory(activeCategory.name);
    }
  }, [activeCategory?.name]);

  // Check if a path is active
  const isActivePath = (path) => {
    return location.pathname === path;
  };

  return (
    <div className="w-full font-sans relative z-40">
      {/* Main Brand Header */}
      <div className="bg-white px-8 py-6 border-b border-slate-100 relative z-40">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">

          {/* Left: Event Title with Elegant Typography - Clickable with Hover Animation */}
          <div 
            className="flex flex-col items-center md:items-start gap-2 flex-1 min-w-[200px] cursor-pointer relative z-10"
            onMouseEnter={() => setIsHoveringTitle(true)}
            onMouseLeave={() => setIsHoveringTitle(false)}
            onClick={() => navigate('/setup')}
          >
            {/* Original Title */}
            <h1 
              className={`text-3xl font-light text-slate-900 tracking-tight uppercase leading-none letter-spacing-wide transition-all duration-300 ${
                isHoveringTitle ? 'opacity-0 -translate-x-8' : 'opacity-100 translate-x-0'
              }`}
            >
              {continuingEvent?.title || continuingEvent?.name || 'Loading Event...'}
            </h1>
            
            {/* Back Icon - Shows on Hover */}
            <div 
              className={`flex items-center gap-2 transition-all duration-300 absolute mt-0 ${
                isHoveringTitle ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8 pointer-events-none'
              }`}
            >
              <ArrowLeft size={28} className="text-slate-900" />
              <span className="text-sm font-semibold text-slate-900 uppercase tracking-wide">Back to Setup</span>
            </div>
            
            <div className="flex items-center gap-3 text-xs font-medium text-slate-600 tracking-widest uppercase mt-1">
              <span className="text-slate-900 font-semibold">
                {continuingEvent?.days?.[0]?.day_number ? `Day ${continuingEvent.days[0].day_number}` : ''}
              </span>
              {continuingEvent?.days?.[0]?.title && (
                <>
                  <span className="text-slate-300">•</span>
                  <span className="text-slate-600">{continuingEvent.days[0].title}</span>
                </>
              )}
            </div>
          </div>

          {/* Center: Navigation Buttons */}
          <div className="flex items-center justify-center gap-2 flex-1 relative z-20">
            <button
              onClick={() => {
                const eventTitle = continuingEvent?.title || continuingEvent?.name;
                if (eventTitle) {
                  navigate(`/admin?event_title=${encodeURIComponent(eventTitle)}`);
                } else {
                  navigate('/admin');
                }
              }}
              className={`px-4 py-2 text-sm font-medium transition-colors ${isActivePath('/admin') || isActivePath('/get_started')
                ? 'border-b-2'
                : 'text-gray-700 hover:text-gray-900'
                }`}
              style={{ 
                color: isActivePath('/admin') || isActivePath('/get_started') ? '#1F2937' : '#374151',
                borderBottomColor: isActivePath('/admin') || isActivePath('/get_started') ? '#1F2937' : 'transparent'
              }}
            >
              Home
            </button>
            <button
              onClick={onEditClick}
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
              style={{ color: '#374151' }}
            >
              Edit
            </button>
            <button
              onClick={() => navigate('/admin/documentation')}
              className={`px-4 py-2 text-sm font-medium transition-colors ${isActivePath('/admin/documentation')
                ? 'text-theme-primary border-b-2 border-theme-primary'
                : 'text-gray-700 hover:text-gray-900'
                }`}
              style={{ color: isActivePath('/admin/documentation') ? undefined : '#374151' }}
            >
              Documentation
            </button>
            <button
              onClick={() => navigate('/judges/configure')}
              className={`px-4 py-2 text-sm font-medium transition-colors ${isActivePath('/judges/configure')
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-900'
                }`}
            >
              Judges
            </button>
            <button
              onClick={() => navigate('/admin/certificates')}
              className={`px-4 py-2 text-sm font-medium transition-colors ${isActivePath('/admin/certificates')
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-900'
                }`}
            >
              Certificates
            </button>
          </div>

          {/* Right: Currently Active Category */}
          <div className="flex flex-col items-center md:items-end justify-center gap-2 flex-1 min-w-[200px]">
            <h2 className="text-2xl font-light text-slate-900 tracking-tight uppercase leading-none">
              {nextCategory || 'Loading...'}
            </h2>
          </div>
        </div>
      </div>
    </div>
  );
}
