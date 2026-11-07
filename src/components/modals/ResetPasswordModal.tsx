import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  X,
  Key,
  Eye,
  EyeOff,
  Save,
  Trash2,
  Download,
  History,
  Shield,
  Loader2,
  AlertTriangle,
} from 'lucide-react';

export const ResetPasswordModal: React.FC = () => {
  const {
    isResetPasswordOpen,
    setIsResetPasswordOpen,
    updateFeaturePasscode,
  } = useApp();

  const [targetOption, setTargetOption] = useState<
    'masterPasscode' | 'deleteSelected' | 'exportVault' | 'clearHistory'
  >('masterPasscode');
  const [currentKeyInput, setCurrentKeyInput] = useState<string>('');
  const [newKeyInput, setNewKeyInput] = useState<string>('');
  const [showCurrent, setShowCurrent] = useState<boolean>(false);
  const [showNew, setShowNew] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');

  if (!isResetPasswordOpen) return null;

  const handleClose = () => {
    setCurrentKeyInput('');
    setNewKeyInput('');
    setErrorMessage('');
    setIsResetPasswordOpen(false);
  };

  const handleUpdateKey = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    if (!currentKeyInput.trim() || !newKeyInput.trim() || isSubmitting) {
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await updateFeaturePasscode(targetOption, currentKeyInput, newKeyInput);
      if (res.success) {
        handleClose();
      } else if (res.error) {
        setErrorMessage(res.error);
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'Failed to update passcode');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" style={{ zIndex: 10000 }}>
      <div className="modal-container" style={{ maxWidth: '520px', borderRadius: '24px' }}>
        {/* Header */}
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '12px',
                backgroundColor: 'rgba(59, 130, 246, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#3b82f6',
              }}
            >
              <Key size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 900, margin: 0, letterSpacing: '-0.01em' }}>
                Reset Passcode & Vault
              </h3>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: '0.15rem 0 0 0' }}>
                Select a feature action to reset its security passcode
              </p>
            </div>
          </div>
          <button className="btn-icon" onClick={handleClose} title="Close Modal">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleUpdateKey} className="modal-form">
          <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem', padding: '1.5rem' }}>
            {errorMessage && (
              <div
                style={{
                  padding: '0.75rem 1rem',
                  borderRadius: '12px',
                  backgroundColor: 'rgba(239, 68, 68, 0.1)',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  color: '#ef4444',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                }}
              >
                <AlertTriangle size={16} style={{ flexShrink: 0 }} />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Target Feature Selector (Positioned directly ABOVE Current Security Key *) */}
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" style={{ fontWeight: 800, fontSize: '0.82rem', letterSpacing: '0.03em' }}>
                SELECT SECURITY ACTION / FEATURE *
              </label>
              <div style={{ position: 'relative' }}>
                <select
                  className="form-input"
                  value={targetOption}
                  onChange={(e) => setTargetOption(e.target.value as any)}
                  style={{
                    fontWeight: 700,
                    fontSize: '0.88rem',
                    borderRadius: '12px',
                    paddingRight: '2rem',
                    backgroundColor: 'var(--bg-primary)',
                    color: 'var(--text-primary)',
                    cursor: 'pointer',
                  }}
                >
                  <option value="masterPasscode">Master Security Passcode (Vault Access Key)</option>
                  <option value="deleteSelected">Delete Selected (MANAGE Batch Delete)</option>
                  <option value="exportVault">ENTER SECURITY KEY (Export Vault Options)</option>
                  <option value="clearHistory">CLEAR ALL (History Logs)</option>
                </select>
              </div>

              {/* Scope Info Badge */}
              <div
                style={{
                  marginTop: '0.5rem',
                  padding: '0.65rem 0.85rem',
                  borderRadius: '10px',
                  backgroundColor: 'var(--bg-primary)',
                  border: '1px solid var(--border-color)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  fontSize: '0.78rem',
                  color: 'var(--text-secondary)',
                }}
              >
                {targetOption === 'masterPasscode' && (
                  <>
                    <Shield size={15} color="#10b981" />
                    <span>Resetting <b>Master Security Passcode</b> for main Vault Access</span>
                  </>
                )}
                {targetOption === 'deleteSelected' && (
                  <>
                    <Trash2 size={15} color="#ef4444" />
                    <span>Resetting passcode for <b>Delete Selected</b> in Manage Passwords</span>
                  </>
                )}
                {targetOption === 'exportVault' && (
                  <>
                    <Download size={15} color="#3b82f6" />
                    <span>Resetting passcode for <b>ENTER SECURITY KEY</b> in Export Vault</span>
                  </>
                )}
                {targetOption === 'clearHistory' && (
                  <>
                    <History size={15} color="#f59e0b" />
                    <span>Resetting passcode for <b>CLEAR ALL</b> in Activity History Logs</span>
                  </>
                )}
              </div>
            </div>

            {/* Current Security Key */}
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" style={{ fontWeight: 800, fontSize: '0.82rem', letterSpacing: '0.03em' }}>
                Current Security Key *
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showCurrent ? 'text' : 'password'}
                  className="form-input"
                  placeholder="Enter current passcode (e.g. 123456)"
                  value={currentKeyInput}
                  onChange={(e) => setCurrentKeyInput(e.target.value)}
                  style={{ paddingRight: '2.5rem', fontFamily: 'var(--font-mono)', borderRadius: '12px' }}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowCurrent(!showCurrent)}
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
                  title={showCurrent ? 'Hide Key' : 'Show Key'}
                >
                  {showCurrent ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* New Security Key */}
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" style={{ fontWeight: 800, fontSize: '0.82rem', letterSpacing: '0.03em' }}>
                New Security Key *
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showNew ? 'text' : 'password'}
                  className="form-input"
                  placeholder="Enter new passcode string"
                  value={newKeyInput}
                  onChange={(e) => setNewKeyInput(e.target.value)}
                  style={{ paddingRight: '2.5rem', fontFamily: 'var(--font-mono)', borderRadius: '12px' }}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowNew(!showNew)}
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
                  title={showNew ? 'Hide Key' : 'Show Key'}
                >
                  {showNew ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
          </div>

          <div className="modal-footer" style={{ gap: '0.5rem', padding: '1.25rem 1.5rem' }}>
            <button type="button" onClick={handleClose} className="btn btn-secondary" style={{ borderRadius: '12px' }} disabled={isSubmitting}>
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              style={{ borderRadius: '12px', fontWeight: 800, minWidth: '160px', justifyContent: 'center' }}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>Updating...</span>
                </>
              ) : (
                <>
                  <Save size={16} />
                  <span>Update Passcode</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
