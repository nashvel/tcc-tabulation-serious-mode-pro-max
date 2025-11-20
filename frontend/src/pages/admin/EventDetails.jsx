import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import AdminPreloader from '../../components/admin/AdminPreloader';

export default function EventDetails() {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editingCriterion, setEditingCriterion] = useState(null);
  const [editValues, setEditValues] = useState({ name: '', percentage: '' });
  const [editingBasicInfo, setEditingBasicInfo] = useState(false);
  const [basicInfoValues, setBasicInfoValues] = useState({
    event_date: '',
    description: '',
    event_type: '',
    number_of_judges: ''
  });
  const [editingTitle, setEditingTitle] = useState(false);
  const [titleValue, setTitleValue] = useState('');

  // Simple auth check
  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    const pin = localStorage.getItem('adminPin');
    
    if (!token || !pin) {
      navigate('/admin/login', { replace: true });
    }
  }, [navigate]);

  useEffect(() => {
    loadEventDetails();
  }, [eventId]);

  const loadEventDetails = async () => {
    try {
      const response = await fetch(`http://localhost:8000/api/events/${eventId}`);

      if (response.ok) {
        const data = await response.json();
        setEvent(data);
      } else {
        toast.error('Failed to load event details');
      }
    } catch (error) {
      console.error('Error loading event:', error);
      toast.error('Error loading event details');
    } finally {
      setLoading(false);
    }
  };

  const handleEditCriterion = (criterion) => {
    setEditingCriterion(criterion.id);
    setEditValues({ 
      name: criterion.name, 
      percentage: criterion.points || criterion.percentage // points field stores percentage 
    });
  };

  const handleCancelEdit = () => {
    setEditingCriterion(null);
    setEditValues({ name: '', percentage: '' });
  };

  const handleSaveCriterion = async (criterionId) => {
    try {
      const response = await fetch(`http://localhost:8000/api/criteria/${criterionId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        },
        body: JSON.stringify({
          name: editValues.name,
          points: parseInt(editValues.percentage), // Save percentage to points field
          event_id: event.id
        })
      });

      if (response.ok) {
        toast.success('Criterion updated successfully');
        setEditingCriterion(null);
        setEditValues({ name: '', percentage: '' });
        loadEventDetails(); // Reload to show updated data
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || 'Failed to update criterion');
      }
    } catch (error) {
      console.error('Error saving criterion:', error);
      toast.error('Error updating criterion');
    }
  };

  const handleEditBasicInfo = () => {
    setEditingBasicInfo(true);
    // Format date to yyyy-MM-dd for date input
    let formattedDate = '';
    if (event.event_date) {
      const dateObj = new Date(event.event_date);
      formattedDate = dateObj.toISOString().split('T')[0]; // Extract yyyy-MM-dd
    }
    setBasicInfoValues({
      event_date: formattedDate,
      description: event.description || '',
      event_type: event.event_type || 'pageant',
      number_of_judges: event.number_of_judges || 7
    });
  };

  const handleCancelBasicInfo = () => {
    setEditingBasicInfo(false);
    setBasicInfoValues({
      event_date: '',
      description: '',
      event_type: '',
      number_of_judges: ''
    });
  };

  const handleSaveBasicInfo = async () => {
    try {
      // Use unique_id if available, otherwise use regular id
      const actualEventId = event.unique_id || event.id;
      const response = await fetch(`http://localhost:8000/api/events/${actualEventId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        },
        body: JSON.stringify({
          event_date: basicInfoValues.event_date,
          description: basicInfoValues.description,
          event_type: basicInfoValues.event_type,
          number_of_judges: parseInt(basicInfoValues.number_of_judges)
        })
      });

      if (response.ok) {
        toast.success('Basic information updated successfully');
        setEditingBasicInfo(false);
        loadEventDetails();
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || 'Failed to update basic information');
      }
    } catch (error) {
      console.error('Error saving basic info:', error);
      toast.error('Error updating basic information');
    }
  };

  const handleEditTitle = () => {
    setEditingTitle(true);
    setTitleValue(event.title);
  };

  const handleCancelTitle = () => {
    setEditingTitle(false);
    setTitleValue('');
  };

  const handleSaveTitle = async () => {
    if (!titleValue.trim()) {
      toast.error('Event title cannot be empty');
      return;
    }

    try {
      // Use unique_id if available, otherwise use regular id
      const actualEventId = event.unique_id || event.id;
      const response = await fetch(`http://localhost:8000/api/events/${actualEventId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        },
        body: JSON.stringify({
          title: titleValue
        })
      });

      if (response.ok) {
        toast.success('Event title updated successfully');
        setEditingTitle(false);
        loadEventDetails();
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || 'Failed to update event title');
      }
    } catch (error) {
      console.error('Error saving title:', error);
      toast.error('Error updating event title');
    }
  };

  if (loading) {
    return <AdminPreloader />;
  }

  if (!event) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <p>Event not found</p>
        <button onClick={() => navigate('/admin')} style={{ marginTop: '20px', padding: '10px 20px' }}>
          Back to Admin
        </button>
      </div>
    );
  }

  return (
    <div style={{ width: '100%' }}>
      {/* Fixed Header */}
      <div style={{
        position: 'fixed',
        top: '0',
        left: '0',
        right: '0',
        width: '100vw',
        zIndex: '9999',
        margin: '0'
      }}>
        {/* Orange Header Bar */}
        <div style={{
          backgroundColor: '#f97316',
          padding: '8px 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '10px',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
        }}>
          <div style={{ display: 'flex', gap: '15px' }}>
            <button onClick={() => navigate('/admin')}
              style={{
                padding: '8px 16px',
                backgroundColor: '#fff',
                color: '#f97316',
                border: 'none',
                borderRadius: '6px',
                fontSize: '13px',
                fontWeight: '600',
                cursor: 'pointer',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}
            >
              HOME
              
            </button>
            <button onClick={() => navigate('#')}
              style={{
                padding: '8px 16px',
                backgroundColor: 'transparent',
                color: '#fff',
                border: '1px solid #fff',
                borderRadius: '6px',
                fontSize: '13px',
                fontWeight: '600',
                cursor: 'pointer',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}
            >
              EDIT
            </button>
            <button onClick={() => alert('Documentation feature coming soon')}
              style={{
                padding: '8px 16px',
                backgroundColor: 'transparent',
                color: '#fff',
                border: '1px solid #fff',
                borderRadius: '6px',
                fontSize: '13px',
                fontWeight: '600',
                cursor: 'pointer',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}
            >
              DOCUMENTATION
            </button>
            <button onClick={() => navigate('/judges')}
              style={{
                padding: '8px 16px',
                backgroundColor: 'transparent',
                color: '#fff',
                border: '1px solid #fff',
                borderRadius: '6px',
                fontSize: '13px',
                fontWeight: '600',
                cursor: 'pointer',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}
            >
              JUDGES
            </button>
            <button onClick={() => navigate('/certificates')}
              style={{
                padding: '8px 16px',
                backgroundColor: 'transparent',
                color: '#fff',
                border: '1px solid #fff',
                borderRadius: '6px',
                fontSize: '13px',
                fontWeight: '600',
                cursor: 'pointer',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}
            >
              CERTIFICATES
            </button>
          </div>
        </div>

        {/* Logo Bar */}
        <div style={{
          backgroundColor: '#fff',
          padding: '20px',
          textAlign: 'center',
          borderBottom: '3px solid #f97316',
          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '30px', flexWrap: 'wrap' }}>
            <img src="/assets/logo-3.png" style={{ height: '80px' }} alt="Logo 3" />
            <img src="/assets/tcc_seal.png" style={{ height: '80px' }} alt="TCC Seal" />
            <img src="/assets/it.png" style={{ height: '80px' }} alt="IT Logo" />
            <img src="/assets/bsit.png" style={{ height: '80px' }} alt="BSIT Logo" />
          </div>
        </div>
      </div>

      {/* Spacer to prevent content from going under fixed header */}
      <div style={{ height: '190px' }} />

      <div style={{ padding: '0 40px 40px 40px' }}>
        {/* Title and Actions */}
        <div style={{ marginBottom: '30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
              {editingTitle ? (
                <>
                  <input
                    type="text"
                    value={titleValue}
                    onChange={(e) => setTitleValue(e.target.value)}
                    style={{
                      fontSize: '32px',
                      fontWeight: 'bold',
                      color: '#1f2937',
                      padding: '4px 8px',
                      border: '2px solid #3b82f6',
                      borderRadius: '6px',
                      flex: 1,
                      maxWidth: '600px'
                    }}
                    autoFocus
                  />
                  <button
                    onClick={handleSaveTitle}
                    style={{
                      padding: '8px 16px',
                      backgroundColor: '#10b981',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontWeight: '600',
                      fontSize: '14px'
                    }}
                  >
                    ✓ Save
                  </button>
                  <button
                    onClick={handleCancelTitle}
                    style={{
                      padding: '8px 16px',
                      backgroundColor: '#ef4444',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontWeight: '600',
                      fontSize: '14px'
                    }}
                  >
                    ✗ Cancel
                  </button>
                </>
              ) : (
                <>
                  <h1 style={{ fontSize: '32px', fontWeight: 'bold', color: '#1f2937', margin: 0 }}>
                    {event.title}
                  </h1>
                  <button
                    onClick={handleEditTitle}
                    style={{
                      padding: '6px 12px',
                      backgroundColor: '#3b82f6',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '12px',
                      fontWeight: '600'
                    }}
                  >
                    Edit Title
                  </button>
                </>
              )}
            </div>
            <p style={{ color: '#6b7280', fontSize: '16px' }}>
              Event ID: {event.id} • Year: {event.year} • Status: <span style={{ 
                color: event.status === 'active' ? '#10b981' : '#f59e0b',
                fontWeight: 'bold',
                textTransform: 'uppercase'
              }}>{event.status}</span>
            </p>
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              onClick={() => navigate('/admin')}
              style={{
                padding: '12px 24px',
                backgroundColor: '#f97316',
                color: '#fff',
                border: 'none',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#ea580c'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#f97316'}
            >
              ← Back to Admin
            </button>
          </div>
        </div>

      {/* Grid Layout for Tables */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '24px' }}>
        {/* Basic Information */}
        <div style={{ backgroundColor: '#fff', border: '2px solid #e5e7eb', borderRadius: '12px', padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '2px solid #fed7aa', paddingBottom: '10px' }}>
            <h2 style={{ fontSize: '20px', fontWeight: 'bold', color: '#f97316', display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
              <span className="material-icons" style={{ fontSize: '24px' }}>info</span>
              Basic Information
            </h2>
            {!editingBasicInfo ? (
              <button
                onClick={handleEditBasicInfo}
                style={{ padding: '6px 12px', backgroundColor: '#3b82f6', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}
              >
                Edit
              </button>
            ) : (
              <div style={{ display: 'flex', gap: '6px' }}>
                <button
                  onClick={handleSaveBasicInfo}
                  style={{ padding: '6px 12px', backgroundColor: '#10b981', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}
                >
                  ✓ Save
                </button>
                <button
                  onClick={handleCancelBasicInfo}
                  style={{ padding: '6px 12px', backgroundColor: '#ef4444', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}
                >
                  ✗ Cancel
                </button>
              </div>
            )}
          </div>
        <table style={{ width: '100%', borderCollapse: 'collapse', border: '2px solid #000' }}>
          <tbody>
            <tr>
              <td style={{ padding: '12px', fontWeight: '600', color: '#374151', width: '200px', border: '1px solid #000', backgroundColor: '#f9fafb' }}>Event Date:</td>
              <td style={{ padding: '12px', color: '#374151', border: '1px solid #000' }}>
                {editingBasicInfo ? (
                  <input
                    type="date"
                    value={basicInfoValues.event_date}
                    onChange={(e) => setBasicInfoValues({...basicInfoValues, event_date: e.target.value})}
                    style={{ width: '100%', padding: '6px', border: '1px solid #d1d5db', borderRadius: '4px' }}
                  />
                ) : (event.event_date || 'Not set')}
              </td>
            </tr>
            <tr>
              <td style={{ padding: '12px', fontWeight: '600', color: '#374151', border: '1px solid #000', backgroundColor: '#f9fafb' }}>Description:</td>
              <td style={{ padding: '12px', color: '#374151', border: '1px solid #000' }}>
                {editingBasicInfo ? (
                  <textarea
                    value={basicInfoValues.description}
                    onChange={(e) => setBasicInfoValues({...basicInfoValues, description: e.target.value})}
                    style={{ width: '100%', padding: '6px', border: '1px solid #d1d5db', borderRadius: '4px', minHeight: '60px' }}
                  />
                ) : (event.description || 'No description')}
              </td>
            </tr>
            <tr>
              <td style={{ padding: '12px', fontWeight: '600', color: '#374151', border: '1px solid #000', backgroundColor: '#f9fafb' }}>Event Type:</td>
              <td style={{ padding: '12px', color: '#374151', border: '1px solid #000', textTransform: 'capitalize' }}>
                {editingBasicInfo ? (
                  <select
                    value={basicInfoValues.event_type}
                    onChange={(e) => setBasicInfoValues({...basicInfoValues, event_type: e.target.value})}
                    style={{ width: '100%', padding: '6px', border: '1px solid #d1d5db', borderRadius: '4px' }}
                  >
                    <option value="pageant">Pageant</option>
                    <option value="competition">Competition</option>
                    <option value="contest">Contest</option>
                  </select>
                ) : event.event_type}
              </td>
            </tr>
            <tr>
              <td style={{ padding: '12px', fontWeight: '600', color: '#374151', border: '1px solid #000', backgroundColor: '#f9fafb' }}>Event Days:</td>
              <td style={{ padding: '12px', color: '#374151', border: '1px solid #000' }}>
                {event.days && event.days.length > 0 ? (
                  <div>
                    {event.days.map((day, index) => (
                      <div key={day.id} style={{ marginBottom: '4px' }}>
                        <span style={{ fontWeight: '600' }}>Day {day.day_number}:</span> {day.title} 
                        <span style={{ 
                          marginLeft: '8px',
                          padding: '2px 6px',
                          backgroundColor: '#f3f4f6',
                          borderRadius: '4px',
                          fontSize: '11px',
                          textTransform: 'uppercase'
                        }}>
                          {day.participant_type}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : 'No event days configured'}
              </td>
            </tr>
            <tr>
              <td style={{ padding: '12px', fontWeight: '600', color: '#374151', border: '1px solid #000', backgroundColor: '#f9fafb' }}>Number of Judges:</td>
              <td style={{ padding: '12px', color: '#374151', border: '1px solid #000' }}>
                {editingBasicInfo ? (
                  <input
                    type="number"
                    value={basicInfoValues.number_of_judges}
                    onChange={(e) => setBasicInfoValues({...basicInfoValues, number_of_judges: e.target.value})}
                    style={{ width: '100px', padding: '6px', border: '1px solid #d1d5db', borderRadius: '4px' }}
                    min="1"
                    max="20"
                  />
                ) : event.number_of_judges}
              </td>
            </tr>
          </tbody>
        </table>
        </div>

        {/* Categories & Criteria */}
        {event.categories && event.categories.length > 0 && (
          <div style={{ backgroundColor: '#fff', border: '2px solid #e5e7eb', borderRadius: '12px', padding: '24px', maxHeight: '600px', overflowY: 'auto' }}>
            <h2 style={{ fontSize: '20px', fontWeight: 'bold', color: '#f97316', marginBottom: '20px', borderBottom: '2px solid #fed7aa', paddingBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className="material-icons" style={{ fontSize: '24px' }}>emoji_events</span>
              Categories & Scoring Criteria
            </h2>
          {event.categories.map((category, catIndex) => {
            const categoryCriteria = event.criteria?.filter(c => c.category_id === category.id) || [];
            const categoryTotal = categoryCriteria.reduce((sum, c) => sum + parseFloat(c.percentage || 0), 0);
            
            return (
              <div key={category.id} style={{ marginBottom: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#1f2937' }}>
                    {catIndex + 1}. {category.name}
                  </h3>
                  <span style={{ 
                    padding: '4px 12px', 
                    backgroundColor: categoryTotal === 100 ? '#d1fae5' : '#fee2e2',
                    color: categoryTotal === 100 ? '#065f46' : '#991b1b',
                    borderRadius: '4px',
                    fontWeight: 'bold',
                    fontSize: '12px'
                  }}>
                    {categoryTotal}% {categoryTotal === 100 ? '✓' : '✗'}
                  </span>
                </div>
                {category.description && (
                  <p style={{ fontSize: '12px', color: '#6b7280', marginBottom: '8px', fontStyle: 'italic' }}>{category.description}</p>
                )}
                
                {categoryCriteria.length > 0 ? (
                  <table style={{ width: '100%', borderCollapse: 'collapse', border: '2px solid #000', marginBottom: '16px' }}>
                    <thead>
                      <tr style={{ backgroundColor: '#fef3c7' }}>
                        <th style={{ padding: '10px', textAlign: 'left', fontWeight: '600', color: '#374151', border: '1px solid #000' }}>Criterion</th>
                        <th style={{ padding: '10px', textAlign: 'center', fontWeight: '600', color: '#374151', width: '120px', border: '1px solid #000' }}>Percentage</th>
                        <th style={{ padding: '10px', textAlign: 'center', fontWeight: '600', color: '#374151', width: '100px', border: '1px solid #000' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {categoryCriteria.map((criterion, index) => (
                        <tr key={criterion.id}>
                          <td style={{ padding: '10px', color: '#374151', border: '1px solid #000' }}>
                            {editingCriterion === criterion.id ? (
                              <input 
                                type="text" 
                                value={editValues.name}
                                onChange={(e) => setEditValues({...editValues, name: e.target.value})}
                                style={{ width: '100%', padding: '6px', border: '1px solid #d1d5db', borderRadius: '4px' }}
                              />
                            ) : criterion.name}
                          </td>
                          <td style={{ padding: '10px', textAlign: 'center', fontWeight: '600', color: '#f97316', border: '1px solid #000' }}>
                            {editingCriterion === criterion.id ? (
                              <input 
                                type="number" 
                                value={editValues.percentage}
                                onChange={(e) => setEditValues({...editValues, percentage: e.target.value})}
                                style={{ width: '60px', padding: '6px', border: '1px solid #d1d5db', borderRadius: '4px', textAlign: 'center' }}
                                min="0"
                                max="100"
                              />
                            ) : `${criterion.percentage}%`}
                          </td>
                          <td style={{ padding: '10px', textAlign: 'center', border: '1px solid #000' }}>
                            {editingCriterion === criterion.id ? (
                              <div style={{ display: 'flex', gap: '4px', justifyContent: 'center' }}>
                                <button 
                                  onClick={() => handleSaveCriterion(criterion.id)}
                                  style={{ padding: '4px 8px', backgroundColor: '#10b981', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}
                                >
                                  ✓
                                </button>
                                <button 
                                  onClick={handleCancelEdit}
                                  style={{ padding: '4px 8px', backgroundColor: '#ef4444', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}
                                >
                                  ✗
                                </button>
                              </div>
                            ) : (
                              <button 
                                onClick={() => handleEditCriterion(criterion)}
                                style={{ padding: '4px 8px', backgroundColor: '#3b82f6', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}
                              >
                                Edit
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div style={{ padding: '16px', textAlign: 'center', color: '#9ca3af', border: '1px solid #e5e7eb', borderRadius: '4px' }}>
                    No criteria defined for this category
                  </div>
                )}
              </div>
            );
          })}
          </div>
        )}
      </div>

      {/* Important People */}
      {event.importantPeople && event.importantPeople.length > 0 && (
        <div style={{ backgroundColor: '#fff', border: '2px solid #e5e7eb', borderRadius: '12px', padding: '24px', marginBottom: '24px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 'bold', color: '#f97316', marginBottom: '20px', borderBottom: '2px solid #fed7aa', paddingBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="material-icons" style={{ fontSize: '24px' }}>group</span>
            Important People
          </h2>
          <table style={{ width: '100%', borderCollapse: 'collapse', border: '2px solid #000' }}>
            <thead>
              <tr style={{ backgroundColor: '#f9fafb' }}>
                <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', color: '#374151', border: '1px solid #000' }}>Position</th>
                <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', color: '#374151', border: '1px solid #000' }}>Name</th>
              </tr>
            </thead>
            <tbody>
              {event.importantPeople.map((person, index) => (
                <tr key={index}>
                  <td style={{ padding: '12px', color: '#374151', border: '1px solid #000' }}>{person.position}</td>
                  <td style={{ padding: '12px', color: '#374151', border: '1px solid #000' }}>{person.name}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Candidates */}
      {event.candidates && event.candidates.length > 0 && (
        <div style={{ backgroundColor: '#fff', border: '2px solid #e5e7eb', borderRadius: '12px', padding: '24px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 'bold', color: '#f97316', marginBottom: '20px', borderBottom: '2px solid #fed7aa', paddingBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="material-icons" style={{ fontSize: '24px' }}>people</span>
            Participants
          </h2>
          <table style={{ width: '100%', borderCollapse: 'collapse', border: '2px solid #000' }}>
            <thead>
              <tr style={{ backgroundColor: '#f9fafb' }}>
                <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', color: '#374151', border: '1px solid #000' }}>Number</th>
                <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', color: '#374151', border: '1px solid #000' }}>Name</th>
                <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', color: '#374151', border: '1px solid #000' }}>Gender</th>
                <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', color: '#374151', border: '1px solid #000' }}>Partner</th>
                <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', color: '#374151', border: '1px solid #000' }}>Team/Department</th>
                <th style={{ padding: '12px', textAlign: 'center', fontWeight: '600', color: '#374151', border: '1px solid #000' }}>Type</th>
                <th style={{ padding: '12px', textAlign: 'center', fontWeight: '600', color: '#374151', border: '1px solid #000' }}>Day</th>
              </tr>
            </thead>
            <tbody>
              {event.candidates.map((candidate, index) => (
                <tr key={candidate.id}>
                  <td style={{ padding: '12px', color: '#374151', fontWeight: '600', border: '1px solid #000' }}>#{candidate.number}</td>
                  <td style={{ padding: '12px', color: '#374151', border: '1px solid #000' }}>
                    {candidate.name}
                    {candidate.partner_name && (
                      <div style={{ fontSize: '12px', color: '#9ca3af', marginTop: '4px' }}>
                        Partner: {candidate.partner_name} ({candidate.partner_gender})
                      </div>
                    )}
                  </td>
                  <td style={{ padding: '12px', color: '#374151', textTransform: 'capitalize', border: '1px solid #000' }}>{candidate.gender || '-'}</td>
                  <td style={{ padding: '12px', color: '#374151', border: '1px solid #000' }}>
                    {candidate.partner_name ? (
                      <div>
                        <div>{candidate.partner_name}</div>
                        <div style={{ fontSize: '12px', color: '#9ca3af' }}>#{candidate.partner_number} • {candidate.partner_gender}</div>
                      </div>
                    ) : '-'}
                  </td>
                  <td style={{ padding: '12px', color: '#374151', border: '1px solid #000' }}>{candidate.team_name || candidate.department || '-'}</td>
                  <td style={{ padding: '12px', textAlign: 'center', border: '1px solid #000' }}>
                    <span style={{ 
                      padding: '4px 8px', 
                      backgroundColor: candidate.participant_type === 'duo' ? '#dbeafe' : '#f3f4f6',
                      color: candidate.participant_type === 'duo' ? '#1e40af' : '#374151',
                      borderRadius: '4px',
                      fontSize: '12px',
                      fontWeight: '600',
                      textTransform: 'uppercase'
                    }}>
                      {candidate.participant_type}
                    </span>
                  </td>
                  <td style={{ padding: '12px', textAlign: 'center', color: '#374151', border: '1px solid #000' }}>Day {candidate.day_number}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      </div>
    </div>
  );
}
