import ScoreValidationCard from '../ScoreValidationCard';

export default function Step4ScoreRules({ 
  criteria, 
  addCriterion,
  removeCriterion,
  updateCriterion,
  totalPercentage
}) {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Criteria & Score Rules</h2>
          <ScoreValidationCard totalPercentage={totalPercentage} />
        </div>
        <button
          type="button"
          onClick={addCriterion}
          className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
        >
          + Add Criterion
        </button>
      </div>

      <div className="space-y-4">
        {criteria.map((criterion, index) => (
          <div key={index} className="p-4 border border-gray-200 rounded-lg bg-gray-50">
            <div className="flex justify-between items-start mb-3">
              <h3 className="font-medium text-gray-700">Criterion #{index + 1}</h3>
              {criteria.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeCriterion(index)}
                  className="text-red-600 hover:text-red-700"
                >
                  Remove
                </button>
              )}
            </div>

            <div className="grid grid-cols-3 gap-3 mb-3">
              <input
                type="text"
                value={criterion.name}
                onChange={(e) => updateCriterion(index, 'name', e.target.value)}
                placeholder="Criterion Name"
                className="col-span-3 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
              <input
                type="number"
                value={criterion.max_score}
                onChange={(e) => updateCriterion(index, 'max_score', e.target.value)}
                placeholder="Max Score"
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
              <input
                type="number"
                value={criterion.percentage}
                onChange={(e) => updateCriterion(index, 'percentage', e.target.value)}
                placeholder="Percentage %"
                step="0.01"
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
              <div className="flex items-center px-4 py-2 bg-gray-100 rounded-lg">
                <span className="text-sm text-gray-600">{criterion.percentage}%</span>
              </div>
            </div>

            <textarea
              value={criterion.description}
              onChange={(e) => updateCriterion(index, 'description', e.target.value)}
              placeholder="Description (optional)"
              rows={2}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
