import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { X, Settings, Plus, Trash2, Edit2, Check, Loader2 } from 'lucide-react';

export const TabManagerModal: React.FC = () => {
  const {
    isTabManagerOpen,
    setIsTabManagerOpen,
    pageTabs,
    addPageTabItem,
    updatePageTabItem,
    deletePageTabItem,
    showConfirmModal,
    addToast,
  } = useApp();

  const [inputName, setInputName] = useState<string>('');
  const [editingTabId, setEditingTabId] = useState<string | null>(null);
  const [editingTabName, setEditingTabName] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  if (!isTabManagerOpen) return null;

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputName.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const res = await addPageTabItem(inputName.trim());
      if (res && res.success === false) {
        addToast(`Failed to create tab: ${res.error || 'Firebase write failed'}`, 'error');
      } else {
        setInputName('');
      }
    } catch (err: any) {
      addToast(`Failed to create tab: ${err?.message || 'Unknown error'}`, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const startEditing = (id: string, currentName: string) => {
    setEditingTabId(id);
    setEditingTabName(currentName);
  };

  const saveEditing = async (id: string) => {
    if (editingTabName.trim()) {
      setIsSubmitting(true);
      try {
        const res = await updatePageTabItem(id, editingTabName.trim());
        if (res && res.success === false) {
          addToast(`Failed to update tab: ${res.error || 'Firebase write failed'}`, 'error');
        } else {
          setEditingTabId(null);
        }
      } catch (err: any) {
        addToast(`Failed to update tab: ${err?.message || 'Unknown error'}`, 'error');
      } finally {
        setIsSubmitting(false);
      }
    } else {
      setEditingTabId(null);
    }
  };

  const handleDelete = (id: string, name: string) => {
    showConfirmModal(
      'Delete Category Tab',
      `Are you sure you want to delete tab "${name}"?`,
      () => deletePageTabItem(id),
      true
    );
  };

  return (
    <div className="modal-overlay">
      <div className="modal-container" style={{ maxWidth: '460px' }}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Settings size={20} color="var(--accent)" />
            <h3 style={{ fontSize: '1.1rem' }}>Manage Page Tabs</h3>
          </div>
          <button className="btn-icon" onClick={() => setIsTabManagerOpen(false)}>
            <X size={18} />
          </button>
        </div>

        <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <form onSubmit={handleAdd} style={{ display: 'flex', gap: '0.5rem' }}>
            <input
              type="text"
              className="form-input"
              placeholder="New category tab (e.g. SERVERS)"
              value={inputName}
              onChange={(e) => setInputName(e.target.value)}
            />
            <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
              {isSubmitting ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Plus size={16} />
              )}
              <span>Add</span>
            </button>
          </form>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '240px', overflowY: 'auto' }}>
            {pageTabs.map((tab, index) => (
              <div
                key={tab.id ? `${tab.id}_${index}` : `tab_${index}`}
                style={{
                  padding: '0.6rem 0.85rem',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--bg-primary)',
                  border: '1px solid var(--border-color)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '0.5rem',
                }}
              >
                {editingTabId === tab.id ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flex: 1 }}>
                    <input
                      type="text"
                      className="form-input"
                      style={{ padding: '0.25rem 0.5rem', fontSize: '0.85rem' }}
                      value={editingTabName}
                      onChange={(e) => setEditingTabName(e.target.value)}
                      autoFocus
                    />
                    <button
                      onClick={() => saveEditing(tab.id)}
                      className="btn-icon"
                      style={{ color: 'var(--success)' }}
                      title="Save"
                    >
                      <Check size={16} />
                    </button>
                  </div>
                ) : (
                  <>
                    <span className="badge badge-accent">{tab.name}</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <button
                        onClick={() => startEditing(tab.id, tab.name)}
                        className="btn-icon"
                        title="Edit Tab Name"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button
                        onClick={() => handleDelete(tab.id, tab.name)}
                        style={{ background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer' }}
                        title="Delete Tab"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="modal-footer">
          <button onClick={() => setIsTabManagerOpen(false)} className="btn btn-secondary" style={{ width: '100%' }}>
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
