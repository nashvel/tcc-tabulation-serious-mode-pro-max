export default function Step4ScoreRules({ 
  criteria, 
  categories,
  addCriterion,
  removeCriterion,
  updateCriterion,
  totalPercentage
}) {
  // Group criteria by category
  const getCriteriaByCategory = (categoryIndex) => {
    return criteria.filter(c => c.category_index === categoryIndex);
  };

  // Calculate percentage total for a category
  const getCategoryTotal = (categoryIndex) => {
    const categoryCriteria = getCriteriaByCategory(categoryIndex);
    return categoryCriteria.reduce((sum, c) => sum + (parseFloat(c.percentage) || 0), 0);
  };
  // Check if all categories are valid (each = 100%)
  const allCategoriesValid = categories.every((_, index) => getCategoryTotal(index) === 100);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Criteria & Score Rules</h2>
          {/* Score Validation Info */}
          <div style={{
            marginTop: '12px',
            padding: '12px 16px',
            backgroundColor: '#eff6ff',
            border: '2px solid #93c5fd',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            <span className="material-icons" style={{ 
              color: '#1e40af',
              fontSize: '24px'
            }}>
              info
            </span>
            <div>
              <p style={{ 
                margin: 0, 
                fontWeight: 'bold', 
                fontSize: '14px',
                color: '#1e3a8a'
              }}>
                Scoring System: Category-Based
              </p>
              <p style={{ 
                margin: 0, 
                fontSize: '12px',
                color: '#1e40af'
              }}>
                Each category is scored independently (100% each). Final score = Average of all categories.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {categories.length > 0 ? (
          categories.map((category, catIndex) => {
            const categoryCriteria = getCriteriaByCategory(catIndex);
            const categoryTotal = getCategoryTotal(catIndex);
            const isValid = categoryTotal === 100;

            return (
              <div key={catIndex} className="border-2 border-gray-300 rounded-lg p-4 bg-white">
                {/* Category Header */}
                <div className="flex justify-between items-center mb-4 pb-3 border-b-2 border-orange-200">
                  <div>
                    <h3 className="text-lg font-bold text-gray-800">{category.name}</h3>
                    {category.description && (
                      <p className="text-sm text-gray-600 mt-1">{category.description}</p>
                    )}
                  </div>
                  <div className={`px-4 py-2 rounded-lg ${
                    isValid ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    <span className="font-bold">{categoryTotal}%</span>
                    <span className="text-xs ml-2">{isValid ? '✓' : '✗'}</span>
                  </div>
                </div>

                {/* Criteria for this category */}
                <div className="space-y-3">
                  {categoryCriteria.map((criterion, index) => {
                    const globalIndex = criteria.findIndex(c => c === criterion);
                    return (
                      <div key={globalIndex} className="p-3 border border-gray-200 rounded-lg bg-gray-50">
                        <div className="flex justify-between items-start mb-2">
                          <span className="text-sm font-medium text-gray-600">Sub-criterion #{index + 1}</span>
                          {categoryCriteria.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeCriterion(globalIndex)}
                              className="text-red-600 hover:text-red-700 text-sm"
                            >
                              Remove
                            </button>
                          )}
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <input
                            type="text"
                            value={criterion.name}
                            onChange={(e) => updateCriterion(globalIndex, 'name', e.target.value)}
                            placeholder="Criterion Name"
                            className="col-span-2 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
                          />
                          <input
                            type="number"
                            value={criterion.percentage}
                            onChange={(e) => updateCriterion(globalIndex, 'percentage', e.target.value)}
                            placeholder="Percentage %"
                            step="1"
                            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
                          />
                          <div className="flex items-center px-3 py-2 bg-orange-100 rounded-lg">
                            <span className="text-sm font-bold text-orange-800">{criterion.percentage}%</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Add criterion button for this category */}
                <button
                  type="button"
                  onClick={() => {
                    const newCriterion = { name: '', max_score: 100, percentage: 0, description: '', category_index: catIndex };
                    addCriterion(newCriterion);
                  }}
                  className="mt-3 px-3 py-2 bg-orange-100 text-orange-700 rounded-lg hover:bg-orange-200 text-sm w-full"
                >
                  + Add Sub-Criterion to {category.name}
                </button>
              </div>
            );
          })
        ) : (
          <div className="p-6 bg-yellow-50 border border-yellow-200 rounded-lg text-center">
            <p className="text-yellow-800">Please add categories in Step 3 first.</p>
          </div>
        )}
      </div>
    </div>
  );
}
