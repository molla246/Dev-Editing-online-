import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import {
  X,
  Lock,
  Eye,
  EyeOff,
  Key,
  Plus,
  Trash2,
  Save,
  ChevronDown,
  ChevronUp,
  Check,
  Tag,
  FileText,
  Loader2,
  FolderPlus,
  AlertCircle,
} from 'lucide-react';
import { DynamicNote, PasswordItem } from '../../types';
import { PasswordAvatar } from '../PasswordAvatar';
import { getFaviconUrl } from '../../utils/favicon';

export const PasswordEditorModal: React.FC = () => {
  const {
    isPasswordEditorOpen,
    passwordEditorId,
    closePasswordEditor,
    passwords,
    labels,
    savePasswordItem,
    setIsPasswordGeneratorOpen,
    addToast,
  } = useApp();

  const [title, setTitle] = useState<string>('');
  const [siteUrl, setSiteUrl] = useState<string>('');
  const [userId, setUserId] = useState<string>('');
  const [audioUrl, setAudioUrl] = useState<string>(''); // Main Password String
  const [posterUrl, setPosterUrl] = useState<string>('');
  const [status, setStatus] = useState<'Published' | 'Draft'>('Published');
  const [selectedLabels, setSelectedLabels] = useState<string[]>([]);
  const [dynamicNotes, setDynamicNotes] = useState<DynamicNote[]>([]);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [isLabelDropdownOpen, setIsLabelDropdownOpen] = useState<boolean>(false);
  const [submittingAction, setSubmittingAction] = useState<'draft' | 'publish' | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    setSubmittingAction(null);
    setErrorMessage(null);
    if (passwordEditorId) {
      const existing = passwords.find((p) => p.id === passwordEditorId);
      if (existing) {
        setTitle(existing.title);
        setSiteUrl(existing.siteUrl || '');
        setUserId(existing.userId || '');
        setAudioUrl(existing.audioUrl || '');
        setPosterUrl(existing.posterUrl || '');
        setStatus(existing.status || 'Published');
        setSelectedLabels(existing.labels || []);
        setDynamicNotes(existing.dynamicNotes || []);
      }
    } else {
      setTitle('');
      setSiteUrl('');
      setUserId('');
      setAudioUrl('');
      setPosterUrl('');
      setStatus('Published');
      setSelectedLabels([]);
      setDynamicNotes([]);
      setIsLabelDropdownOpen(false);
    }
  }, [passwordEditorId, isPasswordEditorOpen]);

  // 30-second Autosave timer to Drafts collection
  useEffect(() => {
    if (!isPasswordEditorOpen) return;

    const timer = setInterval(() => {
      if (title.trim() || audioUrl.trim() || userId.trim()) {
        savePasswordItem({
          id: passwordEditorId || undefined,
          title: title.trim() || 'Untitled Password Draft',
          siteUrl: siteUrl.trim(),
          userId: userId.trim(),
          audioUrl: audioUrl.trim(),
          posterUrl: posterUrl.trim(),
          status: 'Draft',
          labels: selectedLabels,
          dynamicNotes: dynamicNotes.filter((n) => n.val.trim() || n.name.trim()),
        });
        addToast('Autosaved draft to Firebase', 'info');
      }
    }, 30000);

    return () => clearInterval(timer);
  }, [isPasswordEditorOpen, passwordEditorId, title, siteUrl, userId, audioUrl, posterUrl, selectedLabels, dynamicNotes]);

  if (!isPasswordEditorOpen) return null;

  const handleToggleLabel = (labelName: string) => {
    setSelectedLabels((prev) =>
      prev.includes(labelName) ? prev.filter((l) => l !== labelName) : [...prev, labelName]
    );
  };

  const handleAddDynamicNote = () => {
    setDynamicNotes((prev) => [...prev, { name: `Note ${prev.length + 1}`, val: '' }]);
  };

  const handleUpdateDynamicNoteValue = (index: number, value: string) => {
    setDynamicNotes((prev) => {
      const next = [...prev];
      next[index].val = value;
      return next;
    });
  };

  const handleRemoveDynamicNote = (index: number) => {
    setDynamicNotes((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSaveDraft = async () => {
    if (submittingAction) return;
    const draftTitle = title.trim() || 'Untitled Password Draft';
    setSubmittingAction('draft');
    setErrorMessage(null);
    try {
      const res = await savePasswordItem({
        id: passwordEditorId || undefined,
        title: draftTitle,
        siteUrl: siteUrl.trim(),
        userId: userId.trim(),
        audioUrl: audioUrl.trim(),
        posterUrl: posterUrl.trim(),
        status: 'Draft',
        labels: selectedLabels,
        dynamicNotes: dynamicNotes.filter((n) => n.val.trim() || n.name.trim()),
      });

      if (res && res.success === false) {
        setErrorMessage(`Failed to save draft to Firebase: ${res.error || 'Firebase write failed'}`);
        addToast(`Draft save failed: ${res.error || 'Firebase update failed'}`, 'error');
        setSubmittingAction(null);
        return;
      }

      closePasswordEditor();
    } catch (err: any) {
      setSubmittingAction(null);
      setErrorMessage(`Failed to save draft to Firebase: ${err?.message || 'Unknown error'}`);
      addToast(`Save draft failed: ${err?.message || 'Unknown error'}`, 'error');
    }
  };

  const handleCloseWithAutoDraft = () => {
    if (!passwordEditorId && (title.trim() || audioUrl.trim() || userId.trim())) {
      handleSaveDraft().catch(() => {});
    }
    closePasswordEditor();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || submittingAction) return;

    setSubmittingAction('publish');
    setErrorMessage(null);
    try {
      const dateFormatted = new Date().toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });
      const res = await savePasswordItem({
        id: passwordEditorId || undefined,
        title: title.trim(),
        siteUrl: siteUrl.trim(),
        userId: userId.trim(),
        audioUrl: audioUrl.trim(),
        posterUrl: posterUrl.trim(),
        status: 'Published',
        dateString: dateFormatted,
        labels: selectedLabels,
        dynamicNotes: dynamicNotes.filter((n) => n.val.trim() || n.name.trim()),
      });

      if (res && res.success === false) {
        setErrorMessage(`Failed to update Firebase: ${res.error || 'Firebase write failed'}`);
        addToast(`Save failed: ${res.error || 'Firebase write failed'}`, 'error');
        setSubmittingAction(null);
        return;
      }

      closePasswordEditor();
    } catch (err: any) {
      setSubmittingAction(null);
      setErrorMessage(`Failed to update Firebase: ${err?.message || 'Unknown error'}`);
      addToast(`Save failed: ${err?.message || 'Unknown error'}`, 'error');
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-container" style={{ maxWidth: '640px' }}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Lock size={20} color="var(--primary)" />
            <h3 style={{ fontSize: '1.1rem' }}>
              {passwordEditorId ? 'Edit Password Record' : 'Add New Password Record'}
            </h3>
          </div>
          <button className="btn-icon" onClick={handleCloseWithAutoDraft}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {errorMessage && (
              <div
                style={{
                  padding: '0.75rem 1rem',
                  borderRadius: '10px',
                  backgroundColor: 'rgba(239, 68, 68, 0.12)',
                  border: '1px solid rgba(239, 68, 68, 0.4)',
                  color: '#ef4444',
                  fontSize: '0.85rem',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.6rem',
                }}
              >
                <AlertCircle size={20} style={{ flexShrink: 0 }} />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Title */}
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Item Title *</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Google Workspace Admin, Chase Bank"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            <div className="grid-cols-2">
              {/* Site URL */}
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Site / Service URL</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="https://example.com"
                  value={siteUrl}
                  onChange={(e) => setSiteUrl(e.target.value)}
                />
              </div>

              {/* Username / User ID */}
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">User ID / Email / Username</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="admin@company.com"
                  value={userId}
                  onChange={(e) => setUserId(e.target.value)}
                />
              </div>
            </div>

            {/* Password String Field */}
            <div className="form-group" style={{ marginBottom: 0 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label className="form-label">Password String</label>
                <button
                  type="button"
                  onClick={() => setIsPasswordGeneratorOpen(true)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--primary)',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.25rem',
                  }}
                >
                  <Key size={12} />
                  <span>Password Generator</span>
                </button>
              </div>

              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="form-input"
                  style={{ paddingRight: '2.5rem', fontFamily: 'var(--font-mono)' }}
                  placeholder="Enter secret password string"
                  value={audioUrl}
                  onChange={(e) => setAudioUrl(e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '0.75rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    color: 'var(--text-muted)',
                    cursor: 'pointer',
                  }}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Thumbnail URL */}
            <div className="form-group" style={{ marginBottom: 0 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label className="form-label">IMAGE THUMBNAIL / FAVICON URL</label>
                {(siteUrl || title || posterUrl) && (
                  <button
                    type="button"
                    onClick={() => {
                      const autoFav = getFaviconUrl(siteUrl || posterUrl) || getFaviconUrl(title);
                      if (autoFav) setPosterUrl(autoFav);
                    }}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--primary)',
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                  >
                    + Auto-Set Favicon URL
                  </button>
                )}
              </div>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <input
                  type="text"
                  className="form-input"
                  style={{ flex: 1 }}
                  placeholder="https://... (Leave blank for automatic website favicon)"
                  value={posterUrl}
                  onChange={(e) => setPosterUrl(e.target.value)}
                />
                
                {/* Live Icon Preview Badge */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexShrink: 0 }}>
                  <PasswordAvatar
                    posterUrl={posterUrl}
                    siteUrl={siteUrl}
                    title={title || 'Icon'}
                    size={38}
                  />
                </div>
              </div>

              {/* Status Hint */}
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.3rem', fontWeight: 600 }}>
                {posterUrl ? (
                  <span style={{ color: '#10b981' }}>✓ Favicon / Image active from URL</span>
                ) : siteUrl || title ? (
                  <span style={{ color: '#3b82f6' }}>✓ Automatic website favicon active for {siteUrl || title}</span>
                ) : (
                  <span>Enter website URL, domain, or title above to automatically load favicon</span>
                )}
              </div>
            </div>

            {/* Associated Label Tags Dropdown Selector */}
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Associated Label Tags</label>
              
              {/* Dropdown Trigger Box */}
              <button
                type="button"
                onClick={() => setIsLabelDropdownOpen(!isLabelDropdownOpen)}
                className="form-input"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  cursor: 'pointer',
                  backgroundColor: 'var(--bg-primary)',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  color: 'var(--text-primary)',
                  textAlign: 'left',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', overflow: 'hidden' }}>
                  <Tag size={16} color="#a822f6" />
                  <span>
                    {selectedLabels.length === 0
                      ? 'Click to select label tags...'
                      : `${selectedLabels.length} Label Tag${selectedLabels.length === 1 ? '' : 's'} Selected`}
                  </span>
                </div>
                {isLabelDropdownOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>

              {/* Expandable Options List */}
              {isLabelDropdownOpen && (
                <div
                  style={{
                    marginTop: '0.4rem',
                    padding: '0.75rem',
                    borderRadius: '12px',
                    backgroundColor: 'var(--bg-primary)',
                    border: '1px solid var(--border-color)',
                    maxHeight: '180px',
                    overflowY: 'auto',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.35rem',
                    boxShadow: 'var(--shadow-sm)',
                  }}
                >
                  {labels.length === 0 ? (
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      No labels created yet. Go to Labels view to add options.
                    </span>
                  ) : (
                    labels.map((lbl) => {
                      const isSelected = selectedLabels.includes(lbl.name);
                      return (
                        <div
                          key={lbl.id}
                          onClick={() => handleToggleLabel(lbl.name)}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '0.45rem 0.65rem',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            backgroundColor: isSelected ? 'rgba(168, 34, 246, 0.12)' : 'transparent',
                            color: isSelected ? '#a822f6' : 'var(--text-primary)',
                            fontWeight: isSelected ? 800 : 600,
                            fontSize: '0.82rem',
                            transition: 'all 0.15s ease',
                          }}
                        >
                          <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                            <Tag size={13} />
                            {lbl.name}
                          </span>
                          {isSelected && <Check size={16} color="#a822f6" />}
                        </div>
                      );
                    })
                  )}
                </div>
              )}

              {/* Selected Chips Display */}
              {selectedLabels.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', marginTop: '0.5rem' }}>
                  {selectedLabels.map((lbl) => (
                    <span
                      key={lbl}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.3rem',
                        backgroundColor: 'rgba(168, 34, 246, 0.15)',
                        border: '1px solid rgba(168, 34, 246, 0.3)',
                        color: '#a822f6',
                        fontSize: '0.78rem',
                        fontWeight: 800,
                        padding: '0.2rem 0.55rem',
                        borderRadius: '9999px',
                      }}
                    >
                      <span>{lbl}</span>
                      <X
                        size={12}
                        style={{ cursor: 'pointer' }}
                        onClick={() => handleToggleLabel(lbl)}
                      />
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Add Note Field Section */}
            <div className="form-group" style={{ marginBottom: 0 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <label className="form-label" style={{ marginBottom: 0 }}>Notes</label>
                <button
                  type="button"
                  onClick={handleAddDynamicNote}
                  className="btn btn-secondary"
                  style={{ padding: '0.25rem 0.65rem', fontSize: '0.75rem', borderRadius: '10px' }}
                >
                  <Plus size={14} />
                  <span>Add Note Field</span>
                </button>
              </div>

              {dynamicNotes.length === 0 ? (
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontStyle: 'italic', margin: 0 }}>
                  Click "Add Note Field" to create a note text box.
                </p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                  {dynamicNotes.map((note, index) => (
                    <div key={index} style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
                      <textarea
                        className="form-input"
                        placeholder="Write your note here..."
                        style={{ flex: 1, fontSize: '0.85rem', minHeight: '60px', resize: 'vertical' }}
                        value={note.val}
                        onChange={(e) => handleUpdateDynamicNoteValue(index, e.target.value)}
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveDynamicNote(index)}
                        style={{
                          background: 'rgba(239, 68, 68, 0.1)',
                          border: 'none',
                          color: 'var(--danger)',
                          cursor: 'pointer',
                          padding: '0.5rem',
                          borderRadius: '8px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          marginTop: '2px',
                        }}
                        title="Delete Note Box"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="modal-footer" style={{ flexWrap: 'wrap', gap: '0.5rem' }}>
            <button type="button" onClick={handleCloseWithAutoDraft} className="btn btn-secondary" disabled={!!submittingAction}>
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSaveDraft}
              className="btn btn-secondary"
              style={{
                borderColor: '#eab308',
                color: '#ca8a04',
                backgroundColor: 'rgba(234, 179, 8, 0.1)',
                fontWeight: 700,
              }}
              disabled={!!submittingAction}
            >
              {submittingAction === 'draft' ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>Saving Draft...</span>
                </>
              ) : (
                <>
                  <FolderPlus size={16} color="#ca8a04" />
                  <span>Save as Draft</span>
                </>
              )}
            </button>
            <button type="submit" className="btn btn-primary" style={{ whiteSpace: 'nowrap', minWidth: '140px' }} disabled={!!submittingAction}>
              {submittingAction === 'publish' ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save size={16} />
                  <span>{passwordEditorId ? 'Update & Publish' : 'Save & Publish'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
