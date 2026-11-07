import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Trash2, KeyRound, ArrowRight, Edit2, Check, X } from 'lucide-react';

export const LabelsView: React.FC = () => {
  const {
    labels,
    passwords,
    searchQuery,
    updateLabelItem,
    deleteLabelItem,
    showConfirmModal,
    setLabelFilter,
    setActiveView,
  } = useApp();
  const [editingLabelId, setEditingLabelId] = useState<string | null>(null);
  const [editingLabelName, setEditingLabelName] = useState<string>('');

  const filteredLabels = labels.filter((lbl) => {
    if (!searchQuery.trim()) return true;
    return lbl.name.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const startEditing = (id: string, currentName: string) => {
    setEditingLabelId(id);
    setEditingLabelName(currentName);
  };

  const saveEditing = (id: string) => {
    if (editingLabelName.trim()) {
      updateLabelItem(id, editingLabelName.trim());
    }
    setEditingLabelId(null);
  };

  const cancelEditing = () => {
    setEditingLabelId(null);
  };

  const handleDelete = (id: string, name: string) => {
    showConfirmModal(
      'Delete Label Tag',
      `Are you sure you want to delete label "${name}"? Passwords tagged with this label will retain their credentials.`,
      () => deleteLabelItem(id),
      true
    );
  };

  const handleViewPasswords = (labelName: string) => {
    setLabelFilter(labelName);
    setActiveView('password');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Label Cards Grid */}
      <div>
        <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', color: 'var(--text-secondary)' }}>
          Active Vault Tag Badges ({filteredLabels.length})
        </h3>

        {filteredLabels.length === 0 ? (
          <div className="card" style={{ padding: '2rem', textAlign: 'center' }}>
            <p style={{ color: 'var(--text-muted)' }}>No labels match search filter.</p>
          </div>
        ) : (
          <div className="grid-cols-3">
            {filteredLabels.map((lbl, index) => {
              const associatedCount = passwords.filter((p) => p.labels.includes(lbl.name)).length;
              const isEditing = editingLabelId === lbl.id;

              return (
                <div key={lbl.id ? `${lbl.id}_${index}` : `lbl_${index}`} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem' }}>
                    {isEditing ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flex: 1 }}>
                        <input
                          type="text"
                          className="form-input"
                          style={{ padding: '0.25rem 0.5rem', fontSize: '0.85rem' }}
                          value={editingLabelName}
                          onChange={(e) => setEditingLabelName(e.target.value)}
                          autoFocus
                        />
                        <button
                          onClick={() => saveEditing(lbl.id)}
                          className="btn-icon"
                          style={{ color: 'var(--success)' }}
                          title="Save Label"
                        >
                          <Check size={16} />
                        </button>
                        <button
                          onClick={cancelEditing}
                          className="btn-icon"
                          style={{ color: 'var(--text-muted)' }}
                          title="Cancel"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    ) : (
                      <>
                        <span className="badge badge-primary" style={{ fontSize: '0.9rem', padding: '0.3rem 0.8rem' }}>
                          {lbl.name}
                        </span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                          <button
                            onClick={() => startEditing(lbl.id, lbl.name)}
                            className="btn-icon"
                            style={{ width: '32px', height: '32px', color: 'var(--primary)' }}
                            title="Edit Label Name"
                          >
                            <Edit2 size={15} />
                          </button>
                          <button
                            onClick={() => handleDelete(lbl.id, lbl.name)}
                            className="btn-icon"
                            style={{ width: '32px', height: '32px', color: 'var(--danger)' }}
                            title="Delete Label"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </>
                    )}
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                    <KeyRound size={16} />
                    <span>{associatedCount} Passwords tagged</span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '0.5rem', borderTop: '1px solid var(--border-color)' }}>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {lbl.createdAt ? new Date(lbl.createdAt).toLocaleDateString() : 'System Default'}
                    </p>
                    <button
                      onClick={() => handleViewPasswords(lbl.name)}
                      className="btn btn-secondary"
                      style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem' }}
                    >
                      <span>View</span>
                      <ArrowRight size={12} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
