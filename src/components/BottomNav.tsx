import React from 'react';
import { useApp } from '../context/AppContext';
import { KeyRound, ShieldCheck, Settings } from 'lucide-react';
import { ViewTab } from '../types';

export const BottomNav: React.FC = () => {
  const {
    activeView,
    setActiveView,
    isPasswordEditorOpen,
    isPageEditorOpen,
    detailModalData,
    confirmModalConfig,
  } = useApp();

  // Hide BottomNav if modal is open
  if (
    isPasswordEditorOpen ||
    isPageEditorOpen ||
    detailModalData !== null ||
    confirmModalConfig?.isOpen
  ) {
    return null;
  }

  const isAccountsActive =
    activeView === 'accounts' ||
    activeView === 'password' ||
    activeView === 'dashboard' ||
    activeView === 'drafts';

  const isCheckupActive = activeView === 'checkup' || activeView === 'history';
  const isSettingsActive = activeView === 'settings' || activeView === 'export-import';

  const navItems: Array<{
    id: ViewTab;
    label: string;
    icon: typeof KeyRound;
    isActive: boolean;
  }> = [
    {
      id: 'accounts',
      label: 'Accounts',
      icon: KeyRound,
      isActive: isAccountsActive,
    },
    {
      id: 'checkup',
      label: 'Checkup',
      icon: ShieldCheck,
      isActive: isCheckupActive,
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: Settings,
      isActive: isSettingsActive,
    },
  ];

  return (
    <nav
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 90,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-around',
        padding: '0.45rem 1rem 0.65rem',
        backgroundColor: '#111412',
        borderTop: '1px solid #212723',
        maxWidth: '800px',
        margin: '0 auto',
      }}
    >
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = item.isActive;

        return (
          <button
            key={item.id}
            onClick={() => setActiveView(item.id)}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.2rem',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: isActive ? '#d4eed9' : '#8e9690',
              padding: '0.2rem 0.6rem',
              minWidth: '68px',
              transition: 'all 0.15s ease',
            }}
          >
            {/* Pill Background around Icon when active */}
            <div
              style={{
                width: '60px',
                height: '30px',
                borderRadius: '16px',
                backgroundColor: isActive ? '#1c3b2b' : 'transparent',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'background-color 0.2s ease',
              }}
            >
              <Icon
                size={19}
                color={isActive ? '#76e19b' : '#8e9690'}
                strokeWidth={isActive ? 2.4 : 1.9}
              />
            </div>
            <span
              style={{
                fontSize: '0.75rem',
                fontWeight: isActive ? 700 : 500,
                letterSpacing: '0.01em',
              }}
            >
              {item.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
};
