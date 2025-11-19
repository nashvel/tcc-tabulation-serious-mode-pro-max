import { useState } from 'react';
import AdminHeaderButtons from '../../components/admin/AdminHeaderButtons';
import AdminSidebar from '../../components/admin/AdminSidebar';

export default function Certificates() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#fff' }}>
      {/* Admin Sidebar */}
      <AdminSidebar 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
      />
      
      {/* Red Header Bar - Full Width with Buttons */}
      <div style={{
        backgroundColor: '#D52818',
        borderBottom: '5px solid #97180D',
        padding: '8px 20px',
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        gap: '10px'
      }}>
        <AdminHeaderButtons onEditClick={() => setIsSidebarOpen(true)} />
      </div>
      
      {/* Logos Row - 6 logos matching old system */}
      <div style={{ 
        backgroundColor: '#fff',
        padding: '20px',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        gap: '20px',
        borderBottom: '1px solid #ddd'
      }}>
        <img src="/assets/logo.png" alt="Logo 1" style={{ height: '60px' }} />
        <img src="/assets/tcc_seal.png" alt="TCC Seal" style={{ height: '60px' }} />
        <img src="/assets/logo-3.png" alt="Logo 3" style={{ height: '60px' }} />
        <img src="/assets/Mr. & Ms. TCC Logo 2024 (Gold).png" alt="TCC Logo" style={{ height: '60px' }} />
        <img src="/assets/lnk-logo.png" alt="LNK Logo" style={{ height: '60px' }} />
        <img src="/assets/bsit.png" alt="BSIT" style={{ height: '60px' }} />
      </div>
      
      <div style={{ padding: '40px', maxWidth: '1400px', margin: '0 auto' }}>
        
        {/* Print Results Section - Female */}
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <h3 style={{ fontSize: '14px', color: '#666', marginBottom: '15px', textTransform: 'uppercase', letterSpacing: '1px' }}>Print Results - Female</h3>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '15px', flexWrap: 'wrap' }}>
            {[
              { icon: '2108958.png', label: 'Intergalactic Attire', sub: '(FEMALE)' },
              { icon: '2108958.png', label: 'Swimwear & Trunks', sub: '(FEMALE)' },
              { icon: '2108958.png', label: 'Barong Tagalog & Modern Filipiana', sub: '(FEMALE)' },
              { icon: '2108958.png', label: 'Preliminary Interview', sub: '(FEMALE)' },
              { icon: '2108958.png', label: 'Final Question & Answer', sub: '(FEMALE)' }
            ].map((item, idx) => (
              <button
                key={idx}
                style={{
                  display: 'inline-flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  padding: '15px 20px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  backgroundColor: '#fff',
                  cursor: 'pointer',
                  textTransform: 'uppercase',
                  letterSpacing: '2px',
                  fontSize: '13px',
                  minWidth: '160px'
                }}
              >
                <img src={`/assets/icon/${item.icon}`} style={{ height: '75px', marginBottom: '10px' }} alt="" />
                <div style={{ textAlign: 'center', lineHeight: '1.4' }}>
                  {item.label} <br /> <b>{item.sub}</b>
                </div>
              </button>
            ))}
          </div>
        </div>
        
        <hr style={{ width: '75%', margin: '30px auto', borderColor: '#ddd' }} />
        
        {/* Print Results Section - Male */}
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <h3 style={{ fontSize: '14px', color: '#666', marginBottom: '15px', textTransform: 'uppercase', letterSpacing: '1px' }}>Print Results - Male</h3>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '15px', flexWrap: 'wrap' }}>
            {[
              { icon: '2108958.png', label: 'Intergalactic Attire', sub: '(MALE)' },
              { icon: '2108958.png', label: 'Swimwear & Trunks', sub: '(MALE)' },
              { icon: '2108958.png', label: 'Barong Tagalog & Modern Filipiana', sub: '(MALE)' },
              { icon: '2108958.png', label: 'Preliminary Interview', sub: '(MALE)' },
              { icon: '2108958.png', label: 'Final Question & Answer', sub: '(MALE)' }
            ].map((item, idx) => (
              <button
                key={idx}
                style={{
                  display: 'inline-flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  padding: '15px 20px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  backgroundColor: '#fff',
                  cursor: 'pointer',
                  textTransform: 'uppercase',
                  letterSpacing: '2px',
                  fontSize: '13px',
                  minWidth: '160px'
                }}
              >
                <img src={`/assets/icon/${item.icon}`} style={{ height: '75px', marginBottom: '10px' }} alt="" />
                <div style={{ textAlign: 'center', lineHeight: '1.4' }}>
                  {item.label} <br /> <b>{item.sub}</b>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
