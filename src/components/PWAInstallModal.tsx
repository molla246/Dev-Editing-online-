import React, { useState } from 'react';
import {
  X,
  Smartphone,
  Download,
  ExternalLink,
  CheckCircle2,
  Copy,
  Layers,
  Sparkles,
  ArrowRight,
  Shield,
  Share2,
} from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { GoogleKeyLogo } from './GoogleKeyLogo';

interface PWAInstallModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const PWAInstallModal: React.FC<PWAInstallModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'direct' | 'apk'>('direct');

  if (!isOpen) return null;

  const appUrl = window.location.href;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(appUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleNativeInstall = async () => {
    const success = await install();
    if (success) {
      if (onSuccess) onSuccess();
      onClose();
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
        backdropFilter: 'blur(8px)',
        zIndex: 1200,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
        animation: 'fadeIn 0.2s ease-out',
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '520px',
          maxHeight: '90vh',
          backgroundColor: '#1b201d',
          borderRadius: '24px',
          border: '1px solid #2e3831',
          boxShadow: '0 24px 48px rgba(0, 0, 0, 0.75)',
          overflowY: 'auto',
          color: '#e3e3df',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            padding: '1.25rem 1.5rem',
            borderBottom: '1px solid #28332a',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            position: 'sticky',
            top: 0,
            backgroundColor: '#1b201d',
            zIndex: 10,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '12px',
                backgroundColor: 'rgba(0, 214, 104, 0.14)',
                border: '1px solid rgba(0, 214, 104, 0.25)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Smartphone size={22} color="#00d668" />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: '#f0f2ee' }}>
                Install on Android Phone
              </h3>
              <p style={{ margin: 0, fontSize: '0.78rem', color: '#9ba39c' }}>
                Progressive Web App (PWA) & APK Options
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: '#9ba39c',
              cursor: 'pointer',
              padding: '0.35rem',
              display: 'flex',
              borderRadius: '50%',
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Content Body */}
        <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Quick Status / Native Prompt Banner */}
          {isInstalled ? (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '1rem',
                borderRadius: '16px',
                backgroundColor: 'rgba(0, 214, 104, 0.1)',
                border: '1px solid rgba(0, 214, 104, 0.3)',
                color: '#00d668',
                fontSize: '0.86rem',
                fontWeight: 600,
              }}
            >
              <CheckCircle2 size={20} />
              <span>VaultGuard is currently running in Standalone App Mode.</span>
            </div>
          ) : isInstallable ? (
            <button
              onClick={handleNativeInstall}
              style={{
                width: '100%',
                padding: '0.95rem 1.25rem',
                borderRadius: '16px',
                backgroundColor: '#00d668',
                border: 'none',
                color: '#003915',
                fontSize: '0.95rem',
                fontWeight: 800,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.6rem',
                boxShadow: '0 6px 20px rgba(0, 214, 104, 0.35)',
                transition: 'transform 0.15s ease',
              }}
            >
              <Download size={20} />
              <span>1-Click Install App to Android Home Screen</span>
            </button>
          ) : null}

          {/* Navigation Tabs */}
          <div
            style={{
              display: 'flex',
              backgroundColor: '#222924',
              borderRadius: '14px',
              padding: '0.3rem',
              border: '1px solid #2d3630',
            }}
          >
            <button
              onClick={() => setActiveTab('direct')}
              style={{
                flex: 1,
                padding: '0.65rem',
                borderRadius: '10px',
                border: 'none',
                backgroundColor: activeTab === 'direct' ? '#1b201d' : 'transparent',
                color: activeTab === 'direct' ? '#00d668' : '#9ba39c',
                fontSize: '0.82rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.4rem',
                boxShadow: activeTab === 'direct' ? '0 2px 8px rgba(0, 0, 0, 0.25)' : 'none',
              }}
            >
              <Smartphone size={16} />
              <span>Method 1: Direct Phone Install</span>
            </button>
            <button
              onClick={() => setActiveTab('apk')}
              style={{
                flex: 1,
                padding: '0.65rem',
                borderRadius: '10px',
                border: 'none',
                backgroundColor: activeTab === 'apk' ? '#1b201d' : 'transparent',
                color: activeTab === 'apk' ? '#00d668' : '#9ba39c',
                fontSize: '0.82rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.4rem',
                boxShadow: activeTab === 'apk' ? '0 2px 8px rgba(0, 0, 0, 0.25)' : 'none',
              }}
            >
              <Layers size={16} />
              <span>Method 2: Standalone .APK File</span>
            </button>
          </div>

          {/* Tab 1: Direct Install on Android */}
          {activeTab === 'direct' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div
                style={{
                  padding: '1rem 1.15rem',
                  backgroundColor: '#222824',
                  borderRadius: '18px',
                  border: '1px solid #2d3630',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.75rem',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#00d668', fontWeight: 800, fontSize: '0.9rem' }}>
                  <Sparkles size={16} />
                  <span>How to Install on Android Mobile (Fastest & Easiest)</span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', fontSize: '0.82rem', color: '#cfd7d1', lineHeight: 1.5 }}>
                  <div style={{ display: 'flex', gap: '0.65rem', alignItems: 'flex-start' }}>
                    <span style={{ width: '22px', height: '22px', borderRadius: '50%', backgroundColor: '#2d3830', color: '#00d668', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, flexShrink: 0, fontSize: '0.75rem' }}>1</span>
                    <span>
                      Open this application link in <strong>Google Chrome</strong> or <strong>Samsung Internet</strong> on your Android mobile.
                    </span>
                  </div>

                  <div style={{ display: 'flex', gap: '0.65rem', alignItems: 'flex-start' }}>
                    <span style={{ width: '22px', height: '22px', borderRadius: '50%', backgroundColor: '#2d3830', color: '#00d668', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, flexShrink: 0, fontSize: '0.75rem' }}>2</span>
                    <span>
                      Click the green <strong>"Install on Android Phone"</strong> button in the Profile menu, or tap the browser's 3-dot menu (<strong>⋮</strong>) in the top-right corner.
                    </span>
                  </div>

                  <div style={{ display: 'flex', gap: '0.65rem', alignItems: 'flex-start' }}>
                    <span style={{ width: '22px', height: '22px', borderRadius: '50%', backgroundColor: '#2d3830', color: '#00d668', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, flexShrink: 0, fontSize: '0.75rem' }}>3</span>
                    <span>
                      Select <strong>"Install app"</strong> or <strong>"Add to Home screen"</strong> and tap <strong>Install</strong>.
                    </span>
                  </div>

                  <div style={{ display: 'flex', gap: '0.65rem', alignItems: 'flex-start' }}>
                    <span style={{ width: '22px', height: '22px', borderRadius: '50%', backgroundColor: '#2d3830', color: '#00d668', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, flexShrink: 0, fontSize: '0.75rem' }}>4</span>
                    <span>
                      VaultGuard will immediately be added to your Android phone home screen with its official app icon and launches full-screen like a native Android app!
                    </span>
                  </div>
                </div>
              </div>

              {/* Copy App Link to Phone */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.75rem 1rem',
                  backgroundColor: '#222824',
                  borderRadius: '14px',
                  border: '1px solid #2d3630',
                }}
              >
                <div style={{ minWidth: 0, flex: 1, marginRight: '0.75rem' }}>
                  <div style={{ fontSize: '0.75rem', color: '#8d978e' }}>App URL for Mobile Browser:</div>
                  <div style={{ fontSize: '0.8rem', color: '#e3e3df', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {appUrl}
                  </div>
                </div>
                <button
                  onClick={handleCopyLink}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                    padding: '0.5rem 0.85rem',
                    borderRadius: '10px',
                    border: '1px solid #3c4a3f',
                    backgroundColor: copied ? '#00d668' : '#29332c',
                    color: copied ? '#003915' : '#e3e3df',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    flexShrink: 0,
                    transition: 'all 0.15s ease',
                  }}
                >
                  {copied ? <CheckCircle2 size={14} /> : <Copy size={14} />}
                  <span>{copied ? 'Copied!' : 'Copy Link'}</span>
                </button>
              </div>

              {/* iOS Note if on iPhone */}
              {isIOS && (
                <div
                  style={{
                    padding: '0.85rem 1rem',
                    backgroundColor: 'rgba(59, 130, 246, 0.08)',
                    borderRadius: '14px',
                    border: '1px solid rgba(59, 130, 246, 0.25)',
                    fontSize: '0.8rem',
                    color: '#93c5fd',
                    lineHeight: 1.4,
                  }}
                >
                  <strong>Apple iPhone / iPad Note:</strong> Open Safari, tap the <strong>Share</strong> button (box with upward arrow), and select <strong>"Add to Home Screen"</strong>.
                </div>
              )}
            </div>
          )}

          {/* Tab 2: Standalone APK via PWABuilder */}
          {activeTab === 'apk' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div
                style={{
                  padding: '1rem 1.15rem',
                  backgroundColor: '#222824',
                  borderRadius: '18px',
                  border: '1px solid #2d3630',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.85rem',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#00d668', fontWeight: 800, fontSize: '0.9rem' }}>
                  <Download size={16} />
                  <span>Build a Standalone Android (.apk / .aab) File</span>
                </div>

                <p style={{ margin: 0, fontSize: '0.82rem', color: '#9ba39c', lineHeight: 1.5 }}>
                  If you want to package VaultGuard as a standalone <strong>.apk</strong> file to share with friends, sideload, or publish to the Google Play Store:
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', fontSize: '0.82rem', color: '#cfd7d1', lineHeight: 1.5 }}>
                  <div style={{ display: 'flex', gap: '0.65rem', alignItems: 'flex-start' }}>
                    <span style={{ width: '22px', height: '22px', borderRadius: '50%', backgroundColor: '#2d3830', color: '#00d668', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, flexShrink: 0, fontSize: '0.75rem' }}>1</span>
                    <span>
                      Copy your deployed / shared app URL, or download your source code ZIP via <strong>Settings &gt; Export Project</strong> in AI Studio.
                    </span>
                  </div>

                  <div style={{ display: 'flex', gap: '0.65rem', alignItems: 'flex-start' }}>
                    <span style={{ width: '22px', height: '22px', borderRadius: '50%', backgroundColor: '#2d3830', color: '#00d668', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, flexShrink: 0, fontSize: '0.75rem' }}>2</span>
                    <span>
                      Visit <strong>PWABuilder.com</strong> (powered by Microsoft & Google Chromium PWA ecosystem).
                    </span>
                  </div>

                  <div style={{ display: 'flex', gap: '0.65rem', alignItems: 'flex-start' }}>
                    <span style={{ width: '22px', height: '22px', borderRadius: '50%', backgroundColor: '#2d3830', color: '#00d668', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, flexShrink: 0, fontSize: '0.75rem' }}>3</span>
                    <span>
                      Paste your app URL. PWABuilder verifies your Web App Manifest & Service Worker with 100% compliance.
                    </span>
                  </div>

                  <div style={{ display: 'flex', gap: '0.65rem', alignItems: 'flex-start' }}>
                    <span style={{ width: '22px', height: '22px', borderRadius: '50%', backgroundColor: '#2d3830', color: '#00d668', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, flexShrink: 0, fontSize: '0.75rem' }}>4</span>
                    <span>
                      Click <strong>"Package for Android"</strong> to download a ready-to-install <strong>.apk</strong> or Google Play Store ready <strong>.aab</strong> bundle!
                    </span>
                  </div>
                </div>

                <a
                  href="https://www.pwabuilder.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    padding: '0.8rem',
                    borderRadius: '12px',
                    backgroundColor: '#1b201d',
                    border: '1px solid #3b483e',
                    color: '#00d668',
                    textDecoration: 'none',
                    fontSize: '0.85rem',
                    fontWeight: 700,
                    marginTop: '0.35rem',
                  }}
                >
                  <span>Open PWABuilder.com</span>
                  <ExternalLink size={15} />
                </a>
              </div>
            </div>
          )}

          {/* Features Included Card */}
          <div
            style={{
              padding: '1rem',
              backgroundColor: '#161a18',
              borderRadius: '16px',
              border: '1px solid #232a25',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.5rem',
            }}
          >
            <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#8b948d', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              PWA Features Included:
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', fontSize: '0.76rem', color: '#c2cbc4' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <CheckCircle2 size={13} color="#00d668" />
                <span>Web App Manifest</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <CheckCircle2 size={13} color="#00d668" />
                <span>Service Worker Cache</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <CheckCircle2 size={13} color="#00d668" />
                <span>Android Icon Set</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <CheckCircle2 size={13} color="#00d668" />
                <span>Standalone Display</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            padding: '1rem 1.5rem',
            borderTop: '1px solid #28332a',
            display: 'flex',
            justifyContent: 'flex-end',
            backgroundColor: '#161a18',
          }}
        >
          <button
            onClick={onClose}
            style={{
              padding: '0.65rem 1.25rem',
              borderRadius: '12px',
              backgroundColor: '#262f28',
              border: '1px solid #364239',
              color: '#e3e3df',
              fontSize: '0.85rem',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
