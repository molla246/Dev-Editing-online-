import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  FileText,
  Settings,
  Eye,
  Edit,
  Trash2,
  Paperclip,
  Code,
  Download,
  Copy,
  ArrowUpDown,
} from 'lucide-react';
import { PageItem } from '../types';
import { extractFormattedText } from '../utils/formatUtils';
import { getFileCategoryIcon, formatFileSize } from '../utils/fileUtils';

export const PagesView: React.FC = () => {
  const {
    pages,
    pageTabs,
    currentPageTab,
    setCurrentPageTab,
    searchQuery,
    openPageEditor,
    deletePageItem,
    incrementPageView,
    showConfirmModal,
    setDetailModalData,
    setIsTabManagerOpen,
    addToast,
  } = useApp();

  const PAGE_SIZE = 20;
  const [visibleCount, setVisibleCount] = useState<number>(PAGE_SIZE);
  const [sortOption, setSortOption] = useState<'newest' | 'oldest' | 'a-z' | 'z-a'>('newest');

  const handleTabChange = (tabId: string) => {
    setCurrentPageTab(tabId);
    setVisibleCount(PAGE_SIZE);
  };

  const formatItemSize = (content: string = '', title: string = '', attachments: any[] = []) => {
    let bytes = new Blob([content + title]).size;
    if (attachments && attachments.length > 0) {
      attachments.forEach((att) => {
        if (att.size) bytes += att.size;
        else if (att.url) bytes += new Blob([att.url]).size;
      });
    }
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const handleDownloadAttachment = (e: React.MouseEvent, att: any) => {
    e.preventDefault();
    e.stopPropagation();
    showConfirmModal(
      'Download Confirmation',
      `Are you sure you want to download attachment "${att.name}"?`,
      () => {
        const a = document.createElement('a');
        a.href = att.url;
        a.download = att.name;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      }
    );
  };

  const publishedPages = pages.filter((p) => p.status !== 'Draft');
  const draftCount = pages.filter((p) => p.status === 'Draft').length;

  const filteredPages = pages.filter((pg) => {
    if (currentPageTab === 'drafts') {
      if (pg.status !== 'Draft') return false;
    } else {
      if (pg.status === 'Draft') return false;
      if (currentPageTab !== 'all' && pg.tabId !== currentPageTab) return false;
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = (pg.title || '').toLowerCase().includes(q);
      const matchContent = (pg.content || '').toLowerCase().includes(q);
      if (!matchTitle && !matchContent) return false;
    }

    return true;
  }).sort((a, b) => {
    if (sortOption === 'a-z') return a.title.localeCompare(b.title);
    if (sortOption === 'z-a') return b.title.localeCompare(a.title);
    if (sortOption === 'oldest') {
      const timeA = a.createdAt || 0;
      const timeB = b.createdAt || 0;
      return timeA - timeB;
    }
    // 'newest'
    const timeA = a.createdAt || 0;
    const timeB = b.createdAt || 0;
    return timeB - timeA;
  });

  const handleDelete = (item: PageItem) => {
    showConfirmModal(
      'Delete Secure Page',
      `Are you sure you want to delete page "${item.title}"?`,
      () => deletePageItem(item.id),
      true
    );
  };

  const copyPageContent = (item: PageItem) => {
    if (!item.content) {
      addToast('Page content is empty', 'info');
      return;
    }
    const text = extractFormattedText(item.content);
    navigator.clipboard.writeText(text);
    addToast('Copied to clipboard', 'success');
  };

  const getTabName = (tabId: string) => {
    const found = pageTabs.find((t) => t.id === tabId);
    return found ? found.name : 'GENERAL';
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Sticky Top Header & Category Tabs Container */}
      <div
        style={{
          position: 'sticky',
          top: 'var(--app-header-height)',
          zIndex: 35,
          backgroundColor: 'var(--bg-primary)',
          backdropFilter: 'blur(12px)',
          marginTop: '-1rem',
          paddingTop: '1rem',
          paddingBottom: '0.65rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.85rem',
          borderBottom: '1px solid var(--border-color)',
        }}
      >
        {/* Top Title & Toolbar Row */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '0.5rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <FileText size={18} color="#8b5cf6" />
            <h1
              style={{
                fontSize: '1rem',
                fontWeight: 900,
                letterSpacing: '-0.01em',
                margin: 0,
                color: 'var(--text-primary)',
                textTransform: 'uppercase',
                whiteSpace: 'nowrap',
              }}
            >
              PAGES & NOTEBOOK
            </h1>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{ position: 'relative' }}>
              <select
                className="form-select"
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value as any)}
                style={{
                  height: '38px',
                  borderRadius: '14px',
                  fontWeight: 800,
                  fontSize: '0.8rem',
                  padding: '0.45rem 0.65rem 0.45rem 2.1rem',
                  backgroundColor: 'var(--bg-primary)',
                  border: '1px solid var(--border-color)',
                  color: 'var(--text-primary)',
                  cursor: 'pointer',
                  appearance: 'none',
                  WebkitAppearance: 'none',
                  MozAppearance: 'none',
                }}
                title="Sort Pages"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="a-z">A to Z</option>
                <option value="z-a">Z to A</option>
              </select>
              <ArrowUpDown
                size={15}
                color="#8b5cf6"
                style={{
                  position: 'absolute',
                  left: '0.65rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  pointerEvents: 'none',
                }}
              />
            </div>

            <button
              onClick={() => setIsTabManagerOpen(true)}
              className="btn btn-secondary"
              style={{
                borderRadius: '14px',
                padding: '0.45rem 0.85rem',
                fontWeight: 800,
                fontSize: '0.8rem',
                letterSpacing: '0.03em',
                boxShadow: 'var(--shadow-sm)',
              }}
            >
              <Settings size={15} color="#8b5cf6" />
              <span>TABS</span>
            </button>
          </div>
        </div>

        {/* Category Tab Pills Row */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            overflowX: 'auto',
            paddingBottom: '0.25rem',
            scrollbarWidth: 'none',
          }}
        >
          <button
            onClick={() => handleTabChange('all')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.55rem 1.1rem',
              borderRadius: '9999px',
              border: currentPageTab === 'all' ? 'none' : '1px solid var(--border-color)',
              background:
                currentPageTab === 'all'
                  ? 'linear-gradient(135deg, #a822f6 0%, #ff5e36 100%)'
                  : 'var(--bg-secondary)',
              color: currentPageTab === 'all' ? '#ffffff' : 'var(--text-primary)',
              fontWeight: 800,
              fontSize: '0.85rem',
              letterSpacing: '0.03em',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              boxShadow: currentPageTab === 'all' ? '0 4px 14px rgba(255, 94, 54, 0.35)' : 'none',
              transition: 'all 0.2s ease',
            }}
          >
            <span>ALL</span>
            <span
              style={{
                fontSize: '0.72rem',
                fontWeight: 800,
                padding: '2px 7px',
                borderRadius: '9999px',
                backgroundColor:
                  currentPageTab === 'all'
                    ? 'rgba(255, 255, 255, 0.28)'
                    : 'rgba(139, 92, 246, 0.15)',
                color: currentPageTab === 'all' ? '#ffffff' : '#8b5cf6',
              }}
            >
              {publishedPages.length}
            </span>
          </button>

          {pageTabs.map((tab, index) => {
            const count = publishedPages.filter((p) => p.tabId === tab.id).length;
            const isActive = currentPageTab === tab.id;
            return (
              <button
                key={tab.id ? `${tab.id}_${index}` : `tab_${index}`}
                onClick={() => handleTabChange(tab.id)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  padding: '0.55rem 1.1rem',
                  borderRadius: '9999px',
                  border: isActive ? 'none' : '1px solid var(--border-color)',
                  background: isActive
                    ? 'linear-gradient(135deg, #a822f6 0%, #ff5e36 100%)'
                    : 'var(--bg-secondary)',
                  color: isActive ? '#ffffff' : 'var(--text-primary)',
                  fontWeight: 800,
                  fontSize: '0.85rem',
                  letterSpacing: '0.03em',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  boxShadow: isActive ? '0 4px 14px rgba(255, 94, 54, 0.35)' : 'none',
                  transition: 'all 0.2s ease',
                }}
              >
                <span>{tab.name.toUpperCase()}</span>
                <span
                  style={{
                    fontSize: '0.72rem',
                    fontWeight: 800,
                    padding: '2px 7px',
                    borderRadius: '9999px',
                    backgroundColor: isActive
                      ? 'rgba(255, 255, 255, 0.28)'
                      : 'rgba(139, 92, 246, 0.15)',
                    color: isActive ? '#ffffff' : '#8b5cf6',
                  }}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Pages Cards Grid */}
      {filteredPages.length === 0 ? (
        <div className="card" style={{ padding: '3rem', textAlign: 'center' }}>
          <FileText size={48} color="var(--text-muted)" style={{ marginBottom: '1rem' }} />
          <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>No secure pages found</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Use the floating (+) button at the bottom right corner to add a new secure page.
          </p>
        </div>
      ) : (
        <>
          <div className="grid-cols-2">
            {filteredPages.slice(0, visibleCount).map((item, index) => (
            <div
              key={item.id ? `${item.id}_${index}` : `page_${index}`}
              className="card"
              onClick={() => {
                incrementPageView(item.id);
                setDetailModalData({ id: item.id, type: 'page' });
              }}
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem',
                position: 'relative',
                cursor: 'pointer',
                borderRadius: '18px',
                padding: '1.25rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.75rem' }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem', flexWrap: 'wrap' }}>
                    <span className="badge badge-accent">{getTabName(item.tabId)}</span>
                    {item.status === 'Draft' && (
                      <span className="badge" style={{ backgroundColor: 'rgba(234, 179, 8, 0.2)', color: '#ca8a04', border: '1px solid rgba(234, 179, 8, 0.4)', fontWeight: 800 }}>
                        📁 DRAFT
                      </span>
                    )}
                    {item.isCodeMode && (
                      <span className="badge badge-primary">
                        <Code size={12} style={{ marginRight: '0.2rem' }} /> Monospace Code
                      </span>
                    )}
                  </div>

                  {/* Page Title with Ellipsis Truncation */}
                  <div style={{ width: '100%', minWidth: 0, overflow: 'hidden' }}>
                    <h3
                      style={{
                        fontSize: '1.1rem',
                        lineHeight: 1.3,
                        margin: 0,
                        fontWeight: 800,
                        color: 'var(--text-primary)',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        maxWidth: '100%',
                      }}
                      title={item.title}
                    >
                      {item.title}
                    </h3>
                  </div>
                </div>
              </div>

              {/* Content Snippet */}
              <div
                className={item.isCodeMode ? 'code-block' : ''}
                style={{
                  height: '130px',
                  maxHeight: '130px',
                  overflowY: 'auto',
                  fontSize: '0.85rem',
                  color: 'var(--text-secondary)',
                  backgroundColor: 'var(--bg-primary)',
                  padding: '0.85rem',
                  borderRadius: '12px',
                  border: '1px solid var(--border-color)',
                  wordBreak: 'break-word',
                  whiteSpace: 'pre-wrap',
                }}
                dangerouslySetInnerHTML={{
                  __html: item.content || 'Empty document body.'
                }}
              />

              {/* Attachments Summary Badge */}
              {item.attachments && item.attachments.length > 0 && (
                <div style={{ marginTop: '0.2rem' }}>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      incrementPageView(item.id);
                      setDetailModalData({ id: item.id, type: 'page' });
                    }}
                    className="btn btn-secondary"
                    style={{
                      padding: '0.35rem 0.75rem',
                      fontSize: '0.78rem',
                      fontWeight: 700,
                      borderRadius: '10px',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                      backgroundColor: 'rgba(255, 94, 54, 0.08)',
                      color: '#ff5e36',
                      border: '1px solid rgba(255, 94, 54, 0.2)',
                      cursor: 'pointer',
                    }}
                    title="Click to view all attachments"
                  >
                    <Paperclip size={14} />
                    <span>ATTACHMENTS ({item.attachments.length})</span>
                    <Eye size={13} style={{ marginLeft: '0.15rem', opacity: 0.8 }} />
                  </button>
                </div>
              )}

              {/* Card Footer */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  paddingTop: '0.75rem',
                  borderTop: '1px solid var(--border-color)',
                  fontSize: '0.75rem',
                  color: 'var(--text-muted)',
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
                  <span>
                    {item.dateString} •{' '}
                    <strong style={{ color: 'var(--text-primary)', fontWeight: 800 }}>
                      {formatItemSize(item.content, item.title, item.attachments)}
                    </strong>
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      openPageEditor(item.id);
                    }}
                    className="btn-icon"
                    style={{ width: '30px', height: '30px' }}
                    title="Edit Page"
                  >
                    <Edit size={14} />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(item);
                    }}
                    className="btn-icon"
                    style={{ width: '30px', height: '30px', color: 'var(--danger)' }}
                    title="Delete Page"
                  >
                    <Trash2 size={14} />
                  </button>
                  <span
                    style={{
                      fontSize: '0.75rem',
                      fontWeight: 800,
                      color: '#8b5cf6',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.2rem',
                      backgroundColor: 'rgba(139, 92, 246, 0.1)',
                      padding: '2px 7px',
                      borderRadius: '6px',
                    }}
                    title="Real-time Views"
                  >
                    <Eye size={12} color="#8b5cf6" />
                    <span>{item.views || 0}</span>
                  </span>
                </div>
              </div>
            </div>
          ))}
          </div>

          {/* See More Pagination Button */}
          {visibleCount < filteredPages.length && (
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
                <span>SEE MORE ({filteredPages.length - visibleCount} REMAINING)</span>
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};
