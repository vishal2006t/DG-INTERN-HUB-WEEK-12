import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Bookmark, Trash2, ArrowRight } from 'lucide-react';
import WorkspaceLayout from '../components/WorkspaceLayout';
import JobCard from '../components/JobCard';
import ConfirmDialog from '../components/ConfirmDialog';
import { useAuth, useSavedJobs, useToast } from '../hooks/useContexts';
const SavedJobs = ({ onApplyJob, onOpenPostJob }) => {
  const { isAuthenticated } = useAuth();
  const { savedJobs, savedCount, clearSavedJobs } = useSavedJobs();
  const toast = useToast();
  const [confirmClearOpen, setConfirmClearOpen] = useState(false);

  const handleConfirmClear = () => {
    clearSavedJobs();
    setConfirmClearOpen(false);
    toast.info('Cleared all saved listings.');
  };

  const innerContent = (
    <>
      <div className="saas-page-header">
        <div>
          <h1 className="saas-page-title">Saved Internships ({savedCount})</h1>
          <p className="saas-page-subtitle">
            Quickly revisit bookmarked opportunities and submit your application before deadlines close.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <Link to="/jobs" className="btn btn-secondary btn-sm">
            <span>Browse More</span>
            <ArrowRight size={14} />
          </Link>
          {savedCount > 0 && (
            <button
              type="button"
              onClick={() => setConfirmClearOpen(true)}
              className="btn btn-danger btn-sm"
            >
              <Trash2 size={14} />
              <span>Clear Saved</span>
            </button>
          )}
        </div>
      </div>

      {savedCount === 0 ? (
        <div className="empty-state-box">
          <div className="empty-state-icon">
            <Bookmark size={24} />
          </div>
          <h3 style={{ margin: 0, fontSize: '1.15rem' }}>No saved internships yet</h3>
          <p style={{ margin: 0, fontSize: '0.92rem', maxWidth: '440px' }}>
            Click the bookmark icon on any internship card while browsing to save it for fast access later.
          </p>
          <Link to="/jobs" className="btn btn-primary btn-sm" style={{ marginTop: '8px' }}>
            Explore Open Internships
          </Link>
        </div>
      ) : (
        <div
          className="job-cards-grid"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(310px, 1fr))',
            gap: '20px',
          }}
        >
          {savedJobs.map((job) => (
            <JobCard key={job._id || job.id} job={job} onApply={onApplyJob} />
          ))}
        </div>
      )}

      <ConfirmDialog
        isOpen={confirmClearOpen}
        onClose={() => setConfirmClearOpen(false)}
        onConfirm={handleConfirmClear}
        title="Clear Saved Internships"
        message={`Remove all ${savedCount} bookmarked internship listings from your saved list?`}
        confirmText="Clear All"
      />
    </>
  );

  if (isAuthenticated) {
    return (
      <WorkspaceLayout title="Saved Internships" onOpenPostJob={onOpenPostJob}>
        {innerContent}
      </WorkspaceLayout>
    );
  }

  return (
    <section className="page-wrapper" style={{ padding: '40px 0 64px' }}>
      <div className="container">{innerContent}</div>
    </section>
  );
};

export default SavedJobs;
