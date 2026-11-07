import React from 'react';
import { useApp } from '../context/AppContext';
import { Plus, RotateCw } from 'lucide-react';

export const FloatingActionButton: React.FC = () => {
  const {
    activeView,
    openPasswordEditor,
    openPageEditor,
    setIsLabelEditorOpen,
    addToast,
    addLog,
    isSidebarOpen,
    isRightDrawerOpen,
    isPasswordEditorOpen,
    isPageEditorOpen,
    isLabelEditorOpen,
    isTabManagerOpen,
    isSearchModalOpen,
    isReplaceModalOpen,
    detailModalData,
    confirmModalConfig,
  } = useApp();

  const handleRefresh = () => {
    addToast('Reloading...', 'info');
    setTimeout(() => {
      window.location.reload();
    }, 250);
  };

  // Hide FAB if drawer menu or any modal is open
  if (
    isSidebarOpen ||
    isRightDrawerOpen ||
    isPasswordEditorOpen ||
    isPageEditorOpen ||
    isLabelEditorOpen ||
    isTabManagerOpen ||
    isSearchModalOpen ||
    isReplaceModalOpen ||
    detailModalData !== null ||
    confirmModalConfig?.isOpen
  ) {
    return null;
  }

  // Show FAB on dashboard, password, pages, and labels
  if (
    activeView !== 'dashboard' &&
    activeView !== 'password' &&
    activeView !== 'pages' &&
    activeView !== 'labels'
  ) {
    return null;
  }

  const handlePlusClick = () => {
    if (activeView === 'password') {
      openPasswordEditor(null);
    } else if (activeView === 'pages') {
      openPageEditor(null);
    } else if (activeView === 'labels') {
      setIsLabelEditorOpen(true);
    }
  };

  const getPlusTitle = () => {
    if (activeView === 'password') return 'Add Password';
    if (activeView === 'pages') return 'Add Secure Page';
    if (activeView === 'labels') return 'Add Label Tag';
    return 'Add Item';
  };

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '6.8rem',
        right: '1.2rem',
        zIndex: 95,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '0.75rem',
      }}
    >
      {/* Floating Reload / Refresh Button - Shown ONLY on Dashboard View */}
      {activeView === 'dashboard' && (
        <button
          onClick={handleRefresh}
          title="Reload & Refresh Vault"
          style={{
            height: '48px',
            padding: '0 1.15rem',
            borderRadius: '9999px',
            background: 'linear-gradient(135deg, #a822f6 0%, #7b2cbf 100%)',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            border: 'none',
            boxShadow: '0 8px 20px -4px rgba(168, 34, 246, 0.5), 0 4px 6px -2px rgba(0, 0, 0, 0.2)',
            cursor: 'pointer',
            transition: 'all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)',
            fontWeight: 800,
            fontSize: '0.82rem',
            letterSpacing: '0.03em',
          }}
          className="fab-btn"
        >
          <RotateCw size={18} />
          <span>REFRESH</span>
        </button>
      )}

      {/* Main (+) Plus Floating Action Button - NOT on Dashboard, only on specific active views */}
      {activeView !== 'dashboard' && (
        <button
          onClick={handlePlusClick}
          title={getPlusTitle()}
          style={{
            width: '56px',
            height: '56px',
            borderRadius: '50%',
            backgroundColor: '#ff5e36',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: 'none',
            boxShadow: '0 10px 25px -5px rgba(255, 94, 54, 0.6), 0 8px 10px -6px rgba(0, 0, 0, 0.3)',
            cursor: 'pointer',
            transition: 'all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)',
          }}
          className="fab-btn"
        >
          <Plus size={28} />
        </button>
      )}
    </div>
  );
};


