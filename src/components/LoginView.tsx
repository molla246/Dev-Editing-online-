import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Shield, User, Key, Eye, EyeOff, AlertCircle, Fingerprint, Mail, CheckCircle2, Info, Lock } from 'lucide-react';
import { authenticateWithBiometrics, getStoredPasskeys, isWebAuthnSupported } from '../lib/biometrics';

export const LoginView: React.FC = () => {
  const { login, loginWithBiometrics, addToast } = useApp();
  const [loginTab, setLoginTab] = useState<'email' | 'fingerprint'>('email');
  const [emailInput, setEmailInput] = useState<string>('');
  const [masterKeyInput, setMasterKeyInput] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [infoMsg, setInfoMsg] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [storedPasskeysCount, setStoredPasskeysCount] = useState<number>(0);
  const [isSupported, setIsSupported] = useState<boolean>(true);

  useEffect(() => {
    const keys = getStoredPasskeys();
    setStoredPasskeysCount(keys.length);
    isWebAuthnSupported().then((sup) => setIsSupported(sup));
  }, [loginTab]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setInfoMsg('');
    setIsLoading(true);
    try {
      const res = await login(masterKeyInput, emailInput);
      if (!res.success) {
        setErrorMsg(res.error || 'Firebase Authentication failed! Account not found or invalid security key.');
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'An error occurred during login. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBiometricAuth = async () => {
    setErrorMsg('');
    setInfoMsg('');

    // Check if passkey is registered first
    const keys = getStoredPasskeys();
    if (keys.length === 0) {
      setInfoMsg('No biometric passkey registered on this device yet. Please log in with your Email & Password first, then register your fingerprint in Profile Settings.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await authenticateWithBiometrics();
      if (res.success) {
        addToast('Biometric Fingerprint verification successful!', 'success');
        await loginWithBiometrics();
      } else {
        setErrorMsg(res.error || 'Fingerprint / Biometric authentication failed or was cancelled.');
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'Fingerprint verification failed.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-bg-container">
      {/* Animated Fast Multi-Color Floating Blurred Orbs */}
      <div className="orb orb-1" />
      <div className="orb orb-2" />
      <div className="orb orb-3" />
      <div className="orb orb-4" />
      <div className="orb orb-5" />
      <div className="orb orb-6" />

      <div
        className="card"
        style={{
          position: 'relative',
          zIndex: 1,
          width: '100%',
          maxWidth: '420px',
          padding: '2.5rem 2rem',
          borderRadius: '28px',
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.15)',
          borderColor: 'rgba(255, 255, 255, 0.2)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          backgroundColor: 'var(--bg-secondary)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        {/* Top Dark Badge */}
        <div
          style={{
            width: '64px',
            height: '64px',
            borderRadius: '20px',
            backgroundColor: '#0b132b',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 8px 24px rgba(11, 19, 43, 0.35)',
            marginBottom: '1.25rem',
          }}
        >
          <Shield size={32} color="#00d2fe" />
        </div>

        {/* Header Titles */}
        <h1
          style={{
            fontSize: '1.5rem',
            fontWeight: 900,
            letterSpacing: '0.03em',
            margin: '0 0 0.25rem 0',
            color: 'var(--text-primary)',
            textAlign: 'center',
          }}
        >
          DATA PASSWORD
        </h1>
        <p
          style={{
            fontSize: '0.78rem',
            fontWeight: 800,
            letterSpacing: '0.08em',
            color: 'var(--text-muted)',
            margin: '0 0 1.25rem 0',
            textAlign: 'center',
          }}
        >
          SECURE ACCESS PORTAL
        </p>

        {/* Pill Segment Toggle (E-mail / Fingerprint) */}
        <div
          style={{
            width: '100%',
            backgroundColor: 'var(--bg-input)',
            borderRadius: '9999px',
            padding: '4px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '1.25rem',
            border: '1px solid var(--border-color)',
            boxShadow: 'inset 0 1px 3px rgba(0, 0, 0, 0.05)',
          }}
        >
          <button
            type="button"
            onClick={() => {
              setLoginTab('email');
              setErrorMsg('');
            }}
            style={{
              flex: 1,
              padding: '0.6rem 0.8rem',
              borderRadius: '9999px',
              border: 'none',
              backgroundColor: loginTab === 'email' ? 'var(--bg-secondary)' : 'transparent',
              color: loginTab === 'email' ? 'var(--text-primary)' : 'var(--text-muted)',
              fontWeight: 800,
              fontSize: '0.88rem',
              cursor: 'pointer',
              boxShadow: loginTab === 'email' ? '0 2px 8px rgba(0, 0, 0, 0.12)' : 'none',
              transition: 'all 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.4rem',
            }}
          >
            <Mail size={16} />
            <span>E-mail</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setLoginTab('fingerprint');
              setErrorMsg('');
            }}
            style={{
              flex: 1,
              padding: '0.6rem 0.8rem',
              borderRadius: '9999px',
              border: 'none',
              backgroundColor: loginTab === 'fingerprint' ? 'var(--bg-secondary)' : 'transparent',
              color: loginTab === 'fingerprint' ? 'var(--text-primary)' : 'var(--text-muted)',
              fontWeight: 800,
              fontSize: '0.88rem',
              cursor: 'pointer',
              boxShadow: loginTab === 'fingerprint' ? '0 2px 8px rgba(0, 0, 0, 0.12)' : 'none',
              transition: 'all 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.4rem',
            }}
          >
            <Fingerprint size={16} />
            <span>Fingerprint</span>
          </button>
        </div>

        {/* Informational Message Banner */}
        {infoMsg && (
          <div
            style={{
              width: '100%',
              backgroundColor: 'rgba(59, 130, 246, 0.1)',
              border: '1px solid rgba(59, 130, 246, 0.3)',
              borderRadius: '12px',
              padding: '0.75rem 0.9rem',
              marginBottom: '1.25rem',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '0.6rem',
              color: '#3b82f6',
              fontSize: '0.78rem',
              fontWeight: 700,
              lineHeight: 1.4,
              boxSizing: 'border-box',
            }}
          >
            <Info size={18} style={{ flexShrink: 0, marginTop: '1px' }} />
            <span>{infoMsg}</span>
          </div>
        )}

        {/* Error Popup Box */}
        {errorMsg && (
          <div
            style={{
              width: '100%',
              backgroundColor: 'rgba(239, 68, 68, 0.12)',
              border: '1.5px solid #ef4444',
              borderRadius: '12px',
              padding: '0.6rem 0.85rem',
              marginBottom: '1.25rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              color: '#ef4444',
              fontSize: '0.75rem',
              fontWeight: 800,
              boxShadow: '0 4px 12px rgba(239, 68, 68, 0.2)',
              animation: 'toastPop 0.25s ease',
              wordBreak: 'break-word',
              lineHeight: 1.35,
              boxSizing: 'border-box',
            }}
          >
            <AlertCircle size={18} style={{ flexShrink: 0 }} />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* WebAuthn / Biometric Browser Setting Notice if restricted */}
        {!isSupported && (
          <div
            style={{
              width: '100%',
              backgroundColor: 'rgba(234, 179, 8, 0.12)',
              border: '1px solid rgba(234, 179, 8, 0.35)',
              borderRadius: '12px',
              padding: '0.7rem 0.85rem',
              marginBottom: '1.25rem',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '0.6rem',
              color: '#ca8a04',
              fontSize: '0.75rem',
              fontWeight: 700,
              lineHeight: 1.4,
              boxSizing: 'border-box',
            }}
          >
            <Lock size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
            <span>
              <strong>Biometrics Notice:</strong> Browser hardware WebAuthn may be restricted in sandbox iframe or OS setting. Please check browser permissions or open in main tab.
            </span>
          </div>
        )}

        {/* E-mail Login Form */}
        {loginTab === 'email' && (
          <form onSubmit={handleSubmit} style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {/* User ID / Email */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              <label
                style={{
                  fontSize: '0.72rem',
                  fontWeight: 900,
                  color: 'var(--text-secondary)',
                  letterSpacing: '0.04em',
                }}
              >
                USER ID / EMAIL
              </label>
              <div
                style={{
                  backgroundColor: 'var(--bg-input)',
                  border: errorMsg ? '1px solid #ef4444' : '1px solid var(--border-color)',
                  borderRadius: '14px',
                  padding: '0.75rem 1rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                }}
              >
                <User size={18} color={errorMsg ? '#ef4444' : '#94a3b8'} style={{ flexShrink: 0 }} />
                <input
                  type="email"
                  value={emailInput}
                  onChange={(e) => {
                    setEmailInput(e.target.value);
                    if (errorMsg) setErrorMsg('');
                  }}
                  placeholder="Enter Email / User ID"
                  style={{
                    border: 'none',
                    outline: 'none',
                    background: 'transparent',
                    color: 'var(--text-primary)',
                    fontSize: '0.9rem',
                    fontWeight: 700,
                    width: '100%',
                  }}
                />
              </div>
            </div>

            {/* Security Key / Password */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              <label
                style={{
                  fontSize: '0.72rem',
                  fontWeight: 900,
                  color: 'var(--text-secondary)',
                  letterSpacing: '0.04em',
                }}
              >
                SECURITY KEY / PASSWORD
              </label>
              <div
                style={{
                  backgroundColor: 'var(--bg-input)',
                  border: errorMsg ? '1px solid #ef4444' : '1px solid var(--border-color)',
                  borderRadius: '14px',
                  padding: '0.75rem 1rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  position: 'relative',
                }}
              >
                <Key size={18} color={errorMsg ? '#ef4444' : '#94a3b8'} style={{ flexShrink: 0 }} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={masterKeyInput}
                  onChange={(e) => {
                    setMasterKeyInput(e.target.value);
                    if (errorMsg) setErrorMsg('');
                  }}
                  placeholder="••••••"
                  autoFocus
                  style={{
                    border: 'none',
                    outline: 'none',
                    background: 'transparent',
                    color: 'var(--text-primary)',
                    fontSize: '0.9rem',
                    fontWeight: 700,
                    width: '100%',
                    paddingRight: '1.75rem',
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '0.85rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    color: 'var(--text-muted)',
                    cursor: 'pointer',
                    padding: 0,
                    display: 'flex',
                  }}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Sign In Button */}
            <button
              type="submit"
              disabled={isLoading}
              style={{
                width: '100%',
                padding: '0.9rem',
                borderRadius: '14px',
                background: isLoading ? '#475569' : 'linear-gradient(90deg, #3b82f6 0%, #4f46e5 100%)',
                color: '#ffffff',
                fontWeight: 900,
                fontSize: '0.95rem',
                letterSpacing: '0.06em',
                border: 'none',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                boxShadow: isLoading ? 'none' : '0 4px 16px rgba(59, 130, 246, 0.35)',
                marginTop: '0.5rem',
                transition: 'all 0.2s ease',
                opacity: isLoading ? 0.8 : 1,
              }}
            >
              {isLoading ? (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.6rem' }}>
                  <div
                    style={{
                      width: '18px',
                      height: '18px',
                      borderRadius: '50%',
                      border: '2.5px solid rgba(255, 255, 255, 0.3)',
                      borderTopColor: '#ffffff',
                      borderRightColor: 'rgba(255, 255, 255, 0.7)',
                      animation: 'spin 0.7s linear infinite',
                    }}
                  />
                  <span>VERIFYING & CONNECTING...</span>
                </div>
              ) : (
                'SIGN IN'
              )}
            </button>

          </form>
        )}

        {/* Fingerprint / Biometrics Login View */}
        {loginTab === 'fingerprint' && (
          <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.25rem' }}>
            {/* Fingerprint Pulse Icon */}
            <button
              type="button"
              onClick={handleBiometricAuth}
              disabled={isLoading}
              style={{
                width: '100px',
                height: '100px',
                borderRadius: '50%',
                backgroundColor: 'rgba(59, 130, 246, 0.12)',
                border: '2px solid rgba(59, 130, 246, 0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                margin: '0.5rem 0',
                transition: 'all 0.3s ease',
                boxShadow: '0 0 25px rgba(59, 130, 246, 0.25)',
              }}
            >
              <Fingerprint size={52} color="#3b82f6" style={{ animation: isLoading ? 'pulse 1s infinite' : 'none' }} />
            </button>

            <div style={{ textAlign: 'center' }}>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800, margin: '0 0 0.25rem 0', color: 'var(--text-primary)' }}>
                Biometric Fingerprint Authentication
              </h3>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: 0, fontWeight: 700 }}>
                {storedPasskeysCount > 0
                  ? 'Touch sensor or place registered passkey to gain instant access.'
                  : 'No passkey registered on this device yet.'}
              </p>
            </div>

            {/* Action Buttons */}
            {storedPasskeysCount > 0 ? (
              <button
                type="button"
                onClick={handleBiometricAuth}
                disabled={isLoading}
                style={{
                  width: '100%',
                  padding: '0.9rem',
                  borderRadius: '14px',
                  background: isLoading ? '#475569' : 'linear-gradient(90deg, #3b82f6 0%, #4f46e5 100%)',
                  color: '#ffffff',
                  fontWeight: 900,
                  fontSize: '0.92rem',
                  letterSpacing: '0.04em',
                  border: 'none',
                  cursor: isLoading ? 'not-allowed' : 'pointer',
                  boxShadow: isLoading ? 'none' : '0 4px 16px rgba(59, 130, 246, 0.35)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  transition: 'all 0.2s ease',
                }}
              >
                {isLoading ? (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.6rem' }}>
                    <div
                      style={{
                        width: '18px',
                        height: '18px',
                        borderRadius: '50%',
                        border: '2.5px solid rgba(255, 255, 255, 0.3)',
                        borderTopColor: '#ffffff',
                        borderRightColor: 'rgba(255, 255, 255, 0.7)',
                        animation: 'spin 0.7s linear infinite',
                      }}
                    />
                    <span>SCANNING FINGERPRINT...</span>
                  </div>
                ) : (
                  <>
                    <Fingerprint size={20} />
                    <span>AUTHENTICATE FINGERPRINT</span>
                  </>
                )}
              </button>
            ) : (
              <div
                style={{
                  width: '100%',
                  padding: '0.85rem 1rem',
                  borderRadius: '14px',
                  backgroundColor: 'rgba(99, 102, 241, 0.08)',
                  border: '1px solid rgba(99, 102, 241, 0.25)',
                  color: 'var(--text-secondary)',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  textAlign: 'center',
                  lineHeight: 1.5,
                  boxSizing: 'border-box',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', color: '#6366f1', marginBottom: '0.3rem', fontWeight: 800 }}>
                  <Info size={16} />
                  <span>REGISTRATION REQUIRED IN APP</span>
                </div>
                Log in first using your E-mail & Security Key to register your fingerprint passkey in Account Settings.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};


