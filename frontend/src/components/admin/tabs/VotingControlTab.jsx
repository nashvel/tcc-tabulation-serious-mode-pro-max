export default function VotingControlTab({ candidates }) {
  const mockCriteria = [
    { id: 1, name: 'Poise', percentage: 30 },
    { id: 2, name: 'Stage Presence', percentage: 25 },
    { id: 3, name: 'Confidence', percentage: 25 },
    { id: 4, name: 'Overall Presentation', percentage: 20 }
  ];

  return (
    <table className="w-full min-w-max border-collapse">
      <thead>
        <tr className="bg-white border-b border-gray-300">
          <th className="px-4 py-2.5 text-center text-xs font-medium text-gray-900 border-r border-gray-300 w-12">#</th>
          <th className="px-4 py-2.5 text-center text-xs font-medium text-gray-900 border-r border-gray-300 min-w-[80px]">Candidate #</th>
          <th className="px-4 py-2.5 text-left text-xs font-medium text-gray-900 border-r border-gray-300 min-w-[180px]">Candidate Name</th>
          {mockCriteria.map((criterion) => (
            <th key={criterion.id} className="px-4 py-2.5 text-center text-xs font-medium text-gray-900 border-r border-gray-300 min-w-[120px]">
              {criterion.name}
              <div className="text-[10px] font-normal text-gray-600">({criterion.percentage}%)</div>
            </th>
          ))}
          <th className="px-4 py-2.5 text-center text-xs font-medium text-gray-900 min-w-[100px] bg-blue-50">Category Total</th>
        </tr>
      </thead>
      <tbody>
        {(candidates || []).map((candidate, index) => (
          <tr key={candidate.id} className="border-b border-gray-200 hover:bg-gray-50">
            <td className="px-4 py-2.5 text-center text-sm text-gray-700 border-r border-gray-200">{index + 1}.</td>
            <td className="px-4 py-2.5 text-center text-sm text-gray-900 border-r border-gray-200"><strong>{candidate.number}</strong></td>
            <td className="px-4 py-2.5 text-left text-sm text-gray-900 border-r border-gray-200">{candidate.name}</td>
            {mockCriteria.map((criterion) => (
              <td key={criterion.id} className="px-4 py-2.5 text-center border-r border-gray-200 text-sm text-gray-700">85.50</td>
            ))}
            <td className="px-4 py-2.5 text-center text-sm font-bold text-gray-900 bg-blue-50">342.00</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
