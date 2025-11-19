export default function Step2Participants({ 
  eventData,
  eventDays,
  candidatesByDay,
  addCandidateToDay,
  removeCandidateFromDay,
  updateCandidateInDay
}) {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">
        {eventData.event_type === 'pageant' ? 'Candidates' : 'Participants'} by Day
      </h2>
      <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '16px' }}>
        Add participants for each event day. Each day maintains its own participant list.
      </p>

      {eventDays.map((day, dayIndex) => {
        const dayCandidates = candidatesByDay[dayIndex] || [];
        
        return (
          <div key={dayIndex} style={{
            padding: '24px',
            backgroundColor: '#fff7ed',
            border: '2px solid #f97316',
            borderRadius: '12px',
            marginBottom: '24px'
          }}>
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: '#f97316', marginBottom: '4px' }}>
                  Day {day.day_number}: {day.title || 'Untitled Day'}
                </h3>
                <p style={{ fontSize: '12px', color: '#6b7280' }}>
                  Event Type: {day.event_type === 'pageant' ? 'Pageant' : 'Competition'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => addCandidateToDay(dayIndex)}
                className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
              >
                + Add {day.event_type === 'pageant' ? 'Candidate' : 'Participant'}
              </button>
            </div>

            <div className="space-y-4">
              {dayCandidates.length === 0 ? (
                <p style={{ textAlign: 'center', color: '#9ca3af', padding: '20px' }}>
                  No participants added yet. Click "+ Add" to start.
                </p>
              ) : (
                dayCandidates.map((candidate, candIndex) => (
                  <div key={candIndex} className="p-4 border border-gray-200 rounded-lg bg-white">
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="font-medium text-gray-700">#{candIndex + 1}</h3>
                      {dayCandidates.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeCandidateFromDay(dayIndex, candIndex)}
                          className="text-red-600 hover:text-red-700"
                        >
                          Remove
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      {/* Candidate Number */}
                      <input
                        type="number"
                        value={candidate.number}
                        onChange={(e) => updateCandidateInDay(dayIndex, candIndex, 'number', e.target.value)}
                        placeholder="Number"
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      />
                      
                      {/* Candidate Name */}
                      <input
                        type="text"
                        value={candidate.name}
                        onChange={(e) => updateCandidateInDay(dayIndex, candIndex, 'name', e.target.value)}
                        placeholder="Full Name"
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      />

                      {/* Gender (for Pageant) */}
                      {day.event_type === 'pageant' && (
                        <select
                          value={candidate.gender}
                          onChange={(e) => updateCandidateInDay(dayIndex, candIndex, 'gender', e.target.value)}
                          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        >
                          <option value="Female">Female (Miss)</option>
                          <option value="Male">Male (Mr)</option>
                          <option value="Miss Gay">Miss Gay</option>
                          <option value="Non-binary">Non-binary</option>
                          <option value="Other">Other</option>
                        </select>
                      )}

                      {/* Team Name / Department / Barangay (for non-solo) */}
                      {day.participant_type !== 'solo' && (
                        <>
                          <input
                            type="text"
                            value={candidate.team_name}
                            onChange={(e) => updateCandidateInDay(dayIndex, candIndex, 'team_name', e.target.value)}
                            placeholder="Team Name"
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                          />
                          <input
                            type="text"
                            value={candidate.department}
                            onChange={(e) => updateCandidateInDay(dayIndex, candIndex, 'department', e.target.value)}
                            placeholder="Department / Barangay"
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                          />
                        </>
                      )}

                      {/* Partner Info (for Duo in Pageant) */}
                      {day.participant_type === 'duo' && day.event_type === 'pageant' && (
                        <>
                          <div className="col-span-2 mt-3 pt-3 border-t border-gray-300">
                            <p className="text-sm font-medium text-gray-700 mb-2">Partner Information</p>
                          </div>
                          <input
                            type="number"
                            value={candidate.partner_number}
                            onChange={(e) => updateCandidateInDay(dayIndex, candIndex, 'partner_number', e.target.value)}
                            placeholder="Partner Number"
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                          />
                          <input
                            type="text"
                            value={candidate.partner_name}
                            onChange={(e) => updateCandidateInDay(dayIndex, candIndex, 'partner_name', e.target.value)}
                            placeholder="Partner Full Name"
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                          />
                          <select
                            value={candidate.partner_gender}
                            onChange={(e) => updateCandidateInDay(dayIndex, candIndex, 'partner_gender', e.target.value)}
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                          >
                            <option value="">Partner Gender</option>
                            <option value="Female">Female (Miss)</option>
                            <option value="Male">Male (Mr)</option>
                            <option value="Miss Gay">Miss Gay</option>
                            <option value="Non-binary">Non-binary</option>
                            <option value="Other">Other</option>
                          </select>
                        </>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
