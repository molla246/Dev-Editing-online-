import React from 'react';
import { useApp } from '../context/AppContext';
import { CheckCircle2, XCircle, AlertCircle, Info, X } from 'lucide-react';
import { ToastType } from '../types';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useApp();

  if (toasts.length === 0) return null;

  const currentToast = toasts[toasts.length - 1];

  const getIcon = (type: ToastType) => {
    switch (type) {
      case 'success':
        return <CheckCircle2 size={16} color="#10b981" style={{ flexShrink: 0 }} />;
      case 'error':
        return <XCircle size={16} color="#ef4444" style={{ flexShrink: 0 }} />;
      case 'warning':
        return <AlertCircle size={16} color="#f59e0b" style={{ flexShrink: 0 }} />;
      default:
        return <Info size={16} color="#3b82f6" style={{ flexShrink: 0 }} />;
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: '1rem',
        left: '50%',
        transform: 'translateX(-50%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '0.4rem',
        zIndex: 100000,
        pointerEvents: 'none',
        width: 'auto',
        maxWidth: 'calc(100vw - 2rem)',
        padding: '0 0.5rem',
        boxSizing: 'border-box',
      }}
    >
      {[currentToast].map((toast) => (
        <div
          key={toast.id}
          style={{
            pointerEvents: 'auto',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.4rem 0.85rem',
            borderRadius: '9999px',
            backgroundColor: 'var(--bg-secondary)',
            color: 'var(--text-primary)',
            border: '1px solid var(--border-color)',
            boxShadow: '0 6px 20px rgba(0, 0, 0, 0.25)',
            animation: 'toastPop 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
            width: 'max-content',
            maxWidth: 'calc(100vw - 2.5rem)',
            boxSizing: 'border-box',
          }}
        >
          {getIcon(toast.type)}
          <span
            style={{
              fontSize: '0.76rem',
              fontWeight: 600,
              color: 'var(--text-primary)',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              maxWidth: '75vw',
            }}
          >
            {toast.message}
          </span>
          <button
            onClick={() => removeToast(toast.id)}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              padding: '0.1rem',
              marginLeft: '0.15rem',
              display: 'flex',
              alignItems: 'center',
              flexShrink: 0,
            }}
          >
            <X size={13} />
          </button>
        </div>
      ))}
    </div>
  );
};


