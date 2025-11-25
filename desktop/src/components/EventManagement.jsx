import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Plus, Trash2, Play, Save } from 'lucide-react';
import './EventManagement.css';

const API_BASE = 'http://localhost:8000';

function EventManagement({ addLog }) {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    title: '',
    year: new Date().getFullYear(),
    event_type: 'pageant',
    number_of_judges: 5
  });

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE}/api/events`);
      setEvents(response.data);
      addLog(`Loaded ${response.data.length} events`);
    } catch (error) {
      addLog(`Error loading events: ${error.message}`);
      toast.error('Failed to load events');
    } finally {
      setLoading(false);
    }
  };

  const createEvent = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) {
      toast.error('Event title is required');
      return;
    }

    try {
      setLoading(true);
      addLog(`Creating event: ${form.title}...`);
      
      const response = await axios.post(`${API_BASE}/api/events`, {
        title: form.title,
        year: parseInt(form.year),
        event_type: form.event_type,
        number_of_judges: parseInt(form.number_of_judges),
        status: 'active',
        days: [{
          day_number: 1,
          title: 'Day 1',
          event_type: form.event_type,
          participant_type: 'solo'
        }]
      }, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken') || ''}`
        }
      });

      toast.success('Event created successfully!');
      addLog('Event created successfully');
      
      setForm({
        title: '',
        year: new Date().getFullYear(),
        event_type: 'pageant',
        number_of_judges: 5
      });
      
      await loadEvents();
    } catch (error) {
      addLog(`Error: ${error.response?.data?.message || error.message}`);
      toast.error('Failed to create event');
    } finally {
      setLoading(false);
    }
  };

  const deleteEvent = async (eventId, eventTitle) => {
    if (!window.confirm(`Delete event "${eventTitle}"?`)) return;

    try {
      setLoading(true);
      addLog(`Deleting event ${eventId}...`);
      
      await axios.delete(`${API_BASE}/api/events/${eventId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken') || ''}`
        }
      });

      toast.success('Event deleted successfully!');
      addLog('Event deleted');
      await loadEvents();
    } catch (error) {
      addLog(`Error: ${error.message}`);
      toast.error('Failed to delete event');
    } finally {
      setLoading(false);
    }
  };

  const continueEvent = async (event) => {
    try {
      localStorage.setItem('continuingEvent', JSON.stringify(event));
      addLog(`Opening event: ${event.title}`);
      if (window.electron) {
        await window.electron.openBrowser('http://localhost:5173/admin');
      } else {
        window.open('http://localhost:5173/admin', '_blank');
      }
    } catch (error) {
      addLog(`Error: ${error.message}`);
      toast.error('Failed to open event');
    }
  };

  return (
    <div className="event-management">
      <div className="create-event-panel">
        <h2>Create New Event</h2>
        <form onSubmit={createEvent}>
          <div className="form-group">
            <label>Event Title *</label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="e.g., TCC Intramurals 2025"
              disabled={loading}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Year</label>
              <input
                type="number"
                value={form.year}
                onChange={(e) => setForm({ ...form, year: e.target.value })}
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label>Event Type</label>
              <select
                value={form.event_type}
                onChange={(e) => setForm({ ...form, event_type: e.target.value })}
                disabled={loading}
              >
                <option value="pageant">Pageant</option>
                <option value="competition">Competition</option>
                <option value="tournament">Tournament</option>
              </select>
            </div>

            <div className="form-group">
              <label>Number of Judges</label>
              <input
                type="number"
                value={form.number_of_judges}
                onChange={(e) => setForm({ ...form, number_of_judges: e.target.value })}
                min="1"
                disabled={loading}
              />
            </div>
          </div>

          <button type="submit" disabled={loading} className="btn btn-success btn-lg">
            <Save size={18} /> Create Event
          </button>
        </form>
      </div>

      <div className="events-list-panel">
        <h2>Existing Events</h2>
        {events.length === 0 ? (
          <div className="empty-state">
            <p>No events created yet</p>
            <p>Create your first event to get started</p>
          </div>
        ) : (
          <div className="events-list">
            {events.map(event => (
              <div key={event.id} className="event-item">
                <div className="event-info">
                  <h3>{event.title}</h3>
                  <p className="event-meta">
                    Year: {event.year} | Type: {event.event_type} | Judges: {event.number_of_judges}
                  </p>
                  <p className={`event-status ${event.status}`}>
                    Status: {event.status}
                  </p>
                </div>
                <div className="event-actions">
                  <button
                    onClick={() => continueEvent(event)}
                    className="btn btn-success"
                    title="Open event in browser"
                  >
                    <Play size={16} /> Continue
                  </button>
                  <button
                    onClick={() => deleteEvent(event.id, event.title)}
                    className="btn btn-danger"
                    disabled={loading}
                  >
                    <Trash2 size={16} /> Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default EventManagement;
