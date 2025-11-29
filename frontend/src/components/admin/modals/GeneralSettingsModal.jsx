import { useState } from 'react';
import { Settings, X, Key, AlertTriangle } from 'lucide-react';
import ConfirmDialog from './ConfirmDialog';
import axios from 'axios';
import { showSuccess, showError } from '../../../utils/alerts';

export default function GeneralSettingsModal({ isOpen, onClose }) {
    const [currentPin, setCurrentPin] = useState('');
    const [newPin, setNewPin] = useState('');
    const [confirmPin, setConfirmPin] = useState('');
    const [showPinConfirm, setShowPinConfirm] = useState(false);
    const [showResetConfirm, setShowResetConfirm] = useState(false);
    const [isChangingPin, setIsChangingPin] = useState(false);

    const handleChangePinClick = () => {
        // Validate inputs
        if (!currentPin || !newPin || !confirmPin) {
            showError('All PIN fields are required');
            return;
        }

        if (newPin.length < 4) {
            showError('New PIN must be at least 4 digits');
            return;
        }

        if (newPin.length > 6) {
            showError('New PIN must not exceed 6 digits');
            return;
        }

        if (newPin !== confirmPin) {
            showError('New PIN and confirmation do not match');
            return;
        }

        setShowPinConfirm(true);
    };

    const handleConfirmPinChange = async () => {
        setIsChangingPin(true);
        try {
            // Call the backend API to change PIN
            const response = await axios.post('http://localhost:8000/api/admin/change-pin', {
                old_pin: currentPin,
                new_pin: newPin,
                new_pin_confirmation: confirmPin
            }, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
                }
            });

            if (response.data.message) {
                showSuccess('Admin PIN changed successfully');
                setShowPinConfirm(false);

                // Clear form
                setCurrentPin('');
                setNewPin('');
                setConfirmPin('');
            }
        } catch (error) {
            console.error('Error changing PIN:', error);
            const errorMessage = error.response?.data?.message || 'Failed to change PIN';

            if (errorMessage.includes('Invalid current PIN')) {
                showError('Current PIN is incorrect');
            } else {
                showError(errorMessage);
            }

            setShowPinConfirm(false);
        } finally {
            setIsChangingPin(false);
        }
    };

    const handleResetDataClick = () => {
        setShowResetConfirm(true);
    };

    const handleConfirmReset = async () => {
        try {
            // Clear all event-related data from localStorage
            localStorage.removeItem('continuingEvent');
            localStorage.removeItem('selectedEventId');
            localStorage.removeItem('eventData');

            showSuccess('Event data reset successfully');
            setShowResetConfirm(false);

            // Redirect to admin page after a short delay
            setTimeout(() => {
                window.location.href = '/admin';
            }, 1500);
        } catch (error) {
            console.error('Error resetting data:', error);
            showError('Failed to reset event data');
            setShowResetConfirm(false);
        }
    };

    if (!isOpen) return null;

    return (
        <>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                <div className="w-full max-w-2xl flex flex-col bg-white/90 backdrop-blur-2xl border border-white/30 rounded-2xl shadow-2xl overflow-hidden max-h-[90vh]">
                    {/* Header */}
                    <header className="flex items-center justify-between p-4 border-b border-gray-200">
                        <div className="flex items-center gap-2">
                            <Settings className="text-gray-500" size={20} />
                            <h2 className="text-lg font-semibold text-gray-900 tracking-tight">General Settings</h2>
                        </div>
                        <button
                            onClick={onClose}
                            className="text-gray-500 hover:text-gray-900 transition-colors rounded-full p-1 hover:bg-gray-100"
                        >
                            <X size={20} />
                        </button>
                    </header>

                    {/* Main Content */}
                    <main className="p-6 flex-grow overflow-y-auto">
                        <div className="space-y-8">
                            {/* Change Admin PIN Section */}
                            <div className="space-y-4">
                                <div className="flex items-center gap-2 mb-4">
                                    <Key className="text-indigo-600" size={20} />
                                    <h3 className="text-base font-semibold text-gray-900">Change Admin PIN</h3>
                                </div>

                                <div className="space-y-4 pl-7">
                                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                                        <p className="text-xs text-blue-800">
                                            <strong>Note:</strong> The default admin PIN is <code className="bg-blue-100 px-1 py-0.5 rounded">123456</code>. Change it to secure your admin panel.
                                        </p>
                                    </div>

                                    {/* Current PIN */}
                                    <div>
                                        <label className="block text-xs font-medium text-gray-700 mb-1">
                                            Current PIN
                                        </label>
                                        <input
                                            type="password"
                                            value={currentPin}
                                            onChange={(e) => setCurrentPin(e.target.value)}
                                            className="w-full h-9 px-3 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                                            placeholder="Enter current PIN"
                                            maxLength="6"
                                        />
                                    </div>

                                    {/* New PIN */}
                                    <div>
                                        <label className="block text-xs font-medium text-gray-700 mb-1">
                                            New PIN
                                        </label>
                                        <input
                                            type="password"
                                            value={newPin}
                                            onChange={(e) => setNewPin(e.target.value)}
                                            className="w-full h-9 px-3 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                                            placeholder="Enter new PIN (4-6 digits)"
                                            maxLength="6"
                                        />
                                    </div>

                                    {/* Confirm New PIN */}
                                    <div>
                                        <label className="block text-xs font-medium text-gray-700 mb-1">
                                            Confirm New PIN
                                        </label>
                                        <input
                                            type="password"
                                            value={confirmPin}
                                            onChange={(e) => setConfirmPin(e.target.value)}
                                            className="w-full h-9 px-3 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                                            placeholder="Re-enter new PIN"
                                            maxLength="6"
                                        />
                                    </div>

                                    <button
                                        onClick={handleChangePinClick}
                                        disabled={isChangingPin}
                                        className="h-9 px-5 rounded-lg text-sm font-semibold bg-indigo-600 text-white hover:bg-indigo-700 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {isChangingPin ? 'Changing...' : 'Change PIN'}
                                    </button>
                                </div>
                            </div>

                            {/* Divider */}
                            <div className="border-t border-gray-200"></div>

                            {/* Reset Event Data Section */}
                            <div className="space-y-4">
                                <div className="flex items-center gap-2 mb-4">
                                    <AlertTriangle className="text-red-600" size={20} />
                                    <h3 className="text-base font-semibold text-gray-900">Reset Event Data</h3>
                                </div>

                                <div className="pl-7">
                                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                                        <p className="text-sm text-red-800">
                                            <strong>Warning:</strong> This action will clear all stored event data from your browser.
                                            You will be redirected to the admin page to select or create a new event.
                                        </p>
                                    </div>

                                    <button
                                        onClick={handleResetDataClick}
                                        className="h-9 px-5 rounded-lg text-sm font-semibold bg-red-600 text-white hover:bg-red-700 transition-colors shadow-sm"
                                    >
                                        Reset Event Data
                                    </button>
                                </div>
                            </div>
                        </div>
                    </main>

                    {/* Footer */}
                    <footer className="flex justify-end items-center gap-3 p-4 bg-gray-50 border-t border-gray-200">
                        <button
                            onClick={onClose}
                            className="h-9 px-4 rounded-lg text-sm font-medium bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors shadow-sm"
                        >
                            Close
                        </button>
                    </footer>
                </div>
            </div>

            {/* PIN Change Confirmation Dialog */}
            <ConfirmDialog
                isOpen={showPinConfirm}
                onClose={() => !isChangingPin && setShowPinConfirm(false)}
                onConfirm={handleConfirmPinChange}
                title="Change Admin PIN"
                message={`Are you sure you want to change your admin PIN? Make sure to remember your new PIN as you'll need it to log in.`}
                confirmText={isChangingPin ? 'Changing...' : 'Change PIN'}
                cancelText="Cancel"
                variant="warning"
            />

            {/* Reset Data Confirmation Dialog */}
            <ConfirmDialog
                isOpen={showResetConfirm}
                onClose={() => setShowResetConfirm(false)}
                onConfirm={handleConfirmReset}
                title="Reset Event Data"
                message="Are you sure you want to reset all event data? This will clear your current event selection and you will be redirected to the admin page. This action cannot be undone."
                confirmText="Reset Data"
                cancelText="Cancel"
                variant="danger"
            />
        </>
    );
}
