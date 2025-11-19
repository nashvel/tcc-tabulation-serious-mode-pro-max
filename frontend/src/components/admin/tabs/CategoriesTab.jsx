export default function CategoriesTab() {
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
          <th className="px-4 py-2.5 text-center text-xs font-medium text-gray-900 border-r border-gray-300 w-12">
            #
          </th>
          <th className="px-4 py-2.5 text-left text-xs font-medium text-gray-900 border-r border-gray-300 min-w-[200px]">
            Category Name
          </th>
          <th className="px-4 py-2.5 text-left text-xs font-medium text-gray-900 border-r border-gray-300 min-w-[250px]">
            Description
          </th>
          <th className="px-4 py-2.5 text-center text-xs font-medium text-gray-900 min-w-[100px]">
            Order
          </th>
        </tr>
      </thead>
      <tbody>
        {mockCategories.map((category, index) => (
          <tr key={category.id} className="border-b border-gray-200 hover:bg-gray-50">
            <td className="px-4 py-2.5 text-center text-sm text-gray-700 border-r border-gray-200">
              {index + 1}.
            </td>
            <td className="px-4 py-2.5 text-left text-sm text-gray-900 border-r border-gray-200">
              {category.name}
            </td>
            <td className="px-4 py-2.5 text-left text-sm text-gray-700 border-r border-gray-200">
              Category description here
            </td>
            <td className="px-4 py-2.5 text-center text-sm text-gray-900">
              <strong>{category.id}</strong>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
