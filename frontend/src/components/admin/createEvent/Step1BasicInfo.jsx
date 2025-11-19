import EventDaysSection from './EventDaysSection';

export default function Step1BasicInfo({ 
  eventData, 
  setEventData, 
  eventDays,
  addEventDay,
  removeEventDay,
  updateEventDay,
  importantPeople, 
  setImportantPeople 
}) {
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
      
      {/* Event Name */}
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
          {eventData.title && (
            <span className="material-icons" style={{
              position: 'absolute',
              right: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: '#10b981',
              fontSize: '20px'
            }}>
              check_circle
            </span>
          )}
        </div>
      </div>

      {/* Event Date */}
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
          {eventData.event_date && (
            <span className="material-icons" style={{
              position: 'absolute',
              right: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: '#10b981',
              fontSize: '20px'
            }}>
              check_circle
            </span>
          )}
        </div>
      </div>

      {/* Event Description */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Event Description</label>
        <textarea
          value={eventData.description}
          onChange={(e) => setEventData({ ...eventData, description: e.target.value })}
          placeholder="Type your event description here..."
          rows={5}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          style={{
            resize: 'vertical',
            fontSize: '14px',
            lineHeight: '1.5'
          }}
        />
        <p style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>
          Optional event description
        </p>
      </div>

      {/* Number of Judges */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Number of Judges *</label>
        <input
          type="number"
          value={eventData.number_of_judges}
          onChange={(e) => {
            const value = e.target.value === '' ? '' : parseInt(e.target.value);
            setEventData({ ...eventData, number_of_judges: value });
          }}
          onBlur={(e) => {
            // Set to 1 if empty when user leaves the field
            if (e.target.value === '' || parseInt(e.target.value) < 1) {
              setEventData({ ...eventData, number_of_judges: 1 });
            }
          }}
          min="1"
          max="15"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
        />
        <p style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>
          Between 1 and 15 judges
        </p>
      </div>

      {/* Event Days Section */}
      <EventDaysSection
        eventDays={eventDays}
        addEventDay={addEventDay}
        removeEventDay={removeEventDay}
        updateEventDay={updateEventDay}
      />

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
