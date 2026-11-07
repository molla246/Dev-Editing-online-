import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import {
  X,
  Lock,
  LogOut,
  RefreshCw,
  Fingerprint,
  CheckCircle2,
  ChevronRight,
  Database,
  AlertTriangle,
  Trash2,
  Info,
  Smartphone,
  Download,
} from 'lucide-react';
import { GoogleKeyLogo } from './GoogleKeyLogo';
import { PWAInstallModal } from './PWAInstallModal';
import {
  registerBiometricPasskey,
  getStoredPasskeys,
  isWebAuthnSupported,
  clearAllPasskeys,
} from '../lib/biometrics';

interface AccountProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AccountProfileModal: React.FC<AccountProfileModalProps> = ({
  isOpen,
  onClose,
}) => {
  const {
    userEmail,
    logout,
    connectionStatus,
    triggerManualSync,
    isManualSyncing,
    lastSyncTimestamp,
    addToast,
    passwords,
    showConfirmModal,
  } = useApp();

  const [isBiometricRegistered, setIsBiometricRegistered] = useState<boolean>(false);
  const [isRegistering, setIsRegistering] = useState<boolean>(false);
  const [showBiometricModal, setShowBiometricModal] = useState<boolean>(false);
  const [showInstallModal, setShowInstallModal] = useState<boolean>(false);
  const [biometricSupported, setBiometricSupported] = useState<boolean>(true);
  const [biometricError, setBiometricError] = useState<string>('');

  useEffect(() => {
    if (isOpen) {
      const keys = getStoredPasskeys();
      setIsBiometricRegistered(keys.length > 0);
      isWebAuthnSupported().then((sup) => setBiometricSupported(sup));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleRegisterBiometrics = async () => {
    setIsRegistering(true);
    setBiometricError('');
    try {
      const username = userEmail || 'Administrator';
      const res = await registerBiometricPasskey(username);
      if (res.success) {
        setIsBiometricRegistered(true);
        addToast('Biometric Fingerprint Passkey registered successfully on this device!', 'success');
        setShowBiometricModal(false);
      } else {
        setBiometricError(res.error || 'Biometric registration was cancelled or not completed.');
      }
    } catch (err: any) {
      setBiometricError(err?.message || 'Biometric registration failed.');
    } finally {
      setIsRegistering(false);
    }
  };

  const handleRemoveBiometrics = () => {
    showConfirmModal(
      'Remove Biometric Fingerprint Passkey',
      'Are you sure you want to remove your biometric fingerprint passkey registration from this device?',
      () => {
        clearAllPasskeys();
        setIsBiometricRegistered(false);
        setShowBiometricModal(false);
        addToast('Biometric Fingerprint Passkey registration removed successfully!', 'info');
      },
      true,
      false
    );
  };

  const handleLockVault = () => {
    onClose();
    logout();
    addToast('Vault locked successfully.', 'info');
  };

  const handleSyncNow = async () => {
    await triggerManualSync();
  };

  return (
    <>
      <div
        style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.65)',
          backdropFilter: 'blur(8px)',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'center',
          padding: '1rem',
          paddingTop: '3.5rem',
        }}
        onClick={onClose}
      >
        <div
          style={{
            width: '100%',
            maxWidth: '420px',
            backgroundColor: '#1b201d',
            borderRadius: '24px',
            border: '1px solid #2d352f',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.6)',
            overflow: 'hidden',
            animation: 'fadeInScale 0.2s ease-out',
            color: '#e3e3df',
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Top Header */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '1rem 1.25rem 0.75rem',
              borderBottom: '1px solid #28302a',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <GoogleKeyLogo size={24} />
              <span style={{ fontSize: '0.92rem', fontWeight: 700, color: '#e3e3df' }}>
                Google Account
              </span>
            </div>
            <button
              onClick={onClose}
              style={{
                background: 'none',
                border: 'none',
                color: '#a0a7a0',
                cursor: 'pointer',
                padding: '0.3rem',
                display: 'flex',
                borderRadius: '50%',
              }}
            >
              <X size={20} />
            </button>
          </div>

          {/* User Card */}
          <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
                padding: '0.85rem 1rem',
                backgroundColor: '#222824',
                borderRadius: '18px',
                border: '1px solid #2f3831',
              }}
            >
              <div
                style={{
                  width: '46px',
                  height: '46px',
                  borderRadius: '50%',
                  backgroundColor: '#00d668',
                  color: '#003915',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 900,
                  fontSize: '1.2rem',
                  flexShrink: 0,
                  boxShadow: '0 0 12px rgba(0, 214, 104, 0.3)',
                }}
              >
                {(userEmail || 'M')[0].toUpperCase()}
              </div>
              <div style={{ minWidth: 0, flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: '0.98rem', color: '#f0f2ee' }}>
                  Riyajul
                </div>
                <div
                  style={{
                    fontSize: '0.8rem',
                    color: '#9ba39c',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {userEmail || 'MRiyajul25@gmail.com'}
                </div>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                    marginTop: '0.3rem',
                    fontSize: '0.72rem',
                    color: '#00d668',
                    fontWeight: 600,
                  }}
                >
                  <CheckCircle2 size={12} color="#00d668" />
                  <span>Google Password Manager Connected</span>
                </div>
              </div>
            </div>

            {/* Sync & Encryption Status */}
            <div
              style={{
                padding: '0.85rem 1rem',
                backgroundColor: '#222824',
                borderRadius: '16px',
                border: '1px solid #2c352e',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.65rem',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Database size={16} color="#00d668" />
                  <span style={{ fontSize: '0.82rem', fontWeight: 600 }}>Cloud Sync</span>
                </div>
                <span
                  style={{
                    fontSize: '0.75rem',
                    color: connectionStatus === 'connected' ? '#00d668' : '#eab308',
                    fontWeight: 700,
                    textTransform: 'capitalize',
                  }}
                >
                  {connectionStatus === 'connected' ? 'Synced (Firestore)' : 'Connecting'}
                </span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem', color: '#9ba39c' }}>
                <span>Total Passwords:</span>
                <span style={{ fontWeight: 700, color: '#e3e3df' }}>{passwords.length} items</span>
              </div>

              {lastSyncTimestamp && (
                <div style={{ fontSize: '0.72rem', color: '#7a827b' }}>
                  Last synced: {new Date(lastSyncTimestamp).toLocaleTimeString()}
                </div>
              )}

              <button
                onClick={handleSyncNow}
                disabled={isManualSyncing}
                style={{
                  marginTop: '0.2rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.4rem',
                  padding: '0.45rem',
                  borderRadius: '10px',
                  border: '1px solid #364239',
                  backgroundColor: '#1b201d',
                  color: '#e3e3df',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                <RefreshCw
                  size={13}
                  style={{ animation: isManualSyncing ? 'spin 1s linear infinite' : 'none' }}
                />
                <span>{isManualSyncing ? 'Syncing Vault...' : 'Sync with Cloud Now'}</span>
              </button>
            </div>

            {/* Action List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {/* Install on Android Phone Button */}
              <button
                onClick={() => setShowInstallModal(true)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.85rem 1rem',
                  backgroundColor: '#00d668',
                  borderRadius: '16px',
                  border: 'none',
                  color: '#003915',
                  cursor: 'pointer',
                  fontWeight: 800,
                  boxShadow: '0 4px 16px rgba(0, 214, 104, 0.28)',
                  transition: 'transform 0.15s ease',
                }}
                onMouseDown={(e) => (e.currentTarget.style.transform = 'scale(0.98)')}
                onMouseUp={(e) => (e.currentTarget.style.transform = 'scale(1)')}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div
                    style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '10px',
                      backgroundColor: '#003915',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#00d668',
                      flexShrink: 0,
                    }}
                  >
                    <Smartphone size={19} />
                  </div>
                  <div style={{ textAlign: 'left' }}>
                    <div style={{ fontSize: '0.92rem', fontWeight: 800, color: '#003915' }}>
                      Install on Android Phone
                    </div>
                    <div style={{ fontSize: '0.73rem', color: '#004f1e', fontWeight: 600 }}>
                      1-Click home screen install & APK guide
                    </div>
                  </div>
                </div>
                <Download size={18} color="#003915" />
              </button>

              {/* Set Fingerprint Passkey (Replaces Change Master Key) */}
              <button
                onClick={() => {
                  setBiometricError('');
                  setShowBiometricModal(true);
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.85rem 1rem',
                  backgroundColor: isBiometricRegistered ? 'rgba(0, 214, 104, 0.08)' : '#222824',
                  border: isBiometricRegistered ? '1px solid rgba(0, 214, 104, 0.25)' : '1px solid #2f3831',
                  borderRadius: '14px',
                  color: '#e3e3df',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.15s ease',
                }}
                onMouseEnter={(e) => {
                  if (!isBiometricRegistered) e.currentTarget.style.backgroundColor = '#272f2a';
                }}
                onMouseLeave={(e) => {
                  if (!isBiometricRegistered) e.currentTarget.style.backgroundColor = '#222824';
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div
                    style={{
                      width: '34px',
                      height: '34px',
                      borderRadius: '10px',
                      backgroundColor: isBiometricRegistered ? 'rgba(0, 214, 104, 0.15)' : 'rgba(255, 255, 255, 0.06)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: isBiometricRegistered ? '#00d668' : '#a0a7a0',
                      flexShrink: 0,
                    }}
                  >
                    <Fingerprint size={19} />
                  </div>
                  <div>
                    <div
                      style={{
                        fontSize: '0.86rem',
                        fontWeight: 700,
                        color: isBiometricRegistered ? '#00d668' : '#e3e3df',
                      }}
                    >
                      {isBiometricRegistered ? 'Fingerprint Passkey Active' : 'Set up Fingerprint Passkey'}
                    </div>
                    <div style={{ fontSize: '0.72rem', color: '#889189' }}>
                      {isBiometricRegistered
                        ? 'Touch ID / Fingerprint configured'
                        : 'Register biometric sign-in on this device'}
                    </div>
                  </div>
                </div>
                {isBiometricRegistered ? (
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                      color: '#00d668',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                    }}
                  >
                    <CheckCircle2 size={16} />
                    <span>Active</span>
                  </div>
                ) : (
                  <ChevronRight size={16} color="#7a827b" />
                )}
              </button>

              <button
                onClick={handleLockVault}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.75rem 1rem',
                  backgroundColor: 'transparent',
                  border: 'none',
                  borderRadius: '12px',
                  color: '#ef4444',
                  cursor: 'pointer',
                  textAlign: 'left',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.1)')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                  <Lock size={17} color="#ef4444" />
                  <span style={{ fontSize: '0.85rem', fontWeight: 700 }}>Lock Vault / Log Out</span>
                </div>
                <LogOut size={16} color="#ef4444" />
              </button>
            </div>
          </div>

          {/* Footer info */}
          <div
            style={{
              padding: '0.75rem 1.25rem',
              backgroundColor: '#161a18',
              borderTop: '1px solid #232a25',
              fontSize: '0.72rem',
              color: '#717872',
              textAlign: 'center',
            }}
          >
            Google Password Manager • End-to-End Encrypted
          </div>
        </div>
      </div>

      {/* Biometric Passkey Registration Modal */}
      {showBiometricModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.75)',
            backdropFilter: 'blur(8px)',
            zIndex: 1100,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem',
          }}
          onClick={() => setShowBiometricModal(false)}
        >
          <div
            style={{
              backgroundColor: '#1b201d',
              borderRadius: '24px',
              padding: '1.75rem',
              maxWidth: '440px',
              width: '100%',
              border: '1px solid #2d352f',
              boxShadow: '0 20px 40px rgba(0, 0, 0, 0.7)',
              display: 'flex',
              flexDirection: 'column',
              gap: '1.25rem',
              position: 'relative',
              color: '#e3e3df',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowBiometricModal(false)}
              style={{
                position: 'absolute',
                top: '1.25rem',
                right: '1.25rem',
                background: 'none',
                border: 'none',
                color: '#9ba39c',
                cursor: 'pointer',
                padding: '0.25rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <X size={20} />
            </button>

            {/* Modal Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
              <div
                style={{
                  width: '46px',
                  height: '46px',
                  borderRadius: '14px',
                  backgroundColor: isBiometricRegistered
                    ? 'rgba(0, 214, 104, 0.15)'
                    : 'rgba(99, 102, 241, 0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: isBiometricRegistered ? '#00d668' : '#818cf8',
                  flexShrink: 0,
                }}
              >
                <Fingerprint size={28} />
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: '#f0f2ee' }}>
                  Fingerprint Passkey
                </h3>
                <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.78rem', color: '#9ba39c' }}>
                  Touch ID / Android Fingerprint / Face ID / Windows Hello
                </p>
              </div>
            </div>

            {/* Status & Instructions */}
            <div
              style={{
                backgroundColor: 'rgba(0, 214, 104, 0.08)',
                border: '1px solid rgba(0, 214, 104, 0.25)',
                borderRadius: '16px',
                padding: '1rem',
                fontSize: '0.82rem',
                color: '#d0ded3',
                lineHeight: 1.5,
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  fontWeight: 800,
                  marginBottom: '0.4rem',
                  color: '#00d668',
                }}
              >
                <Info size={16} />
                <span>Device Biometric Instructions</span>
              </div>
              When you click{' '}
              <strong>
                {isBiometricRegistered
                  ? 'Re-register Fingerprint'
                  : 'Start Fingerprint Registration'}
              </strong>
              , your device or browser will present a security prompt. Touch your device's
              fingerprint sensor to securely bind your account.
            </div>

            {isBiometricRegistered && (
              <div
                style={{
                  backgroundColor: 'rgba(0, 214, 104, 0.1)',
                  border: '1px solid rgba(0, 214, 104, 0.35)',
                  borderRadius: '14px',
                  padding: '0.85rem 1rem',
                  fontSize: '0.82rem',
                  color: '#00d668',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.6rem',
                  fontWeight: 700,
                  lineHeight: 1.4,
                }}
              >
                <CheckCircle2 size={20} style={{ flexShrink: 0 }} />
                <span>
                  Fingerprint passkey is registered on this device. You can sign in using your
                  fingerprint from the login screen.
                </span>
              </div>
            )}

            {!biometricSupported && (
              <div
                style={{
                  backgroundColor: 'rgba(234, 179, 8, 0.1)',
                  border: '1px solid rgba(234, 179, 8, 0.3)',
                  borderRadius: '14px',
                  padding: '0.85rem 1rem',
                  fontSize: '0.8rem',
                  color: '#eab308',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '0.6rem',
                }}
              >
                <AlertTriangle size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
                <span>
                  <strong>Browser Notice:</strong> Native WebAuthn biometrics may be restricted in
                  sandbox preview iframe. Open in a new tab to test native Touch ID / Face ID
                  hardware prompts.
                </span>
              </div>
            )}

            {biometricError && (
              <div
                style={{
                  backgroundColor: 'rgba(239, 68, 68, 0.1)',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  borderRadius: '14px',
                  padding: '0.85rem 1rem',
                  fontSize: '0.8rem',
                  color: '#ef4444',
                  lineHeight: 1.4,
                }}
              >
                <strong>Security Notice:</strong> {biometricError}
              </div>
            )}

            {/* Actions */}
            {isBiometricRegistered ? (
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.75rem',
                  marginTop: '0.25rem',
                }}
              >
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <button
                    type="button"
                    onClick={() => setShowBiometricModal(false)}
                    style={{
                      flex: 1,
                      padding: '0.8rem',
                      borderRadius: '14px',
                      backgroundColor: '#28302a',
                      border: '1px solid #364239',
                      color: '#e3e3df',
                      fontWeight: 700,
                      fontSize: '0.85rem',
                      cursor: 'pointer',
                    }}
                  >
                    Close
                  </button>
                  <button
                    type="button"
                    onClick={handleRegisterBiometrics}
                    disabled={isRegistering}
                    style={{
                      flex: 1.5,
                      padding: '0.8rem',
                      borderRadius: '14px',
                      backgroundColor: '#00d668',
                      border: 'none',
                      color: '#003915',
                      fontWeight: 800,
                      fontSize: '0.85rem',
                      cursor: isRegistering ? 'not-allowed' : 'pointer',
                      boxShadow: '0 4px 14px rgba(0, 214, 104, 0.35)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.45rem',
                      opacity: isRegistering ? 0.7 : 1,
                    }}
                  >
                    <Fingerprint size={18} />
                    <span>{isRegistering ? 'Scanning...' : 'Re-register Passkey'}</span>
                  </button>
                </div>

                <button
                  type="button"
                  onClick={handleRemoveBiometrics}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    borderRadius: '14px',
                    backgroundColor: 'rgba(239, 68, 68, 0.1)',
                    border: '1px solid rgba(239, 68, 68, 0.3)',
                    color: '#ef4444',
                    fontWeight: 700,
                    fontSize: '0.82rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <Trash2 size={16} />
                  <span>Remove Fingerprint Registration</span>
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.25rem' }}>
                <button
                  type="button"
                  onClick={() => setShowBiometricModal(false)}
                  style={{
                    flex: 1,
                    padding: '0.8rem',
                    borderRadius: '14px',
                    backgroundColor: '#28302a',
                    border: '1px solid #364239',
                    color: '#e3e3df',
                    fontWeight: 700,
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleRegisterBiometrics}
                  disabled={isRegistering}
                  style={{
                    flex: 2,
                    padding: '0.8rem',
                    borderRadius: '14px',
                    backgroundColor: '#00d668',
                    border: 'none',
                    color: '#003915',
                    fontWeight: 800,
                    fontSize: '0.85rem',
                    cursor: isRegistering ? 'not-allowed' : 'pointer',
                    boxShadow: '0 4px 14px rgba(0, 214, 104, 0.35)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    opacity: isRegistering ? 0.7 : 1,
                  }}
                >
                  <Fingerprint size={18} />
                  <span>{isRegistering ? 'Scanning...' : 'Start Fingerprint Registration'}</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* PWA Install Modal */}
      <PWAInstallModal
        isOpen={showInstallModal}
        onClose={() => setShowInstallModal(false)}
      />
    </>
  );
};

