import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import {
  X,
  FileText,
  Code,
  Paperclip,
  Trash2,
  Save,
  Upload,
  RotateCcw,
  RotateCw,
  Image as ImageIcon,
  Copy,
  Download,
  Eye,
  Loader2,
  FolderPlus,
  AlertCircle,
} from 'lucide-react';
import { AttachmentFile } from '../../types';
import { extractFormattedText } from '../../utils/formatUtils';
import {
  getFileCategoryIcon,
  MAX_PAGE_TOTAL_FILE_SIZE,
  formatFileSize,
} from '../../utils/fileUtils';

export const PageEditorModal: React.FC = () => {
  const {
    isPageEditorOpen,
    pageEditorId,
    closePageEditor,
    pages,
    pageTabs,
    savePageItem,
    addToast,
    showConfirmModal,
    currentPageTab,
    setCurrentPageTab,
  } = useApp();

  const [title, setTitle] = useState<string>('');
  const [tabId, setTabId] = useState<string>('');
  const [content, setContent] = useState<string>('');
  const [isCodeMode, setIsCodeMode] = useState<boolean>(false);
  const [attachments, setAttachments] = useState<AttachmentFile[]>([]);
  const [submittingAction, setSubmittingAction] = useState<'draft' | 'publish' | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Selected image for action modal (Download or Delete options)
  const [selectedImageModal, setSelectedImageModal] = useState<{
    att: AttachmentFile;
    index: number;
    imgElement?: HTMLImageElement | null;
  } | null>(null);

  // Undo / Redo history state
  const [history, setHistory] = useState<string[]>(['']);
  const [historyIndex, setHistoryIndex] = useState<number>(0);

  const editorRef = useRef<HTMLDivElement | null>(null);
  const imageInputRef = useRef<HTMLInputElement | null>(null);

  // 30-second Autosave timer to Drafts collection
  useEffect(() => {
    if (!isPageEditorOpen) return;

    const timer = setInterval(() => {
      if (title.trim() || content.trim()) {
        savePageItem({
          id: pageEditorId || undefined,
          title: title.trim() || 'Untitled Draft Page',
          tabId: tabId || (pageTabs[0]?.id || 'tab-1'),
          content,
          isCodeMode,
          attachments,
          status: 'Draft',
        });
        addToast('Autosaved draft to Firebase', 'info');
      }
    }, 30000);

    return () => clearInterval(timer);
  }, [isPageEditorOpen, pageEditorId, title, tabId, content, isCodeMode, attachments, pageTabs]);

  useEffect(() => {
    setSubmittingAction(null);
    setErrorMessage(null);
    if (isPageEditorOpen) {
      if (pageEditorId) {
        const existing = pages.find((p) => p.id === pageEditorId);
        if (existing) {
          setTitle(existing.title);
          setTabId(existing.tabId);
          setContent(existing.content);
          setIsCodeMode(!!existing.isCodeMode);
          setAttachments(existing.attachments || []);
          setHistory([existing.content]);
          setHistoryIndex(0);
          if (editorRef.current) {
            editorRef.current.innerHTML = existing.content || '';
          }
        }
      } else {
        setTitle('');
        setTabId(pageTabs[0]?.id || 'tab-1');
        setContent('');
        setIsCodeMode(false);
        setAttachments([]);
        setHistory(['']);
        setHistoryIndex(0);
        if (editorRef.current) {
          editorRef.current.innerHTML = '';
        }
      }
    }
  }, [pageEditorId, isPageEditorOpen]);

  if (!isPageEditorOpen) return null;

  const handleContentChange = (newVal: string) => {
    setContent(newVal);
    const updatedHistory = history.slice(0, historyIndex + 1);
    setHistory([...updatedHistory, newVal]);
    setHistoryIndex(updatedHistory.length);
  };

  const handleUndo = () => {
    if (historyIndex > 0) {
      const prevIndex = historyIndex - 1;
      setHistoryIndex(prevIndex);
      const prevVal = history[prevIndex];
      setContent(prevVal);
      if (editorRef.current) {
        editorRef.current.innerHTML = prevVal;
      }
      addToast('Undo action', 'info');
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const nextIndex = historyIndex + 1;
      setHistoryIndex(nextIndex);
      const nextVal = history[nextIndex];
      setContent(nextVal);
      if (editorRef.current) {
        editorRef.current.innerHTML = nextVal;
      }
      addToast('Redo action', 'info');
    }
  };

  // Click handler for images rendered directly inside the contentEditable text box
  const handleEditorClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;
    if (target && target.tagName === 'IMG') {
      e.stopPropagation();
      const imgEl = target as HTMLImageElement;
      const url = imgEl.src || imgEl.getAttribute('src') || '';
      const alt = imgEl.alt || imgEl.getAttribute('alt') || 'Image';

      // Find if this image is in attachments list by matching URL
      const foundIdx = attachments.findIndex((a) => a.url === url);

      setSelectedImageModal({
        att: {
          name: alt || 'Embedded Photo',
          url: url,
          type: 'image/png',
          size: 0,
        },
        index: foundIdx,
        imgElement: imgEl,
      });
    }
  };

  // Helper to insert image directly inside contentEditable box at cursor location
  const insertImageAtCursor = (url: string, fileName: string) => {
    const imgHtml = `<img src="${url}" alt="${fileName || 'Image'}" style="max-width: 100%; max-height: 280px; border-radius: 12px; margin: 8px 0; display: block; object-fit: contain; border: 1px solid var(--border-color); cursor: pointer;" />`;
    if (editorRef.current) {
      editorRef.current.focus();
      const sel = window.getSelection();
      if (sel && sel.rangeCount > 0 && editorRef.current.contains(sel.anchorNode)) {
        const range = sel.getRangeAt(0);
        range.deleteContents();
        const temp = document.createElement('div');
        temp.innerHTML = imgHtml;
        const frag = document.createDocumentFragment();
        let node;
        let lastNode;
        while ((node = temp.firstChild)) {
          lastNode = frag.appendChild(node);
        }
        range.insertNode(frag);
        if (lastNode) {
          range.setStartAfter(lastNode);
          range.collapse(true);
          sel.removeAllRanges();
          sel.addRange(range);
        }
      } else {
        editorRef.current.innerHTML += imgHtml;
      }
      handleContentChange(editorRef.current.innerHTML);
    }
  };

  const getCurrentAttachmentsTotalSize = (atts: AttachmentFile[]) => {
    return atts.reduce((sum, item) => sum + (item.size || 0), 0);
  };

  // Add Photo via Image Button
  const handleAddPhotos = (files: FileList | null) => {
    if (!files || files.length === 0) return;

    let currentTotal = getCurrentAttachmentsTotalSize(attachments);
    let skippedCount = 0;

    Array.from(files).forEach((file) => {
      if (currentTotal + file.size > MAX_PAGE_TOTAL_FILE_SIZE) {
        skippedCount++;
        return;
      }
      currentTotal += file.size;

      const reader = new FileReader();
      reader.onload = (e) => {
        const url = e.target?.result as string;
        const newAttachment: AttachmentFile = {
          name: file.name || `Photo_${Date.now()}.png`,
          url,
          type: file.type || 'image/png',
          size: file.size,
        };
        setAttachments((prev) => [...prev, newAttachment]);
        insertImageAtCursor(url, file.name || 'Photo');
        addToast(`Image inserted inside text box`, 'success');
      };
      reader.readAsDataURL(file);
    });

    if (skippedCount > 0) {
      addToast(`Total attachment size cannot exceed 16 MB! (${skippedCount} file(s) skipped)`, 'warning');
    }
  };

  // Paste Files / Images / HTML Code directly into Text Box
  const handlePaste = (e: React.ClipboardEvent<HTMLDivElement>) => {
    const files = e.clipboardData?.files;
    let hasImages = false;
    let skippedCount = 0;
    if (files && files.length > 0) {
      let currentTotal = getCurrentAttachmentsTotalSize(attachments);

      Array.from(files).forEach((file) => {
        if (currentTotal + file.size > MAX_PAGE_TOTAL_FILE_SIZE) {
          skippedCount++;
          return;
        }
        currentTotal += file.size;

        if (file.type.startsWith('image/')) {
          hasImages = true;
          e.preventDefault();
          const reader = new FileReader();
          reader.onload = (evt) => {
            const url = evt.target?.result as string;
            insertImageAtCursor(url, file.name || 'Pasted Image');
            setAttachments((prev) => [
              ...prev,
              { name: file.name || `Pasted_Image_${Date.now()}.png`, url, type: file.type, size: file.size },
            ]);
            addToast(`Image pasted directly into text box`, 'success');
          };
          reader.readAsDataURL(file);
        } else {
          const reader = new FileReader();
          reader.onload = (evt) => {
            const url = evt.target?.result as string;
            setAttachments((prev) => [
              ...prev,
              { name: file.name || `File_${Date.now()}`, url, type: file.type, size: file.size },
            ]);
            addToast(`Attached file "${file.name}"`, 'success');
          };
          reader.readAsDataURL(file);
        }
      });
      if (skippedCount > 0) {
        addToast(`Total attachment size cannot exceed 16 MB! (${skippedCount} file(s) skipped)`, 'warning');
      }
      if (hasImages) return;
    }

    // Intercept plain text / HTML code paste to insert as clean text node, preserving code formatting & tags
    const plainText = e.clipboardData?.getData('text/plain');
    if (plainText) {
      e.preventDefault();
      const sel = window.getSelection();
      if (sel && sel.rangeCount > 0 && editorRef.current && editorRef.current.contains(sel.anchorNode)) {
        const range = sel.getRangeAt(0);
        range.deleteContents();
        const textNode = document.createTextNode(plainText);
        range.insertNode(textNode);
        range.setStartAfter(textNode);
        range.collapse(true);
        sel.removeAllRanges();
        sel.addRange(range);
      } else if (editorRef.current) {
        editorRef.current.appendChild(document.createTextNode(plainText));
      }
      if (editorRef.current) {
        handleContentChange(editorRef.current.innerHTML);
      }
    }
  };

  // Copy Content EXCLUDING Images while preserving exact code format
  const handleCopyCleanText = () => {
    if (!content) {
      addToast('No content to copy', 'warning');
      return;
    }

    const cleanText = extractFormattedText(content);

    if (!cleanText) {
      addToast('No text content to copy (only images)', 'warning');
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

  const handleFileUpload = (files: FileList | null) => {
    if (!files || files.length === 0) return;

    let currentTotal = getCurrentAttachmentsTotalSize(attachments);
    let skippedCount = 0;

    Array.from(files).forEach((file) => {
      if (currentTotal + file.size > MAX_PAGE_TOTAL_FILE_SIZE) {
        skippedCount++;
        return;
      }
      currentTotal += file.size;

      const reader = new FileReader();
      reader.onload = (e) => {
        const url = e.target?.result as string;
        const newAttachment: AttachmentFile = {
          name: file.name,
          url,
          type: file.type,
          size: file.size,
        };
        setAttachments((prev) => [...prev, newAttachment]);
        addToast(`Attached file "${file.name}"`, 'success');
      };
      reader.readAsDataURL(file);
    });

    if (skippedCount > 0) {
      addToast(`Total attachment size cannot exceed 16 MB! (${skippedCount} file(s) skipped)`, 'warning');
    }
  };

  const handleRemoveAttachment = (index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSaveDraft = async () => {
    if (submittingAction) return;
    const draftTitle = title.trim() || 'Untitled Draft Page';
    setSubmittingAction('draft');
    setErrorMessage(null);
    try {
      const res = await savePageItem({
        id: pageEditorId || undefined,
        title: draftTitle,
        tabId: tabId || (pageTabs[0]?.id || 'tab-1'),
        content,
        isCodeMode,
        attachments,
        status: 'Draft',
      });

      if (res && res.success === false) {
        setErrorMessage(`Failed to save draft to Firebase: ${res.error || 'Firebase write failed'}`);
        addToast(`Draft save failed: ${res.error || 'Firebase update failed'}`, 'error');
        setSubmittingAction(null);
        return;
      }

      closePageEditor();
    } catch (err: any) {
      setSubmittingAction(null);
      setErrorMessage(`Failed to save draft to Firebase: ${err?.message || 'Unknown error'}`);
      addToast(`Save draft failed: ${err?.message || 'Unknown error'}`, 'error');
    }
  };

  const handleCloseWithAutoDraft = () => {
    if (!pageEditorId && (title.trim() || content.trim())) {
      handleSaveDraft().catch(() => {});
    }
    closePageEditor();
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

      const targetTab = tabId || (pageTabs[0]?.id || 'tab-1');

      const res = await savePageItem({
        id: pageEditorId || undefined,
        title: title.trim(),
        tabId: targetTab,
        content,
        isCodeMode,
        attachments,
        status: 'Published',
        dateString: dateFormatted,
        updatedAt: Date.now(),
      });

      if (res && res.success === false) {
        setErrorMessage(`Failed to update Firebase Realtime Database: ${res.error || 'Firebase write failed'}`);
        addToast(`Save failed: ${res.error || 'Firebase write failed'}`, 'error');
        setSubmittingAction(null);
        return;
      }

      if (currentPageTab === 'drafts') {
        setCurrentPageTab(targetTab);
      }

      closePageEditor();
    } catch (err: any) {
      setSubmittingAction(null);
      setErrorMessage(`Failed to update Firebase Realtime Database: ${err?.message || 'Unknown error'}`);
      addToast(`Save failed: ${err?.message || 'Unknown error'}`, 'error');
    }
  };

  return (
    <div className="modal-overlay" style={{ zIndex: 100 }}>
      <div className="modal-container page-editor-modal" style={{ maxWidth: '720px' }}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <FileText size={20} color="var(--accent)" />
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800 }}>
              {pageEditorId ? 'Edit Secure Page' : 'Create New Secure Page'}
            </h3>
          </div>
          <button className="btn-icon" onClick={handleCloseWithAutoDraft}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
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

            <div className="grid-cols-2">
              {/* Title */}
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Page Title *</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Server Configs, Recovery Code List"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>

              {/* Tab Category */}
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Category Tab</label>
                <select
                  className="form-select"
                  value={tabId}
                  onChange={(e) => setTabId(e.target.value)}
                >
                  {pageTabs.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Header section with Page Body Content and strictly ONLY 3 icon buttons: Undo (↺), Redo (↻), Image (🖼️) */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'nowrap', gap: '0.5rem' }}>
              <label className="form-label" style={{ marginBottom: 0, fontWeight: 800 }}>Page Body Content</label>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                {/* Undo (↺) & Redo (↻) Buttons Container */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.2rem', backgroundColor: 'var(--bg-secondary)', padding: '2px 6px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                  <button
                    type="button"
                    onClick={handleUndo}
                    disabled={historyIndex === 0}
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: historyIndex === 0 ? 'not-allowed' : 'pointer',
                      color: historyIndex === 0 ? 'var(--text-muted)' : 'var(--primary)',
                      padding: '0.35rem',
                      borderRadius: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      opacity: historyIndex === 0 ? 0.4 : 1,
                    }}
                    title="Undo (↺)"
                  >
                    <RotateCcw size={16} />
                  </button>

                  <button
                    type="button"
                    onClick={handleRedo}
                    disabled={historyIndex >= history.length - 1}
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: historyIndex >= history.length - 1 ? 'not-allowed' : 'pointer',
                      color: historyIndex >= history.length - 1 ? 'var(--text-muted)' : 'var(--primary)',
                      padding: '0.35rem',
                      borderRadius: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      opacity: historyIndex >= history.length - 1 ? 0.4 : 1,
                    }}
                    title="Redo (↻)"
                  >
                    <RotateCw size={16} />
                  </button>
                </div>

                {/* Image (🖼️) Button - ICON ONLY */}
                <button
                  type="button"
                  onClick={() => imageInputRef.current?.click()}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '36px',
                    height: '36px',
                    borderRadius: '12px',
                    backgroundColor: 'rgba(255, 94, 54, 0.12)',
                    color: '#ff5e36',
                    border: '1px solid rgba(255, 94, 54, 0.25)',
                    cursor: 'pointer',
                    boxShadow: 'var(--shadow-sm)',
                  }}
                  title="Add Image to Editor (🖼️)"
                >
                  <ImageIcon size={18} />
                </button>
                <input
                  ref={imageInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  style={{ display: 'none' }}
                  onChange={(e) => handleAddPhotos(e.target.files)}
                />
              </div>
            </div>

            {/* Complete Unified Code Box / Rich Text Editor Container with embedded inline image rendering and drop/paste support */}
            <div
              style={{
                border: '1.5px solid var(--border-color)',
                borderRadius: '16px',
                backgroundColor: 'var(--bg-primary)',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                transition: 'border-color 0.2s ease',
                flexShrink: 0,
                minHeight: '220px',
              }}
            >
              {/* ContentEditable Editor Box - Images render inline directly inside this text box */}
              <div
                ref={editorRef}
                id="page-editor-contenteditable"
                contentEditable
                style={{
                  width: '100%',
                  minHeight: '220px',
                  maxHeight: '380px',
                  overflowY: 'auto',
                  fontFamily: isCodeMode ? 'var(--font-mono)' : 'inherit',
                  fontSize: isCodeMode ? '0.85rem' : '0.95rem',
                  padding: '1rem',
                  border: 'none',
                  outline: 'none',
                  backgroundColor: 'transparent',
                  color: 'var(--text-primary)',
                  boxSizing: 'border-box',
                  lineHeight: 1.6,
                  flexShrink: 0,
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word',
                }}
                onInput={(e) => handleContentChange(e.currentTarget.innerHTML)}
                onPaste={handlePaste}
                onClick={handleEditorClick}
              />
            </div>

            {/* File Attachments Uploader List */}
            <div className="form-group" style={{ marginBottom: 0 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <label className="form-label" style={{ marginBottom: 0 }}>All Attachments</label>
                <label className="btn btn-secondary" style={{ padding: '0.25rem 0.6rem', fontSize: '0.75rem', cursor: 'pointer', borderRadius: '10px' }}>
                  <Upload size={14} />
                  <span>Attach File</span>
                  <input
                    type="file"
                    multiple
                    style={{ display: 'none' }}
                    onChange={(e) => handleFileUpload(e.target.files)}
                  />
                </label>
              </div>

              {attachments.length === 0 ? (
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                  No files attached.
                </p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {attachments.map((att, idx) => (
                    <div
                      key={idx}
                      style={{
                        padding: '0.5rem 0.85rem',
                        borderRadius: '12px',
                        backgroundColor: 'var(--bg-primary)',
                        border: '1px solid var(--border-color)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', overflow: 'hidden', minWidth: 0 }}>
                        {getFileCategoryIcon(att.type, att.name, 18)}
                        <span style={{ fontSize: '0.85rem', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {att.name}
                        </span>
                        {att.size ? (
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', flexShrink: 0 }}>
                            ({formatFileSize(att.size)})
                          </span>
                        ) : null}
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          showConfirmModal(
                            'Delete Attachment Confirmation',
                            `Are you sure you want to delete file "${att.name}"?`,
                            () => {
                              handleRemoveAttachment(idx);
                              addToast(`Attachment "${att.name}" deleted`, 'info');
                            },
                            true
                          );
                        }}
                        style={{ background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer', padding: '0.25rem' }}
                        title="Delete attachment"
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
            <button type="button" onClick={handleCloseWithAutoDraft} className="btn btn-secondary" style={{ borderRadius: '12px' }} disabled={!!submittingAction}>
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSaveDraft}
              className="btn btn-secondary"
              style={{
                borderRadius: '12px',
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
            <button type="submit" className="btn btn-primary" style={{ borderRadius: '12px', backgroundColor: '#ff5e36', borderColor: '#ff5e36', whiteSpace: 'nowrap', minWidth: '140px' }} disabled={!!submittingAction}>
              {submittingAction === 'publish' ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save size={16} />
                  <span>{pageEditorId ? 'Update & Publish' : 'Save & Publish'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Image Action Options Modal (Click on photo -> Download / Delete) */}
      {selectedImageModal && (
        <div
          className="modal-overlay"
          style={{ zIndex: 120, backgroundColor: 'rgba(0,0,0,0.85)' }}
          onClick={() => setSelectedImageModal(null)}
        >
          <div
            className="modal-container"
            style={{ maxWidth: '420px', padding: '1.25rem', textAlign: 'center' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 800 }}>Photo Management</h4>
              <button className="btn-icon" onClick={() => setSelectedImageModal(null)}>
                <X size={18} />
              </button>
            </div>

            <div style={{ marginBottom: '1rem', borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--border-color)', maxHeight: '240px' }}>
              <img
                src={selectedImageModal.att.url}
                alt={selectedImageModal.att.name}
                style={{ width: '100%', maxHeight: '240px', objectFit: 'contain', backgroundColor: '#000' }}
              />
            </div>

            <p style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: '1.25rem' }}>
              {selectedImageModal.att.name}
            </p>

            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
              {/* Download button with Permission Dialog */}
              <button
                type="button"
                className="btn btn-primary"
                style={{ flex: 1, borderRadius: '12px', backgroundColor: '#10b981', borderColor: '#10b981' }}
                onClick={() => {
                  showConfirmModal(
                    'Download Confirmation',
                    `Are you sure you want to download image "${selectedImageModal.att.name}"?`,
                    () => {
                      const a = document.createElement('a');
                      a.href = selectedImageModal.att.url;
                      a.download = selectedImageModal.att.name;
                      document.body.appendChild(a);
                      a.click();
                      document.body.removeChild(a);
                      setSelectedImageModal(null);
                      addToast('Image downloaded', 'success');
                    }
                  );
                }}
              >
                <Download size={16} />
                <span>Download</span>
              </button>

              {/* Delete button */}
              <button
                type="button"
                className="btn btn-danger"
                style={{ flex: 1, borderRadius: '12px' }}
                onClick={() => {
                  showConfirmModal(
                    'Delete Image Confirmation',
                    `Are you sure you want to remove image "${selectedImageModal.att.name}" from page?`,
                    () => {
                      if (selectedImageModal.imgElement) {
                        selectedImageModal.imgElement.remove();
                        if (editorRef.current) {
                          handleContentChange(editorRef.current.innerHTML);
                        }
                      } else if (editorRef.current) {
                        const tempDiv = document.createElement('div');
                        tempDiv.innerHTML = editorRef.current.innerHTML;
                        const imgs = tempDiv.querySelectorAll('img');
                        imgs.forEach((img) => {
                          if (img.src === selectedImageModal.att.url || img.getAttribute('src') === selectedImageModal.att.url) {
                            img.remove();
                          }
                        });
                        editorRef.current.innerHTML = tempDiv.innerHTML;
                        handleContentChange(tempDiv.innerHTML);
                      }

                      if (selectedImageModal.index >= 0) {
                        handleRemoveAttachment(selectedImageModal.index);
                      } else {
                        setAttachments((prev) => prev.filter((a) => a.url !== selectedImageModal.att.url));
                      }

                      setSelectedImageModal(null);
                      addToast('Image deleted from editor', 'info');
                    },
                    true
                  );
                }}
              >
                <Trash2 size={16} />
                <span>Delete</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
