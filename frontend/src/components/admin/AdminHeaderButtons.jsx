import { useNavigate } from 'react-router-dom';

export default function AdminHeaderButtons({ onEditClick, onCertificatesClick, activeCategory }) {
  const navigate = useNavigate();
  const buttonStyle = {
    backgroundColor: 'transparent',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    padding: '6px 12px',
    fontSize: '12px',
    cursor: 'pointer',
    textTransform: 'uppercase',
    letterSpacing: '1px',
    fontWeight: '500'
  };

  const handleMouseOver = (e) => {
    e.target.style.textDecoration = 'underline';
  };

  const handleMouseOut = (e) => {
    e.target.style.textDecoration = 'none';
  };

  return (
    <>
      {activeCategory && (
        <div style={{
          backgroundColor: '#f97316',
          color: '#fff',
          padding: '8px 16px',
          borderRadius: '6px',
          fontSize: '13px',
          fontWeight: 'bold',
          letterSpacing: '1px',
          textTransform: 'uppercase',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          marginRight: '15px'
        }}>
          <span className="material-icons" style={{ fontSize: '16px' }}>star</span>
          Active: {activeCategory.name}
        </div>
      )}
      <button
        style={buttonStyle}
        onMouseOver={handleMouseOver}
        onMouseOut={handleMouseOut}
        onClick={() => navigate('/admin')}
      >
        Home
      </button>
      <button
        style={buttonStyle}
        onMouseOver={handleMouseOver}
        onMouseOut={handleMouseOut}
        onClick={onEditClick}
      >
        Edit
      </button>
      <button
        style={buttonStyle}
        onMouseOver={handleMouseOver}
        onMouseOut={handleMouseOut}
        onClick={() => navigate('/admin/documentation')}
      >
        Documentation
      </button>
      <button
        style={buttonStyle}
        onMouseOver={handleMouseOver}
        onMouseOut={handleMouseOut}
      >
        Judges
      </button>
      <button
        style={buttonStyle}
        onMouseOver={handleMouseOver}
        onMouseOut={handleMouseOut}
        onClick={() => navigate('/admin/certificates')}
      >
        Certificates
      </button>
    </>
  );
}
