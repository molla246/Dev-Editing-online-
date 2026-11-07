import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { X, Tag as TagIcon, Plus, Trash2, Edit2, Check, Loader2 } from 'lucide-react';

export const LabelEditorModal: React.FC = () => {
  const {
    isLabelEditorOpen,
    setIsLabelEditorOpen,
    labels,
    addLabelItem,
    updateLabelItem,
    deleteLabelItem,
    showConfirmModal,
    addToast,
  } = useApp();

  const [inputName, setInputName] = useState<string>('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  if (!isLabelEditorOpen) return null;

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputName.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const res = await addLabelItem(inputName.trim());
      if (res && res.success === false) {
        addToast(`Failed to add tag: ${res.error || 'Firebase write failed'}`, 'error');
      } else {
        setInputName('');
      }
    } catch (err: any) {
      addToast(`Failed to add label: ${err?.message || 'Unknown error'}`, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const startEditing = (id: string, name: string) => {
    setEditingId(id);
    setEditingName(name);
  };

  const saveEditing = async (id: string) => {
    if (editingName.trim()) {
      setIsSubmitting(true);
      try {
        const res = await updateLabelItem(id, editingName.trim());
        if (res && res.success === false) {
          addToast(`Failed to update tag: ${res.error || 'Firebase write failed'}`, 'error');
        } else {
          setEditingId(null);
        }
      } catch (err: any) {
        addToast(`Failed to update label: ${err?.message || 'Unknown error'}`, 'error');
      } finally {
        setIsSubmitting(false);
      }
    } else {
      setEditingId(null);
    }
  };

  const handleDelete = (id: string, name: string) => {
    showConfirmModal(
      'Delete Label',
      `Are you sure you want to delete tag "${name}"?`,
      () => deleteLabelItem(id),
      true
    );
  };

  return (
    <div className="modal-overlay">
      <div className="modal-container" style={{ maxWidth: '460px' }}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <TagIcon size={20} color="var(--primary)" />
            <h3 style={{ fontSize: '1.1rem' }}>Manage Label Tags</h3>
          </div>
          <button className="btn-icon" onClick={() => setIsLabelEditorOpen(false)}>
            <X size={18} />
          </button>
        </div>

        <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <form onSubmit={handleAdd} style={{ display: 'flex', gap: '0.5rem' }}>
            <input
              type="text"
              className="form-input"
              placeholder="New tag name (e.g. FINANCE)"
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
            {labels.map((lbl, index) => (
              <div
                key={lbl.id ? `${lbl.id}_${index}` : `lbl_${index}`}
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
                {editingId === lbl.id ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flex: 1 }}>
                    <input
                      type="text"
                      className="form-input"
                      style={{ padding: '0.25rem 0.5rem', fontSize: '0.85rem' }}
                      value={editingName}
                      onChange={(e) => setEditingName(e.target.value)}
                      autoFocus
                    />
                    <button
                      onClick={() => saveEditing(lbl.id)}
                      className="btn-icon"
                      style={{ color: 'var(--success)' }}
                      title="Save"
                    >
                      <Check size={16} />
                    </button>
                  </div>
                ) : (
                  <>
                    <span className="badge badge-primary">{lbl.name}</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <button
                        onClick={() => startEditing(lbl.id, lbl.name)}
                        className="btn-icon"
                        title="Edit Tag Name"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button
                        onClick={() => handleDelete(lbl.id, lbl.name)}
                        style={{ background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer' }}
                        title="Delete Tag"
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
          <button onClick={() => setIsLabelEditorOpen(false)} className="btn btn-secondary" style={{ width: '100%' }}>
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
