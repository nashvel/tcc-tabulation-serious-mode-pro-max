import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import axios from 'axios';

export default function AdminLogin() {
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Check if already logged in
  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    const storedPin = localStorage.getItem('adminPin');
    if (token && storedPin) {
      // Redirect to the page they were trying to access, or setup
      const from = location.state?.from?.pathname || '/setup';
      navigate(from, { replace: true });
    }
  }, [navigate, location]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await axios.post('http://localhost:8000/api/admin/login', {
        pin: pin
      });

      if (response.data.token) {
        // Store authentication data
        localStorage.setItem('adminToken', response.data.token);
        localStorage.setItem('adminPin', pin);
        localStorage.setItem('isAdmin', 'true');
        
        // Show welcome toast
        toast.success('Welcome Admin! 🎉', {
          duration: 4000,
          style: {
            background: '#10b981',
            color: '#fff',
            fontWeight: '600',
          },
        });
        
        // Redirect to the page they were trying to access, or setup
        const from = location.state?.from?.pathname || '/setup';
        navigate(from, { replace: true });
      } else {
        setError('Invalid PIN');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError(err.response?.data?.message || 'Invalid PIN or connection error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#f5f5f5'
    }}>
      <div style={{
        backgroundColor: '#fff',
        padding: '40px',
        borderRadius: '8px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
        width: '100%',
        maxWidth: '400px'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: '#333', marginBottom: '8px' }}>
            Admin Login
          </h1>
          <p style={{ fontSize: '14px', color: '#666' }}>
            Enter your PIN to access admin panel
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '20px' }}>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: '500',
              color: '#333',
              marginBottom: '8px'
            }}>
              Admin PIN
            </label>
            <input
              type="password"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              placeholder="Enter 6-digit PIN"
              maxLength="6"
              style={{
                width: '100%',
                padding: '12px',
                fontSize: '16px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                textAlign: 'center',
                letterSpacing: '8px',
                fontWeight: 'bold'
              }}
              required
            />
          </div>

          {error && (
            <div style={{
              padding: '12px',
              backgroundColor: '#fee',
              border: '1px solid #fcc',
              borderRadius: '4px',
              color: '#c33',
              fontSize: '14px',
              marginBottom: '20px'
            }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || pin.length < 4}
            style={{
              width: '100%',
              padding: '12px',
              backgroundColor: '#D52818',
              color: '#fff',
              border: 'none',
              borderRadius: '4px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading || pin.length < 4 ? 0.6 : 1
            }}
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
      </div>
    </div>
  );
}
