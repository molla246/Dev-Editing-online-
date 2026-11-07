import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  X,
  FolderPlus,
  Lock,
  FileText,
  Trash2,
  Edit,
  CheckCircle,
  Clock,
  Search,
} from 'lucide-react';
import { PasswordItem, PageItem } from '../../types';

export const DraftManagerModal: React.FC = () => {
  const {
    isDraftManagerOpen,
    setIsDraftManagerOpen,
    passwords,
    pages,
    savePasswordItem,
    savePageItem,
    deletePasswordItem,
    deletePageItem,
    openPasswordEditor,
    openPageEditor,
    showConfirmModal,
    addToast,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'all' | 'passwords' | 'pages'>('all');
  const [filterQuery, setFilterQuery] = useState<string>('');

  if (!isDraftManagerOpen) return null;

  const draftPasswords = passwords.filter((p) => p.status === 'Draft' || (p.status as string) === 'draft');
  const draftPages = pages.filter((p) => p.status === 'Draft' || (p.status as string) === 'draft');

  const filteredPasswords = draftPasswords.filter(
    (p) =>
      p.title.toLowerCase().includes(filterQuery.toLowerCase()) ||
      (p.userId && p.userId.toLowerCase().includes(filterQuery.toLowerCase()))
  );

  const filteredPages = draftPages.filter((p) =>
    p.title.toLowerCase().includes(filterQuery.toLowerCase())
  );

  const totalDrafts = draftPasswords.length + draftPages.length;

  const handlePublishPassword = async (p: PasswordItem) => {
    try {
      const res = await savePasswordItem({ ...p, status: 'Published' });
      if (res && res.success === false) {
        addToast(`Publish failed: ${res.error || 'Firebase write error'}`, 'error');
        return;
      }
      addToast(`Published password draft: "${p.title || 'Untitled'}"`, 'success');
    } catch (e: any) {
      addToast(`Publish error: ${e?.message || 'Error'}`, 'error');
    }
  };

  const handlePublishPage = async (pg: PageItem) => {
    try {
      const res = await savePageItem({ ...pg, status: 'Published' });
      if (res && res.success === false) {
        addToast(`Publish failed: ${res.error || 'Firebase write error'}`, 'error');
        return;
      }
      addToast(`Published page draft: "${pg.title || 'Untitled'}"`, 'success');
    } catch (e: any) {
      addToast(`Publish error: ${e?.message || 'Error'}`, 'error');
    }
  };

  const handleDeletePassword = (p: PasswordItem) => {
    showConfirmModal(
      'Delete Draft Confirmation',
      `Are you sure you want to delete password draft "${p.title || 'Untitled'}"?`,
      async () => {
        try {
          await deletePasswordItem(p.id);
          addToast(`Deleted password draft: "${p.title || 'Untitled'}"`, 'info');
        } catch (e: any) {
          addToast(`Delete draft error: ${e?.message || 'Error'}`, 'error');
        }
      },
      false
    );
  };

  const handleDeletePage = (pg: PageItem) => {
    showConfirmModal(
      'Delete Draft Confirmation',
      `Are you sure you want to delete page draft "${pg.title || 'Untitled'}"?`,
      async () => {
        try {
          await deletePageItem(pg.id);
          addToast(`Deleted notebook draft: "${pg.title || 'Untitled'}"`, 'info');
        } catch (e: any) {
          addToast(`Delete draft error: ${e?.message || 'Error'}`, 'error');
        }
      },
      false
    );
  };

  return (
    <div className="modal-overlay" style={{ zIndex: 100 }}>
      <div className="modal-container" style={{ maxWidth: '720px', width: '92dvw', maxHeight: '90dvh', display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                backgroundColor: 'rgba(234, 179, 8, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ca8a04',
              }}
            >
              <FolderPlus size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, margin: 0 }}>Draft Manager</h3>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: '0.15rem 0 0 0' }}>
                {totalDrafts} saved draft {totalDrafts === 1 ? 'entry' : 'entries'} pending publication
              </p>
            </div>
          </div>
          <button className="btn-icon" onClick={() => setIsDraftManagerOpen(false)} title="Close Draft Manager">
            <X size={18} />
          </button>
        </div>

        {/* Search & Tabs Toolbar */}
        <div style={{ padding: '0.85rem 1.25rem', borderBottom: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '0.75rem', backgroundColor: 'var(--bg-secondary)' }}>
          {/* Search Box */}
          <div style={{ position: 'relative' }}>
            <Search size={16} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              type="text"
              className="form-input"
              placeholder="Search drafts..."
              value={filterQuery}
              onChange={(e) => setFilterQuery(e.target.value)}
              style={{ paddingLeft: '2.4rem', fontSize: '0.88rem', borderRadius: '12px' }}
            />
          </div>

          {/* Filter Tabs */}
          <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', scrollbarWidth: 'none', paddingBottom: '2px' }}>
            <button
              onClick={() => setActiveTab('all')}
              style={{
                padding: '0.45rem 0.95rem',
                borderRadius: '9999px',
                fontSize: '0.8rem',
                fontWeight: 800,
                border: activeTab === 'all' ? 'none' : '1px solid var(--border-color)',
                backgroundColor: activeTab === 'all' ? '#ca8a04' : 'var(--bg-primary)',
                color: activeTab === 'all' ? '#ffffff' : 'var(--text-primary)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
                whiteSpace: 'nowrap',
                flexShrink: 0,
              }}
            >
              <span>ALL DRAFTS</span>
              <span style={{ fontSize: '0.72rem', opacity: 0.85, backgroundColor: 'rgba(255,255,255,0.25)', padding: '1px 6px', borderRadius: '8px' }}>
                {totalDrafts}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('passwords')}
              style={{
                padding: '0.45rem 0.95rem',
                borderRadius: '9999px',
                fontSize: '0.8rem',
                fontWeight: 800,
                border: activeTab === 'passwords' ? 'none' : '1px solid var(--border-color)',
                backgroundColor: activeTab === 'passwords' ? '#ca8a04' : 'var(--bg-primary)',
                color: activeTab === 'passwords' ? '#ffffff' : 'var(--text-primary)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
                whiteSpace: 'nowrap',
                flexShrink: 0,
              }}
            >
              <Lock size={13} />
              <span>PASSWORDS</span>
              <span style={{ fontSize: '0.72rem', opacity: 0.85, backgroundColor: 'rgba(255,255,255,0.25)', padding: '1px 6px', borderRadius: '8px' }}>
                {draftPasswords.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('pages')}
              style={{
                padding: '0.45rem 0.95rem',
                borderRadius: '9999px',
                fontSize: '0.8rem',
                fontWeight: 800,
                border: activeTab === 'pages' ? 'none' : '1px solid var(--border-color)',
                backgroundColor: activeTab === 'pages' ? '#ca8a04' : 'var(--bg-primary)',
                color: activeTab === 'pages' ? '#ffffff' : 'var(--text-primary)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
                whiteSpace: 'nowrap',
                flexShrink: 0,
              }}
            >
              <FileText size={13} />
              <span>PAGES</span>
              <span style={{ fontSize: '0.72rem', opacity: 0.85, backgroundColor: 'rgba(255,255,255,0.25)', padding: '1px 6px', borderRadius: '8px' }}>
                {draftPages.length}
              </span>
            </button>
          </div>
        </div>

        {/* Body List */}
        <div style={{ padding: '1rem', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          {totalDrafts === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-muted)' }}>
              <FolderPlus size={48} style={{ marginBottom: '0.75rem', opacity: 0.5 }} />
              <h4 style={{ margin: 0, fontSize: '1.1rem' }}>No Active Drafts</h4>
              <p style={{ fontSize: '0.85rem', marginTop: '0.35rem' }}>
                All your password entries and notes are published.
              </p>
            </div>
          ) : (
            <>
              {/* Password Drafts */}
              {(activeTab === 'all' || activeTab === 'passwords') &&
                filteredPasswords.map((p) => (
                  <div
                    key={p.id}
                    style={{
                      padding: '1rem',
                      borderRadius: '16px',
                      backgroundColor: 'var(--bg-primary)',
                      border: '1px solid var(--border-color)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.75rem',
                      boxShadow: 'var(--shadow-sm)',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem', flexWrap: 'wrap' }}>
                      <span className="badge" style={{ backgroundColor: 'rgba(59, 130, 246, 0.15)', color: '#3b82f6', fontSize: '0.72rem', fontWeight: 800 }}>
                        <Lock size={11} style={{ marginRight: '0.2rem' }} /> PASSWORD DRAFT
                      </span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <Clock size={12} /> {p.dateString}
                      </span>
                    </div>

                    <div>
                      <h4 style={{ fontSize: '1.02rem', fontWeight: 800, margin: 0, wordBreak: 'break-word', color: 'var(--text-primary)' }}>
                        {p.title || 'Untitled Password Draft'}
                      </h4>
                      {p.userId && (
                        <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', margin: '0.25rem 0 0 0' }}>
                          User: <span style={{ fontWeight: 600 }}>{p.userId}</span>
                        </p>
                      )}
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.5rem', paddingTop: '0.35rem', borderTop: '1px dashed var(--border-color)' }}>
                      <button
                        onClick={() => {
                          setIsDraftManagerOpen(false);
                          openPasswordEditor(p.id);
                        }}
                        className="btn btn-secondary"
                        style={{ padding: '0.45rem 0.85rem', fontSize: '0.8rem', borderRadius: '10px', fontWeight: 700 }}
                        title="Edit Draft"
                      >
                        <Edit size={14} />
                        <span>Edit</span>
                      </button>

                      <button
                        onClick={() => handlePublishPassword(p)}
                        className="btn btn-primary"
                        style={{ padding: '0.45rem 0.85rem', fontSize: '0.8rem', borderRadius: '10px', backgroundColor: '#10b981', borderColor: '#10b981', fontWeight: 800 }}
                        title="Publish Draft"
                      >
                        <CheckCircle size={14} />
                        <span>Publish</span>
                      </button>

                      <button
                        onClick={() => handleDeletePassword(p)}
                        className="btn btn-secondary"
                        style={{ padding: '0.45rem 0.75rem', fontSize: '0.8rem', borderRadius: '10px', color: '#ef4444', borderColor: 'rgba(239, 68, 68, 0.3)', backgroundColor: 'rgba(239, 68, 68, 0.08)' }}
                        title="Delete Draft"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                ))}

              {/* Page Drafts */}
              {(activeTab === 'all' || activeTab === 'pages') &&
                filteredPages.map((pg) => (
                  <div
                    key={pg.id}
                    style={{
                      padding: '1rem',
                      borderRadius: '16px',
                      backgroundColor: 'var(--bg-primary)',
                      border: '1px solid var(--border-color)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.75rem',
                      boxShadow: 'var(--shadow-sm)',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem', flexWrap: 'wrap' }}>
                      <span className="badge" style={{ backgroundColor: 'rgba(139, 92, 246, 0.15)', color: '#8b5cf6', fontSize: '0.72rem', fontWeight: 800 }}>
                        <FileText size={11} style={{ marginRight: '0.2rem' }} /> NOTEBOOK DRAFT
                      </span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <Clock size={12} /> {pg.dateString}
                      </span>
                    </div>

                    <div>
                      <h4 style={{ fontSize: '1.02rem', fontWeight: 800, margin: 0, wordBreak: 'break-word', color: 'var(--text-primary)' }}>
                        {pg.title || 'Untitled Page Draft'}
                      </h4>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.5rem', paddingTop: '0.35rem', borderTop: '1px dashed var(--border-color)' }}>
                      <button
                        onClick={() => {
                          setIsDraftManagerOpen(false);
                          openPageEditor(pg.id);
                        }}
                        className="btn btn-secondary"
                        style={{ padding: '0.45rem 0.85rem', fontSize: '0.8rem', borderRadius: '10px', fontWeight: 700 }}
                        title="Edit Draft"
                      >
                        <Edit size={14} />
                        <span>Edit</span>
                      </button>

                      <button
                        onClick={() => handlePublishPage(pg)}
                        className="btn btn-primary"
                        style={{ padding: '0.45rem 0.85rem', fontSize: '0.8rem', borderRadius: '10px', backgroundColor: '#10b981', borderColor: '#10b981', fontWeight: 800 }}
                        title="Publish Draft"
                      >
                        <CheckCircle size={14} />
                        <span>Publish</span>
                      </button>

                      <button
                        onClick={() => handleDeletePage(pg)}
                        className="btn btn-secondary"
                        style={{ padding: '0.45rem 0.75rem', fontSize: '0.8rem', borderRadius: '10px', color: '#ef4444', borderColor: 'rgba(239, 68, 68, 0.3)', backgroundColor: 'rgba(239, 68, 68, 0.08)' }}
                        title="Delete Draft"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                ))}
            </>
          )}
        </div>

        {/* Modal Footer */}
        <div className="modal-footer" style={{ justifyContent: 'flex-end' }}>
          <button className="btn btn-secondary" onClick={() => setIsDraftManagerOpen(false)}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
