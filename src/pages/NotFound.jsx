import React from 'react';
import { Link } from 'react-router-dom';
import { Home as HomeIcon, Briefcase, Compass } from 'lucide-react';

const NotFound = () => {
  return (
    <section className="not-found-container" style={{ padding: '72px 0' }}>
      <div className="container" style={{ maxWidth: '580px' }}>
        <div className="saas-card" style={{ textAlign: 'center', padding: '48px 28px' }}>
          <div
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '18px',
              backgroundColor: 'var(--primary-light)',
              color: 'var(--primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 18px',
            }}
          >
            <Compass size={32} />
          </div>
          <span className="badge badge-blue" style={{ marginBottom: '12px' }}>
            404 — Page Not Found
          </span>
          <h1 style={{ fontSize: '1.9rem', margin: '0 0 10px' }}>We couldn&apos;t locate that route</h1>
          <p style={{ fontSize: '0.96rem', color: 'var(--text-muted)', margin: '0 0 24px', lineHeight: 1.6 }}>
            The page you requested may have moved, expired, or does not exist on DG Interns Hub.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', flexWrap: 'wrap' }}>
            <Link to="/" className="btn btn-primary">
              <HomeIcon size={16} />
              <span>Return Home</span>
            </Link>
            <Link to="/jobs" className="btn btn-secondary">
              <Briefcase size={16} />
              <span>Browse Internships</span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default NotFound;
