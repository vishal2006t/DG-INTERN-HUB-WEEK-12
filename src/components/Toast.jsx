import React from 'react';
import { CheckCircle2, XCircle, AlertTriangle, Info, X } from 'lucide-react';
import { useToast } from '../hooks/useContexts';
const Toast = () => {
  const { toasts, removeToast } = useToast();

  if (!toasts || toasts.length === 0) return null;

  const getStyleConfig = (type) => {
    switch (type) {
      case 'success':
        return {
          icon: <CheckCircle2 size={18} style={{ color: 'var(--success)', flexShrink: 0 }} />,
          accent: 'var(--success)',
        };
      case 'error':
        return {
          icon: <XCircle size={18} style={{ color: 'var(--error)', flexShrink: 0 }} />,
          accent: 'var(--error)',
        };
      case 'warning':
        return {
          icon: <AlertTriangle size={18} style={{ color: 'var(--warning)', flexShrink: 0 }} />,
          accent: 'var(--warning)',
        };
      default:
        return {
          icon: <Info size={18} style={{ color: 'var(--info)', flexShrink: 0 }} />,
          accent: 'var(--info)',
        };
    }
  };

  return (
    <div className="toast-container" aria-live="polite" aria-atomic="true">
      {toasts.map((toast) => {
        const { icon, accent } = getStyleConfig(toast.type);
        return (
          <div
            key={toast.id}
            role="alert"
            className="toast-item"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '12px 14px',
              borderRadius: 'var(--radius-md)',
              borderLeft: `4px solid ${accent}`,
              minWidth: '280px',
              maxWidth: '420px',
              animation: 'slideUp 0.18s ease-out',
            }}
          >
            {icon}
            <span style={{ fontSize: '0.88rem', fontWeight: 500, flex: 1, lineHeight: 1.4 }}>
              {toast.message}
            </span>
            <button
              type="button"
              onClick={() => removeToast(toast.id)}
              aria-label="Dismiss notification"
              className="btn-ghost"
              style={{ padding: '4px', borderRadius: '6px' }}
            >
              <X size={15} />
            </button>
          </div>
        );
      })}
    </div>
  );
};

export default Toast;
