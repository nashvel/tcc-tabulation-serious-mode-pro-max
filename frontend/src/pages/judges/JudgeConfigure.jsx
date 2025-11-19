import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function JudgeConfigure() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('header');
  const [headerImages, setHeaderImages] = useState([]);
  const [loadingImages, setLoadingImages] = useState([]);
  const [lockedImages, setLockedImages] = useState([]);

  useEffect(() => {
    // Load existing images from folders
    loadImages();
  }, []);

  const loadImages = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/judge-screens');
      const data = await response.json();
      
      setHeaderImages(data.header || []);
      setLoadingImages(data.loading || []);
      setLockedImages(data.locked || []);
    } catch (error) {
      console.error('Error loading images:', error);
      toast.error('Failed to load images');
    }
  };

  const handleFileUpload = async (event, type) => {
    const files = Array.from(event.target.files);
    
    if (files.length === 0) return;

    const formData = new FormData();
    files.forEach((file) => {
      formData.append('images', file);
    });
    formData.append('type', type);

    try {
      const response = await fetch('http://localhost:8000/api/judge-screens/upload', {
        method: 'POST',
        body: formData
      });

      if (response.ok) {
        toast.success(`${files.length} image(s) uploaded successfully!`);
        loadImages();
      } else {
        toast.error('Failed to upload images');
      }
    } catch (error) {
      console.error('Error uploading:', error);
      toast.error('Error uploading images');
    }
  };

  const handleDelete = async (filename, type) => {
    try {
      const response = await fetch(`http://localhost:8000/api/judge-screens/delete`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ filename, type })
      });

      if (response.ok) {
        toast.success('Image deleted successfully!');
        loadImages();
      } else {
        toast.error('Failed to delete image');
      }
    } catch (error) {
      console.error('Error deleting:', error);
      toast.error('Error deleting image');
    }
  };

  const tabs = [
    { id: 'header', label: 'Judge Header', icon: 'edit' },
    { id: 'loading', label: 'Loading Screen', icon: 'hourglass_empty' },
    { id: 'locked', label: 'Locked Screen', icon: 'lock' }
  ];

  const getCurrentImages = () => {
    switch (activeTab) {
      case 'header': return headerImages;
      case 'loading': return loadingImages;
      case 'locked': return lockedImages;
      default: return [];
    }
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#fafafa' }}>
      <ToastContainer />
      
      {/* Header */}
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        backgroundColor: '#fff',
        borderBottom: '1px solid #e5e7eb',
        padding: '16px 32px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        zIndex: 1000,
        boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button
            onClick={() => navigate('/admin')}
            style={{
              backgroundColor: 'transparent',
              border: '1px solid #e5e7eb',
              color: '#6b7280',
              padding: '8px 14px',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '13px',
              fontWeight: '500',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <span className="material-icons" style={{ fontSize: '16px' }}>arrow_back</span>
            Back
          </button>
          <div style={{ height: '24px', width: '1px', backgroundColor: '#e5e7eb' }} />
          <h1 style={{ color: '#1f2937', fontSize: '18px', fontWeight: '600', margin: 0, letterSpacing: '-0.01em' }}>
            Judge Screens Configuration
          </h1>
        </div>
      </div>

      {/* Content */}
      <div style={{ paddingTop: '80px', padding: '80px 32px 40px 32px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          
          {/* Tabs */}
          <div style={{ 
            display: 'flex', 
            gap: '8px', 
            marginBottom: '24px',
            backgroundColor: '#fff',
            padding: '8px',
            borderRadius: '8px',
            border: '1px solid #e5e7eb'
          }}>
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  flex: 1,
                  padding: '12px 20px',
                  backgroundColor: activeTab === tab.id ? '#fdba74' : 'transparent',
                  color: activeTab === tab.id ? '#fff' : '#6b7280',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '600',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  transition: 'all 0.2s'
                }}
              >
                <span className="material-icons" style={{ fontSize: '18px' }}>{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>

          {/* Current Active Screen Display */}
          <div style={{
            backgroundColor: '#fff',
            borderRadius: '8px',
            border: '2px solid #fdba74',
            padding: '32px',
            marginBottom: '24px'
          }}>
            <h2 style={{ 
              fontSize: '16px', 
              fontWeight: '600', 
              color: '#1f2937', 
              marginBottom: '16px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <span className="material-icons" style={{ fontSize: '20px', color: '#fdba74' }}>visibility</span>
              Current Active {tabs.find(t => t.id === activeTab)?.label}
            </h2>

            {getCurrentImages().length === 0 ? (
              <div style={{
                textAlign: 'center',
                padding: '60px 20px',
                backgroundColor: '#fafafa',
                borderRadius: '8px',
                border: '2px dashed #e5e7eb'
              }}>
                <span className="material-icons" style={{ fontSize: '64px', color: '#9ca3af', opacity: 0.3 }}>
                  hide_image
                </span>
                <p style={{ fontSize: '14px', color: '#6b7280', marginTop: '16px', marginBottom: '8px' }}>
                  No active screen set
                </p>
                <p style={{ fontSize: '12px', color: '#9ca3af', margin: 0 }}>
                  Upload an image below to set the {tabs.find(t => t.id === activeTab)?.label.toLowerCase()}
                </p>
              </div>
            ) : (
              <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                backgroundColor: '#000',
                borderRadius: '8px',
                overflow: 'hidden',
                minHeight: '300px',
                position: 'relative'
              }}>
                <img
                  src={getCurrentImages()[0]?.url}
                  alt="Current active screen"
                  style={{
                    maxWidth: '100%',
                    maxHeight: '500px',
                    objectFit: 'contain'
                  }}
                />
                <div style={{
                  position: 'absolute',
                  top: '16px',
                  right: '16px',
                  backgroundColor: 'rgba(253, 186, 116, 0.9)',
                  color: '#fff',
                  padding: '8px 16px',
                  borderRadius: '6px',
                  fontSize: '12px',
                  fontWeight: '600',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}>
                  Active
                </div>
              </div>
            )}
          </div>

          {/* Upload Section */}
          <div style={{
            backgroundColor: '#fff',
            borderRadius: '8px',
            border: '1px solid #e5e7eb',
            padding: '32px',
            marginBottom: '24px'
          }}>
            <h2 style={{ 
              fontSize: '16px', 
              fontWeight: '600', 
              color: '#1f2937', 
              marginBottom: '16px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <span className="material-icons" style={{ fontSize: '20px', color: '#fdba74' }}>cloud_upload</span>
              Upload Images
            </h2>
            
            <div style={{
              border: '2px dashed #e5e7eb',
              borderRadius: '8px',
              padding: '48px',
              textAlign: 'center',
              backgroundColor: '#fafafa',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            onDragOver={(e) => {
              e.preventDefault();
              e.currentTarget.style.borderColor = '#fdba74';
              e.currentTarget.style.backgroundColor = '#fff7ed';
            }}
            onDragLeave={(e) => {
              e.currentTarget.style.borderColor = '#e5e7eb';
              e.currentTarget.style.backgroundColor = '#fafafa';
            }}
            onDrop={(e) => {
              e.preventDefault();
              e.currentTarget.style.borderColor = '#e5e7eb';
              e.currentTarget.style.backgroundColor = '#fafafa';
              const files = Array.from(e.dataTransfer.files);
              handleFileUpload({ target: { files } }, activeTab);
            }}
            onClick={() => document.getElementById('fileInput').click()}
            >
              <span className="material-icons" style={{ fontSize: '48px', color: '#fdba74', marginBottom: '16px' }}>
                add_photo_alternate
              </span>
              <p style={{ fontSize: '14px', color: '#6b7280', margin: '8px 0' }}>
                Click to upload or drag and drop
              </p>
              <p style={{ fontSize: '12px', color: '#9ca3af', margin: 0 }}>
                PNG, JPG, GIF up to 10MB
              </p>
              <input
                id="fileInput"
                type="file"
                multiple
                accept="image/*"
                onChange={(e) => handleFileUpload(e, activeTab)}
                style={{ display: 'none' }}
              />
            </div>
          </div>

          {/* Images Grid */}
          <div style={{
            backgroundColor: '#fff',
            borderRadius: '8px',
            border: '1px solid #e5e7eb',
            padding: '32px'
          }}>
            <h2 style={{ 
              fontSize: '16px', 
              fontWeight: '600', 
              color: '#1f2937', 
              marginBottom: '16px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <span className="material-icons" style={{ fontSize: '20px', color: '#fdba74' }}>photo_library</span>
              Current Images
            </h2>

            {getCurrentImages().length === 0 ? (
              <div style={{
                textAlign: 'center',
                padding: '60px 20px',
                color: '#9ca3af'
              }}>
                <span className="material-icons" style={{ fontSize: '64px', opacity: 0.3 }}>
                  image_not_supported
                </span>
                <p style={{ fontSize: '14px', marginTop: '16px' }}>
                  No images uploaded yet
                </p>
              </div>
            ) : (
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                gap: '16px'
              }}>
                {getCurrentImages().map((image, index) => (
                  <div
                    key={index}
                    style={{
                      position: 'relative',
                      borderRadius: '8px',
                      overflow: 'hidden',
                      border: '1px solid #e5e7eb',
                      aspectRatio: '16/9',
                      backgroundColor: '#fafafa'
                    }}
                  >
                    <img
                      src={image.url}
                      alt={image.name}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover'
                      }}
                    />
                    <button
                      onClick={() => handleDelete(image.name, activeTab)}
                      style={{
                        position: 'absolute',
                        top: '8px',
                        right: '8px',
                        backgroundColor: 'rgba(239, 68, 68, 0.9)',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '4px',
                        padding: '6px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      <span className="material-icons" style={{ fontSize: '18px' }}>delete</span>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
