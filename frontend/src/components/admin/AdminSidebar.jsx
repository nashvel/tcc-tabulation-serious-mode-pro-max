import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function AdminSidebar({ isOpen, onClose }) {
  const navigate = useNavigate();
  return (
    <>
      {/* Sidebar */}
      <div
        style={{
          position: 'fixed',
          top: '0',
          left: isOpen ? '0' : '-320px',
          width: '320px',
          height: '100vh',
          backgroundColor: '#fff',
          boxShadow: isOpen ? '4px 0 12px rgba(0,0,0,0.1)' : 'none',
          transition: 'left 0.3s ease-in-out',
          zIndex: 1000,
          overflowY: 'auto',
          paddingTop: '180px' // Space for fixed header
        }}
      >
        {/* Content Container with Orange Border */}
        <div style={{ height: 'fit-content', padding: '20px' }}>
          <div style={{
            backgroundColor: '#fff',
            border: '2px solid #f97316',
            borderRadius: '8px',
            padding: '20px',
            boxShadow: '0 4px 12px rgba(249, 115, 22, 0.1)'
          }}>
            {/* Sidebar Header */}
            <h3 style={{
              fontSize: '18px',
              fontWeight: 'bold',
              color: '#f97316',
              marginBottom: '15px',
              textAlign: 'center',
              textTransform: 'uppercase',
              letterSpacing: '2px',
              margin: '0 0 20px 0'
            }}>
              Edit Menu
            </h3>

            {/* Menu Items */}
            <nav>
              <MenuItem 
                icon="monitor" 
                label="Judge Screens" 
                onClick={() => {
                  navigate('/judges/configure');
                  onClose();
                }}
              />
              <div style={{ height: '1px', backgroundColor: '#e5e7eb', margin: '12px 0' }} />
              <MenuItem icon="group" label="Candidates" />
              <MenuItem icon="emoji_events" label="Rounds" />
              <MenuItem icon="assignment" label="Criteria" />
              <MenuItem icon="settings" label="Settings" />
              <MenuItem icon="assessment" label="Reports" />
              <MenuItem icon="lock" label="Permissions" />
            </nav>
          </div>
        </div>
      </div>

      {/* Toggle Button - Only visible when sidebar is open */}
      {isOpen && (
        <button
          onClick={() => onClose()}
          style={{
            position: 'fixed',
            top: '50%',
            left: '320px',
            transform: 'translateY(-50%)',
            width: '40px',
            height: '80px',
            backgroundColor: '#f97316',
            border: 'none',
            borderRadius: '0 8px 8px 0',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '2px 0 8px rgba(0,0,0,0.1)',
            transition: 'left 0.3s ease-in-out',
            zIndex: 1001,
            color: '#fff',
            fontSize: '24px'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#ea580c';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#f97316';
          }}
        >
        </button>
      )}
    </>
  );
}

function MenuItem({ icon, label, onClick }) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        padding: '12px 20px',
        color: isHovered ? '#f97316' : '#333',
        backgroundColor: isHovered ? '#fff7ed' : 'transparent',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        fontSize: '14px',
        transition: 'all 0.2s ease',
        borderLeft: isHovered ? '4px solid #f97316' : '4px solid transparent'
      }}
    >
      <span className="material-icons" style={{ fontSize: '20px' }}>{icon}</span>
      <span>{label}</span>
    </div>
  );
}
