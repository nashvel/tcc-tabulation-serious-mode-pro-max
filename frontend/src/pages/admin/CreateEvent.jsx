import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import toast, { Toaster } from 'react-hot-toast';
import AdminHeaderButtons from '../../components/admin/AdminHeaderButtons';
import AdminSidebar from '../../components/admin/AdminSidebar';
import ProgressSteps from '../../components/admin/createEvent/ProgressSteps';
import Step1BasicInfo from '../../components/admin/createEvent/Step1BasicInfo';
import Step2Participants from '../../components/admin/createEvent/Step2Participants';
import Step3Categories from '../../components/admin/createEvent/Step3Categories';
import Step4ScoreRules from '../../components/admin/createEvent/Step4ScoreRules';

export default function CreateEvent() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [eventId, setEventId] = useState(null); // Track draft event ID
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingDraft, setIsLoadingDraft] = useState(true);

  // Event basic info
  const [basicInfo, setBasicInfo] = useState({
    title: '',
    event_date: '',
    description: '',
    event_type: 'pageant',
    number_of_judges: 7
  });

  // Important people
  const [importantPeople, setImportantPeople] = useState([
    { position: '', name: '' }
  ]);

  // Event Days
  const [eventDays, setEventDays] = useState([
    { day_number: 1, title: '', event_type: 'pageant', participant_type: 'solo' }
  ]);

  // Candidates by Day (organized by event day)
  const [candidatesByDay, setCandidatesByDay] = useState({
    0: [{ number: 1, name: '', gender: 'Female', team_name: '', department: '', partner_number: '', partner_name: '', partner_gender: '' }]
  });

  // Categories
  const [categories, setCategories] = useState([
    { name: '', description: '' }
  ]);

  // Criteria/Score Rules
  const [criteria, setCriteria] = useState([
    { name: '', max_score: 100, percentage: 0, description: '' }
  ]);

  const totalPercentage = criteria.reduce((sum, c) => sum + parseFloat(c.percentage || 0), 0);

  // Load draft event on mount
  useEffect(() => {
    const loadDraft = async () => {
      // Check if there's a draft_id in localStorage or URL
      const draftId = searchParams.get('draft_id') || localStorage.getItem('current_draft_id');
      
      if (draftId) {
        try {
          const response = await fetch(`http://localhost:8000/api/events/${draftId}`, {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
            }
          });

          if (response.ok) {
            const event = await response.json();
            
            console.log('Loaded event:', event);
            console.log('Candidates:', event.candidates);
            console.log('Categories:', event.categories);
            console.log('Criteria:', event.criteria);
            console.log('Criteria count:', event.criteria ? event.criteria.length : 0);
            
            // Populate form with draft data
            setEventId(event.id);
            
            // Format event_date properly (Laravel returns it as "2025-11-08T00:00:00.000000Z")
            let formattedDate = '';
            if (event.event_date) {
              // Extract just the date part (YYYY-MM-DD)
              formattedDate = event.event_date.split('T')[0];
            }
            
            setBasicInfo({
              title: event.title,
              event_date: formattedDate,
              description: event.description || '',
              event_type: event.event_type || 'pageant',
              number_of_judges: event.number_of_judges || 7
            });

            // Load event days
            if (event.days && event.days.length > 0) {
              setEventDays(event.days.map(day => ({
                day_number: day.day_number,
                title: day.title,
                event_type: day.event_type || 'pageant',
                participant_type: day.participant_type || 'solo'
              })));
            }

            // Load important people (check both snake_case and camelCase)
            const importantPeopleData = event.important_people || event.importantPeople || [];
            if (importantPeopleData.length > 0) {
              setImportantPeople(importantPeopleData.map(p => ({
                position: p.position || '',
                name: p.name || ''
              })));
            }

            // Load candidates by day
            if (event.candidates && event.candidates.length > 0) {
              const candByDay = {};
              event.candidates.forEach(cand => {
                const dayIndex = (cand.day_number || 1) - 1;
                if (!candByDay[dayIndex]) candByDay[dayIndex] = [];
                candByDay[dayIndex].push(cand);
              });
              setCandidatesByDay(candByDay);
            }

            // Load categories
            if (event.categories && event.categories.length > 0) {
              setCategories(event.categories.map(cat => ({
                name: cat.name,
                description: cat.description || ''
              })));
            }

            // Load criteria with category mapping
            if (event.criteria && event.criteria.length > 0) {
              const loadedCriteria = event.criteria.map(crit => {
                // Find which category this criterion belongs to
                let categoryIndex = 0;
                if (crit.category_id && event.categories) {
                  const catIndex = event.categories.findIndex(cat => cat.id === crit.category_id);
                  if (catIndex !== -1) categoryIndex = catIndex;
                }
                
                return {
                  name: crit.name,
                  max_score: crit.max_score || 100,
                  percentage: crit.percentage,
                  description: crit.description || '',
                  category_index: categoryIndex
                };
              });
              setCriteria(loadedCriteria);
            }

            // Determine current step based on completion
            if (event.step4_completed) setCurrentStep(4);
            else if (event.step3_completed) setCurrentStep(3);
            else if (event.step2_completed) setCurrentStep(2);
            else setCurrentStep(1);

            toast.success('Draft loaded!', { duration: 2000 });
          }
        } catch (error) {
          console.error('Error loading draft:', error);
        }
      }
      
      setIsLoadingDraft(false);
    };

    loadDraft();
  }, [searchParams]);

  // Save draft ID to localStorage when created
  useEffect(() => {
    if (eventId) {
      localStorage.setItem('current_draft_id', eventId);
    }
  }, [eventId]);

  // Auto-save Step 1 (Basic Info)
  const saveStep1 = async () => {
    if (!eventData.title) {
      toast.error('Please enter event name before proceeding');
      return false;
    }

    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:8000/api/events/save-draft', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        },
        body: JSON.stringify({
          event_id: eventId,
          ...eventData,
          event_days: eventDays.filter(d => d.title),
          important_people: importantPeople.filter(p => p.position || p.name),
          current_step: 1
        })
      });

      if (response.ok) {
        const result = await response.json();
        setEventId(result.event_id);
        toast.success('Step 1 saved!', { duration: 2000 });
        return true;
      } else {
        toast.error('Failed to save step 1');
        return false;
      }
    } catch (error) {
      console.error('Error saving step 1:', error);
      toast.error('Error saving step 1');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Auto-save Step 2 (Participants)
  const saveStep2 = async () => {
    if (!eventId) {
      toast.error('Please complete Step 1 first');
      return false;
    }

    // Validation: Check if at least one participant has a name
    let hasParticipants = false;
    Object.values(candidatesByDay).forEach(dayCandidates => {
      if (dayCandidates && dayCandidates.some(c => c.name && c.name.trim() !== '')) {
        hasParticipants = true;
      }
    });

    if (!hasParticipants) {
      toast.error('Please add at least one participant with a name');
      return false;
    }

    // Validation: Check if participants with names also have numbers
    let missingNumbers = false;
    Object.values(candidatesByDay).forEach(dayCandidates => {
      if (dayCandidates) {
        dayCandidates.forEach(c => {
          if (c.name && c.name.trim() !== '' && (!c.number || c.number === '')) {
            missingNumbers = true;
          }
        });
      }
    });

    if (missingNumbers) {
      toast.error('Please provide numbers for all participants with names');
      return false;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`http://localhost:8000/api/events/${eventId}/update-step`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        },
        body: JSON.stringify({
          step: 2,
          data: {
            candidates_by_day: candidatesByDay
          }
        })
      });

      if (response.ok) {
        toast.success('Step 2 saved!', { duration: 2000 });
        return true;
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || 'Failed to save step 2');
        return false;
      }
    } catch (error) {
      console.error('Error saving step 2:', error);
      toast.error('Error saving step 2: ' + error.message);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Auto-save Step 3 (Categories)
  const saveStep3 = async () => {
    if (!eventId) {
      toast.error('Please complete Step 1 first');
      return false;
    }

    // Validation: Check if at least one category exists
    const validCategories = categories.filter(c => c.name && c.name.trim() !== '');
    if (validCategories.length === 0) {
      toast.error('Please add at least one category');
      return false;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`http://localhost:8000/api/events/${eventId}/update-step`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        },
        body: JSON.stringify({
          step: 3,
          data: {
            categories: validCategories
          }
        })
      });

      if (response.ok) {
        toast.success('Step 3 saved!', { duration: 2000 });
        return true;
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || 'Failed to save step 3');
        return false;
      }
    } catch (error) {
      console.error('Error saving step 3:', error);
      toast.error('Error saving step 3: ' + error.message);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Auto-save Step 4 (Score Rules)
  const saveStep4 = async () => {
    if (!eventId) {
      toast.error('Please complete Step 1 first');
      return false;
    }

    // Validation: Check if at least one criterion exists
    const validCriteria = criteria.filter(c => c.name && c.name.trim() !== '');
    if (validCriteria.length === 0) {
      toast.error('Please add at least one scoring criterion');
      return false;
    }

    // Validation: Check if all criteria have valid percentages
    const hasInvalidPercentage = validCriteria.some(c => {
      const percentage = parseFloat(c.percentage);
      return isNaN(percentage) || percentage <= 0;
    });

    if (hasInvalidPercentage) {
      toast.error('All criteria must have valid percentages greater than 0');
      return false;
    }

    // Validation: Check if each category's criteria total 100%
    let invalidCategory = null;
    const categoriesValid = categories.every((category, catIndex) => {
      const categoryCriteria = validCriteria.filter(c => c.category_index === catIndex);
      const categoryTotal = categoryCriteria.reduce((sum, c) => sum + (parseFloat(c.percentage) || 0), 0);
      if (categoryTotal !== 100) {
        invalidCategory = { name: category.name, total: categoryTotal };
        return false;
      }
      return true;
    });

    if (!categoriesValid && invalidCategory) {
      toast.error(`"${invalidCategory.name}" criteria must total 100% (currently ${invalidCategory.total}%)`);
      return false;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`http://localhost:8000/api/events/${eventId}/update-step`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        },
        body: JSON.stringify({
          step: 4,
          data: {
            criteria: validCriteria
          }
        })
      });

      if (response.ok) {
        toast.success('Step 4 saved!', { duration: 2000 });
        return true;
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || 'Failed to save step 4');
        return false;
      }
    } catch (error) {
      console.error('Error saving step 4:', error);
      toast.error('Error saving step 4: ' + error.message);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Next button with auto-save
  const handleNext = async () => {
    let saved = false;
    
    switch (currentStep) {
      case 1:
        saved = await saveStep1();
        break;
      case 2:
        saved = await saveStep2();
        break;
      case 3:
        saved = await saveStep3();
        break;
      default:
        saved = true;
    }

    if (saved) {
      setCurrentStep(Math.min(4, currentStep + 1));
    }
  };

  // Event Day handlers
  const addEventDay = () => {
    const nextDay = eventDays.length + 1;
    setEventDays([...eventDays, { day_number: nextDay, title: '', event_type: 'pageant', participant_type: 'solo' }]);
  };

  const removeEventDay = (index) => {
    setEventDays(eventDays.filter((_, i) => i !== index));
  };

  const updateEventDay = (index, field, value) => {
    const updated = [...eventDays];
    updated[index][field] = value;
    setEventDays(updated);
  };

  // Candidate handlers (by day)
  const addCandidateToDay = (dayIndex) => {
    const dayCandidates = candidatesByDay[dayIndex] || [];
    const nextNumber = dayCandidates.length + 1;
    
    setCandidatesByDay({
      ...candidatesByDay,
      [dayIndex]: [...dayCandidates, {
        number: nextNumber,
        name: '',
        gender: 'Female',
        team_name: '',
        department: '',
        partner_number: '',
        partner_name: '',
        partner_gender: ''
      }]
    });
  };

  const removeCandidateFromDay = (dayIndex, candIndex) => {
    const dayCandidates = candidatesByDay[dayIndex] || [];
    setCandidatesByDay({
      ...candidatesByDay,
      [dayIndex]: dayCandidates.filter((_, i) => i !== candIndex)
    });
  };

  const updateCandidateInDay = (dayIndex, candIndex, field, value) => {
    const dayCandidates = [...(candidatesByDay[dayIndex] || [])];
    dayCandidates[candIndex][field] = value;
    setCandidatesByDay({
      ...candidatesByDay,
      [dayIndex]: dayCandidates
    });
  };

  // Category handlers
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

  // Handle template loading
  const handleTemplateLoad = (template) => {
    try {
      const templateCategories = JSON.parse(template.categories);
      const templateCriteria = JSON.parse(template.criteria);
      
      // Set categories
      setCategories(templateCategories.map(cat => ({
        name: cat.name,
        description: cat.description || ''
      })));
      
      // Set criteria with category references
      const criteriaWithCategories = templateCriteria.map(crit => ({
        name: crit.name,
        percentage: crit.percentage,
        category_index: crit.category_index
      }));
      
      setCriteria(criteriaWithCategories);
      
      toast.success(`Template "${template.name}" loaded!`, { duration: 3000 });
    } catch (error) {
      console.error('Error loading template:', error);
      toast.error('Error loading template');
    }
  };

  // Criterion handlers
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

    // Flatten candidatesByDay into a single array with day_number
    const allCandidates = [];
    Object.keys(candidatesByDay).forEach(dayIndex => {
      const dayCandidates = candidatesByDay[dayIndex] || [];
      dayCandidates.forEach(candidate => {
        if (candidate.name) {
          allCandidates.push({
            ...candidate,
            day_number: parseInt(dayIndex) + 1
          });
        }
      });
    });

    const payload = {
      ...eventData,
      event_days: eventDays.filter(d => d.title),
      important_people: importantPeople.filter(p => p.position || p.name),
      candidates: allCandidates,
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
        backgroundColor: '#fff',
        borderBottom: '1px solid #e5e7eb',
        padding: '16px 32px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        zIndex: 1000,
        boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button
            onClick={() => navigate('/setup')}
            style={{
              backgroundColor: 'transparent',
              border: '1px solid #e5e7eb',
              color: '#6b7280',
              padding: '8px 14px',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '13px',
              fontWeight: '500',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <span className="material-icons" style={{ fontSize: '16px' }}>arrow_back</span>
            Back
          </button>
          <div style={{ height: '24px', width: '1px', backgroundColor: '#e5e7eb' }} />
          <h1 style={{ color: '#1f2937', fontSize: '18px', fontWeight: '600', margin: 0, letterSpacing: '-0.01em' }}>
            Create Event
          </h1>
        </div>
        <AdminHeaderButtons onEditClick={() => setIsSidebarOpen(true)} />
      </div>

      {/* Progress Steps */}
      <ProgressSteps currentStep={currentStep} />

      {/* Content */}
      <div style={{ paddingTop: '140px', padding: '140px 32px 40px 32px', minHeight: '100vh', backgroundColor: '#fafafa' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          {/* Step Content Card */}
          <div style={{
            backgroundColor: '#fff',
            borderRadius: '8px',
            boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
            border: '1px solid #e5e7eb',
            padding: '32px 40px',
            minHeight: '500px'
          }}>
            {currentStep === 1 && (
              <Step1BasicInfo
                eventData={basicInfo}
                setEventData={setBasicInfo}
                eventDays={eventDays}
                addEventDay={addEventDay}
                removeEventDay={removeEventDay}
                updateEventDay={updateEventDay}
                importantPeople={importantPeople}
                setImportantPeople={setImportantPeople}
              />
            )}
            {currentStep === 2 && (
              <Step2Participants
                eventData={basicInfo}
                eventDays={eventDays}
                candidatesByDay={candidatesByDay}
                addCandidateToDay={addCandidateToDay}
                removeCandidateFromDay={removeCandidateFromDay}
                updateCandidateInDay={updateCandidateInDay}
              />
            )}
            {currentStep === 3 && (
              <Step3Categories
                categories={categories}
                addCategory={addCategory}
                removeCategory={removeCategory}
                updateCategory={updateCategory}
                onTemplateLoad={handleTemplateLoad}
              />
            )}
            {currentStep === 4 && (
              <Step4ScoreRules
                criteria={criteria}
                categories={categories}
                addCriterion={addCriterion}
                removeCriterion={removeCriterion}
                updateCriterion={updateCriterion}
                totalPercentage={totalPercentage}
              />
            )}

            {/* Navigation Buttons */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginTop: '48px',
              paddingTop: '32px',
              borderTop: '2px solid #f3f4f6'
            }}>
              <button
                onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
                disabled={currentStep === 1}
                style={{
                  padding: '12px 32px',
                  backgroundColor: currentStep === 1 ? '#e5e7eb' : '#fff',
                  color: currentStep === 1 ? '#9ca3af' : '#374151',
                  border: '2px solid #e5e7eb',
                  borderRadius: '8px',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: currentStep === 1 ? 'not-allowed' : 'pointer'
                }}
              >
                ← Previous
              </button>

              {currentStep < 4 ? (
                <button
                  onClick={handleNext}
                  disabled={isLoading}
                  style={{
                    padding: '12px 32px',
                    backgroundColor: isLoading ? '#9ca3af' : '#f97316',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '16px',
                    fontWeight: '600',
                    cursor: isLoading ? 'not-allowed' : 'pointer'
                  }}
                >
                  {isLoading ? 'Saving...' : 'Next →'}
                </button>
              ) : (
                <button
                  onClick={async () => {
                    const saved = await saveStep4();
                    if (saved) {
                      // Activate event
                      try {
                        const response = await fetch(`http://localhost:8000/api/events/${eventId}/activate`, {
                          method: 'POST',
                          headers: {
                            'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
                          }
                        });
                        
                        if (response.ok) {
                          toast.success('Event activated successfully!', { duration: 3000 });
                          setTimeout(() => navigate('/get_started'), 1500);
                        } else {
                          toast.error('Failed to activate event');
                        }
                      } catch (error) {
                        console.error('Error activating event:', error);
                        toast.error('Error activating event');
                      }
                    }
                  }}
                  disabled={isLoading}
                  style={{
                    padding: '12px 32px',
                    backgroundColor: isLoading ? '#9ca3af' : '#16a34a',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '16px',
                    fontWeight: '600',
                    cursor: isLoading ? 'not-allowed' : 'pointer'
                  }}
                >
                  {isLoading ? 'Saving...' : 'Activate Event ✓'}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
