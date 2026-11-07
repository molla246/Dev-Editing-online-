import React from 'react';
import { useApp } from '../context/AppContext';
import {
  Shield,
  FileCode,
  Tag,
  Eye,
  TrendingUp,
} from 'lucide-react';
import { SyncStatusBadge } from '../components/SyncStatusBadge';

export const DashboardView: React.FC = () => {
  const { passwords, pages, labels } = useApp();

  const totalPasswords = passwords.length;
  const totalPages = pages.length;
  const totalLabels = labels.length;

  const totalPageViews = pages.reduce((acc, pg) => acc + (pg.views || 0), 0);
  const totalPasswordViews = passwords.reduce((acc, p) => acc + (p.views || 0), 0);
  const totalClicks = totalPasswordViews + totalPageViews;
  const pinnedCount = passwords.filter((p) => p.isPinned).length;

  const totalItems = totalPasswords + totalPages + totalLabels;
  const passPct = totalItems > 0 ? Math.round((totalPasswords / totalItems) * 100) : 31;
  const pagesPct = totalItems > 0 ? Math.round((totalPages / totalItems) * 100) : 31;
  const labelsPct = totalItems > 0 ? 100 - passPct - pagesPct : 38;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      {/* Top Welcome Banner */}
      <div
        style={{
          background: 'linear-gradient(135deg, #ff5e36 0%, #a822f6 55%, #7b2cbf 100%)',
          borderRadius: '16px',
          padding: '1.75rem 2rem',
          color: '#ffffff',
          boxShadow: '0 10px 25px -5px rgba(255, 94, 54, 0.35)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            display: 'inline-block',
            backgroundColor: 'rgba(255, 255, 255, 0.22)',
            backdropFilter: 'blur(8px)',
            color: '#ffffff',
            fontSize: '0.7rem',
            fontWeight: 800,
            padding: '0.25rem 0.75rem',
            borderRadius: '9999px',
            letterSpacing: '0.05em',
            marginBottom: '0.75rem',
            textTransform: 'uppercase',
          }}
        >
          SECURE VAULT V3.0
        </div>
        <h1
          style={{
            fontSize: '1.85rem',
            fontWeight: 900,
            letterSpacing: '-0.02em',
            margin: 0,
            lineHeight: 1.2,
            textTransform: 'uppercase',
            color: '#ffffff',
          }}
        >
          WELCOME, ADMINISTRATOR
        </h1>
        <p
          style={{
            fontSize: '0.85rem',
            color: 'rgba(255, 255, 255, 0.9)',
            marginTop: '0.5rem',
            marginBottom: 0,
            maxWidth: '540px',
            lineHeight: 1.45,
          }}
        >
          Manage your passwords, notes, and pages in a clean workspace with real-time Firebase cloud backup.
        </p>
      </div>

      {/* 4 Stat Boxes Grid */}
      <div className="grid-cols-4">
        {/* Passwords Card */}
        <div className="card" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.6rem' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              PASSWORDS
            </span>
            <Shield size={20} color="#ff5e36" />
          </div>
          <div style={{ fontSize: '2.4rem', fontWeight: 900, color: '#3b82f6', lineHeight: 1 }}>
            {totalPasswords}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.5rem', fontWeight: 600 }}>
            Encrypted Vault Entries
          </div>
        </div>

        {/* Pages Card */}
        <div className="card" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.6rem' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              PAGES
            </span>
            <FileCode size={20} color="#8b5cf6" />
          </div>
          <div style={{ fontSize: '2.4rem', fontWeight: 900, color: '#3b82f6', lineHeight: 1 }}>
            {totalPages}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.5rem', fontWeight: 600 }}>
            Rich Markdown Notes
          </div>
        </div>

        {/* Labels Card */}
        <div className="card" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.6rem' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              LABELS
            </span>
            <Tag size={20} color="#a822f6" />
          </div>
          <div style={{ fontSize: '2.4rem', fontWeight: 900, color: '#a822f6', lineHeight: 1 }}>
            {totalLabels}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.5rem', fontWeight: 600 }}>
            Categories Organized
          </div>
        </div>

        {/* Total Clicks Card */}
        <div className="card" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.6rem' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#10b981', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              TOTAL CLICKS
            </span>
            <Eye size={20} color="#10b981" />
          </div>
          <div style={{ fontSize: '2.4rem', fontWeight: 900, color: '#10b981', lineHeight: 1 }}>
            {totalClicks}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.5rem', fontWeight: 600 }}>
            {pinnedCount} Favorites Pinned
          </div>
        </div>
      </div>

      {/* Data Breakdown Progress Bars Section */}
      <div className="card" style={{ padding: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-primary)' }}>
              <TrendingUp size={18} color="#ff5e36" />
              <span>DATA BREAKDOWN</span>
            </h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '0.2rem 0 0 0' }}>
              Distribution across system resources
            </p>
          </div>

          <SyncStatusBadge compact={false} />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Passwords Progress Bar */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.4rem' }}>
              <span style={{ color: '#ff5e36' }}>Passwords ({totalPasswords})</span>
              <span style={{ color: 'var(--text-secondary)' }}>{passPct}%</span>
            </div>
            <div style={{ height: '10px', backgroundColor: 'var(--bg-primary)', borderRadius: '9999px', overflow: 'hidden' }}>
              <div style={{ width: `${passPct}%`, height: '100%', backgroundColor: '#ff5e36', borderRadius: '9999px', transition: 'width 0.5s ease' }} />
            </div>
          </div>

          {/* Pages Progress Bar */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.4rem' }}>
              <span style={{ color: '#5865f2' }}>Pages ({totalPages})</span>
              <span style={{ color: 'var(--text-secondary)' }}>{pagesPct}%</span>
            </div>
            <div style={{ height: '10px', backgroundColor: 'var(--bg-primary)', borderRadius: '9999px', overflow: 'hidden' }}>
              <div style={{ width: `${pagesPct}%`, height: '100%', backgroundColor: '#5865f2', borderRadius: '9999px', transition: 'width 0.5s ease' }} />
            </div>
          </div>

          {/* Labels Progress Bar */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.4rem' }}>
              <span style={{ color: '#a822f6' }}>Labels ({totalLabels})</span>
              <span style={{ color: 'var(--text-secondary)' }}>{labelsPct}%</span>
            </div>
            <div style={{ height: '10px', backgroundColor: 'var(--bg-primary)', borderRadius: '9999px', overflow: 'hidden' }}>
              <div style={{ width: `${labelsPct}%`, height: '100%', backgroundColor: '#a822f6', borderRadius: '9999px', transition: 'width 0.5s ease' }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

