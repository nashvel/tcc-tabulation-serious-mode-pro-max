import { Lock, Unlock } from 'lucide-react';
import { useState } from 'react';

export default function CandidatesTab({ candidates, isLocked = false }) {
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({});

  const handleEdit = (candidate) => {
    setEditingId(candidate.id);
    setEditData({ ...candidate });
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditData({});
  };

  const handleSave = async (candidateId) => {
    // TODO: Add API call to save candidate changes
    console.log('Saving candidate:', editData);
    setEditingId(null);
  };

  return (
    <div className="relative">
      {/* Lock Overlay */}
      {isLocked && (
        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-40 rounded-lg">
          <div className="bg-white rounded-lg p-6 shadow-xl text-center">
            <Lock size={32} className="text-slate-600 mx-auto mb-3" />
            <p className="text-sm font-semibold text-slate-900">Editing Locked</p>
            <p className="text-xs text-slate-600 mt-1">Unlock from the sidebar to edit candidates</p>
          </div>
        </div>
      )}

      <table className="w-full min-w-max border-collapse">
        <thead>
          <tr className="bg-white border-b border-gray-300">
            <th className="px-4 py-2.5 text-center text-xs font-medium text-gray-900 border-r border-gray-300 w-12">
              #
            </th>
            <th className="px-4 py-2.5 text-center text-xs font-medium text-gray-900 border-r border-gray-300 min-w-[100px]">
              Number
            </th>
            <th className="px-4 py-2.5 text-left text-xs font-medium text-gray-900 border-r border-gray-300 min-w-[200px]">
              Name
            </th>
            <th className="px-4 py-2.5 text-center text-xs font-medium text-gray-900 border-r border-gray-300 min-w-[100px]">
              Gender
            </th>
            {!isLocked && (
              <th className="px-4 py-2.5 text-center text-xs font-medium text-gray-900 min-w-[80px]">
                Actions
              </th>
            )}
          </tr>
        </thead>
        <tbody>
          {candidates && candidates.length > 0 ? (
            candidates.map((candidate, index) => (
              <tr key={candidate.id} className="border-b border-gray-200 hover:bg-gray-50">
                <td className="px-4 py-2.5 text-center text-sm text-gray-700 border-r border-gray-200">
                  {index + 1}.
                </td>
                <td className="px-4 py-2.5 text-center text-sm text-gray-900 border-r border-gray-200">
                  {editingId === candidate.id ? (
                    <input
                      type="text"
                      value={editData.number}
                      onChange={(e) => setEditData({ ...editData, number: e.target.value })}
                      className="w-full px-2 py-1 border border-slate-300 rounded text-sm"
                      disabled={isLocked}
                    />
                  ) : (
                    <strong>{candidate.number}</strong>
                  )}
                </td>
                <td className="px-4 py-2.5 text-left text-sm text-gray-900 border-r border-gray-200">
                  {editingId === candidate.id ? (
                    <input
                      type="text"
                      value={editData.name}
                      onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                      className="w-full px-2 py-1 border border-slate-300 rounded text-sm"
                      disabled={isLocked}
                    />
                  ) : (
                    candidate.name
                  )}
                </td>
                <td className="px-4 py-2.5 text-center text-sm text-gray-700 border-r border-gray-200">
                  <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${
                    candidate.gender === 'Female' ? 'bg-pink-100 text-pink-800' : 'bg-blue-100 text-blue-800'
                  }`}>
                    {candidate.gender}
                  </span>
                </td>
                {!isLocked && (
                  <td className="px-4 py-2.5 text-center text-sm">
                    {editingId === candidate.id ? (
                      <div className="flex gap-2 justify-center">
                        <button
                          onClick={() => handleSave(candidate.id)}
                          className="px-2 py-1 bg-green-500 hover:bg-green-600 text-white text-xs rounded font-semibold transition-colors"
                        >
                          Save
                        </button>
                        <button
                          onClick={handleCancel}
                          className="px-2 py-1 bg-slate-400 hover:bg-slate-500 text-white text-xs rounded font-semibold transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleEdit(candidate)}
                        className="px-2 py-1 bg-blue-500 hover:bg-blue-600 text-white text-xs rounded font-semibold transition-colors"
                      >
                        Edit
                      </button>
                    )}
                  </td>
                )}
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={isLocked ? "4" : "5"} className="px-4 py-8 text-center text-sm text-gray-500">
                No candidates found
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
