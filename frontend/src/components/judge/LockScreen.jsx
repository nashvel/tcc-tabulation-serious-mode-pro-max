import { useState, useEffect } from 'react';
import { Lock } from 'lucide-react';

export default function LockScreen() {
  const [lockImage, setLockImage] = useState(null);
  const [hasImage, setHasImage] = useState(false);

  useEffect(() => {
    // Fetch locked screen image from API using dynamic hostname
    const apiUrl = `http://${window.location.hostname}:8000/api/judge-screens`;
    fetch(apiUrl)
      .then(res => res.json())
      .then(data => {
        if (data.locked && data.locked.length > 0) {
          setLockImage(data.locked[0].url);
          setHasImage(true);
        }
      })
      .catch(err => {
        // Silently fail - use default lock icon if API not available
        console.debug('Lock screen images not available');
      });
  }, []);

  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      minHeight: '400px',
      backgroundColor: '#fff'
    }}>
      <div style={{ textAlign: 'center' }}>
        {hasImage ? (
          <img src={lockImage} alt="Lock Screen" style={{ height: '300px', opacity: 0.8 }} />
        ) : (
          <Lock size={120} color="#fdba74" style={{ marginBottom: '20px' }} />
        )}
        <br />
        <p style={{ color: '#666', fontSize: '24px', marginTop: '20px' }}>
          Screen Locked by Administrator
        </p>
      </div>
    </div>
  );
}
