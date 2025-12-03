import { useState, useEffect, useMemo } from 'react';
import { Info, X, Calendar, Save } from 'lucide-react';
import { showSuccess, showError } from '../../../utils/alerts';

export default function EventDetailsModal({ isOpen, onClose, eventId }) {
    const [event, setEvent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [formData, setFormData] = useState({
        title: '',
        event_date: '',
        description: '',
        event_type: 'pageant',
        number_of_judges: ''
    });

    const apiBase = useMemo(() => {
        const url = new URL(window.location.href);
        return `${url.protocol}//${url.hostname}:8000`;
    }, []);

    useEffect(() => {
        if (isOpen && eventId) {
            console.log('Loading event details for eventId:', eventId);
            loadEventDetails();
        }
    }, [isOpen, eventId]);

    const loadEventDetails = async () => {
        setLoading(true);
        try {
            // Fetch event and judges in parallel
            const [eventResponse, judgesResponse] = await Promise.all([
                fetch(`${apiBase}/api/events/${eventId}`),
                fetch(`${apiBase}/api/judges?event_id=${eventId}`)
            ]);
            
            if (eventResponse.ok) {
                const data = await eventResponse.json();
                console.log('Event data received:', data);
                setEvent(data);

                // Get actual judges count from judges API
                let judgesCount = '';
                if (judgesResponse.ok) {
                    const judgesData = await judgesResponse.json();
                    judgesCount = judgesData.length;
                    console.log('Judges count from API:', judgesCount);
                }

                let formattedDate = '';
                if (data.event_date) {
                    const dateObj = new Date(data.event_date);
                    formattedDate = dateObj.toISOString().split('T')[0];
                }

                setFormData({
                    title: data.title || '',
                    event_date: formattedDate,
                    description: data.description || '',
                    event_type: data.event_type ?? '',
                    number_of_judges: judgesCount || data.number_of_judges || ''
                });
            } else {
                console.error('Failed to load event, status:', eventResponse.status);
                showError('Failed to load event details');
            }
        } catch (error) {
            console.error('Error loading event:', error);
            showError('Error loading event details');
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSave = async () => {
        try {
            const actualEventId = event.unique_id || event.id;
            const url = `${apiBase}/api/events/${actualEventId}`;
            console.log('Saving to:', url, formData);
            
            const response = await fetch(url, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
                },
                body: JSON.stringify({
                    title: formData.title,
                    event_date: formData.event_date,
                    description: formData.description,
                    event_type: formData.event_type,
                    number_of_judges: parseInt(formData.number_of_judges)
                })
            });

            if (response.ok) {
                showSuccess('Event updated successfully');
                loadEventDetails();
            } else {
                const errorData = await response.json();
                console.error('Save error:', errorData);
                showError(errorData.message || 'Failed to update event');
            }
        } catch (error) {
            console.error('Error saving event:', error);
            showError('Error updating event');
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/20 backdrop-blur-sm">
            <div
                className="w-full max-w-3xl flex flex-col bg-white rounded-xl shadow-2xl overflow-hidden"
                style={{
                    maxHeight: 'calc(100vh - 80px)',
                    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(0, 0, 0, 0.05)'
                }}
            >
                {/* macOS Title Bar */}
                <div className="flex items-center justify-between px-5 py-4 bg-gray-50 border-b border-gray-200">
                    <div className="flex items-center gap-2">
                        {/* macOS Close Button */}
                        <button
                            onClick={onClose}
                            className="w-3 h-3 rounded-full bg-red-500 hover:bg-red-600 transition-colors group relative mr-4"
                            title="Close"
                        >
                            <X size={8} className="absolute inset-0 m-auto text-red-900 opacity-0 group-hover:opacity-100" strokeWidth={3} />
                        </button>

                        <Info className="text-gray-600" size={18} />
                        <h2 className="text-sm font-semibold text-gray-900" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif' }}>
                            Event Details
                        </h2>
                    </div>
                </div>

                {/* Content Area */}
                <div className="flex-grow overflow-y-auto bg-white" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif' }}>
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-20">
                            <div className="w-8 h-8 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
                            <p className="mt-4 text-sm text-gray-600">Loading...</p>
                        </div>
                    ) : !event ? (
                        <div className="flex flex-col items-center justify-center py-20">
                            <Info size={48} className="text-gray-300 mb-4" />
                            <p className="text-sm text-gray-600">Event not found</p>
                        </div>
                    ) : (
                        <div className="p-6 space-y-6">
                            {/* Event Metadata */}
                            <div className="flex items-center gap-6 px-4 py-3 bg-blue-50 rounded-lg text-sm">
                                <div className="flex items-center gap-2">
                                    <span className="text-gray-600">ID</span>
                                    <span className="font-medium text-gray-900">{event.id}</span>
                                </div>
                                <div className="w-px h-4 bg-gray-300"></div>
                                <div className="flex items-center gap-2">
                                    <span className="text-gray-600">Year</span>
                                    <span className="font-medium text-gray-900">{event.year}</span>
                                </div>
                                <div className="w-px h-4 bg-gray-300"></div>
                                <div className="flex items-center gap-2">
                                    <span className="text-gray-600">Status</span>
                                    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium ${event.status === 'active'
                                        ? 'bg-green-100 text-green-800'
                                        : 'bg-yellow-100 text-yellow-800'
                                        }`}>
                                        <span className={`w-1.5 h-1.5 rounded-full ${event.status === 'active' ? 'bg-green-500' : 'bg-yellow-500'
                                            }`}></span>
                                        {event.status}
                                    </span>
                                </div>
                            </div>

                            {/* Form Section */}
                            <div className="space-y-5">
                                <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider">General Information</div>

                                {/* Event Title */}
                                <div className="space-y-1.5">
                                    <label className="block text-sm font-medium text-gray-700">Event Title</label>
                                    <input
                                        type="text"
                                        name="title"
                                        value={formData.title}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2 text-sm bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                        placeholder="Enter event title"
                                        style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif' }}
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    {/* Event Date */}
                                    <div className="space-y-1.5">
                                        <label className="block text-sm font-medium text-gray-700">
                                            <Calendar size={14} className="inline mr-1 mb-0.5" />
                                            Event Date
                                        </label>
                                        <input
                                            type="date"
                                            name="event_date"
                                            value={formData.event_date}
                                            onChange={handleInputChange}
                                            className="w-full px-3 py-2 text-sm bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                            style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif' }}
                                        />
                                    </div>

                                    {/* Event Type */}
                                    <div className="space-y-1.5">
                                        <label className="block text-sm font-medium text-gray-700">Event Type</label>
                                        <select
                                            name="event_type"
                                            value={formData.event_type}
                                            onChange={handleInputChange}
                                            className="w-full px-3 py-2 text-sm bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all capitalize"
                                            style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif' }}
                                        >
                                            <option value="pageant">Pageant</option>
                                            <option value="competition">Competition</option>
                                            <option value="contest">Contest</option>
                                        </select>
                                    </div>
                                </div>

                                {/* Number of Judges */}
                                <div className="space-y-1.5">
                                    <label className="block text-sm font-medium text-gray-700">Number of Judges</label>
                                    <input
                                        type="number"
                                        name="number_of_judges"
                                        value={formData.number_of_judges}
                                        onChange={handleInputChange}
                                        className="w-32 px-3 py-2 text-sm bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                        min="1"
                                        max="20"
                                        style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif' }}
                                    />
                                </div>

                                {/* Description */}
                                <div className="space-y-1.5">
                                    <label className="block text-sm font-medium text-gray-700">Description</label>
                                    <textarea
                                        name="description"
                                        value={formData.description}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2 text-sm bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                                        rows="4"
                                        placeholder="Enter event description..."
                                        style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif' }}
                                    />
                                </div>
                            </div>

                            {/* Categories & Criteria */}
                            {event.categories && event.categories.length > 0 && (
                                <div className="space-y-3 pt-4 border-t border-gray-200">
                                    <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Categories & Criteria</div>
                                    <div className="space-y-2">
                                        {event.categories.map((category, index) => {
                                            const categoryCriteria = event.criteria?.filter(c => c.category_id === category.id) || [];
                                            const categoryTotal = categoryCriteria.reduce((sum, c) => sum + parseFloat(c.percentage || 0), 0);

                                            return (
                                                <div key={category.id} className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                                                    <div className="flex justify-between items-center mb-2">
                                                        <span className="text-sm font-semibold text-gray-900">
                                                            {index + 1}. {category.name}
                                                        </span>
                                                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${categoryTotal === 100
                                                            ? 'bg-green-100 text-green-700'
                                                            : 'bg-red-100 text-red-700'
                                                            }`}>
                                                            {categoryTotal}%
                                                        </span>
                                                    </div>
                                                    <div className="space-y-1 ml-4">
                                                        {categoryCriteria.map((criterion) => (
                                                            <div key={criterion.id} className="flex justify-between text-xs">
                                                                <span className="text-gray-700">{criterion.name}</span>
                                                                <span className="font-medium text-blue-600">{criterion.percentage}%</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            {/* Participants */}
                            {event.candidates && event.candidates.length > 0 && (
                                <div className="space-y-3 pt-4 border-t border-gray-200">
                                    <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                        Participants ({event.candidates.length})
                                    </div>
                                    <div className="border border-gray-200 rounded-lg overflow-hidden">
                                        <table className="w-full text-sm">
                                            <thead>
                                                <tr className="bg-gray-50 border-b border-gray-200">
                                                    <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-600">#</th>
                                                    <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-600">Name</th>
                                                    <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-600">Type</th>
                                                    <th className="px-4 py-2.5 text-center text-xs font-semibold text-gray-600">Day</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-200">
                                                {event.candidates.map((candidate) => (
                                                    <tr key={candidate.id} className="hover:bg-gray-50 transition-colors">
                                                        <td className="px-4 py-2.5 font-semibold text-blue-600">#{candidate.number}</td>
                                                        <td className="px-4 py-2.5 text-gray-900">{candidate.name}</td>
                                                        <td className="px-4 py-2.5">
                                                            <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium uppercase ${candidate.participant_type === 'duo'
                                                                ? 'bg-blue-100 text-blue-700'
                                                                : 'bg-gray-100 text-gray-700'
                                                                }`}>
                                                                {candidate.participant_type}
                                                            </span>
                                                        </td>
                                                        <td className="px-4 py-2.5 text-center text-gray-600">Day {candidate.day_number}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* macOS Bottom Bar */}
                <div className="flex items-center justify-between px-6 py-4 bg-gray-50 border-t border-gray-200">
                    <div className="text-xs text-gray-500">
                        {event && `Last modified: ${new Date().toLocaleDateString()}`}
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 active:bg-gray-100 transition-colors"
                            style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif' }}
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSave}
                            className="px-4 py-2 text-sm font-medium text-white bg-blue-500 rounded-lg hover:bg-blue-600 active:bg-blue-700 transition-colors shadow-sm flex items-center gap-2"
                            style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif' }}
                        >
                            <Save size={14} />
                            Save
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
