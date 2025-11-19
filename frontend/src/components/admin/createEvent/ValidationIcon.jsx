export default function ValidationIcon({ isValid }) {
  if (!isValid) return null;

  return (
    <span className="material-icons" style={{
      position: 'absolute',
      right: '12px',
      top: '50%',
      transform: 'translateY(-50%)',
      color: '#10b981',
      fontSize: '20px',
      pointerEvents: 'none'
    }}>
      check_circle
    </span>
  );
}
