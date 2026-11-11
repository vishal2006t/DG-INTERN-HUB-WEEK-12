import React from 'react';
import { Loader2 } from 'lucide-react';

const Loader = ({
  type = 'spinner',
  text = 'Loading...',
  rows = 5,
  count = 6,
  fullScreen = false,
}) => {
  if (type === 'skeleton-cards') {
    return (
      <div
        className="job-cards-grid"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
          gap: '20px',
        }}
        aria-busy="true"
        aria-label="Loading listings"
      >
        {Array.from({ length: count }).map((_, idx) => (
          <div key={idx} className="saas-card" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              <div className="skeleton" style={{ width: '44px', height: '44px', borderRadius: '12px' }} />
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div className="skeleton" style={{ height: '16px', width: '72%' }} />
                <div className="skeleton" style={{ height: '12px', width: '46%' }} />
              </div>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <div className="skeleton" style={{ height: '22px', width: '80px', borderRadius: '999px' }} />
              <div className="skeleton" style={{ height: '22px', width: '64px', borderRadius: '999px' }} />
            </div>
            <div className="skeleton" style={{ height: '42px', width: '100%' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px' }}>
              <div className="skeleton" style={{ height: '18px', width: '90px' }} />
              <div className="skeleton" style={{ height: '32px', width: '110px' }} />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (type === 'skeleton-table') {
    return (
      <div className="saas-card" aria-busy="true" aria-label="Loading data">
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '18px' }}>
          <div className="skeleton" style={{ height: '22px', width: '180px' }} />
          <div className="skeleton" style={{ height: '32px', width: '120px' }} />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {Array.from({ length: rows }).map((_, idx) => (
            <div
              key={idx}
              style={{
                display: 'grid',
                gridTemplateColumns: '2fr 1.2fr 1fr 1fr',
                gap: '12px',
                padding: '10px 0',
                borderBottom: '1px solid var(--border-subtle)',
              }}
            >
              <div className="skeleton" style={{ height: '18px' }} />
              <div className="skeleton" style={{ height: '18px' }} />
              <div className="skeleton" style={{ height: '18px' }} />
              <div className="skeleton" style={{ height: '18px' }} />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div
      role="status"
      aria-busy="true"
      aria-live="polite"
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '12px',
        padding: fullScreen ? '4rem 1.5rem' : '2.5rem 1rem',
        minHeight: fullScreen ? '60vh' : 'auto',
        color: 'var(--text-secondary)',
      }}
    >
      <Loader2 size={34} className="spin-icon" style={{ color: 'var(--primary)' }} />
      {text && <p style={{ fontSize: '0.92rem', fontWeight: 500, color: 'var(--text-muted)', margin: 0 }}>{text}</p>}
    </div>
  );
};

export default Loader;
