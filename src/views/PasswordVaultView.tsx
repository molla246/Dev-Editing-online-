import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import {
  CheckSquare,
  Square,
  Trash2,
  Edit,
  ExternalLink,
  Star,
  Lock,
  RefreshCw,
  Tag as TagIcon,
  ArrowUpDown,
  Eye,
} from 'lucide-react';
import { PasswordItem } from '../types';
import { PasswordAvatar } from '../components/PasswordAvatar';

export const PasswordVaultView: React.FC = () => {
  const {
    passwords,
    labels,
    searchQuery,
    labelFilter,
    setLabelFilter,
    sortOrder,
    setSortOrder,
    isManageMode,
    setIsManageMode,
    selectedPasswordIds,
    toggleSelectPassword,
    toggleSelectAllPasswords,
    bulkDeletePasswords,
    bulkUpdatePasswordStatus,
    bulkApplyLabel,
    bulkDuplicatePasswords,
    togglePinPassword,
    incrementPasswordView,
    openPasswordEditor,
    deletePasswordItem,
    showConfirmModal,
    setDetailModalData,
  } = useApp();

  const PAGE_SIZE = 20;
  const [visibleCount, setVisibleCount] = useState<number>(PAGE_SIZE);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedBulkLabel, setSelectedBulkLabel] = useState<string>('');

  const [sortOption, setSortOption] = useState<'newest' | 'oldest' | 'a-z' | 'z-a'>('newest');

  // Reset pagination when search, filter, or sort changes
  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [searchQuery, labelFilter, statusFilter, sortOption]);

  const publishedPasswords = passwords.filter((p) => p.status !== 'Draft' && (p.status as string) !== 'draft');

  // Filtering & Sorting logic
  const filteredPasswords = passwords.filter((item) => {
    const isDraft = item.status === 'Draft' || (item.status as string) === 'draft';

    // Hide draft items from main list by default, so they only appear in Draft Manager
    if (statusFilter === 'all' && isDraft) return false;
    if (statusFilter === 'Published' && isDraft) return false;
    if (statusFilter === 'Draft' && !isDraft) return false;

    // Search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = item.title.toLowerCase().includes(q);
      const matchUser = (item.userId || '').toLowerCase().includes(q);
      const matchUrl = (item.siteUrl || '').toLowerCase().includes(q);
      const matchLabel = item.labels.some((l) => l.toLowerCase().includes(q));
      if (!matchTitle && !matchUser && !matchUrl && !matchLabel) return false;
    }

    // Label Filter
    if (labelFilter !== 'all' && !item.labels.includes(labelFilter)) return false;

    return true;
  });

  // Sorting: Pinned first, then by sortOption
  const sortedPasswords = [...filteredPasswords].sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;

    if (sortOption === 'a-z') {
      return a.title.localeCompare(b.title);
    }
    if (sortOption === 'z-a') {
      return b.title.localeCompare(a.title);
    }
    if (sortOption === 'oldest') {
      return a.createdAt - b.createdAt;
    }
    // 'newest'
    return b.createdAt - a.createdAt;
  });

  const visibleIds = sortedPasswords.map((p) => p.id);
  const isAllSelected = visibleIds.length > 0 && visibleIds.every((id) => selectedPasswordIds.has(id));

  const handleDeleteSingle = (e: React.MouseEvent, item: PasswordItem) => {
    e.stopPropagation();
    showConfirmModal(
      'Delete Password Record',
      `Are you sure you want to permanently delete "${item.title}"?`,
      () => deletePasswordItem(item.id),
      true,
      false
    );
  };

  const handleBulkDeleteConfirm = () => {
    showConfirmModal(
      'Bulk Delete Password Records',
      `Are you sure you want to delete ${selectedPasswordIds.size} selected password items? Enter your security key (e.g. 123456) to authorize deletion.`,
      () => bulkDeletePasswords(),
      true,
      true
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
      {/* Header Controls Outer Container - Sticky Top as requested in marked user image */}
      <div
        style={{
          position: 'sticky',
          top: 'var(--app-header-height)',
          zIndex: 35,
          backgroundColor: 'var(--bg-primary)',
          backdropFilter: 'blur(12px)',
          border: '1px solid var(--border-color)',
          borderRadius: '22px',
          marginTop: '-0.75rem',
          padding: '0.65rem 0.75rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.65rem',
          boxShadow: 'var(--shadow-sm)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', width: '100%' }}>
          {/* 1. LABELS Select Dropdown (Large Pill) */}
          <div style={{ position: 'relative', flex: 1, minWidth: 0 }}>
            <select
              className="form-select"
              style={{
                width: '100%',
                borderRadius: '16px',
                fontWeight: 800,
                fontSize: '0.85rem',
                padding: '0.5rem 0.75rem 0.5rem 2.2rem',
                height: '42px',
                backgroundColor: 'var(--bg-primary)',
                border: '1px solid var(--border-color)',
                color: 'var(--text-primary)',
                cursor: 'pointer',
              }}
              value={labelFilter}
              onChange={(e) => setLabelFilter(e.target.value)}
            >
              <option value="all">LABELS ({publishedPasswords.length})</option>
              {labels.map((l, lIdx) => {
                const count = publishedPasswords.filter((p) => p.labels.includes(l.name)).length;
                return (
                  <option key={l.id ? `${l.id}_${lIdx}` : `opt_lbl_${lIdx}`} value={l.name}>
                    {l.name} ({count})
                  </option>
                );
              })}
            </select>
            <TagIcon
              size={16}
              color="#ff5e36"
              style={{
                position: 'absolute',
                left: '0.75rem',
                top: '50%',
                transform: 'translateY(-50%)',
                pointerEvents: 'none',
              }}
            />
          </div>

          {/* 2. MANAGE / EXIT Button */}
          <button
            onClick={() => setIsManageMode(!isManageMode)}
            style={{
              height: '42px',
              backgroundColor: isManageMode ? '#ff5e36' : 'rgba(255, 94, 54, 0.12)',
              color: isManageMode ? '#ffffff' : '#ff5e36',
              border: isManageMode ? 'none' : '1px solid rgba(255, 94, 54, 0.25)',
              borderRadius: '16px',
              padding: '0.5rem 1.25rem',
              fontWeight: 900,
              fontSize: '0.85rem',
              letterSpacing: '0.04em',
              cursor: 'pointer',
              flexShrink: 0,
              whiteSpace: 'nowrap',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              boxShadow: isManageMode ? '0 4px 12px rgba(255, 94, 54, 0.3)' : 'none',
            }}
          >
            <CheckSquare size={16} />
            <span>{isManageMode ? 'EXIT' : 'MANAGE'}</span>
          </button>

          {/* 3. Icon-Only Sort Button (No text beside icon) */}
          <div
            style={{
              position: 'relative',
              width: '42px',
              height: '42px',
              borderRadius: '16px',
              backgroundColor: 'var(--bg-primary)',
              border: '1px solid var(--border-color)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              cursor: 'pointer',
            }}
            title={`Sort: ${sortOption.toUpperCase()}`}
          >
            <ArrowUpDown size={18} color="#8b5cf6" />
            <select
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value as any)}
              style={{
                position: 'absolute',
                inset: 0,
                opacity: 0,
                width: '100%',
                height: '100%',
                cursor: 'pointer',
              }}
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="a-z">A to Z</option>
              <option value="z-a">Z to A</option>
            </select>
          </div>
        </div>

        {/* Bulk Selection Action Bar - Inside Sticky Container */}
        {isManageMode && (
          <div
            style={{
              padding: '0.85rem 1rem',
              backgroundColor: 'rgba(255, 94, 54, 0.08)',
              border: '1px solid #ff5e36',
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '0.75rem',
              borderRadius: '16px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <button
                onClick={() => toggleSelectAllPasswords(visibleIds)}
                className="btn btn-secondary"
                style={{ padding: '0.4rem 0.85rem', fontSize: '0.8rem', borderRadius: '12px' }}
              >
                {isAllSelected ? <CheckSquare size={16} color="#ff5e36" /> : <Square size={16} />}
                <span>{isAllSelected ? 'Deselect All' : 'Select All Visible'}</span>
              </button>

              <span className="badge badge-primary" style={{ fontSize: '0.8rem', backgroundColor: '#ff5e36', color: '#fff' }}>
                {selectedPasswordIds.size} SELECTED
              </span>
            </div>

            {selectedPasswordIds.size > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  <select
                    className="form-select"
                    style={{ padding: '0.35rem 0.6rem', fontSize: '0.8rem', width: '120px', borderRadius: '10px' }}
                    value={selectedBulkLabel}
                    onChange={(e) => setSelectedBulkLabel(e.target.value)}
                  >
                    <option value="">Apply Tag...</option>
                    {labels.map((l, lIdx) => (
                      <option key={l.id ? `${l.id}_bulk_${lIdx}` : `bulk_lbl_${lIdx}`} value={l.name}>
                        {l.name}
                      </option>
                    ))}
                  </select>
                  <button
                    disabled={!selectedBulkLabel}
                    onClick={() => {
                      if (selectedBulkLabel) {
                        bulkApplyLabel(selectedBulkLabel);
                        setSelectedBulkLabel('');
                      }
                    }}
                    className="btn btn-secondary"
                    style={{ padding: '0.4rem 0.6rem', fontSize: '0.8rem', borderRadius: '10px' }}
                  >
                    <TagIcon size={14} />
                  </button>
                </div>

                <button
                  onClick={bulkDuplicatePasswords}
                  className="btn btn-secondary"
                  style={{ padding: '0.4rem 0.75rem', fontSize: '0.8rem', borderRadius: '10px' }}
                >
                  <RefreshCw size={14} />
                  <span>Duplicate</span>
                </button>

                <button
                  onClick={handleBulkDeleteConfirm}
                  className="btn btn-danger"
                  style={{ padding: '0.4rem 0.85rem', fontSize: '0.8rem', borderRadius: '10px' }}
                >
                  <Trash2 size={14} />
                  <span>Delete Selected</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Passwords Grid / List */}
      {sortedPasswords.length === 0 ? (
        <div className="card" style={{ padding: '3rem', textAlign: 'center', borderRadius: '20px' }}>
          <Lock size={48} color="var(--text-muted)" style={{ marginBottom: '1rem' }} />
          <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>No password records</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Use the floating (+) button at the bottom right corner to add a new password record.
          </p>
        </div>
      ) : (
        <>
          <div className="grid-cols-3">
            {sortedPasswords.slice(0, visibleCount).map((item, index) => {
              const isSelected = selectedPasswordIds.has(item.id);

            return (
              <div
                key={`${item.id}_${index}`}
                className={`password-card ${isSelected ? 'selected' : ''}`}
                onClick={() => {
                  incrementPasswordView(item.id);
                  setDetailModalData({ id: item.id, type: 'pass' });
                }}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.85rem',
                  position: 'relative',
                  cursor: 'pointer',
                  borderRadius: '18px',
                  padding: '1.25rem',
                }}
              >
                {/* Card Header */}
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.75rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', minWidth: 0, flex: 1 }}>
                    {isManageMode && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleSelectPassword(item.id);
                        }}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                      >
                        {isSelected ? <CheckSquare size={20} color="#ff5e36" /> : <Square size={20} color="var(--text-muted)" />}
                      </button>
                    )}

                    <PasswordAvatar
                      posterUrl={item.posterUrl}
                      siteUrl={item.siteUrl}
                      title={item.title}
                      size={42}
                    />

                    {/* Title and URL / User ID with Ellipsis Truncation */}
                    <div style={{ flex: 1, minWidth: 0, overflow: 'hidden' }}>
                      <div style={{ width: '100%', minWidth: 0, overflow: 'hidden' }}>
                        <h4
                          style={{
                            fontSize: '1.05rem',
                            fontWeight: 800,
                            lineHeight: 1.2,
                            color: 'var(--text-primary)',
                            margin: 0,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            maxWidth: '100%',
                          }}
                          title={item.title}
                        >
                          {item.title}
                        </h4>
                      </div>

                      {item.siteUrl ? (
                        <a
                          href={item.siteUrl.startsWith('http') ? item.siteUrl : `https://${item.siteUrl}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          style={{
                            fontSize: '0.75rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.25rem',
                            marginTop: '0.2rem',
                            color: '#3b82f6',
                            fontWeight: 700,
                            maxWidth: '100%',
                            minWidth: 0,
                            overflow: 'hidden',
                          }}
                        >
                          <span
                            style={{
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                              maxWidth: '100%',
                              display: 'block',
                              minWidth: 0,
                            }}
                          >
                            {item.siteUrl.replace(/^https?:\/\//, '')}
                          </span>
                          <ExternalLink size={12} style={{ flexShrink: 0 }} />
                        </a>
                      ) : item.userId ? (
                        <div
                          style={{
                            fontSize: '0.75rem',
                            color: 'var(--text-muted)',
                            fontWeight: 600,
                            marginTop: '0.2rem',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            maxWidth: '100%',
                          }}
                          title={item.userId}
                        >
                          {item.userId}
                        </div>
                      ) : null}
                    </div>
                  </div>
                </div>

                {/* Label Tags */}
                {item.labels && item.labels.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '0.4rem' }}>
                    {item.labels.map((lbl, idx) => (
                      <span key={idx} className="badge badge-primary">
                        {lbl}
                      </span>
                    ))}
                  </div>
                )}

                {/* Card Action Controls (Edit & Delete only, card click handles view) */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    paddingTop: '0.75rem',
                    borderTop: '1px solid var(--border-color)',
                    marginTop: 'auto',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                    <span
                      style={{
                        fontSize: '0.75rem',
                        fontWeight: 900,
                        color: '#ff5e36',
                        backgroundColor: 'rgba(255, 94, 54, 0.12)',
                        padding: '2px 8px',
                        borderRadius: '8px',
                      }}
                    >
                      #{index + 1}
                    </span>
                    <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                      {item.dateString}
                    </span>
                    <span
                      style={{
                        fontSize: '0.75rem',
                        fontWeight: 800,
                        color: '#a822f6',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.2rem',
                        backgroundColor: 'rgba(168, 34, 246, 0.1)',
                        padding: '2px 7px',
                        borderRadius: '6px',
                      }}
                      title="Real-time Views"
                    >
                      <Eye size={12} color="#a822f6" />
                      <span>{item.views || 0}</span>
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        togglePinPassword(item.id);
                      }}
                      className="btn-icon"
                      style={{ width: '32px', height: '32px', color: item.isPinned ? '#f59e0b' : 'var(--text-muted)' }}
                      title={item.isPinned ? 'Unpin from top' : 'Pin to top'}
                    >
                      <Star size={14} fill={item.isPinned ? '#f59e0b' : 'none'} />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        openPasswordEditor(item.id);
                      }}
                      className="btn-icon"
                      style={{ width: '32px', height: '32px' }}
                      title="Edit Item"
                    >
                      <Edit size={14} />
                    </button>
                    <button
                      onClick={(e) => handleDeleteSingle(e, item)}
                      className="btn-icon"
                      style={{ width: '32px', height: '32px', color: 'var(--danger)' }}
                      title="Delete Item"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
          </div>

          {/* See More Pagination Button */}
          {visibleCount < sortedPasswords.length && (
            <div style={{ display: 'flex', justifyContent: 'center', marginTop: '1.25rem', marginBottom: '1.5rem' }}>
              <button
                onClick={() => setVisibleCount((prev) => prev + PAGE_SIZE)}
                className="btn btn-secondary"
                style={{
                  padding: '0.7rem 1.8rem',
                  borderRadius: '9999px',
                  fontWeight: 800,
                  fontSize: '0.85rem',
                  letterSpacing: '0.03em',
                  border: '1px solid var(--border-color)',
                  background: 'var(--bg-secondary)',
                  color: 'var(--text-primary)',
                  cursor: 'pointer',
                  boxShadow: 'var(--shadow-md)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  transition: 'all 0.2s ease',
                }}
              >
                <span>SEE MORE ({sortedPasswords.length - visibleCount} REMAINING)</span>
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

