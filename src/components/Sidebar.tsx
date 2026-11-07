import React from 'react';
import { useApp } from '../context/AppContext';
import {
  Tag,
  DownloadCloud,
  History,
  FolderPlus,
  X,
} from 'lucide-react';
import { ViewTab } from '../types';

export const Sidebar: React.FC = () => {
  const {
    activeView,
    setActiveView,
    isSidebarOpen,
    setIsSidebarOpen,
    setIsDraftManagerOpen,
    draftCount,
  } = useApp();

  const handleNav = (tab: ViewTab) => {
    setActiveView(tab);
    setIsSidebarOpen(false);
  };

  const handleOpenDrafts = () => {
    setIsDraftManagerOpen(true);
    setIsSidebarOpen(false);
  };

  return (
    <>
      {isSidebarOpen && (
        <div
          className="sidebar-overlay"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <aside className={`app-sidebar ${isSidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-brand" style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h2
              style={{
                fontSize: '1.4rem',
                fontWeight: 900,
                fontStyle: 'italic',
                letterSpacing: '-0.01em',
                color: '#ff5e36',
                margin: 0,
                lineHeight: 1,
              }}
            >
              PRO ADMIN
            </h2>
            <p
              style={{
                fontSize: '0.65rem',
                fontWeight: 800,
                color: 'var(--text-muted)',
                letterSpacing: '0.05em',
                margin: '0.3rem 0 0 0',
                textTransform: 'uppercase',
              }}
            >
              DATA PASSWORD VAULT
            </p>
          </div>

          <button
            className="btn-icon"
            onClick={() => setIsSidebarOpen(false)}
            style={{ borderRadius: '50%', color: 'var(--text-secondary)' }}
          >
            <X size={20} />
          </button>
        </div>

        <nav className="sidebar-nav" style={{ padding: '1.5rem 1.25rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <button
            className="nav-link-item"
            onClick={handleOpenDrafts}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0.85rem 1rem',
              borderRadius: '12px',
              fontWeight: 700,
              fontSize: '0.95rem',
              color: 'var(--text-primary)',
              background: 'rgba(234, 179, 8, 0.12)',
              border: '1px solid rgba(234, 179, 8, 0.25)',
              cursor: 'pointer',
              width: '100%',
              textAlign: 'left',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
              <FolderPlus size={20} color="#ca8a04" />
              <span>Drafts</span>
            </div>
            {draftCount > 0 && (
              <span
                style={{
                  backgroundColor: '#eab308',
                  color: '#ffffff',
                  fontSize: '0.72rem',
                  fontWeight: 900,
                  padding: '2px 8px',
                  borderRadius: '9999px',
                }}
              >
                {draftCount}
              </span>
            )}
          </button>

          <button
            className={`nav-link-item ${activeView === 'labels' ? 'active' : ''}`}
            onClick={() => handleNav('labels')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.85rem',
              padding: '0.85rem 1rem',
              borderRadius: '12px',
              fontWeight: 700,
              fontSize: '0.95rem',
              color: 'var(--text-primary)',
              background: activeView === 'labels' ? 'rgba(255, 94, 54, 0.12)' : 'transparent',
              border: 'none',
              cursor: 'pointer',
              width: '100%',
              textAlign: 'left',
            }}
          >
            <Tag size={20} color={activeView === 'labels' ? '#ff5e36' : 'var(--text-secondary)'} />
            <span>Labels</span>
          </button>

          <button
            className={`nav-link-item ${activeView === 'export-import' ? 'active' : ''}`}
            onClick={() => handleNav('export-import')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.85rem',
              padding: '0.85rem 1rem',
              borderRadius: '12px',
              fontWeight: 700,
              fontSize: '0.95rem',
              color: 'var(--text-primary)',
              background: activeView === 'export-import' ? 'rgba(255, 94, 54, 0.12)' : 'transparent',
              border: 'none',
              cursor: 'pointer',
              width: '100%',
              textAlign: 'left',
            }}
          >
            <DownloadCloud size={20} color={activeView === 'export-import' ? '#ff5e36' : 'var(--text-secondary)'} />
            <span>Export/Import</span>
          </button>

          <button
            className={`nav-link-item ${activeView === 'history' ? 'active' : ''}`}
            onClick={() => handleNav('history')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.85rem',
              padding: '0.85rem 1rem',
              borderRadius: '12px',
              fontWeight: 700,
              fontSize: '0.95rem',
              color: 'var(--text-primary)',
              background: activeView === 'history' ? 'rgba(255, 94, 54, 0.12)' : 'transparent',
              border: 'none',
              cursor: 'pointer',
              width: '100%',
              textAlign: 'left',
            }}
          >
            <History size={20} color={activeView === 'history' ? '#ff5e36' : 'var(--text-secondary)'} />
            <span>History Logs</span>
          </button>
        </nav>
      </aside>
    </>
  );
};

