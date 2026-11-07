import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import {
  Sun,
  Moon,
  User,
  ShieldCheck,
  LogOut,
  Key,
  X,
  Fingerprint,
  CheckCircle2,
  Info,
  Shield,
  AlertTriangle,
  Trash2,
} from 'lucide-react';
import { registerBiometricPasskey, getStoredPasskeys, isWebAuthnSupported, clearAllPasskeys } from '../lib/biometrics';

export const Drawer: React.FC = () => {
  const {
    isRightDrawerOpen,
    setIsRightDrawerOpen,
    isDarkMode,
    themeMode,
    toggleTheme,
    logout,
    showConfirmModal,
    setIsResetPasswordOpen,
    currentUserEmail,
    addToast,
  } = useApp();

  const [isBiometricRegistered, setIsBiometricRegistered] = useState<boolean>(false);
  const [isRegistering, setIsRegistering] = useState<boolean>(false);
  const [showBiometricModal, setShowBiometricModal] = useState<boolean>(false);
  const [biometricSupported, setBiometricSupported] = useState<boolean>(true);
  const [biometricError, setBiometricError] = useState<string>('');

  const isAuthorizedAdmin = true;

  useEffect(() => {
    if (isRightDrawerOpen) {
      const keys = getStoredPasskeys();
      setIsBiometricRegistered(keys.length > 0);
      isWebAuthnSupported().then((sup) => setBiometricSupported(sup));
    }
  }, [isRightDrawerOpen]);

  const handleRegisterBiometrics = async () => {
    setIsRegistering(true);
    setBiometricError('');
    try {
      const username = currentUserEmail || 'Administrator';
      const res = await registerBiometricPasskey(username);
      if (res.success) {
        setIsBiometricRegistered(true);
        addToast('Biometric Passkey registered successfully on this device!', 'success');
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
      'REMOVE BIOMETRIC FINGERPRINT PASSKEY',
      'Are you sure you want to remove your biometric fingerprint passkey registration from this device?',
      () => {
        clearAllPasskeys();
        setIsBiometricRegistered(false);
        setShowBiometricModal(false);
        addToast('Biometric Passkey registration removed successfully!', 'info');
      },
      true, // isDanger
      false // requirePassword (no security key required)
    );
  };

  return (
    <>
      {isRightDrawerOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.4)',
            backdropFilter: 'blur(3px)',
            zIndex: 98,
          }}
          onClick={() => setIsRightDrawerOpen(false)}
        />
      )}

      {/* Biometric Passkey Registration Modal */}
      {showBiometricModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.65)',
            backdropFilter: 'blur(6px)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem',
          }}
          onClick={() => setShowBiometricModal(false)}
        >
          <div
            style={{
              backgroundColor: 'var(--bg-secondary)',
              borderRadius: '24px',
              padding: '1.75rem',
              maxWidth: '440px',
              width: '100%',
              border: '1px solid var(--border-color)',
              boxShadow: '0 20px 40px rgba(0, 0, 0, 0.35)',
              display: 'flex',
              flexDirection: 'column',
              gap: '1.25rem',
              position: 'relative',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowBiometricModal(false)}
              style={{
                position: 'absolute',
                top: '1rem',
                right: '1rem',
                background: 'none',
                border: 'none',
                color: 'var(--text-muted)',
                cursor: 'pointer',
              }}
            >
              <X size={20} />
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '14px',
                  backgroundColor: 'rgba(99, 102, 241, 0.12)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#6366f1',
                }}
              >
                <Fingerprint size={26} />
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                  Biometric Passkey Setup
                </h3>
                <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  Touch ID / Face ID / Fingerprint / Security Key
                </p>
              </div>
            </div>

            {/* Instruction Banner */}
            <div
              style={{
                backgroundColor: 'rgba(59, 130, 246, 0.08)',
                border: '1px solid rgba(59, 130, 246, 0.25)',
                borderRadius: '14px',
                padding: '0.9rem 1rem',
                fontSize: '0.82rem',
                color: 'var(--text-primary)',
                lineHeight: 1.5,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 800, marginBottom: '0.4rem', color: '#3b82f6' }}>
                <Info size={16} />
                <span>Device Security Prompt Instructions</span>
              </div>
              When you click <strong>Start Fingerprint Registration</strong>, your device or browser will present a security prompt. Scan your fingerprint to authorize and bind your account passkey.
            </div>

            {isBiometricRegistered && (
              <div
                style={{
                  backgroundColor: 'rgba(16, 185, 129, 0.08)',
                  border: '1px solid rgba(16, 185, 129, 0.3)',
                  borderRadius: '14px',
                  padding: '0.85rem 1rem',
                  fontSize: '0.8rem',
                  color: '#10b981',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.6rem',
                  fontWeight: 700,
                  lineHeight: 1.4,
                }}
              >
                <CheckCircle2 size={18} style={{ flexShrink: 0 }} />
                <span>Fingerprint passkey is registered on this device. You can re-register or remove registration with security permission below.</span>
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
                  color: '#ca8a04',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '0.6rem',
                }}
              >
                <AlertTriangle size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
                <span>
                  <strong>Browser Notice:</strong> Native WebAuthn biometrics may be restricted in sandbox iframe preview. A hardware biometric passkey will be safely bound to this device.
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

            {/* Action Buttons */}
            {isBiometricRegistered ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', marginTop: '0.5rem' }}>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <button
                    type="button"
                    onClick={() => setShowBiometricModal(false)}
                    style={{
                      flex: 1,
                      padding: '0.8rem',
                      borderRadius: '12px',
                      backgroundColor: 'var(--bg-tertiary)',
                      border: '1px solid var(--border-color)',
                      color: 'var(--text-primary)',
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
                      flex: 1.5,
                      padding: '0.8rem',
                      borderRadius: '12px',
                      backgroundColor: '#6366f1',
                      border: 'none',
                      color: '#ffffff',
                      fontWeight: 800,
                      fontSize: '0.85rem',
                      cursor: isRegistering ? 'not-allowed' : 'pointer',
                      boxShadow: '0 4px 12px rgba(99, 102, 241, 0.35)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.4rem',
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
                    padding: '0.8rem',
                    borderRadius: '12px',
                    backgroundColor: 'rgba(239, 68, 68, 0.1)',
                    border: '1px solid rgba(239, 68, 68, 0.3)',
                    color: '#ef4444',
                    fontWeight: 800,
                    fontSize: '0.82rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    transition: 'all 0.2s ease',
                  }}
                >
                  <Trash2 size={16} />
                  <span>REMOVE FINGERPRINT REGISTRATION</span>
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => setShowBiometricModal(false)}
                  style={{
                    flex: 1,
                    padding: '0.8rem',
                    borderRadius: '12px',
                    backgroundColor: 'var(--bg-tertiary)',
                    border: '1px solid var(--border-color)',
                    color: 'var(--text-primary)',
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
                    borderRadius: '12px',
                    backgroundColor: '#6366f1',
                    border: 'none',
                    color: '#ffffff',
                    fontWeight: 800,
                    fontSize: '0.85rem',
                    cursor: isRegistering ? 'not-allowed' : 'pointer',
                    boxShadow: '0 4px 12px rgba(99, 102, 241, 0.35)',
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

      <div className={`right-drawer ${isRightDrawerOpen ? 'open' : ''}`} style={{ zIndex: 99, position: 'fixed' }}>
        {/* Close X Button */}
        <button
          onClick={() => setIsRightDrawerOpen(false)}
          className="btn-icon"
          style={{
            position: 'absolute',
            top: '0.85rem',
            right: '0.85rem',
            zIndex: 10,
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            backgroundColor: 'var(--bg-tertiary)',
            color: 'var(--text-primary)',
            border: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
          }}
          title="Close Drawer"
        >
          <X size={20} />
        </button>
        <div style={{ padding: '2rem 1.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
          {/* Avatar Circle */}
          <div
            style={{
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              backgroundColor: '#ff5e36',
              color: '#ffffff',
              fontSize: '2.5rem',
              fontWeight: 900,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 8px 20px rgba(255, 94, 54, 0.35)',
              marginBottom: '0.75rem',
            }}
          >
            {currentUserEmail ? currentUserEmail.trim().charAt(0).toUpperCase() : 'A'}
          </div>

          <h3 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>
            Administrator
          </h3>

          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem',
              marginTop: '0.35rem',
              color: '#ff5e36',
              fontWeight: 700,
              fontSize: '0.8rem',
            }}
          >
            <ShieldCheck size={16} />
            <span>Super User Access</span>
          </div>
        </div>

        <div style={{ padding: '0 1.5rem 1.5rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem', flex: 1, overflowY: 'auto' }}>
          {/* Dark Mode Card */}
          <div
            className="card"
            onClick={toggleTheme}
            style={{
              padding: '1rem 1.25rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              borderRadius: '16px',
              cursor: 'pointer',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              {isDarkMode ? <Moon size={20} color="#ff5e36" /> : <Sun size={20} color="#ff5e36" />}
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '0.04em' }}>
                  DARK MODE
                </span>
                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#ff5e36', marginTop: '1px' }}>
                  {themeMode === 'system' ? 'System default' : themeMode === 'light' ? 'Light' : 'Dark'}
                </span>
              </div>
            </div>

            {/* Toggle Switch Pill */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleTheme();
              }}
              style={{
                width: '50px',
                height: '28px',
                borderRadius: '9999px',
                backgroundColor: isDarkMode ? '#ff5e36' : '#e2e8f0',
                border: 'none',
                position: 'relative',
                cursor: 'pointer',
                transition: 'background-color 0.2s ease',
                padding: '2px',
              }}
            >
              <div
                style={{
                  width: '24px',
                  height: '24px',
                  borderRadius: '50%',
                  backgroundColor: '#ffffff',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                  transform: isDarkMode ? 'translateX(22px)' : 'translateX(0px)',
                  transition: 'transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)',
                }}
              />
            </button>
          </div>

          {/* User ID Card */}
          <div
            className="card"
            style={{
              padding: '1.25rem',
              borderRadius: '16px',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.5rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', wordBreak: 'break-all' }}>
              <User size={18} color="#3b82f6" style={{ flexShrink: 0 }} />
              <span style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                ID: {currentUserEmail || 'Administrator'}
              </span>
            </div>
          </div>

          {/* Sign Out Button */}
          <button
            onClick={() => {
              showConfirmModal(
                'CONFIRM LOGOUT',
                'Are you sure you want to sign out of Data Password Portal? You will need to enter your Security Key to enter again.',
                () => {
                  logout();
                  setIsRightDrawerOpen(false);
                },
                true
              );
            }}
            style={{
              width: '100%',
              padding: '1rem 1.25rem',
              borderRadius: '16px',
              backgroundColor: 'rgba(239, 68, 68, 0.08)',
              border: '1px solid rgba(239, 68, 68, 0.2)',
              color: '#ef4444',
              fontWeight: 900,
              fontSize: '0.9rem',
              letterSpacing: '0.04em',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              cursor: 'pointer',
              marginTop: '0.5rem',
              transition: 'all 0.2s ease',
            }}
          >
            <span>SIGN OUT SYSTEM</span>
            <LogOut size={18} />
          </button>

          {/* Register Fingerprint / Biometric Passkey Controls */}
          {isAuthorizedAdmin && (
            <button
              onClick={() => {
                setBiometricError('');
                setShowBiometricModal(true);
              }}
              style={{
                width: '100%',
                padding: '0.85rem 1.25rem',
                borderRadius: '16px',
                backgroundColor: isBiometricRegistered ? 'rgba(16, 185, 129, 0.08)' : 'rgba(99, 102, 241, 0.08)',
                border: isBiometricRegistered ? '1px solid rgba(16, 185, 129, 0.25)' : '1px solid rgba(99, 102, 241, 0.25)',
                color: isBiometricRegistered ? '#10b981' : '#6366f1',
                fontWeight: 800,
                fontSize: '0.85rem',
                letterSpacing: '0.03em',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                cursor: 'pointer',
                marginTop: '0.25rem',
                transition: 'all 0.2s ease',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <Fingerprint size={18} />
                <span>
                  {isBiometricRegistered
                    ? 'FINGERPRINT PASSKEY ACTIVE'
                    : 'REGISTER FINGERPRINT PASSKEY'}
                </span>
              </div>
              {isBiometricRegistered ? <CheckCircle2 size={18} /> : <Shield size={18} />}
            </button>
          )}

          {/* Reset Password Button */}
          <button
            onClick={() => {
              setIsRightDrawerOpen(false);
              setIsResetPasswordOpen(true);
            }}
            style={{
              width: '100%',
              padding: '0.85rem 1.25rem',
              borderRadius: '16px',
              backgroundColor: 'rgba(59, 130, 246, 0.08)',
              border: '1px solid rgba(59, 130, 246, 0.2)',
              color: '#3b82f6',
              fontWeight: 800,
              fontSize: '0.85rem',
              letterSpacing: '0.03em',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              cursor: 'pointer',
              marginTop: '0.25rem',
              transition: 'all 0.2s ease',
            }}
          >
            <span>RESET PASSWORD</span>
            <Key size={18} />
          </button>
        </div>
      </div>
    </>
  );
};

