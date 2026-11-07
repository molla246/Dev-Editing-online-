import React from 'react';
import { useApp } from '../../context/AppContext';
import { X, FileText, Code, Paperclip, Download, Edit, Trash2, Calendar, Copy } from 'lucide-react';
import { extractFormattedText } from '../../utils/formatUtils';
import { getFileCategoryIcon, formatFileSize } from '../../utils/fileUtils';

export const PageDetailModal: React.FC = () => {
  const {
    detailModalData,
    setDetailModalData,
    pages,
    pageTabs,
    openPageEditor,
    deletePageItem,
    showConfirmModal,
    addToast,
    setImageViewerData,
  } = useApp();

  if (!detailModalData || detailModalData.type !== 'page') return null;

  const item = pages.find((p) => p.id === detailModalData.id);
  if (!item) return null;

  const handleClose = () => setDetailModalData(null);

  const handleCopyContent = () => {
    if (!item.content) {
      addToast('No content to copy', 'warning');
      return;
    }

    const cleanText = extractFormattedText(item.content);

    if (!cleanText) {
      addToast('No text content to copy (only images in post)', 'warning');
      return;
    }

    navigator.clipboard.writeText(cleanText)
      .then(() => {
        addToast('Copied to clipboard', 'success');
      })
      .catch(() => {
        addToast('Failed to copy content', 'error');
      });
  };

  const getTabName = (tabId: string) => {
    const found = pageTabs.find((t) => t.id === tabId);
    return found ? found.name : 'GENERAL';
  };

  const handleDelete = () => {
    handleClose();
    showConfirmModal(
      'Delete Secure Page',
      `Are you sure you want to delete page "${item.title}"?`,
      () => deletePageItem(item.id),
      true
    );
  };

  return (
    <div className="modal-overlay">
      <div className="modal-container" style={{ maxWidth: '680px' }}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <FileText size={22} color="var(--accent)" />
            <div>
              <h3 style={{ fontSize: '1.1rem' }}>{item.title}</h3>
              <div style={{ display: 'flex', gap: '0.4rem', marginTop: '0.2rem' }}>
                <span className="badge badge-accent">{getTabName(item.tabId)}</span>
                {item.isCodeMode && (
                  <span className="badge badge-primary">
                    <Code size={12} style={{ marginRight: '0.2rem' }} /> Code Mode
                  </span>
                )}
              </div>
            </div>
          </div>
          <button className="btn-icon" onClick={handleClose}>
            <X size={18} />
          </button>
        </div>

        <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Content Box */}
          <div
            className={`page-detail-content ${item.isCodeMode ? 'code-block' : ''}`}
            onClick={(e) => {
              const target = e.target as HTMLElement;
              if (target && target.tagName === 'IMG') {
                const imgEl = target as HTMLImageElement;
                const url = imgEl.src || imgEl.getAttribute('src') || '';
                const alt = imgEl.alt || item.title || 'Note Attachment';
                if (url) {
                  setImageViewerData({ url, title: alt });
                }
              }
            }}
            style={{
              padding: '1.25rem',
              borderRadius: '16px',
              backgroundColor: 'var(--bg-primary)',
              border: '1px solid var(--border-color)',
              fontSize: '0.92rem',
              lineHeight: 1.6,
              minHeight: '140px',
              maxHeight: '52dvh',
              overflowY: 'auto',
              wordBreak: 'break-word',
              whiteSpace: 'pre-wrap',
              cursor: 'pointer',
            }}
            dangerouslySetInnerHTML={{
              __html: item.content || 'Empty document.'
            }}
          />

          {/* File Attachments Download Cards */}
          {item.attachments && item.attachments.length > 0 && (
            <div>
              <h5 style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                FILE ATTACHMENTS ({item.attachments.length})
              </h5>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.6rem' }}>
                {item.attachments.map((att, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
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
                    }}
                    className="btn btn-secondary"
                    style={{
                      padding: '0.5rem 0.85rem',
                      fontSize: '0.85rem',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                      maxWidth: '100%',
                      overflow: 'hidden',
                    }}
                  >
                    {getFileCategoryIcon(att.type, att.name, 16)}
                    <span
                      style={{
                        maxWidth: '220px',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                      title={att.name}
                    >
                      {att.name}
                    </span>
                    {att.size ? (
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', flexShrink: 0 }}>
                        ({formatFileSize(att.size)})
                      </span>
                    ) : null}
                    <Download size={14} style={{ flexShrink: 0 }} />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Metadata */}
          <div style={{ display: 'flex', gap: '1.5rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <Calendar size={14} /> Created: {item.dateString}
            </span>
            <span>Views: {item.views}</span>
          </div>
        </div>

        <div className="modal-footer modal-footer-between">
          <button onClick={handleDelete} className="btn btn-danger">
            <Trash2 size={16} />
            <span>Delete Page</span>
          </button>

          <div className="modal-footer-actions">
            <button onClick={handleCopyContent} className="btn btn-secondary">
              <Copy size={16} color="var(--primary)" />
              <span>Copy Content</span>
            </button>

            <button
              onClick={() => {
                handleClose();
                openPageEditor(item.id);
              }}
              className="btn btn-primary"
            >
              <Edit size={16} />
              <span>Edit Page</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
