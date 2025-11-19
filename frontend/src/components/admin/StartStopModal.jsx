import { useState } from 'react';

export default function StartStopModal({ isOpen, onClose, onConfirm, isVotingActive }) {
  const [loading, setLoading] = useState(false);
  const [confirmationText, setConfirmationText] = useState('');
  const requiredText = 'STOP VOTING';

  const handleConfirm = async () => {
    // For stop action, require confirmation text
    if (isVotingActive && confirmationText !== requiredText) {
      return;
    }
    
    setLoading(true);
    await onConfirm();
    setLoading(false);
    setConfirmationText(''); // Reset after confirm
  };

  const handleClose = () => {
    setConfirmationText('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center" style={{ zIndex: 10000 }}>
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="p-6">
          <div className="flex items-center justify-center mb-4">
            <div className={`w-16 h-16 rounded-full flex items-center justify-center ${
              isVotingActive ? 'bg-red-100' : 'bg-green-100'
            }`}>
              <span className="material-icons" style={{ fontSize: '40px', color: isVotingActive ? '#dc2626' : '#16a34a' }}>
                {isVotingActive ? 'stop_circle' : 'play_circle'}
              </span>
            </div>
          </div>
          
          <h2 className="text-2xl font-bold text-center mb-2">
            {isVotingActive ? 'Stop Voting?' : 'Start Voting?'}
          </h2>
          
          <p className="text-gray-600 text-center mb-6">
            {isVotingActive 
              ? 'This will stop the current voting session and close the category selection.'
              : 'This will start a new voting session and allow you to select a category to activate.'
            }
          </p>

          {/* Confirmation input for STOP action */}
          {isVotingActive && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Type <span className="font-bold text-red-600">{requiredText}</span> to confirm:
              </label>
              <input
                type="text"
                value={confirmationText}
                onChange={(e) => setConfirmationText(e.target.value)}
                placeholder="Type here..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none"
                autoFocus
              />
              {confirmationText && confirmationText !== requiredText && (
                <p className="text-red-500 text-sm mt-1">
                  Text does not match. Please type exactly: {requiredText}
                </p>
              )}
            </div>
          )}

          <div className="flex gap-3">
            <button
              onClick={handleClose}
              disabled={loading}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              disabled={loading || (isVotingActive && confirmationText !== requiredText)}
              className={`flex-1 px-4 py-2 rounded-lg text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                isVotingActive 
                  ? 'bg-red-600 hover:bg-red-700' 
                  : 'bg-green-600 hover:bg-green-700'
              }`}
            >
              {loading ? 'Processing...' : (isVotingActive ? 'Stop' : 'Start')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
