import React, { useEffect } from 'react';
import { AlertTriangle, Trash2, X } from 'lucide-react';

/**
 * Accessible SaaS Confirmation Dialog
 * Replaces native browser window.confirm() with keyboard-accessible modal actions.
 */
const ConfirmDialog = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirm Action',
  message = 'Are you sure you want to proceed with this action?',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'danger',
  loading = false,
}) => {
  useEffect(() => {
    if (!isOpen) return undefined;
    const onKeyDown = (e) => {
      if (e.key === 'Escape' && !loading) {
        onClose();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen, loading, onClose]);

  if (!isOpen) return null;

  const isDanger = variant === 'danger';

  return (
    <div
      className="modal-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-dialog-title"
      onClick={(e) => {
        if (e.target === e.currentTarget && !loading) onClose();
      }}
    >
      <div className="modal-container confirm-dialog">
        <div className="confirm-dialog-header">
          <div className={`confirm-dialog-icon ${isDanger ? 'danger' : ''}`}>
            {isDanger ? <Trash2 size={20} /> : <AlertTriangle size={20} />}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <h3 id="confirm-dialog-title" style={{ fontSize: '1.08rem', marginBottom: '6px' }}>
              {title}
            </h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.55 }}>
              {message}
            </p>
          </div>
          <button
            type="button"
            className="btn-ghost"
            onClick={onClose}
            disabled={loading}
            aria-label="Close confirmation dialog"
            style={{ padding: '4px', borderRadius: '6px' }}
          >
            <X size={18} />
          </button>
        </div>

        <div className="confirm-dialog-actions">
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={onClose}
            disabled={loading}
          >
            {cancelText}
          </button>
          <button
            type="button"
            className={`btn btn-sm ${isDanger ? 'btn-danger' : 'btn-primary'}`}
            onClick={onConfirm}
            disabled={loading}
            style={
              isDanger
                ? {
                    backgroundColor: 'var(--error)',
                    color: '#FFFFFF',
                    borderColor: 'var(--error)',
                  }
                : undefined
            }
          >
            {loading ? 'Processing...' : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;

