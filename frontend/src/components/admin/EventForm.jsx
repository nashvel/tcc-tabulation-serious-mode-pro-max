export default function EventForm({ eventForm, setEventForm, onSubmit, editingEvent }) {
  const addDay = () => {
    setEventForm({
      ...eventForm,
      days: [...eventForm.days, { day_number: eventForm.days.length + 1, title: '' }]
    });
  };

  const removeDay = (index) => {
    const newDays = eventForm.days.filter((_, i) => i !== index);
    const renumberedDays = newDays.map((day, i) => ({ ...day, day_number: i + 1 }));
    setEventForm({ ...eventForm, days: renumberedDays });
  };

  const updateDay = (index, title) => {
    const newDays = [...eventForm.days];
    newDays[index].title = title;
    setEventForm({ ...eventForm, days: newDays });
  };

  return (
    <div style={{
      backgroundColor: '#f9fafb',
      padding: '30px',
      borderRadius: '8px',
      border: '1px solid #e5e7eb'
    }}>
      <form onSubmit={onSubmit}>
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#333', marginBottom: '8px' }}>
            Event Title
          </label>
          <input
            type="text"
            value={eventForm.title}
            onChange={(e) => setEventForm({ ...eventForm, title: e.target.value })}
            placeholder="e.g., Intramurals 2025"
            style={{
              width: '100%',
              padding: '10px 12px',
              fontSize: '14px',
              border: '1px solid #ddd',
              borderRadius: '4px'
            }}
            required
          />
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#333', marginBottom: '8px' }}>
            Year
          </label>
          <input
            type="number"
            value={eventForm.year}
            onChange={(e) => setEventForm({ ...eventForm, year: parseInt(e.target.value) })}
            style={{
              width: '200px',
              padding: '10px 12px',
              fontSize: '14px',
              border: '1px solid #ddd',
              borderRadius: '4px'
            }}
            required
          />
        </div>

        <div style={{ marginBottom: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <label style={{ fontSize: '14px', fontWeight: '500', color: '#333' }}>
              Event Days
            </label>
            <button
              type="button"
              onClick={addDay}
              style={{
                padding: '6px 12px',
                backgroundColor: '#10b981',
                color: '#fff',
                border: 'none',
                borderRadius: '4px',
                fontSize: '12px',
                cursor: 'pointer'
              }}
            >
              + Add Day
            </button>
          </div>

          {eventForm.days.map((day, index) => (
            <div key={index} style={{ display: 'flex', gap: '12px', marginBottom: '12px', alignItems: 'center' }}>
              <div style={{
                minWidth: '80px',
                padding: '10px',
                backgroundColor: '#fff',
                border: '1px solid #ddd',
                borderRadius: '4px',
                textAlign: 'center',
                fontSize: '14px',
                fontWeight: '600',
                color: '#666'
              }}>
                Day {day.day_number}
              </div>
              <input
                type="text"
                value={day.title}
                onChange={(e) => updateDay(index, e.target.value)}
                placeholder="e.g., Battle of the Bands"
                style={{
                  flex: 1,
                  padding: '10px 12px',
                  fontSize: '14px',
                  border: '1px solid #ddd',
                  borderRadius: '4px'
                }}
                required
              />
              {eventForm.days.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeDay(index)}
                  style={{
                    padding: '10px 12px',
                    backgroundColor: '#ef4444',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                >
                  ✕
                </button>
              )}
            </div>
          ))}
        </div>

        <button
          type="submit"
          style={{
            padding: '12px 24px',
            backgroundColor: '#D52818',
            color: '#fff',
            border: 'none',
            borderRadius: '6px',
            fontSize: '14px',
            fontWeight: '600',
            cursor: 'pointer'
          }}
        >
          {editingEvent ? 'Update Event' : 'Create Event'}
        </button>
      </form>
    </div>
  );
}
