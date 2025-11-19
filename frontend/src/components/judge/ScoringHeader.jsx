import { useState, useEffect } from 'react';
import TimeDisplay from './TimeDisplay';

export default function ScoringHeader({ scoresHidden, onToggleScores }) {
  const [headerImages, setHeaderImages] = useState([
    '/assets/1.png',
    '/assets/2.png',
    '/assets/3.png',
    '/assets/4.png',
    '/assets/5.png',
    '/assets/6.png',
    '/assets/7.png'
  ]);

  useEffect(() => {
    // Fetch header images from API
    fetch('http://localhost:8000/api/judge-screens')
      .then(res => res.json())
      .then(data => {
        if (data.header && data.header.length > 0) {
          // Use uploaded images if available
          setHeaderImages(data.header.map(img => img.url));
        }
      })
      .catch(err => console.error('Error loading header images:', err));
  }, []);

  return (
    <>
      {/* Orange Header with Time and Logos */}
      <div style={{
        backgroundColor: '#f97316',
        borderBottom: '5px solid #ea580c',
        padding: '12px 20px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        position: 'sticky',
        top: 0,
        zIndex: 1000
      }}>
        {/* Time on Left */}
        <div style={{
          fontSize: '28px',
          fontWeight: 'bold',
          color: '#fff',
          fontFamily: 'monospace',
          minWidth: '200px'
        }}>
          <TimeDisplay />
        </div>

        {/* Logos in Center */}
        <div style={{
          display: 'flex',
          gap: '15px',
          alignItems: 'center',
          justifyContent: 'center',
          flex: 1
        }}>
          {headerImages.map((img, index) => (
            <img key={index} src={img} alt={`Logo ${index + 1}`} style={{ height: '60px' }} />
          ))}
        </div>

        {/* Empty space on right for balance */}
        <div style={{ minWidth: '200px' }}></div>
      </div>

      {/* Criteria Header with Hide Button */}
      <div style={{ backgroundColor: '#fff', padding: '20px' }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          marginBottom: '20px',
          paddingLeft: '25px'
        }}>
          <h3 style={{
            textTransform: 'uppercase',
            fontFamily: 'Nunito, sans-serif',
            fontWeight: 'bolder',
            fontSize: '24px',
            margin: 0,
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}>
            <img src="/assets/1642423.png" alt="" style={{ height: '55px' }} />
            Criteria for Judging (Linggo Ng Kabataan)
          </h3>
          <button 
            onClick={onToggleScores}
            style={{
              backgroundColor: '#f97316',
              color: '#fff',
              border: 'none',
              padding: '10px 20px',
              borderRadius: '4px',
              cursor: 'pointer',
              letterSpacing: '2px',
              textTransform: 'uppercase',
              fontWeight: 'bold',
              marginRight: '20px'
            }}
          >
            <span style={{ marginRight: '8px' }}>👁</span>
            {scoresHidden ? 'Show My Scores' : 'Hide My Scores'}
          </button>
        </div>
      </div>
    </>
  );
}
