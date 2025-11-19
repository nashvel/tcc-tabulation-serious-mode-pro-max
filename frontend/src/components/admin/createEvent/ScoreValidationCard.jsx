export default function ScoreValidationCard({ totalPercentage }) {
  const isValid = totalPercentage === 100;

  return (
    <div style={{ 
      marginTop: '12px',
      padding: '12px 16px',
      borderRadius: '8px',
      backgroundColor: isValid ? '#d1fae5' : '#fee2e2',
      border: `2px solid ${isValid ? '#10b981' : '#ef4444'}`,
      display: 'flex',
      alignItems: 'center',
      gap: '8px'
    }}>
      <span className="material-icons" style={{ 
        color: isValid ? '#10b981' : '#ef4444',
        fontSize: '24px'
      }}>
        {isValid ? 'check_circle' : 'error'}
      </span>
      <div>
        <p style={{ 
          fontSize: '14px', 
          fontWeight: '600',
          color: isValid ? '#065f46' : '#991b1b',
          margin: 0
        }}>
          Total Percentage: {totalPercentage}%
        </p>
        <p style={{ 
          fontSize: '12px',
          color: isValid ? '#047857' : '#dc2626',
          margin: 0
        }}>
          {isValid ? 'Perfect! Ready to proceed.' : 'Must equal 100% to continue.'}
        </p>
      </div>
    </div>
  );
}
