import ValidationIcon from '../ValidationIcon';
import RichTextEditor from '../RichTextEditor';

export default function Step1BasicInfo({ eventData, setEventData, importantPeople, setImportantPeople }) {
  const addImportantPerson = () => {
    setImportantPeople([...importantPeople, { position: '', name: '' }]);
  };

  const removeImportantPerson = (index) => {
    setImportantPeople(importantPeople.filter((_, i) => i !== index));
  };

  const updateImportantPerson = (index, field, value) => {
    const updated = [...importantPeople];
    updated[index][field] = value;
    setImportantPeople(updated);
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">Basic Information</h2>
      
      <div style={{ position: 'relative' }}>
        <label className="block text-sm font-medium text-gray-700 mb-2">Event Name *</label>
        <div style={{ position: 'relative' }}>
          <input
            type="text"
            value={eventData.title}
            onChange={(e) => setEventData({ ...eventData, title: e.target.value })}
            placeholder="e.g., Battle of the Bands 2025"
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            style={{
              borderColor: eventData.title ? '#10b981' : '#d1d5db',
              paddingRight: '40px'
            }}
          />
          <ValidationIcon isValid={eventData.title} />
        </div>
      </div>

      <div style={{ position: 'relative' }}>
        <label className="block text-sm font-medium text-gray-700 mb-2">Event Date *</label>
        <div style={{ position: 'relative' }}>
          <input
            type="date"
            value={eventData.event_date}
            onChange={(e) => setEventData({ ...eventData, event_date: e.target.value })}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            style={{
              borderColor: eventData.event_date ? '#10b981' : '#d1d5db',
              paddingRight: '40px'
            }}
          />
          <ValidationIcon isValid={eventData.event_date} />
        </div>
      </div>

      <RichTextEditor
        value={eventData.description}
        onChange={(value) => setEventData({ ...eventData, description: value })}
      />

      <div style={{ position: 'relative' }}>
        <label className="block text-sm font-medium text-gray-700 mb-2">Event Type *</label>
        <div style={{ position: 'relative' }}>
          <select
            value={eventData.event_type}
            onChange={(e) => setEventData({ ...eventData, event_type: e.target.value })}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            style={{
              borderColor: '#10b981',
              paddingRight: '40px'
            }}
          >
            <option value="pageant">Pageant</option>
            <option value="competition">Competition</option>
          </select>
          <ValidationIcon isValid={true} />
        </div>
      </div>

      <div style={{ position: 'relative' }}>
        <label className="block text-sm font-medium text-gray-700 mb-2">Participant Type *</label>
        <div style={{ position: 'relative' }}>
          <select
            value={eventData.participant_type}
            onChange={(e) => setEventData({ ...eventData, participant_type: e.target.value })}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            style={{
              borderColor: '#10b981',
              paddingRight: '40px'
            }}
          >
            <option value="solo">Solo</option>
            <option value="duo">Duo (Pair)</option>
            <option value="squad">Squad (Small Group)</option>
            <option value="group">Group (Team)</option>
          </select>
          <ValidationIcon isValid={true} />
        </div>
      </div>

      <div style={{ position: 'relative' }}>
        <label className="block text-sm font-medium text-gray-700 mb-2">Number of Judges *</label>
        <div style={{ position: 'relative' }}>
          <input
            type="number"
            value={eventData.number_of_judges}
            onChange={(e) => setEventData({ ...eventData, number_of_judges: parseInt(e.target.value) })}
            min="1"
            max="15"
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            style={{
              borderColor: eventData.number_of_judges >= 1 && eventData.number_of_judges <= 15 ? '#10b981' : '#d1d5db',
              paddingRight: '40px'
            }}
          />
          <ValidationIcon isValid={eventData.number_of_judges >= 1 && eventData.number_of_judges <= 15} />
        </div>
        {eventData.number_of_judges < 1 || eventData.number_of_judges > 15 ? (
          <p style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px' }}>
            Must be between 1 and 15 judges
          </p>
        ) : null}
      </div>

      {/* Important People */}
      <div>
        <div className="flex justify-between items-center mb-3">
          <label className="block text-sm font-medium text-gray-700">Important People</label>
          <button
            type="button"
            onClick={addImportantPerson}
            className="text-sm text-orange-600 hover:text-orange-700 font-medium"
          >
            + Add Person
          </button>
        </div>
        {importantPeople.map((person, index) => (
          <div key={index} className="flex gap-3 mb-3">
            <input
              type="text"
              value={person.position}
              onChange={(e) => updateImportantPerson(index, 'position', e.target.value)}
              placeholder="Position (e.g., Director)"
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
            <input
              type="text"
              value={person.name}
              onChange={(e) => updateImportantPerson(index, 'name', e.target.value)}
              placeholder="Name"
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
            {importantPeople.length > 1 && (
              <button
                type="button"
                onClick={() => removeImportantPerson(index)}
                className="px-3 py-2 text-red-600 hover:text-red-700"
              >
                ✕
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
