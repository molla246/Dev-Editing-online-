import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { GoogleKeyLogo } from './GoogleKeyLogo';
import { Search, X } from 'lucide-react';
import { AccountProfileModal } from './AccountProfileModal';

export const Header: React.FC = () => {
  const {
    activeView,
    searchQuery,
    setSearchQuery,
    userEmail,
  } = useApp();

  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  const getHeaderTitle = () => {
    switch (activeView) {
      case 'settings':
      case 'export-import':
        return 'Settings';
      case 'checkup':
      case 'history':
        return 'Password Checkup';
      default:
        return '';
    }
  };

  const isHomeAccountsView = activeView === 'accounts' || activeView === 'password' || activeView === 'dashboard';

  return (
    <>
      <header
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '0.75rem',
          padding: '0.75rem 1rem 0.5rem',
          backgroundColor: '#111412',
          position: 'sticky',
          top: 0,
          zIndex: 80,
          maxWidth: '800px',
          margin: '0 auto',
          width: '100%',
        }}
      >
        {/* Left: Google Key Logo */}
        <div style={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
          <GoogleKeyLogo size={32} />
        </div>

        {/* Center: Search Bar or View Title */}
        {isHomeAccountsView ? (
          <div
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              backgroundColor: '#272d29',
              borderRadius: '28px',
              padding: '0.5rem 1rem',
              gap: '0.65rem',
              minWidth: 0,
              border: '1px solid #323b34',
            }}
          >
            <Search size={18} color="#9ba39c" style={{ flexShrink: 0 }} />
            <input
              type="text"
              placeholder="Search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                background: 'none',
                border: 'none',
                outline: 'none',
                color: '#e3e3df',
                fontSize: '0.95rem',
                width: '100%',
                fontWeight: 500,
              }}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#9ba39c',
                  cursor: 'pointer',
                  padding: 0,
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                <X size={16} />
              </button>
            )}
          </div>
        ) : (
          <div
            style={{
              flex: 1,
              textAlign: 'center',
              fontWeight: 700,
              fontSize: '1.2rem',
              color: '#e3e3df',
              letterSpacing: '-0.01em',
            }}
          >
            {getHeaderTitle()}
          </div>
        )}

        {/* Right: User Profile Avatar */}
        <button
          onClick={() => setIsProfileModalOpen(true)}
          title="Account & Login Settings"
          style={{
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            backgroundColor: '#00d668',
            color: '#003915',
            border: '2px solid #2f3831',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 800,
            fontSize: '1rem',
            cursor: 'pointer',
            flexShrink: 0,
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.4)',
            transition: 'transform 0.15s ease',
          }}
          onMouseDown={(e) => (e.currentTarget.style.transform = 'scale(0.94)')}
          onMouseUp={(e) => (e.currentTarget.style.transform = 'scale(1)')}
        >
          {(userEmail || 'M')[0].toUpperCase()}
        </button>
      </header>

      <AccountProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
      />
    </>
  );
};
