import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import {
  Download,
  Upload,
  Trash2,
  CheckCircle2,
  Plus,
  X,
  Shield,
  FileSpreadsheet,
  AlertTriangle,
  Loader2,
  Globe,
  Fingerprint,
  ChevronRight,
  Info,
  Smartphone,
} from 'lucide-react';
import { DeclinedSite } from '../types';
import { PasswordAvatar } from '../components/PasswordAvatar';
import { PWAInstallModal } from '../components/PWAInstallModal';
import {
  registerBiometricPasskey,
  getStoredPasskeys,
  isWebAuthnSupported,
  clearAllPasskeys,
} from '../lib/biometrics';

export const GoogleSettingsView: React.FC = () => {
  const {
    passwords,
    importCsvFile,
    exportCsvFile,
    importProgress,
    showConfirmModal,
    addToast,
    deleteAllPasswords,
    userEmail,
  } = useApp();

  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isAddDeclinedModalOpen, setIsAddDeclinedModalOpen] = useState(false);
  const [newDeclinedDomain, setNewDeclinedDomain] = useState('');
  const [newDeclinedName, setNewDeclinedName] = useState('');

  // Biometric / Fingerprint State
  const [isBiometricRegistered, setIsBiometricRegistered] = useState<boolean>(false);
  const [isRegistering, setIsRegistering] = useState<boolean>(false);
  const [showBiometricModal, setShowBiometricModal] = useState<boolean>(false);
  const [biometricSupported, setBiometricSupported] = useState<boolean>(true);
  const [biometricError, setBiometricError] = useState<string>('');
  const [showInstallModal, setShowInstallModal] = useState<boolean>(false);

  useEffect(() => {
    const keys = getStoredPasskeys();
    setIsBiometricRegistered(keys.length > 0);
    isWebAuthnSupported().then((sup) => setBiometricSupported(sup));
  }, []);

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
        addToast('Biometric Fingerprint Passkey removed successfully!', 'info');
      },
      true,
      false
    );
  };

  // Initial list of declined sites matching Photo 2 & 5
  const [declinedSites, setDeclinedSites] = useState<DeclinedSite[]>([
    { id: '1', name: 'Binance', domain: 'accounts.binance.com' },
    { id: '2', name: 'Google Accounts', domain: 'accounts.google.com' },
    { id: '3', name: 'Buzzily', domain: 'Buzzily' },
    { id: '4', name: 'Facebook Lite', domain: 'Facebook Lite' },
    { id: '5', name: 'Realme ID', domain: 'id.realme.com' },
    { id: '6', name: 'Instagram', domain: 'instagram.com' },
    { id: '7', name: 'Netflix', domain: 'netflix.com' },
    { id: '8', name: 'Twitter / X', domain: 'twitter.com' },
    { id: '9', name: 'LinkedIn', domain: 'linkedin.com' },
    { id: '10', name: 'Amazon', domain: 'amazon.com' },
    { id: '11', name: 'Discord', domain: 'discord.com' },
    { id: '12', name: 'Telegram Web', domain: 'web.telegram.org' },
    { id: '13', name: 'Spotify', domain: 'spotify.com' },
    { id: '14', name: 'GitHub', domain: 'github.com' },
    { id: '15', name: 'PayPal', domain: 'paypal.com' },
    { id: '16', name: 'Reddit', domain: 'reddit.com' },
    { id: '17', name: 'Pinterest', domain: 'pinterest.com' },
    { id: '18', name: 'Snapchat', domain: 'snapchat.com' },
  ]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsImportModalOpen(true);
    await importCsvFile(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleExportClick = () => {
    exportCsvFile();
    addToast('Google Password Manager CSV exported successfully.', 'success');
  };

  const handleDeleteAllData = () => {
    showConfirmModal(
      'Delete all data from Google Password Manager?',
      `This will permanently delete all ${passwords.length} saved passwords and passkeys from Google Password Manager. Enter your Master Key to confirm.`,
      () => {
        if (deleteAllPasswords) {
          deleteAllPasswords();
        }
        addToast('All password data has been deleted.', 'info');
      },
      true,
      false
    );
  };

  const handleRemoveDeclinedSite = (id: string, domain: string) => {
    setDeclinedSites((prev) => prev.filter((s) => s.id !== id));
    addToast(`Removed ${domain} from declined sites`, 'info');
  };

  const handleAddDeclinedSite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDeclinedDomain.trim()) return;

    const newSite: DeclinedSite = {
      id: Date.now().toString(),
      name: newDeclinedName.trim() || newDeclinedDomain.trim(),
      domain: newDeclinedDomain.trim(),
      dateAdded: Date.now(),
    };

    setDeclinedSites((prev) => [newSite, ...prev]);
    setNewDeclinedDomain('');
    setNewDeclinedName('');
    setIsAddDeclinedModalOpen(false);
    addToast(`Added ${newSite.domain} to declined sites`, 'success');
  };

  return (
    <div
      style={{
        maxWidth: '800px',
        margin: '0 auto',
        padding: '0.5rem 1rem 5rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
      }}
    >
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept=".csv,.json"
        style={{ display: 'none' }}
      />

      {/* Biometric Fingerprint Passkey Card */}
      <div
        style={{
          backgroundColor: '#1b201d',
          borderRadius: '22px',
          border: '1px solid #262e28',
          overflow: 'hidden',
        }}
      >
        <button
          onClick={() => {
            setBiometricError('');
            setShowBiometricModal(true);
          }}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            padding: '1.1rem 1.25rem',
            width: '100%',
            background: 'none',
            border: 'none',
            color: '#e3e3df',
            cursor: 'pointer',
            textAlign: 'left',
            transition: 'background-color 0.15s ease',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#232a25')}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
        >
          <div
            style={{
              width: '38px',
              height: '38px',
              borderRadius: '50%',
              backgroundColor: isBiometricRegistered ? 'rgba(0, 214, 104, 0.18)' : '#193928',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <Fingerprint size={20} color={isBiometricRegistered ? '#00d668' : '#a0a7a0'} />
          </div>
          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontSize: '0.98rem', fontWeight: 600, color: '#f0f2ee' }}>
                Screen lock and fingerprint passkey
              </span>
              {isBiometricRegistered && (
                <span
                  style={{
                    fontSize: '0.72rem',
                    backgroundColor: 'rgba(0, 214, 104, 0.15)',
                    color: '#00d668',
                    padding: '0.15rem 0.5rem',
                    borderRadius: '8px',
                    fontWeight: 700,
                  }}
                >
                  Active
                </span>
              )}
            </div>
            <div style={{ fontSize: '0.82rem', color: '#9ba39c', marginTop: '0.15rem' }}>
              {isBiometricRegistered
                ? 'Device passkey is active for instant biometric login'
                : 'Set up fingerprint passkey (Touch ID / Face ID / Android sensor)'}
            </div>
          </div>
          <ChevronRight size={18} color="#7a827b" />
        </button>
      </div>

      {/* Install on Android Phone (PWA) Card */}
      <div
        style={{
          backgroundColor: '#1b201d',
          borderRadius: '22px',
          border: '1px solid #262e28',
          overflow: 'hidden',
        }}
      >
        <button
          onClick={() => setShowInstallModal(true)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            padding: '1.1rem 1.25rem',
            width: '100%',
            background: 'none',
            border: 'none',
            color: '#e3e3df',
            cursor: 'pointer',
            textAlign: 'left',
            transition: 'background-color 0.15s ease',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#232a25')}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
        >
          <div
            style={{
              width: '38px',
              height: '38px',
              borderRadius: '50%',
              backgroundColor: 'rgba(0, 214, 104, 0.16)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <Smartphone size={20} color="#00d668" />
          </div>
          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontSize: '0.98rem', fontWeight: 600, color: '#f0f2ee' }}>
                Install on Android Phone
              </span>
              <span
                style={{
                  fontSize: '0.72rem',
                  backgroundColor: 'rgba(0, 214, 104, 0.15)',
                  color: '#00d668',
                  padding: '0.15rem 0.5rem',
                  borderRadius: '8px',
                  fontWeight: 700,
                }}
              >
                PWA
              </span>
            </div>
            <div style={{ fontSize: '0.82rem', color: '#9ba39c', marginTop: '0.15rem' }}>
              Add to Android home screen (full screen) or generate standalone .APK
            </div>
          </div>
          <ChevronRight size={18} color="#7a827b" />
        </button>
      </div>

      {/* Card 1: Import & Export Passwords (matching Photo 2 & 5) */}
      <div
        style={{
          backgroundColor: '#1b201d',
          borderRadius: '22px',
          border: '1px solid #262e28',
          overflow: 'hidden',
        }}
      >
        {/* Import Action */}
        <button
          onClick={() => fileInputRef.current?.click()}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            padding: '1.1rem 1.25rem',
            width: '100%',
            background: 'none',
            border: 'none',
            borderBottom: '1px solid #242b26',
            color: '#e3e3df',
            cursor: 'pointer',
            textAlign: 'left',
            transition: 'background-color 0.15s ease',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#232a25')}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
        >
          <div
            style={{
              width: '38px',
              height: '38px',
              borderRadius: '50%',
              backgroundColor: '#193928',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <Download size={20} color="#00d668" />
          </div>
          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{ fontSize: '0.98rem', fontWeight: 600, color: '#f0f2ee' }}>
              Import passwords and passkeys
            </div>
            <div style={{ fontSize: '0.82rem', color: '#9ba39c', marginTop: '0.15rem' }}>
              Add from another password manager
            </div>
          </div>
        </button>

        {/* Export Action */}
        <button
          onClick={handleExportClick}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            padding: '1.1rem 1.25rem',
            width: '100%',
            background: 'none',
            border: 'none',
            color: '#e3e3df',
            cursor: 'pointer',
            textAlign: 'left',
            transition: 'background-color 0.15s ease',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#232a25')}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
        >
          <div
            style={{
              width: '38px',
              height: '38px',
              borderRadius: '50%',
              backgroundColor: '#193928',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <Upload size={20} color="#00d668" />
          </div>
          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{ fontSize: '0.98rem', fontWeight: 600, color: '#f0f2ee' }}>
              Export passwords and passkeys
            </div>
            <div style={{ fontSize: '0.82rem', color: '#9ba39c', marginTop: '0.15rem' }}>
              Move to another password manager
            </div>
          </div>
        </button>
      </div>

      {/* Card 2: Delete All Data (matching Photo 2 & 5) */}
      <div
        style={{
          backgroundColor: '#1b201d',
          borderRadius: '22px',
          border: '1px solid #262e28',
          overflow: 'hidden',
        }}
      >
        <button
          onClick={handleDeleteAllData}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            padding: '1.1rem 1.25rem',
            width: '100%',
            background: 'none',
            border: 'none',
            color: '#e3e3df',
            cursor: 'pointer',
            textAlign: 'left',
            transition: 'background-color 0.15s ease',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#232a25')}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
        >
          <div
            style={{
              width: '38px',
              height: '38px',
              borderRadius: '50%',
              backgroundColor: '#193928',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <Trash2 size={20} color="#00d668" />
          </div>
          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{ fontSize: '0.98rem', fontWeight: 600, color: '#f0f2ee' }}>
              Delete all data
            </div>
            <div style={{ fontSize: '0.82rem', color: '#9ba39c', marginTop: '0.15rem' }}>
              From Google Password Manager, including passwords and passkeys
            </div>
          </div>
        </button>
      </div>

      {/* Card 3: On-device encryption (matching Photo 2 & 5) */}
      <div
        style={{
          backgroundColor: '#1b201d',
          borderRadius: '22px',
          border: '1px solid #262e28',
          padding: '1.25rem',
          display: 'flex',
          gap: '1rem',
        }}
      >
        <div style={{ flexShrink: 0, marginTop: '0.15rem' }}>
          <CheckCircle2 size={22} color="#00d668" />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
          <div style={{ fontSize: '1rem', fontWeight: 600, color: '#f0f2ee' }}>
            On-device encryption
          </div>
          <div
            style={{
              fontSize: '0.84rem',
              lineHeight: 1.55,
              color: '#9ba39c',
            }}
          >
            Your data is encrypted on your device before it&apos;s saved to Google Password Manager.
          </div>
          <div
            style={{
              fontSize: '0.84rem',
              lineHeight: 1.55,
              color: '#9ba39c',
            }}
          >
            Your screen lock is being used to unlock your encrypted data, including your passkeys, on any device
          </div>
        </div>
      </div>

      {/* Card 4: Declined sites and apps (matching Photo 2 & 5) */}
      <div
        style={{
          backgroundColor: '#1b201d',
          borderRadius: '22px',
          border: '1px solid #262e28',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Header inside Declined Card */}
        <div
          style={{
            padding: '1.25rem 1.25rem 0.85rem',
            borderBottom: '1px solid #242b26',
          }}
        >
          <div style={{ fontSize: '1rem', fontWeight: 600, color: '#f0f2ee' }}>
            {declinedSites.length} declined sites and apps
          </div>
          <div
            style={{
              fontSize: '0.82rem',
              color: '#9ba39c',
              marginTop: '0.3rem',
              lineHeight: 1.5,
            }}
          >
            You&apos;ve chosen not to save passwords for these sites and apps.{' '}
            <span style={{ color: '#00d668', cursor: 'pointer', fontWeight: 500 }}>
              Learn more
            </span>
          </div>
        </div>

        {/* Add more button */}
        <button
          onClick={() => setIsAddDeclinedModalOpen(true)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.9rem',
            padding: '0.85rem 1.25rem',
            background: 'none',
            border: 'none',
            borderBottom: '1px solid #242b26',
            color: '#e3e3df',
            cursor: 'pointer',
            textAlign: 'left',
            transition: 'background-color 0.15s ease',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#232a25')}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
        >
          <div
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              backgroundColor: '#193928',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <Plus size={18} color="#00d668" strokeWidth={2.5} />
          </div>
          <span style={{ fontSize: '0.92rem', fontWeight: 600, color: '#e3e3df' }}>
            Add more
          </span>
        </button>

        {/* Declined sites list */}
        {declinedSites.map((site, idx) => (
          <div
            key={site.id}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '0.85rem',
              padding: '0.75rem 1.25rem',
              borderBottom: idx < declinedSites.length - 1 ? '1px solid #232a25' : 'none',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', minWidth: 0, flex: 1 }}>
              <PasswordAvatar
                siteUrl={site.domain}
                title={site.name}
                size={34}
                style={{ borderRadius: '8px' }}
              />
              <span
                style={{
                  fontSize: '0.92rem',
                  color: '#e3e3df',
                  fontWeight: 500,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {site.domain}
              </span>
            </div>

            <button
              onClick={() => handleRemoveDeclinedSite(site.id, site.domain)}
              title="Remove from declined list"
              style={{
                background: 'none',
                border: 'none',
                color: '#8ba892',
                cursor: 'pointer',
                padding: '0.35rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '50%',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = '#ef4444')}
              onMouseLeave={(e) => (e.currentTarget.style.color = '#8ba892')}
            >
              <X size={18} />
            </button>
          </div>
        ))}
      </div>

      {/* Import Progress Modal */}
      {isImportModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.7)',
            backdropFilter: 'blur(6px)',
            zIndex: 1100,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem',
          }}
        >
          <div
            style={{
              width: '100%',
              maxWidth: '420px',
              backgroundColor: '#1b201d',
              borderRadius: '24px',
              border: '1px solid #2d352f',
              padding: '1.5rem',
              color: '#e3e3df',
              display: 'flex',
              flexDirection: 'column',
              gap: '1.25rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <Download size={24} color="#00d668" />
              <h3 style={{ fontSize: '1.15rem', margin: 0, fontWeight: 700 }}>
                {importProgress.isComplete ? 'Import Complete' : 'Importing Passwords...'}
              </h3>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <div
                style={{
                  height: '8px',
                  backgroundColor: '#272f29',
                  borderRadius: '9999px',
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    height: '100%',
                    width: `${importProgress.progress}%`,
                    backgroundColor: '#00d668',
                    transition: 'width 0.2s ease',
                  }}
                />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: '#9ba39c' }}>
                <span>{importProgress.progress}% Completed</span>
                {importProgress.total && <span>{importProgress.current} / {importProgress.total}</span>}
              </div>
            </div>

            {importProgress.isComplete && (
              <button
                onClick={() => setIsImportModalOpen(false)}
                style={{
                  padding: '0.65rem',
                  borderRadius: '20px',
                  backgroundColor: '#00d668',
                  color: '#003915',
                  border: 'none',
                  fontWeight: 700,
                  fontSize: '0.92rem',
                  cursor: 'pointer',
                }}
              >
                Done
              </button>
            )}
          </div>
        </div>
      )}

      {/* Add Declined Site Modal */}
      {isAddDeclinedModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.7)',
            backdropFilter: 'blur(6px)',
            zIndex: 1100,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem',
          }}
          onClick={() => setIsAddDeclinedModalOpen(false)}
        >
          <div
            style={{
              width: '100%',
              maxWidth: '400px',
              backgroundColor: '#1b201d',
              borderRadius: '24px',
              border: '1px solid #2d352f',
              padding: '1.5rem',
              color: '#e3e3df',
              display: 'flex',
              flexDirection: 'column',
              gap: '1.25rem',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: '1.1rem', margin: 0, fontWeight: 700 }}>
                Add Declined Site or App
              </h3>
              <button
                onClick={() => setIsAddDeclinedModalOpen(false)}
                style={{ background: 'none', border: 'none', color: '#9ba39c', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleAddDeclinedSite} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ fontSize: '0.8rem', color: '#9ba39c', display: 'block', marginBottom: '0.35rem' }}>
                  Site Domain or App Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. accounts.google.com or Spotify"
                  value={newDeclinedDomain}
                  onChange={(e) => setNewDeclinedDomain(e.target.value)}
                  required
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem',
                    borderRadius: '12px',
                    backgroundColor: '#111412',
                    border: '1px solid #2d3630',
                    color: '#e3e3df',
                    fontSize: '0.9rem',
                    outline: 'none',
                  }}
                />
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => setIsAddDeclinedModalOpen(false)}
                  style={{
                    padding: '0.55rem 1.25rem',
                    borderRadius: '20px',
                    backgroundColor: 'transparent',
                    color: '#c2c8c3',
                    border: '1px solid #2d3630',
                    cursor: 'pointer',
                    fontSize: '0.88rem',
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    padding: '0.55rem 1.4rem',
                    borderRadius: '20px',
                    backgroundColor: '#00d668',
                    color: '#003915',
                    border: 'none',
                    fontWeight: 700,
                    cursor: 'pointer',
                    fontSize: '0.88rem',
                  }}
                >
                  Add
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

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
    </div>
  );
};
