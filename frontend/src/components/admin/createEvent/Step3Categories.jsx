import { useState, useEffect } from 'react';

export default function Step3Categories({ 
  categories, 
  addCategory,
  removeCategory,
  updateCategory,
  onTemplateLoad
}) {
  const [templates, setTemplates] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState('');

  useEffect(() => {
    // Load templates
    fetch('http://localhost:8000/api/scoring-templates')
      .then(res => res.json())
      .then(data => setTemplates(data))
      .catch(err => console.error('Error loading templates:', err));
  }, []);

  const handleTemplateChange = (e) => {
    const templateId = e.target.value;
    setSelectedTemplate(templateId);
    
    if (templateId && onTemplateLoad) {
      const template = templates.find(t => t.id == templateId);
      if (template) {
        onTemplateLoad(template);
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Template Selector */}
      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          📋 Load from Template (Optional)
        </label>
        <select
          value={selectedTemplate}
          onChange={handleTemplateChange}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="">-- Select a template --</option>
          {templates.map(template => (
            <option key={template.id} value={template.id}>
              {template.name} {template.is_default ? '(Default)' : ''}
            </option>
          ))}
        </select>
        <p className="text-xs text-gray-600 mt-2">
          Templates will auto-fill categories and their scoring criteria
        </p>
      </div>

      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Categories / Rounds</h2>
        <button
          type="button"
          onClick={addCategory}
          className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
        >
          + Add Category
        </button>
      </div>

      <div className="space-y-4">
        {categories.map((category, index) => (
          <div key={index} className="p-4 border border-gray-200 rounded-lg bg-gray-50">
            <div className="flex justify-between items-start mb-3">
              <h3 className="font-medium text-gray-700">Category #{index + 1}</h3>
              {categories.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeCategory(index)}
                  className="text-red-600 hover:text-red-700"
                >
                  Remove
                </button>
              )}
            </div>

            <div className="space-y-3">
              <input
                type="text"
                value={category.name}
                onChange={(e) => updateCategory(index, 'name', e.target.value)}
                placeholder="Category Name (e.g., Swimsuit, Evening Gown)"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
              <textarea
                value={category.description}
                onChange={(e) => updateCategory(index, 'description', e.target.value)}
                placeholder="Description (optional)"
                rows={2}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
