import React, { useEffect, useState } from 'react';
import { WifiOff } from 'lucide-react';

export const OfflineIndicator: React.FC = () => {
  const [isOnline, setIsOnline] = useState<boolean>(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (isOnline) return null;

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '1rem',
        left: '1rem',
        zIndex: 1300,
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        backgroundColor: '#f59e0b',
        color: '#78350f',
        padding: '0.5rem 0.85rem',
        borderRadius: '12px',
        fontSize: '0.8rem',
        fontWeight: 700,
        boxShadow: '0 8px 24px rgba(0, 0, 0, 0.4)',
      }}
    >
      <WifiOff size={16} />
      <span>Offline Mode — Cached data is active.</span>
    </div>
  );
};
