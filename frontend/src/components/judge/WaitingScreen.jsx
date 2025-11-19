import { useState, useEffect } from 'react';
import { Circles } from 'react-loader-spinner';
import TimeDisplay from './TimeDisplay';

export default function WaitingScreen() {
  const [loadingImage, setLoadingImage] = useState(null);
  const [hasImage, setHasImage] = useState(false);
  const [headerImages, setHeaderImages] = useState([]);
  const [hasHeaderImages, setHasHeaderImages] = useState(false);

  useEffect(() => {
    // Fetch loading screen image and header images from API
    fetch('http://localhost:8000/api/judge-screens')
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
      .catch(err => console.error('Error loading waiting screen:', err));
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

        {/* Empty space on right for balance */}
        <div style={{ minWidth: '200px' }}></div>
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
        <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          {hasImage ? (
            <img src={loadingImage} alt="Loading Screen" style={{ height: '300px', opacity: 0.8 }} />
          ) : (
            <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'center' }}>
              <Circles
                height="120"
                width="120"
                color="#fdba74"
                ariaLabel="circles-loading"
                visible={true}
              />
            </div>
          )}
          <p style={{ color: '#666', fontSize: '24px', marginTop: '20px', margin: '20px 0 0 0' }}>
            Waiting for Admin to select criteria...
          </p>
        </div>
      </div>
    </>
  );
}
