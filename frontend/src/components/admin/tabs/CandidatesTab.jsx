export default function CandidatesTab({ candidates }) {
  return (
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
          <th className="px-4 py-2.5 text-center text-xs font-medium text-gray-900 min-w-[100px]">
            Gender
          </th>
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
                <strong>{candidate.number}</strong>
              </td>
              <td className="px-4 py-2.5 text-left text-sm text-gray-900 border-r border-gray-200">
                {candidate.name}
              </td>
              <td className="px-4 py-2.5 text-center text-sm text-gray-700">
                <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${
                  candidate.gender === 'Female' ? 'bg-pink-100 text-pink-800' : 'bg-blue-100 text-blue-800'
                }`}>
                  {candidate.gender}
                </span>
              </td>
            </tr>
          ))
        ) : (
          <tr>
            <td colSpan="4" className="px-4 py-8 text-center text-sm text-gray-500">
              No candidates found
            </td>
          </tr>
        )}
      </tbody>
    </table>
  );
}
