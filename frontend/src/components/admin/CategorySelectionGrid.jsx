export default function CategorySelectionGrid({ 
  showCategoryGrid, 
  isCategoryGridCollapsed,
  setIsCategoryGridCollapsed,
  availableCategories,
  onCategorySelect 
}) {
  if (!showCategoryGrid) return null;

  return (
    <div style={{ 
      maxWidth: '1200px', 
      margin: '0 auto 30px', 
      padding: '30px',
      backgroundColor: '#fff',
      border: '1px solid #e5e7eb',
      borderRadius: '12px',
      animation: 'slideDown 0.3s ease-out',
      position: 'relative',
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
    }}>
      {/* Toggle Arrow Button */}
      <button
        onClick={() => setIsCategoryGridCollapsed(!isCategoryGridCollapsed)}
        style={{
          position: 'absolute',
          top: '20px',
          right: '20px',
          background: '#fff',
          border: '1px solid #e5e7eb',
          borderRadius: '6px',
          width: '36px',
          height: '36px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          transition: 'all 0.2s',
          zIndex: 10
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = '#f9fafb';
          e.currentTarget.style.borderColor = '#d1d5db';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = '#fff';
          e.currentTarget.style.borderColor = '#e5e7eb';
        }}
      >
        <span className="material-icons" style={{ 
          color: '#6b7280', 
          fontSize: '20px',
          transform: isCategoryGridCollapsed ? 'rotate(180deg)' : 'rotate(0deg)',
          transition: 'transform 0.3s'
        }}>
          expand_less
        </span>
      </button>
      
      <h3 style={{ 
        textAlign: 'left', 
        marginBottom: isCategoryGridCollapsed ? '0' : '24px', 
        color: '#111827',
        fontSize: '16px',
        fontWeight: '600',
        letterSpacing: '0.5px',
        paddingRight: '50px',
        transition: 'margin 0.3s'
      }}>
        Select Category to Activate
      </h3>
      
      {/* Category Grid - Collapsible */}
      {!isCategoryGridCollapsed && (
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
          gap: '16px',
          animation: 'fadeIn 0.3s ease-out'
        }}>
          {availableCategories.map((category, index) => (
            <button
              key={category.id}
              onClick={() => onCategorySelect(category)}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                padding: '24px 16px',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                backgroundColor: '#fafafa',
                cursor: 'pointer',
                fontSize: '11px',
                transition: 'all 0.2s ease',
                fontWeight: '500',
                color: '#374151',
                textAlign: 'center',
                lineHeight: '1.4'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.borderColor = '#d1d5db';
                e.currentTarget.style.backgroundColor = '#fff';
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.07)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.borderColor = '#e5e7eb';
                e.currentTarget.style.backgroundColor = '#fafafa';
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <img 
                src={`/assets/icon/${category.icon}`} 
                style={{ 
                  height: '56px', 
                  marginBottom: '12px',
                  opacity: 0.9
                }} 
                alt="" 
              />
              <div style={{ textAlign: 'center', width: '100%' }}>
                <div style={{ 
                  fontSize: '9px', 
                  color: '#9ca3af', 
                  marginBottom: '6px', 
                  fontWeight: '600',
                  letterSpacing: '0.5px',
                  textTransform: 'uppercase'
                }}>
                  Round {category.spot || index + 1}
                </div>
                <div style={{
                  fontSize: '12px',
                  fontWeight: '500',
                  color: '#111827',
                  textTransform: 'capitalize'
                }}>
                  {category.name}
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
