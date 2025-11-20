import { useNavigate } from 'react-router-dom';
import { Home, Edit, FileText, Gavel, Award } from 'lucide-react';

export default function AdminHeaderButtons({ onEditClick, onCertificatesClick, activeCategory }) {
  const navigate = useNavigate();
  const buttonStyle = {
    backgroundColor: 'transparent',
    color: '#1e293b',
    border: 'none',
    borderRadius: '6px',
    padding: '6px 12px',
    fontSize: '12px',
    cursor: 'pointer',
    fontWeight: '600',
    transition: 'all 0.2s ease',
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    textTransform: 'uppercase',
    letterSpacing: '0.5px'
  };

  const handleMouseOver = (e) => {
    e.currentTarget.style.backgroundColor = '#f1f5f9';
    e.currentTarget.style.color = '#0f172a';
  };

  const handleMouseOut = (e) => {
    e.currentTarget.style.backgroundColor = 'transparent';
    e.currentTarget.style.color = '#1e293b';
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
      <button
        style={buttonStyle}
        onMouseOver={handleMouseOver}
        onMouseOut={handleMouseOut}
        onClick={() => navigate('/admin')}
      >
        <Home size={16} />
        Home
      </button>
      <button
        style={buttonStyle}
        onMouseOver={handleMouseOver}
        onMouseOut={handleMouseOut}
        onClick={onEditClick}
      >
        <Edit size={16} />
        Edit
      </button>
      <button
        style={buttonStyle}
        onMouseOver={handleMouseOver}
        onMouseOut={handleMouseOut}
        onClick={() => navigate('/admin/documentation')}
      >
        <FileText size={16} />
        Documentation
      </button>
      <button
        style={buttonStyle}
        onMouseOver={handleMouseOver}
        onMouseOut={handleMouseOut}
      >
        <Gavel size={16} />
        Judges
      </button>
      <button
        style={buttonStyle}
        onMouseOver={handleMouseOver}
        onMouseOut={handleMouseOut}
        onClick={() => navigate('/admin/certificates')}
      >
        <Award size={16} />
        Certificates
      </button>
    </div>
  );
}
