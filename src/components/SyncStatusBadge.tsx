import React from 'react';
import { useApp } from '../context/AppContext';
import { RefreshCw, AlertCircle } from 'lucide-react';

export const SyncStatusBadge: React.FC<{ compact?: boolean }> = ({ compact = true }) => {
  const { syncStatus, checkFirebaseConnection } = useApp();

  const handleClick = () => {
    checkFirebaseConnection();
  };

  return (
    <button
      onClick={handleClick}
      type="button"
      title={
        syncStatus === 'syncing'
          ? 'Syncing with Firebase Cloud...'
          : syncStatus === 'error'
          ? 'Sync Error - Click to Retry Sync'
          : 'Firebase Connected & Live Synced'
      }
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.3rem',
        padding: compact ? '0.2rem 0.5rem' : '0.3rem 0.7rem',
        borderRadius: '9999px',
        backgroundColor: 'var(--bg-tertiary)',
        border:
          syncStatus === 'error'
            ? '1px solid rgba(239, 68, 68, 0.5)'
            : syncStatus === 'syncing'
            ? '1px solid rgba(245, 158, 11, 0.5)'
            : '1px solid rgba(16, 185, 129, 0.3)',
        cursor: 'pointer',
        whiteSpace: 'nowrap',
        fontSize: compact ? '0.68rem' : '0.75rem',
        fontWeight: 700,
        color: 'var(--text-primary)',
        transition: 'all 0.2s ease',
        lineHeight: 1,
        flexShrink: 0,
      }}
    >
      {syncStatus === 'syncing' ? (
        <>
          <RefreshCw size={11} style={{ color: '#f59e0b', animation: 'spin 0.8s linear infinite' }} />
          <span style={{ color: '#f59e0b' }}>Syncing...</span>
        </>
      ) : syncStatus === 'error' ? (
        <>
          <AlertCircle size={11} style={{ color: '#ef4444' }} />
          <span style={{ color: '#ef4444' }}>Sync Error</span>
        </>
      ) : (
        <>
          <span
            style={{
              width: '6px',
              height: '6px',
              borderRadius: '50%',
              backgroundColor: '#10b981',
              boxShadow: '0 0 6px #10b981aa',
              display: 'inline-block',
              flexShrink: 0,
            }}
          />
          <span style={{ color: '#10b981' }}>Live Synced</span>
        </>
      )}
    </button>
  );
};
