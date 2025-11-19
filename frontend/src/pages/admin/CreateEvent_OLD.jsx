import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast, { Toaster } from 'react-hot-toast';
import AdminHeaderButtons from '../../components/admin/AdminHeaderButtons';
import AdminSidebar from '../../components/admin/AdminSidebar';
import EventDaysSection from '../../components/admin/createEvent/EventDaysSection';

export default function CreateEvent() {
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);

  // Event basic info
  const [eventData, setEventData] = useState({
    title: '',
    event_date: '',
    description: '',
    event_type: 'pageant',
    participant_type: 'solo',
    number_of_judges: 7
  });

  // Important people
  const [importantPeople, setImportantPeople] = useState([
    { position: '', name: '' }
  ]);

  // Candidates
  const [candidates, setCandidates] = useState([
    { number: 1, name: '', gender: 'Female', team_name: '', department: '', partner_number: '', partner_name: '', partner_gender: '' }
  ]);

  // Event Days
  const [eventDays, setEventDays] = useState([
    { day_number: 1, title: '', event_type: 'pageant' }
  ]);

  // Categories
  const [categories, setCategories] = useState([
    { name: '', description: '' }
  ]);

  // Criteria/Score Rules
  const [criteria, setCriteria] = useState([
    { name: '', max_score: 100, percentage: 0, description: '' }
  ]);

  const totalPercentage = criteria.reduce((sum, c) => sum + parseFloat(c.percentage || 0), 0);

  // Event Day handlers
  const addEventDay = () => {
    const nextDay = eventDays.length + 1;
    setEventDays([...eventDays, { day_number: nextDay, title: '', event_type: 'pageant' }]);
  };

  const removeEventDay = (index) => {
    setEventDays(eventDays.filter((_, i) => i !== index));
  };

  const updateEventDay = (index, field, value) => {
    const updated = [...eventDays];
    updated[index][field] = value;
    setEventDays(updated);
  };

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

  const addCandidate = () => {
    const nextNumber = candidates.length + 1;
    setCandidates([...candidates, { 
      number: nextNumber, 
      name: '', 
      gender: 'Female', 
      team_name: '', 
      department: '',
      partner_number: '',
      partner_name: '',
      partner_gender: ''
    }]);
  };

  const removeCandidate = (index) => {
    setCandidates(candidates.filter((_, i) => i !== index));
  };

  const updateCandidate = (index, field, value) => {
    const updated = [...candidates];
    updated[index][field] = value;
    setCandidates(updated);
  };

  const addCategory = () => {
    setCategories([...categories, { name: '', description: '' }]);
  };

  const removeCategory = (index) => {
    setCategories(categories.filter((_, i) => i !== index));
  };

  const updateCategory = (index, field, value) => {
    const updated = [...categories];
    updated[index][field] = value;
    setCategories(updated);
  };

  const addCriterion = () => {
    setCriteria([...criteria, { name: '', max_score: 100, percentage: 0, description: '' }]);
  };

  const removeCriterion = (index) => {
    setCriteria(criteria.filter((_, i) => i !== index));
  };

  const updateCriterion = (index, field, value) => {
    const updated = [...criteria];
    updated[index][field] = value;
    setCriteria(updated);
  };

  const handleSubmit = async () => {
    // Validation
    if (!eventData.title || !eventData.event_date) {
      toast.error('Please fill in event name and date');
      return;
    }

    if (totalPercentage !== 100) {
      toast.error(`Score percentages must total 100% (currently ${totalPercentage}%)`);
      return;
    }

    const payload = {
      ...eventData,
      event_days: eventDays.filter(d => d.title),
      important_people: importantPeople.filter(p => p.position || p.name),
      candidates: candidates.filter(c => c.name),
      categories: categories.filter(c => c.name),
      criteria: criteria.filter(c => c.name),
      score_rules: criteria.map(c => ({
        name: c.name,
        percentage: c.percentage,
        max_score: c.max_score
      }))
    };

    try {
      const response = await fetch('http://localhost:8000/api/events/create-full', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        const result = await response.json();
        toast.success(
          (t) => (
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span className="material-icons" style={{ fontSize: '32px', color: '#10b981' }}>
                check_circle
              </span>
              <div>
                <p style={{ margin: 0, fontWeight: 'bold', fontSize: '16px' }}>
                  Event Created Successfully!
                </p>
                <p style={{ margin: 0, fontSize: '14px', color: '#6b7280' }}>
                  {eventData.title}
                </p>
              </div>
            </div>
          ),
          {
            duration: 4000,
            style: {
              padding: '16px',
              borderRadius: '8px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            },
          }
        );
        setTimeout(() => navigate('/get_started'), 1500);
      } else {
        const error = await response.json();
        toast.error(error.message || 'Failed to create event', {
          duration: 4000,
          icon: '❌',
        });
      }
    } catch (error) {
      console.error('Error creating event:', error);
      toast.error('Error creating event. Please try again.', {
        duration: 4000,
        icon: '❌',
      });
    }
  };

  const renderStep1 = () => (
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

      {/* Event Days - Using separated component */}
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

  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">
          {eventData.event_type === 'pageant' ? 'Candidates' : 'Participants'}
        </h2>
        <button
          type="button"
          onClick={addCandidate}
          className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
        >
          + Add {eventData.event_type === 'pageant' ? 'Candidate' : 'Participant'}
        </button>
      </div>

      <div className="space-y-4">
        {candidates.map((candidate, index) => (
          <div key={index} className="p-4 border border-gray-200 rounded-lg bg-gray-50">
            <div className="flex justify-between items-start mb-3">
              <h3 className="font-medium text-gray-700">#{index + 1}</h3>
              {candidates.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeCandidate(index)}
                  className="text-red-600 hover:text-red-700"
                >
                  Remove
                </button>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <input
                type="number"
                value={candidate.number}
                onChange={(e) => updateCandidate(index, 'number', e.target.value)}
                placeholder="Number"
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
              <input
                type="text"
                value={candidate.name}
                onChange={(e) => updateCandidate(index, 'name', e.target.value)}
                placeholder="Name"
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />

              {eventData.event_type === 'pageant' && (
                <select
                  value={candidate.gender}
                  onChange={(e) => updateCandidate(index, 'gender', e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                >
                  <option value="Female">Female</option>
                  <option value="Male">Male</option>
                </select>
              )}

              {eventData.participant_type !== 'solo' && (
                <>
                  <input
                    type="text"
                    value={candidate.team_name}
                    onChange={(e) => updateCandidate(index, 'team_name', e.target.value)}
                    placeholder="Team Name (optional)"
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                  <input
                    type="text"
                    value={candidate.department}
                    onChange={(e) => updateCandidate(index, 'department', e.target.value)}
                    placeholder="Department (optional)"
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </>
              )}

              {eventData.participant_type === 'duo' && eventData.event_type === 'pageant' && (
                <>
                  <input
                    type="number"
                    value={candidate.partner_number}
                    onChange={(e) => updateCandidate(index, 'partner_number', e.target.value)}
                    placeholder="Partner Number"
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                  <input
                    type="text"
                    value={candidate.partner_name}
                    onChange={(e) => updateCandidate(index, 'partner_name', e.target.value)}
                    placeholder="Partner Name"
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                  <select
                    value={candidate.partner_gender}
                    onChange={(e) => updateCandidate(index, 'partner_gender', e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  >
                    <option value="">Partner Gender</option>
                    <option value="Female">Female</option>
                    <option value="Male">Male</option>
                  </select>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Categories</h2>
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

  const renderStep4 = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Criteria & Score Rules</h2>
          <div style={{ 
            marginTop: '12px',
            padding: '12px 16px',
            borderRadius: '8px',
            backgroundColor: totalPercentage === 100 ? '#d1fae5' : '#fee2e2',
            border: `2px solid ${totalPercentage === 100 ? '#10b981' : '#ef4444'}`,
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <span className="material-icons" style={{ 
              color: totalPercentage === 100 ? '#10b981' : '#ef4444',
              fontSize: '24px'
            }}>
              {totalPercentage === 100 ? 'check_circle' : 'error'}
            </span>
            <div>
              <p style={{ 
                fontSize: '14px', 
                fontWeight: '600',
                color: totalPercentage === 100 ? '#065f46' : '#991b1b',
                margin: 0
              }}>
                Total Percentage: {totalPercentage}%
              </p>
              <p style={{ 
                fontSize: '12px',
                color: totalPercentage === 100 ? '#047857' : '#dc2626',
                margin: 0
              }}>
                {totalPercentage === 100 ? 'Perfect! Ready to proceed.' : 'Must equal 100% to continue.'}
              </p>
            </div>
          </div>
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

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
      <AdminSidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      
      {/* Toast Notifications */}
      <Toaster
        position="top-right"
        reverseOrder={false}
        toastOptions={{
          style: {
            background: '#fff',
            color: '#363636',
          },
        }}
      />
      
      {/* Header */}
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        backgroundColor: '#f97316',
        borderBottom: '5px solid #ea580c',
        padding: '12px 40px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        zIndex: 1000,
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <button
            onClick={() => navigate('/setup')}
            style={{
              backgroundColor: 'rgba(255,255,255,0.2)',
              border: 'none',
              color: '#fff',
              padding: '8px 16px',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            ← Back to Setup
          </button>
          <h1 style={{ color: '#fff', fontSize: '20px', fontWeight: 'bold', margin: 0 }}>
            Create New Event
          </h1>
        </div>
        <AdminHeaderButtons onEditClick={() => setIsSidebarOpen(true)} />
      </div>

      {/* Progress Steps - Centered */}
      <div style={{
        position: 'fixed',
        top: '65px',
        left: 0,
        right: 0,
        backgroundColor: '#fff',
        padding: '24px 40px',
        borderBottom: '1px solid #e5e7eb',
        zIndex: 999,
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          {[
            { num: 1, title: 'Basic Info' },
            { num: 2, title: 'Participants' },
            { num: 3, title: 'Categories' },
            { num: 4, title: 'Score Rules' }
          ].map((step, index) => (
            <div key={step.num} style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                <div style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '18px',
                  fontWeight: 'bold',
                  backgroundColor: currentStep >= step.num ? '#f97316' : '#e5e7eb',
                  color: currentStep >= step.num ? '#fff' : '#9ca3af',
                  transition: 'all 0.3s'
                }}>
                  {currentStep > step.num ? '✓' : step.num}
                </div>
                <span style={{
                  fontSize: '13px',
                  fontWeight: currentStep === step.num ? '600' : '400',
                  color: currentStep === step.num ? '#f97316' : '#6b7280'
                }}>
                  {step.title}
                </span>
              </div>
              {index < 3 && (
                <div style={{
                  flex: 1,
                  height: '3px',
                  margin: '0 16px',
                  backgroundColor: currentStep > step.num ? '#f97316' : '#e5e7eb',
                  transition: 'all 0.3s',
                  marginTop: '-24px'
                }} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Content - Centered with max-width */}
      <div style={{ paddingTop: '180px', padding: '180px 40px 40px 40px', minHeight: '100vh' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          {/* Step Content Card */}
          <div style={{
            backgroundColor: '#fff',
            borderRadius: '12px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            padding: '48px 60px',
            minHeight: '500px'
          }}>
            {currentStep === 1 && renderStep1()}
            {currentStep === 2 && renderStep2()}
            {currentStep === 3 && renderStep3()}
            {currentStep === 4 && renderStep4()}

            {/* Navigation Buttons */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginTop: '48px',
              paddingTop: '32px',
              borderTop: '2px solid #f3f4f6'
            }}>
              <button
                onClick={() => currentStep > 1 ? setCurrentStep(currentStep - 1) : navigate('/setup')}
                style={{
                  padding: '12px 32px',
                  border: '2px solid #e5e7eb',
                  borderRadius: '8px',
                  backgroundColor: '#fff',
                  color: '#374151',
                  fontSize: '15px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => e.target.style.backgroundColor = '#f9fafb'}
                onMouseLeave={(e) => e.target.style.backgroundColor = '#fff'}
              >
                {currentStep === 1 ? '← Cancel' : '← Previous'}
              </button>

              {currentStep < 4 ? (
                <button
                  onClick={() => setCurrentStep(currentStep + 1)}
                  style={{
                    padding: '12px 32px',
                    border: 'none',
                    borderRadius: '8px',
                    backgroundColor: '#f97316',
                    color: '#fff',
                    fontSize: '15px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => e.target.style.backgroundColor = '#ea580c'}
                  onMouseLeave={(e) => e.target.style.backgroundColor = '#f97316'}
                >
                  Next Step →
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  disabled={totalPercentage !== 100}
                  style={{
                    padding: '12px 32px',
                    border: 'none',
                    borderRadius: '8px',
                    backgroundColor: totalPercentage === 100 ? '#10b981' : '#d1d5db',
                    color: '#fff',
                    fontSize: '15px',
                    fontWeight: '600',
                    cursor: totalPercentage === 100 ? 'pointer' : 'not-allowed',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    if (totalPercentage === 100) e.target.style.backgroundColor = '#059669';
                  }}
                  onMouseLeave={(e) => {
                    if (totalPercentage === 100) e.target.style.backgroundColor = '#10b981';
                  }}
                >
                  ✓ Create Event & Proceed
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
