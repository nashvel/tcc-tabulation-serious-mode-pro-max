export default function ProgressSteps({ currentStep }) {
  const steps = [
    { num: 1, title: 'Basic Info' },
    { num: 2, title: 'Participants' },
    { num: 3, title: 'Categories' },
    { num: 4, title: 'Score Rules' }
  ];

  return (
    <div style={{
      position: 'fixed',
      top: '57px',
      left: 0,
      right: 0,
      backgroundColor: '#fafafa',
      padding: '20px 32px',
      borderBottom: '1px solid #e5e7eb',
      zIndex: 999
    }}>
      <div style={{ maxWidth: '900px', margin: '0 auto', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '12px' }}>
        {steps.map((step, index) => (
          <div key={step.num} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '10px',
              padding: '8px 16px',
              borderRadius: '6px',
              backgroundColor: currentStep === step.num ? '#fff7ed' : 'transparent',
              border: currentStep === step.num ? '1px solid #fdba74' : '1px solid transparent'
            }}>
              <div style={{
                width: '28px',
                height: '28px',
                borderRadius: '6px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '13px',
                fontWeight: '600',
                backgroundColor: currentStep >= step.num ? '#fdba74' : '#e5e7eb',
                color: currentStep >= step.num ? '#fff' : '#9ca3af',
                transition: 'all 0.2s'
              }}>
                {currentStep > step.num ? '✓' : step.num}
              </div>
              <span style={{
                fontSize: '13px',
                fontWeight: currentStep === step.num ? '600' : '500',
                color: currentStep >= step.num ? '#1f2937' : '#9ca3af',
                whiteSpace: 'nowrap'
              }}>
                {step.title}
              </span>
            </div>
            {index < 3 && (
              <div style={{
                width: '24px',
                height: '2px',
                backgroundColor: currentStep > step.num ? '#fdba74' : '#e5e7eb',
                transition: 'all 0.2s'
              }} />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
