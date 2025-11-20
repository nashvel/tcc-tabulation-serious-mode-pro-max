import React from 'react';
import AdminHeaderButtons from './AdminHeaderButtons';
import { Calendar, Clock, ChevronRight, ChevronDown } from 'lucide-react';

export default function FixedHeader({ 
  onEditClick, 
  activeCategory, 
  continuingEvent,
  judges = []
}) {
  const [eventData, setEventData] = React.useState(null);
  const [nextCategory, setNextCategory] = React.useState(null);
  const [showDatePicker, setShowDatePicker] = React.useState(false);
  const [selectedDate, setSelectedDate] = React.useState(new Date());
  
  React.useEffect(() => {
    const fetchEventData = async () => {
      try {
        const apiBase = `http://${window.location.hostname}:8000`;
        
        // Get currently active category from voting state
        const votingStateResponse = await fetch(`${apiBase}/api/voting/state`);
        const votingState = await votingStateResponse.json();
        
        // Auto-start first round if no round is active yet
        if (!votingState.active_round_name && !votingState.active_round_id) {
          try {
            await fetch(`${apiBase}/api/voting/start-first-round`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ event_id: votingState.event_id || 1 })
            });
          } catch (err) {
            console.warn('Could not auto-start first round:', err);
          }
        }
        
        if (votingState.active_round_name) {
          // Use the active round name from voting state
          setNextCategory(votingState.active_round_name);
        } else if (votingState.active_round_id) {
          // Fallback: fetch round details if only ID is available
          const roundResponse = await fetch(`${apiBase}/api/rounds/${votingState.active_round_id}`);
          const round = await roundResponse.json();
          setNextCategory(round.name || 'Unknown');
        } else if (votingState.is_active) {
          // Event is active but no specific round selected yet
          setNextCategory('Event Active - No Round Selected');
        } else {
          // No active event
          setNextCategory('Not Active');
        }
      } catch (error) {
        console.error('Error fetching voting state:', error);
        setNextCategory('Error');
      }
    };
    
    fetchEventData();
    
    // Refresh every 2 seconds to stay in sync
    const interval = setInterval(fetchEventData, 2000);
    return () => clearInterval(interval);
  }, []);

  // Generate calendar days
  const getDaysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const handlePrevMonth = () => {
    setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth() - 1));
  };

  const handleNextMonth = () => {
    setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1));
  };

  const handleDateSelect = (day) => {
    const newDate = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), day);
    setSelectedDate(newDate);
    setShowDatePicker(false);
  };

  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'];
  const daysInMonth = getDaysInMonth(selectedDate);
  const firstDay = getFirstDayOfMonth(selectedDate);
  
  return (
    <div className="w-full font-sans relative z-40">
      {/* Top Navigation Bar - Minimal Elegant */}
      <div className="bg-white text-slate-900 px-6 py-3 flex items-center justify-between border-b border-slate-100 shadow-sm relative z-50 overflow-visible">
        <div className="flex items-center gap-4">
          <AdminHeaderButtons 
            onEditClick={onEditClick} 
            activeCategory={activeCategory}
          />
        </div>
        
        {/* Date Picker Dropdown */}
        <div className="relative z-50">
          <button
            onClick={() => setShowDatePicker(!showDatePicker)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 hover:border-slate-300 transition-all text-xs font-semibold text-slate-700 uppercase tracking-wide"
          >
            <Calendar size={16} className="text-slate-600" />
            <span>{selectedDate.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}</span>
            <ChevronDown size={14} className={`transition-transform text-slate-600 ${showDatePicker ? 'rotate-180' : ''}`} />
          </button>

          {/* Calendar Dropdown */}
          {showDatePicker && (
            <div className="absolute right-0 top-full mt-2 bg-white rounded-lg shadow-xl border border-slate-200 p-4 z-50 w-80">
              {/* Month/Year Header */}
              <div className="flex items-center justify-between mb-4">
                <button
                  onClick={handlePrevMonth}
                  className="p-2 hover:bg-slate-50 rounded-lg transition-all text-slate-600"
                >
                  <ChevronRight size={18} className="rotate-180" />
                </button>
                <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wide">
                  {monthNames[selectedDate.getMonth()]} {selectedDate.getFullYear()}
                </h3>
                <button
                  onClick={handleNextMonth}
                  className="p-2 hover:bg-slate-50 rounded-lg transition-all text-slate-600"
                >
                  <ChevronRight size={18} />
                </button>
              </div>

              {/* Day Headers */}
              <div className="grid grid-cols-7 gap-2 mb-2">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                  <div key={day} className="text-center text-xs font-semibold text-slate-500 uppercase">
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar Days */}
              <div className="grid grid-cols-7 gap-2">
                {Array.from({ length: firstDay }).map((_, i) => (
                  <div key={`empty-${i}`} />
                ))}
                {Array.from({ length: daysInMonth }).map((_, i) => {
                  const day = i + 1;
                  const isToday = new Date().toDateString() === new Date(selectedDate.getFullYear(), selectedDate.getMonth(), day).toDateString();
                  const isSelected = selectedDate.getDate() === day;
                  
                  return (
                    <button
                      key={day}
                      onClick={() => handleDateSelect(day)}
                      className={`p-2 rounded-lg text-sm font-semibold transition-all ${
                        isSelected
                          ? 'bg-slate-900 text-white shadow-md'
                          : isToday
                          ? 'bg-slate-100 text-slate-900 border border-slate-300'
                          : 'text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      {day}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main Brand Header */}
      <div className="bg-white px-8 py-6 border-b border-slate-100 relative overflow-hidden z-40">
        {/* Minimal Accent Line */}
        <div className="absolute top-0 left-0 w-full h-0.5 bg-slate-900"></div>

        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          
          {/* Left: Event Title with Elegant Typography */}
          <div className="flex flex-col items-center md:items-start gap-2 flex-1 min-w-[200px]">
            <h1 className="text-3xl font-light text-slate-900 tracking-tight uppercase leading-none letter-spacing-wide">
              {eventData?.title || eventData?.name || 'TCC INTRAMURALS 2025'}
            </h1>
            <div className="flex items-center gap-3 text-xs font-medium text-slate-600 tracking-widest uppercase mt-1">
              <span className="text-slate-900 font-semibold">
                {eventData?.days?.[0]?.day_number ? `Day ${eventData.days[0].day_number}` : 'Day 1'}
              </span>
              <span className="text-slate-300">•</span>
              <span className="text-slate-600">{eventData?.days?.[0]?.title || 'MR AND MISS'}</span>
            </div>
          </div>

          {/* Center: Logos (Balanced) */}
          <div className="flex items-center justify-center gap-6 py-2">
            <img src="/assets/logo-3.png" className="h-14 object-contain drop-shadow-sm filter hover:brightness-110 transition-all" alt="Logo 1" />
            <div className="h-10 w-px bg-slate-200"></div>
            <img src="/assets/tcc_seal.png" className="h-14 object-contain drop-shadow-sm filter hover:brightness-110 transition-all" alt="Seal" />
            <div className="h-10 w-px bg-slate-200"></div>
            <img src="/assets/it.png" className="h-14 object-contain drop-shadow-sm filter hover:brightness-110 transition-all" alt="IT" />
            <div className="h-10 w-px bg-slate-200"></div>
            <img src="/assets/bsit.png" className="h-14 object-contain drop-shadow-sm filter hover:brightness-110 transition-all" alt="BSIT" />
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
