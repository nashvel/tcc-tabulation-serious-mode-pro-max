export default function ResultsTab({ candidates }) {
  const mockCategories = [
    { id: 1, name: 'Swimsuit Competition' },
    { id: 2, name: 'Evening Gown' },
    { id: 3, name: 'Question & Answer' },
    { id: 4, name: 'Talent Show' }
  ];

  return (
    <table className="w-full min-w-max border-collapse">
      <thead>
        <tr className="bg-white border-b border-gray-300">
          <th className="px-4 py-2.5 text-center text-xs font-medium text-gray-900 border-r border-gray-300 w-12">Rank</th>
          <th className="px-4 py-2.5 text-center text-xs font-medium text-gray-900 border-r border-gray-300 min-w-[80px]">#</th>
          <th className="px-4 py-2.5 text-left text-xs font-medium text-gray-900 border-r border-gray-300 min-w-[180px]">Candidate Name</th>
          {mockCategories.map((category) => (
            <th key={category.id} className="px-4 py-2.5 text-center text-xs font-medium text-gray-900 border-r border-gray-300 min-w-[120px]">
              {category.name}
            </th>
          ))}
          <th className="px-4 py-2.5 text-center text-xs font-medium text-gray-900 min-w-[120px] bg-yellow-50">Overall Total</th>
        </tr>
      </thead>
      <tbody>
        {(candidates || []).map((candidate, index) => (
          <tr key={candidate.id} className="border-b border-gray-200 hover:bg-gray-50">
            <td className="px-4 py-2.5 text-center text-sm font-semibold border-r border-gray-200">{index + 1}.</td>
            <td className="px-4 py-2.5 text-center text-sm text-gray-900 border-r border-gray-200"><strong>{candidate.number}</strong></td>
            <td className="px-4 py-2.5 text-left text-sm text-gray-900 border-r border-gray-200">{candidate.name}</td>
            {mockCategories.map((category) => (
              <td key={category.id} className="px-4 py-2.5 text-center border-r border-gray-200 text-sm text-gray-700">
                {(Math.random() * 30 + 70).toFixed(2)}
              </td>
            ))}
            <td className="px-4 py-2.5 text-center text-sm font-bold text-gray-900 bg-yellow-50">
              {(Math.random() * 120 + 280).toFixed(2)}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
