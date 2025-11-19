export default function EventDaysSection({ eventDays, addEventDay, removeEventDay, updateEventDay }) {
  return (
    <div style={{
      padding: '20px',
      backgroundColor: '#fff7ed',
      border: '2px solid #f97316',
      borderRadius: '12px'
    }}>
      <div className="flex justify-between items-center mb-4">
        <div>
          <label className="block text-lg font-bold text-gray-800">Event Days Configuration</label>
          <p style={{ fontSize: '13px', color: '#6b7280', marginTop: '4px' }}>
            Each day represents a complete, independent event with its own records and tabulation
          </p>
        </div>
        <button
          type="button"
          onClick={addEventDay}
          className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 font-medium"
        >
          + Add Day
        </button>
      </div>
      <div className="space-y-4">
        {eventDays.map((day, index) => (
          <div key={index} style={{
            padding: '20px',
            border: '2px solid #e5e7eb',
            borderRadius: '10px',
            backgroundColor: '#fff',
            boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
          }}>
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 style={{ 
                  fontSize: '18px', 
                  fontWeight: 'bold', 
                  color: '#f97316',
                  marginBottom: '4px'
                }}>
                  Day {day.day_number}
                </h3>
                <p style={{ fontSize: '12px', color: '#6b7280' }}>
                  Complete event with all tabulation records
                </p>
              </div>
              {eventDays.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeEventDay(index)}
                  className="px-3 py-1 text-red-600 hover:text-red-700 text-sm font-medium border border-red-300 rounded hover:bg-red-50"
                >
                  Remove Day
                </button>
              )}
            </div>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Day Title / Event Name *
                </label>
                <input
                  type="text"
                  value={day.title}
                  onChange={(e) => updateEventDay(index, 'title', e.target.value)}
                  placeholder="e.g., Mr & Miss Intramurals 2025"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
                <p style={{ fontSize: '11px', color: '#6b7280', marginTop: '4px' }}>
                  This will be documented as a separate event
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Event Type *
                  </label>
                  <select
                    value={day.event_type}
                    onChange={(e) => updateEventDay(index, 'event_type', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  >
                    <option value="pageant">Pageant</option>
                    <option value="competition">Competition</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Participant Type *
                  </label>
                  <select
                    value={day.participant_type || 'solo'}
                    onChange={(e) => updateEventDay(index, 'participant_type', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  >
                    <option value="solo">Solo (Individual)</option>
                    <option value="duo">Duo (Pair/2 People)</option>
                    <option value="squad">Squad (Small Group/3-5)</option>
                    <option value="group">Group (Team/6+)</option>
                  </select>
                </div>
              </div>
            </div>
            
            {/* Status indicator */}
            <div style={{
              marginTop: '12px',
              padding: '8px 12px',
              backgroundColor: '#f0fdf4',
              border: '1px solid #86efac',
              borderRadius: '6px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <span className="material-icons" style={{ color: '#16a34a', fontSize: '18px' }}>
                info
              </span>
              <span style={{ fontSize: '12px', color: '#166534' }}>
                All records, scores, and results will be saved independently for this day
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
