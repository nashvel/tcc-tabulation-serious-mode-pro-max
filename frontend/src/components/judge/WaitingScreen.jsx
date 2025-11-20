import { useState, useEffect } from 'react';
import TimeDisplay from './TimeDisplay';
import AdminPreloader from '../admin/AdminPreloader';

export default function WaitingScreen({ judgeId }) {
  const [loadingImage, setLoadingImage] = useState(null);
  const [hasImage, setHasImage] = useState(false);
  const [headerImages, setHeaderImages] = useState([]);
  const [hasHeaderImages, setHasHeaderImages] = useState(false);

  useEffect(() => {
    // Fetch loading screen image and header images from API
    // Use dynamic hostname so it works when judges connect via IP
    const apiUrl = `http://${window.location.hostname}:8000/api/judge-screens`;
    
    fetch(apiUrl)
      .then(res => res.json())
      .then(data => {
        if (data.loading && data.loading.length > 0) {
          setLoadingImage(data.loading[0].url);
          setHasImage(true);
        }
        if (data.header && data.header.length > 0) {
          setHeaderImages(data.header.map(img => img.url));
          setHasHeaderImages(true);
        }
      })
      .catch(err => {
        // Silently fail - use default UI if API not available
        console.debug('Waiting screen images not available');
      });
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
          {hasHeaderImages ? (
            headerImages.map((img, index) => (
              <img key={index} src={img} alt={`Logo ${index + 1}`} style={{ height: '60px' }} />
            ))
          ) : (
            <div style={{ 
              color: '#fff', 
              fontSize: '16px', 
              fontWeight: '600',
              letterSpacing: '1px'
            }}>
              TABULATION SYSTEM
            </div>
          )}
        </div>

        {/* Judge Number on Right */}
        <div style={{ 
          minWidth: '200px',
          textAlign: 'right',
          fontSize: '28px',
          fontWeight: 'bold',
          color: '#fff',
          fontFamily: 'Nunito, sans-serif',
          letterSpacing: '2px'
        }}>
          {judgeId && `JUDGE ${String(judgeId).padStart(2, '0')}`}
        </div>
      </div>

      {/* Content Area with Spinner */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: 'calc(100vh - 100px)',
        backgroundColor: '#fff',
        padding: '40px'
      }}>
        <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
          {hasImage ? (
            <img src={loadingImage} alt="Loading Screen" style={{ height: '300px', opacity: 0.8 }} />
          ) : (
            <div style={{ width: '100%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column' }}>
              <AdminPreloader />
            </div>
          )}
        </div>
      </div>
    </>
  );
}
