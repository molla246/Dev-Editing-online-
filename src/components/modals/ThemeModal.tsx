import React, { useState, useEffect } from 'react';
import { useApp, ThemeMode } from '../../context/AppContext';

export const ThemeModal: React.FC = () => {
  const {
    themeMode,
    setThemeMode,
    isThemeModalOpen,
    setIsThemeModalOpen,
    isDarkMode,
    addToast,
  } = useApp();

  const [tempMode, setTempMode] = useState<ThemeMode>(themeMode);

  useEffect(() => {
    if (isThemeModalOpen) {
      setTempMode(themeMode);
    }
  }, [isThemeModalOpen, themeMode]);

  if (!isThemeModalOpen) return null;

  const handleOk = () => {
    setThemeMode(tempMode);
    let label = 'System default';
    if (tempMode === 'light') label = 'Light';
    if (tempMode === 'dark') label = 'Dark';
    addToast(`Theme set to ${label}`, 'success');
    setIsThemeModalOpen(false);
  };

  const handleCancel = () => {
    setIsThemeModalOpen(false);
  };

  const themeOptions: { id: ThemeMode; label: string }[] = [
    { id: 'system', label: 'System default' },
    { id: 'light', label: 'Light' },
    { id: 'dark', label: 'Dark' },
  ];

  return (
    <div
      className="modal-overlay"
      style={{
        zIndex: 99999,
        backgroundColor: 'rgba(0, 0, 0, 0.55)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) handleCancel();
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '340px',
          backgroundColor: isDarkMode ? '#1e293b' : '#ffffff',
          color: isDarkMode ? '#f8fafc' : '#1e293b',
          borderRadius: '28px',
          padding: '1.75rem 1.75rem 1.25rem 1.75rem',
          boxShadow: '0 20px 30px -10px rgba(0, 0, 0, 0.3)',
          border: isDarkMode ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(0, 0, 0, 0.08)',
          animation: 'fadeInScale 0.2s ease-out forwards',
        }}
      >
        <h2
          style={{
            fontSize: '1.45rem',
            fontWeight: 500,
            margin: '0 0 1.5rem 0',
            color: isDarkMode ? '#ffffff' : '#1f2937',
            letterSpacing: '-0.01em',
            fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          }}
        >
          Choose theme
        </h2>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {themeOptions.map((option) => {
            const isSelected = tempMode === option.id;
            return (
              <div
                key={option.id}
                onClick={() => setTempMode(option.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1.1rem',
                  cursor: 'pointer',
                  userSelect: 'none',
                  padding: '0.2rem 0',
                }}
              >
                {/* Radio Circle */}
                <div
                  style={{
                    width: '22px',
                    height: '22px',
                    borderRadius: '50%',
                    border: isSelected
                      ? '2px solid #0f9d58'
                      : isDarkMode
                      ? '2px solid #64748b'
                      : '2px solid #5f6368',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'border-color 0.15s ease',
                    flexShrink: 0,
                  }}
                >
                  {isSelected && (
                    <div
                      style={{
                        width: '12px',
                        height: '12px',
                        borderRadius: '50%',
                        backgroundColor: '#0f9d58',
                      }}
                    />
                  )}
                </div>

                <span
                  style={{
                    fontSize: '1rem',
                    fontWeight: 400,
                    color: isDarkMode ? '#f1f5f9' : '#1f2937',
                    fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                  }}
                >
                  {option.label}
                </span>
              </div>
            );
          })}
        </div>

        {/* Action Buttons */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            gap: '0.5rem',
            marginTop: '1.75rem',
          }}
        >
          <button
            type="button"
            onClick={handleCancel}
            style={{
              background: 'none',
              border: 'none',
              color: '#0f9d58',
              fontSize: '0.95rem',
              fontWeight: 600,
              padding: '0.5rem 1.1rem',
              borderRadius: '9999px',
              cursor: 'pointer',
              transition: 'background-color 0.15s ease',
              fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(15, 157, 88, 0.08)')}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleOk}
            style={{
              background: 'none',
              border: 'none',
              color: '#0f9d58',
              fontSize: '0.95rem',
              fontWeight: 700,
              padding: '0.5rem 1.1rem',
              borderRadius: '9999px',
              cursor: 'pointer',
              transition: 'background-color 0.15s ease',
              fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(15, 157, 88, 0.08)')}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
          >
            OK
          </button>
        </div>
      </div>
    </div>
  );
};
