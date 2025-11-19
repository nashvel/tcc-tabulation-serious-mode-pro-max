export default function Step2Participants({ 
  eventData, 
  candidates, 
  setCandidates,
  addCandidate,
  removeCandidate,
  updateCandidate
}) {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">
          {eventData.event_type === 'pageant' ? 'Candidates' : 'Participants'}
        </h2>
        <button
          type="button"
          onClick={addCandidate}
          className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
        >
          + Add {eventData.event_type === 'pageant' ? 'Candidate' : 'Participant'}
        </button>
      </div>

      <div className="space-y-4">
        {candidates.map((candidate, index) => (
          <div key={index} className="p-4 border border-gray-200 rounded-lg bg-gray-50">
            <div className="flex justify-between items-start mb-3">
              <h3 className="font-medium text-gray-700">#{index + 1}</h3>
              {candidates.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeCandidate(index)}
                  className="text-red-600 hover:text-red-700"
                >
                  Remove
                </button>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <input
                type="number"
                value={candidate.number}
                onChange={(e) => updateCandidate(index, 'number', e.target.value)}
                placeholder="Number"
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
              <input
                type="text"
                value={candidate.name}
                onChange={(e) => updateCandidate(index, 'name', e.target.value)}
                placeholder="Name"
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />

              {eventData.event_type === 'pageant' && (
                <select
                  value={candidate.gender}
                  onChange={(e) => updateCandidate(index, 'gender', e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                >
                  <option value="Female">Female</option>
                  <option value="Male">Male</option>
                </select>
              )}

              {eventData.participant_type !== 'solo' && (
                <>
                  <input
                    type="text"
                    value={candidate.team_name}
                    onChange={(e) => updateCandidate(index, 'team_name', e.target.value)}
                    placeholder="Team Name (optional)"
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                  <input
                    type="text"
                    value={candidate.department}
                    onChange={(e) => updateCandidate(index, 'department', e.target.value)}
                    placeholder="Department (optional)"
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </>
              )}

              {eventData.participant_type === 'duo' && eventData.event_type === 'pageant' && (
                <>
                  <input
                    type="number"
                    value={candidate.partner_number}
                    onChange={(e) => updateCandidate(index, 'partner_number', e.target.value)}
                    placeholder="Partner Number"
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                  <input
                    type="text"
                    value={candidate.partner_name}
                    onChange={(e) => updateCandidate(index, 'partner_name', e.target.value)}
                    placeholder="Partner Name"
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                  <select
                    value={candidate.partner_gender}
                    onChange={(e) => updateCandidate(index, 'partner_gender', e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  >
                    <option value="">Partner Gender</option>
                    <option value="Female">Female</option>
                    <option value="Male">Male</option>
                  </select>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
