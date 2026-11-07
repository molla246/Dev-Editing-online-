import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { X, RefreshCw, Replace, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

export const ReplaceModal: React.FC = () => {
  const {
    isReplaceModalOpen,
    setIsReplaceModalOpen,
    passwords,
    setPasswords,
    pages,
    setPages,
    addToast,
    addLog,
  } = useApp();

  const [findText, setFindText] = useState<string>('');
  const [replaceText, setReplaceText] = useState<string>('');
  const [targetScope, setTargetScope] = useState<'all' | 'passwords' | 'pages'>('all');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  if (!isReplaceModalOpen) return null;

  // Calculate live matches
  let passwordMatches = 0;
  let pageMatches = 0;

  if (findText.trim()) {
    const q = findText;
    if (targetScope === 'all' || targetScope === 'passwords') {
      passwords.forEach((p) => {
        if (p.title.includes(q)) passwordMatches++;
        if (p.userId && p.userId.includes(q)) passwordMatches++;
        if (p.siteUrl && p.siteUrl.includes(q)) passwordMatches++;
        if (p.note && p.note.includes(q)) passwordMatches++;
      });
    }
    if (targetScope === 'all' || targetScope === 'pages') {
      pages.forEach((pg) => {
        if (pg.title.includes(q)) pageMatches++;
        if (pg.content && pg.content.includes(q)) pageMatches++;
      });
    }
  }

  const totalMatches = passwordMatches + pageMatches;

  const handleExecuteReplace = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!findText.trim() || isSubmitting) {
      addToast('Please enter text to find', 'warning');
      return;
    }

    setIsSubmitting(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 500));
      let passReplacedCount = 0;
      let pageReplacedCount = 0;

    if (targetScope === 'all' || targetScope === 'passwords') {
      setPasswords((prev) =>
        prev.map((p) => {
          let updated = false;
          let newTitle = p.title;
          let newUserId = p.userId;
          let newSiteUrl = p.siteUrl;
          let newNote = p.note;

          if (newTitle.includes(findText)) {
            newTitle = newTitle.replaceAll(findText, replaceText);
            updated = true;
          }
          if (newUserId && newUserId.includes(findText)) {
            newUserId = newUserId.replaceAll(findText, replaceText);
            updated = true;
          }
          if (newSiteUrl && newSiteUrl.includes(findText)) {
            newSiteUrl = newSiteUrl.replaceAll(findText, replaceText);
            updated = true;
          }
          if (newNote && newNote.includes(findText)) {
            newNote = newNote.replaceAll(findText, replaceText);
            updated = true;
          }

          if (updated) passReplacedCount++;
          return updated
            ? { ...p, title: newTitle, userId: newUserId, siteUrl: newSiteUrl, note: newNote }
            : p;
        })
      );
    }

    if (targetScope === 'all' || targetScope === 'pages') {
      setPages((prev) =>
        prev.map((pg) => {
          let updated = false;
          let newTitle = pg.title;
          let newContent = pg.content;

          if (newTitle.includes(findText)) {
            newTitle = newTitle.replaceAll(findText, replaceText);
            updated = true;
          }
          if (newContent && newContent.includes(findText)) {
            newContent = newContent.replaceAll(findText, replaceText);
            updated = true;
          }

          if (updated) pageReplacedCount++;
          return updated ? { ...pg, title: newTitle, content: newContent } : pg;
        })
      );
    }

    const totalReplaced = passReplacedCount + pageReplacedCount;
    addLog(
      'Find & Replace',
      `Replaced "${findText}" with "${replaceText}" across ${totalReplaced} items.`
    );
    addToast(`REPLACED IN ${totalReplaced} VAULT ITEMS!`, 'success');
    setIsReplaceModalOpen(false);
    setFindText('');
    setReplaceText('');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-container" style={{ maxWidth: '520px' }}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <Replace size={20} color="#a822f6" />
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, margin: 0 }}>
              Find & Replace Tool
            </h3>
          </div>
          <button className="btn-icon" onClick={() => setIsReplaceModalOpen(false)}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleExecuteReplace} className="modal-form">
          <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Find Target Text *</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. old-domain.com, temp_user, v1.0"
                value={findText}
                onChange={(e) => setFindText(e.target.value)}
                required
              />
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Replace With</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. new-domain.com, admin_prod, v2.0"
                value={replaceText}
                onChange={(e) => setReplaceText(e.target.value)}
              />
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Scope</label>
              <select
                className="form-select"
                value={targetScope}
                onChange={(e) => setTargetScope(e.target.value as any)}
              >
                <option value="all">Entire Vault (Passwords & Pages)</option>
                <option value="passwords">Passwords Only</option>
                <option value="pages">Pages Only</option>
              </select>
            </div>

            {findText.trim() && (
              <div
                style={{
                  padding: '0.85rem 1rem',
                  borderRadius: '12px',
                  backgroundColor: totalMatches > 0 ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                  border: `1px solid ${totalMatches > 0 ? 'rgba(16, 185, 129, 0.25)' : 'rgba(239, 68, 68, 0.25)'}`,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.6rem',
                  fontSize: '0.85rem',
                  fontWeight: 700,
                  color: totalMatches > 0 ? '#10b981' : '#ef4444',
                }}
              >
                {totalMatches > 0 ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
                <span>
                  {totalMatches > 0
                    ? `Found ${totalMatches} matching record${totalMatches === 1 ? '' : 's'} ready to replace.`
                    : 'No matches found for the specified target text.'}
                </span>
              </div>
            )}
          </div>

          <div className="modal-footer">
            <button
              type="button"
              onClick={() => setIsReplaceModalOpen(false)}
              className="btn btn-secondary"
              style={{ borderRadius: '12px' }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!findText.trim() || totalMatches === 0 || isSubmitting}
              className="btn btn-primary"
              style={{
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #a822f6 0%, #7b2cbf 100%)',
                border: 'none',
                opacity: !findText.trim() || totalMatches === 0 || isSubmitting ? 0.5 : 1,
              }}
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>Replacing...</span>
                </>
              ) : (
                <>
                  <RefreshCw size={16} />
                  <span>Replace All ({totalMatches})</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
