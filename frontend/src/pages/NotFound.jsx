import { useNavigate, useLocation } from 'react-router-dom';
import { useMemo } from 'react';
import Fuse from 'fuse.js';

export default function NotFound() {
  const navigate = useNavigate();
  const location = useLocation();
  
  // List of all valid routes in your app
  const validRoutes = [
    { path: '/', name: 'Home' },
    { path: '/judge', name: 'Judge Interface' },
    { path: '/admin/login', name: 'Admin Login' },
    { path: '/admin', name: 'Admin Tools' },
    { path: '/setup', name: 'Setup' },
    { path: '/admin/certificates', name: 'Certificates' },
    { path: '/admin/documentation', name: 'Documentation' },
    { path: '/scoreboard', name: 'Scoreboard' },
    { path: '/print', name: 'Print Results' },
  ];
  
  // Find similar routes using fuzzy search
  const suggestedRoute = useMemo(() => {
    const fuse = new Fuse(validRoutes, {
      keys: ['path', 'name'],
      threshold: 0.4, // Lower = more strict matching
      includeScore: true,
    });
    
    const results = fuse.search(location.pathname);
    return results.length > 0 ? results[0].item : null;
  }, [location.pathname]);

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      backgroundColor: '#f9fafb',
      padding: '20px'
    }}>
      <div style={{
        textAlign: 'center',
        maxWidth: '600px'
      }}>
        {/* 404 Number */}
        <h1 style={{
          fontSize: '120px',
          fontWeight: 'bold',
          color: '#f97316',
          margin: '0',
          lineHeight: '1'
        }}>
          404
        </h1>
        
        {/* Error Message */}
        <h2 style={{
          fontSize: '32px',
          fontWeight: '600',
          color: '#1f2937',
          marginTop: '20px',
          marginBottom: '10px'
        }}>
          Page Not Found
        </h2>
        
        <p style={{
          fontSize: '18px',
          color: '#6b7280',
          marginBottom: '20px'
        }}>
          Sorry, the page you are looking for doesn't exist or has been moved.
        </p>
        
        {/* Suggested Route */}
        {suggestedRoute && (
          <div style={{
            backgroundColor: '#fff7ed',
            border: '2px solid #f97316',
            borderRadius: '8px',
            padding: '15px 20px',
            marginBottom: '30px',
            textAlign: 'left'
          }}>
            <p style={{
              fontSize: '14px',
              color: '#9a3412',
              margin: '0 0 8px 0',
              fontWeight: '600'
            }}>
              💡 Did you mean:
            </p>
            <button
              onClick={() => navigate(suggestedRoute.path)}
              style={{
                backgroundColor: 'transparent',
                border: 'none',
                color: '#f97316',
                fontSize: '16px',
                fontWeight: '600',
                cursor: 'pointer',
                padding: '0',
                textDecoration: 'underline',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
              onMouseOver={(e) => {
                e.target.style.color = '#ea580c';
              }}
              onMouseOut={(e) => {
                e.target.style.color = '#f97316';
              }}
            >
              {suggestedRoute.path} <span style={{ fontSize: '12px', color: '#9a3412' }}>({suggestedRoute.name})</span>
            </button>
          </div>
        )}
        
        {/* Action Buttons */}
        <div style={{
          display: 'flex',
          gap: '15px',
          justifyContent: 'center',
          flexWrap: 'wrap'
        }}>
          <button
            onClick={() => navigate(-1)}
            style={{
              backgroundColor: '#fff',
              color: '#f97316',
              border: '2px solid #f97316',
              padding: '12px 30px',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            onMouseOver={(e) => {
              e.target.style.backgroundColor = '#fff7ed';
            }}
            onMouseOut={(e) => {
              e.target.style.backgroundColor = '#fff';
            }}
          >
            ← Go Back
          </button>
          
          <button
            onClick={() => navigate('/admin/login')}
            style={{
              backgroundColor: '#f97316',
              color: '#fff',
              border: '2px solid #f97316',
              padding: '12px 30px',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            onMouseOver={(e) => {
              e.target.style.backgroundColor = '#ea580c';
              e.target.style.borderColor = '#ea580c';
            }}
            onMouseOut={(e) => {
              e.target.style.backgroundColor = '#f97316';
              e.target.style.borderColor = '#f97316';
            }}
          >
            Go to Home
          </button>
        </div>
        
        {/* Illustration */}
        <div style={{
          marginTop: '60px',
          opacity: '0.5'
        }}>
          <svg width="200" height="200" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="100" cy="100" r="80" stroke="#f97316" strokeWidth="4" strokeDasharray="8 8"/>
            <path d="M70 80 L70 120 M130 80 L130 120" stroke="#f97316" strokeWidth="8" strokeLinecap="round"/>
            <path d="M60 150 Q100 170 140 150" stroke="#f97316" strokeWidth="6" strokeLinecap="round" fill="none"/>
          </svg>
        </div>
      </div>
    </div>
  );
}
