import React, { useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { Search, X, Lock, FileText, Tag, Filter, RotateCcw } from 'lucide-react';

export const SearchModal: React.FC = () => {
  const {
    isSearchModalOpen,
    setIsSearchModalOpen,
    searchQuery,
    setSearchQuery,
    passwords,
    pages,
    labels,
    activeView,
    setActiveView,
  } = useApp();

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isSearchModalOpen) {
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [isSearchModalOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isSearchModalOpen) {
        setIsSearchModalOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSearchModalOpen, setIsSearchModalOpen]);

  if (!isSearchModalOpen) return null;

  const handleClose = () => {
    setIsSearchModalOpen(false);
  };

  const handleClear = () => {
    setSearchQuery('');
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  // Live matching calculations
  const matchPasswords = searchQuery.trim()
    ? passwords.filter(
        (p) =>
          (p.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
          (p.siteUrl && p.siteUrl.toLowerCase().includes(searchQuery.toLowerCase())) ||
          (p.userId && p.userId.toLowerCase().includes(searchQuery.toLowerCase())) ||
          (p.labels && p.labels.some((lbl) => lbl.toLowerCase().includes(searchQuery.toLowerCase())))
      )
    : passwords;

  const matchPages = searchQuery.trim()
    ? pages.filter(
        (pg) =>
          (pg.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
          (pg.content || '').toLowerCase().includes(searchQuery.toLowerCase())
      )
    : pages;

  const matchLabels = searchQuery.trim()
    ? labels.filter((lbl) => (lbl.name || '').toLowerCase().includes(searchQuery.toLowerCase()))
    : labels;

  const totalFilteredCount =
    activeView === 'password'
      ? matchPasswords.length
      : activeView === 'pages'
      ? matchPages.length
      : activeView === 'labels'
      ? matchLabels.length
      : matchPasswords.length + matchPages.length;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1100,
        padding: '0.65rem 1rem',
        backgroundColor: 'rgba(15, 23, 42, 0.94)',
        backdropFilter: 'blur(16px)',
        borderBottom: '1px solid rgba(255, 94, 54, 0.3)',
        boxShadow: '0 15px 35px rgba(0, 0, 0, 0.6)',
        animation: 'slideDown 0.2s cubic-bezier(0.16, 1, 0.3, 1) forwards',
      }}
    >
      <div
        style={{
          maxWidth: '1100px',
          margin: '0 auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.5rem',
        }}
      >
        {/* Top Popup Search Field */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            backgroundColor: 'var(--bg-secondary, #1e293b)',
            borderRadius: '16px',
            padding: '0.55rem 1rem',
            border: '2px solid #ff5e36',
            boxShadow: '0 0 16px rgba(255, 94, 54, 0.25)',
          }}
        >
          <Search size={22} color="#ff5e36" style={{ flexShrink: 0 }} />

          <input
            ref={inputRef}
            type="text"
            className="form-input"
            style={{
              border: 'none',
              background: 'transparent',
              fontSize: '1.05rem',
              fontWeight: 700,
              color: 'var(--text-primary)',
              boxShadow: 'none',
              outline: 'none',
              padding: '0.2rem 0',
              flex: 1,
            }}
            placeholder="Type to live filter passwords, pages, URLs, tags below..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />

          {searchQuery && (
            <button
              onClick={handleClear}
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.12)',
                border: 'none',
                color: 'var(--text-primary)',
                borderRadius: '50%',
                width: '30px',
                height: '30px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                flexShrink: 0,
                transition: 'all 0.15s ease',
              }}
              title="Clear text"
            >
              <X size={16} />
            </button>
          )}

          <button
            onClick={handleClose}
            style={{
              backgroundColor: '#ff5e36',
              color: '#ffffff',
              border: 'none',
              borderRadius: '12px',
              padding: '0.45rem 1rem',
              fontWeight: 800,
              fontSize: '0.82rem',
              letterSpacing: '0.03em',
              cursor: 'pointer',
              flexShrink: 0,
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              boxShadow: '0 4px 12px rgba(255, 94, 54, 0.35)',
            }}
            title="Close Search Bar"
          >
            <span>HIDE</span>
            <X size={16} />
          </button>
        </div>

        {/* Live Filter Bar Stats & Quick Filters */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '0.5rem',
            padding: '0.1rem 0.25rem 0',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
            <span
              style={{
                fontSize: '0.78rem',
                fontWeight: 900,
                color: '#ff5e36',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.3rem',
                backgroundColor: 'rgba(255, 94, 54, 0.12)',
                padding: '2px 8px',
                borderRadius: '8px',
                border: '1px solid rgba(255, 94, 54, 0.25)',
              }}
            >
              <Filter size={12} />
              <span>LIVE FILTER</span>
            </span>

            {searchQuery.trim() ? (
              <span style={{ fontSize: '0.82rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                Showing {totalFilteredCount} matching item{totalFilteredCount !== 1 ? 's' : ''} in view below
              </span>
            ) : (
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                Type above to filter items in real-time on the page below.
              </span>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
            {/* Quick View Filters */}
            <button
              onClick={() => setActiveView('password')}
              style={{
                backgroundColor: activeView === 'password' ? 'rgba(59, 130, 246, 0.25)' : 'rgba(255, 255, 255, 0.06)',
                border: activeView === 'password' ? '1px solid #3b82f6' : '1px solid rgba(255, 255, 255, 0.1)',
                color: activeView === 'password' ? '#60a5fa' : 'var(--text-secondary)',
                padding: '0.25rem 0.65rem',
                borderRadius: '10px',
                fontWeight: 800,
                fontSize: '0.75rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.3rem',
              }}
            >
              <Lock size={12} />
              <span>Passwords ({matchPasswords.length})</span>
            </button>

            <button
              onClick={() => setActiveView('pages')}
              style={{
                backgroundColor: activeView === 'pages' ? 'rgba(168, 34, 246, 0.25)' : 'rgba(255, 255, 255, 0.06)',
                border: activeView === 'pages' ? '1px solid #a822f6' : '1px solid rgba(255, 255, 255, 0.1)',
                color: activeView === 'pages' ? '#c084fc' : 'var(--text-secondary)',
                padding: '0.25rem 0.65rem',
                borderRadius: '10px',
                fontWeight: 800,
                fontSize: '0.75rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.3rem',
              }}
            >
              <FileText size={12} />
              <span>Pages ({matchPages.length})</span>
            </button>

            <button
              onClick={() => setActiveView('labels')}
              style={{
                backgroundColor: activeView === 'labels' ? 'rgba(234, 179, 8, 0.25)' : 'rgba(255, 255, 255, 0.06)',
                border: activeView === 'labels' ? '1px solid #eab308' : '1px solid rgba(255, 255, 255, 0.1)',
                color: activeView === 'labels' ? '#fde047' : 'var(--text-secondary)',
                padding: '0.25rem 0.65rem',
                borderRadius: '10px',
                fontWeight: 800,
                fontSize: '0.75rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.3rem',
              }}
            >
              <Tag size={12} />
              <span>Labels ({matchLabels.length})</span>
            </button>

            {searchQuery && (
              <button
                onClick={handleClear}
                style={{
                  backgroundColor: 'rgba(239, 68, 68, 0.15)',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  color: '#f87171',
                  padding: '0.25rem 0.65rem',
                  borderRadius: '10px',
                  fontWeight: 800,
                  fontSize: '0.75rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.3rem',
                }}
                title="Reset Search Filter"
              >
                <RotateCcw size={12} />
                <span>Reset</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
