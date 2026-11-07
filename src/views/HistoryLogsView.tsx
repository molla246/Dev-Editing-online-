import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import {
  History,
  Trash2,
  Clock,
  PlusCircle,
  Info,
  ShieldCheck,
  KeyRound,
  Lock,
  X,
  Key,
  MapPin,
  Copy,
  Check,
  Search,
  Loader2,
  Globe,
  Navigation,
  RotateCw,
} from 'lucide-react';
import { ActivityLog } from '../types';

export const HistoryLogsView: React.FC = () => {
  const { logs, clearLogsWithKey, updateLogLocation, fetchDeviceGeoAndIp, addToast, currentUserEmail } = useApp();
  const [logSearch, setLogSearch] = useState<string>('');
  const [showPassPrompt, setShowPassPrompt] = useState<boolean>(false);
  const [securityKey, setSecurityKey] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const isAuthorizedToClear = currentUserEmail?.trim().toLowerCase() === 'mollariyajul55@gmail.com';

  // Location Modal State
  const [activeLocationLog, setActiveLocationLog] = useState<ActivityLog | null>(null);
  const [currentAddress, setCurrentAddress] = useState<string>('');
  const [currentIp, setCurrentIp] = useState<string>('');
  const [isLocating, setIsLocating] = useState<boolean>(false);
  const [isCopied, setIsCopied] = useState<boolean>(false);

  const filteredLogs = logs.filter((l) => {
    if (!logSearch.trim()) return true;
    const q = logSearch.toLowerCase();
    return (
      l.action.toLowerCase().includes(q) ||
      l.detail.toLowerCase().includes(q) ||
      (l.location && l.location.toLowerCase().includes(q)) ||
      (l.ip && l.ip.toLowerCase().includes(q))
    );
  });

  const handleClearSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);
    try {
      const success = await clearLogsWithKey(securityKey);
      if (success) {
        setShowPassPrompt(false);
        setSecurityKey('');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const openLocationModal = async (item: ActivityLog) => {
    setActiveLocationLog(item);
    setIsCopied(false);
    setIsLocating(true);

    let address = item.location || '';
    let ip = item.ip || '';

    const isGenericAddress =
      !address ||
      address.includes('Detected') ||
      address.includes('Active') ||
      address.includes('Dhaka, Bangladesh') ||
      address.includes('unavailable') ||
      address.includes('Mobile Location');

    const isGenericIp = !ip || ip.includes('Offline') || ip.includes('103.145');

    if (!isGenericAddress && !isGenericIp) {
      setCurrentAddress(address);
      setCurrentIp(ip);
      setIsLocating(false);
      return;
    }

    try {
      const geo = await fetchDeviceGeoAndIp();
      address = geo.address;
      ip = geo.ip;
    } catch (err) {
      console.warn('Location detection notice:', err);
    }

    if (!address) address = 'Real Device Location Active';
    if (!ip) ip = 'Offline / Local Network';

    setCurrentAddress(address);
    setCurrentIp(ip);
    updateLogLocation(item.id, address, ip);
    setIsLocating(false);
  };

  const handleRefreshLiveLocation = async () => {
    if (!activeLocationLog) return;
    setIsLocating(true);
    try {
      const geo = await fetchDeviceGeoAndIp();
      setCurrentAddress(geo.address);
      setCurrentIp(geo.ip);
      updateLogLocation(activeLocationLog.id, geo.address, geo.ip);
      addToast('✓ Live device location & IP updated!', 'success');
    } catch (err) {
      addToast('Failed to refresh location details', 'error');
    } finally {
      setIsLocating(false);
    }
  };

  const copyLocationAddressAndIp = () => {
    if (!currentAddress && !currentIp) return;
    const fullText = `Location: ${currentAddress} | IP: ${currentIp}`;
    try {
      navigator.clipboard.writeText(fullText);
      setIsCopied(true);
      if (activeLocationLog) {
        updateLogLocation(activeLocationLog.id, currentAddress, currentIp);
      }
      addToast('✓ Location & IP Address copied to clipboard!', 'success');
      setTimeout(() => setIsCopied(false), 2000);
    } catch {
      addToast('Failed to copy location & IP', 'error');
    }
  };

  const getLogIcon = (action: string) => {
    const act = action.toUpperCase();
    if (act.includes('CREATE') || act.includes('ADD')) {
      return (
        <div
          style={{
            width: '32px',
            height: '32px',
            borderRadius: '10px',
            backgroundColor: 'rgba(34, 197, 94, 0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <PlusCircle size={16} color="#16a34a" />
        </div>
      );
    }
    if (act.includes('LOGIN') || act.includes('AUTH') || act.includes('SYSTEM')) {
      return (
        <div
          style={{
            width: '32px',
            height: '32px',
            borderRadius: '10px',
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <Info size={16} color="#2563eb" />
        </div>
      );
    }
    if (act.includes('PASSWORD') || act.includes('KEY') || act.includes('REPLACE')) {
      return (
        <div
          style={{
            width: '32px',
            height: '32px',
            borderRadius: '10px',
            backgroundColor: 'rgba(245, 158, 11, 0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <KeyRound size={16} color="#d97706" />
        </div>
      );
    }
    return (
      <div
        style={{
          width: '32px',
          height: '32px',
          borderRadius: '10px',
          backgroundColor: 'rgba(139, 92, 246, 0.1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        <ShieldCheck size={16} color="#7c3aed" />
      </div>
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
      {/* Sticky Fixed Top Header & Search Bar (Does not scroll out of view) */}
      <div
        className="card"
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 20,
          padding: '0.75rem 1rem',
          borderRadius: '16px',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.65rem',
          boxShadow: 'var(--shadow-md)',
          backgroundColor: 'var(--bg-card)',
          border: '1px solid var(--border-color)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', minWidth: 0 }}>
            <History size={18} color="#ff5e36" />
            <h3
              style={{
                fontSize: '0.88rem',
                fontWeight: 900,
                margin: 0,
                color: 'var(--text-primary)',
                letterSpacing: '0.02em',
                textTransform: 'uppercase',
                whiteSpace: 'nowrap',
              }}
            >
              ACTIVITY HISTORY LOGS ({filteredLogs.length})
            </h3>
          </div>

          {isAuthorizedToClear && (
            <button
              onClick={() => setShowPassPrompt(true)}
              disabled={logs.length === 0}
              style={{
                padding: '0.38rem 0.8rem',
                borderRadius: '10px',
                backgroundColor: 'rgba(239, 68, 68, 0.12)',
                border: '1px solid rgba(239, 68, 68, 0.25)',
                color: '#ef4444',
                fontWeight: 800,
                fontSize: '0.72rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
                cursor: logs.length === 0 ? 'not-allowed' : 'pointer',
                opacity: logs.length === 0 ? 0.5 : 1,
                whiteSpace: 'nowrap',
                flexShrink: 0,
              }}
            >
              <Trash2 size={13} />
              <span>CLEAR ALL</span>
            </button>
          )}
        </div>

        {/* Integrated Filter/Search Input inside Fixed Top Bar */}
        <div style={{ position: 'relative', width: '100%' }}>
          <Search
            size={15}
            style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}
          />
          <input
            type="text"
            value={logSearch}
            onChange={(e) => setLogSearch(e.target.value)}
            placeholder="Search activity logs or location..."
            style={{
              width: '100%',
              padding: '0.45rem 0.75rem 0.45rem 2.2rem',
              fontSize: '0.8rem',
              fontWeight: 600,
              borderRadius: '10px',
              border: '1px solid var(--border-color)',
              backgroundColor: 'var(--bg-input)',
              color: 'var(--text-primary)',
              outline: 'none',
              boxSizing: 'border-box',
            }}
          />
        </div>
      </div>

      {/* Security Password Verification Prompt Modal */}
      {showPassPrompt && (
        <div className="modal-overlay" style={{ zIndex: 99999 }}>
          <div className="modal-container" style={{ maxWidth: '420px', borderRadius: '20px' }}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Lock size={18} color="#ef4444" />
                <h3 style={{ fontSize: '1rem', fontWeight: 800, margin: 0 }}>
                  Security Verification Required
                </h3>
              </div>
              <button
                className="btn-icon"
                onClick={() => {
                  setShowPassPrompt(false);
                  setSecurityKey('');
                }}
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleClearSubmit} className="modal-form">
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.45 }}>
                  Enter your Master Security Key to authorize clearing all activity history logs.
                </p>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Security Key *</label>
                  <div style={{ position: 'relative' }}>
                    <Key
                      size={16}
                      color="var(--text-muted)"
                      style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)' }}
                    />
                    <input
                      type="password"
                      className="form-input"
                      style={{ paddingLeft: '2.5rem' }}
                      placeholder="Enter security key"
                      value={securityKey}
                      onChange={(e) => setSecurityKey(e.target.value)}
                      required
                      autoFocus
                    />
                  </div>
                </div>
              </div>

              <div className="modal-footer" style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => {
                    setShowPassPrompt(false);
                    setSecurityKey('');
                  }}
                  className="btn btn-secondary"
                  style={{ borderRadius: '10px', fontSize: '0.8rem' }}
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn btn-danger"
                  style={{
                    borderRadius: '10px',
                    fontSize: '0.8rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.4rem',
                    minWidth: '150px',
                    opacity: isSubmitting ? 0.7 : 1,
                  }}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 size={15} className="animate-spin" />
                      <span>Clearing Logs...</span>
                    </>
                  ) : (
                    <span>Confirm & Clear Logs</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Device Location Info Popup Modal */}
      {activeLocationLog && (
        <div className="modal-overlay" style={{ zIndex: 99999 }}>
          <div
            className="modal-container"
            style={{
              maxWidth: '440px',
              borderRadius: '24px',
              padding: '1.5rem',
              backgroundColor: 'var(--bg-secondary)',
              border: '1px solid var(--border-color)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
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
                  <MapPin size={20} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 900, margin: 0, color: 'var(--text-primary)' }}>
                    Device Current Location
                  </h3>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: '0.1rem 0 0 0' }}>
                    {activeLocationLog.action} • {activeLocationLog.dateString}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setActiveLocationLog(null)}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '0.25rem' }}
              >
                <X size={18} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {/* Status Badge */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.6rem 0.85rem',
                  borderRadius: '12px',
                  backgroundColor: 'rgba(34, 197, 94, 0.1)',
                  border: '1px solid rgba(34, 197, 94, 0.25)',
                  color: '#16a34a',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                }}
              >
                <Globe size={15} />
                <span>Live Device GPS / Location Coordinates Detected</span>
              </div>

              {/* IP Address Box */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <label style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
                  Network IP Address
                </label>
                <div
                  style={{
                    padding: '0.85rem 1rem',
                    borderRadius: '14px',
                    backgroundColor: 'var(--bg-input)',
                    border: '1px solid var(--border-color)',
                    color: '#3b82f6',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.88rem',
                    fontWeight: 800,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '0.5rem',
                  }}
                >
                  <span>{currentIp || 'Detecting Network IP...'}</span>
                  <button
                    type="button"
                    onClick={() => {
                      if (currentIp) {
                        navigator.clipboard.writeText(currentIp);
                        addToast('✓ IP Address copied to clipboard!', 'success');
                      }
                    }}
                    disabled={!currentIp}
                    style={{
                      background: 'rgba(59, 130, 246, 0.15)',
                      border: 'none',
                      color: '#3b82f6',
                      borderRadius: '8px',
                      padding: '0.25rem 0.55rem',
                      fontSize: '0.72rem',
                      fontWeight: 800,
                      cursor: currentIp ? 'pointer' : 'not-allowed',
                    }}
                  >
                    Copy IP
                  </button>
                </div>
              </div>

              {/* Location Address Display Box */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <label style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
                    Location Address / GPS
                  </label>
                  <button
                    type="button"
                    onClick={handleRefreshLiveLocation}
                    disabled={isLocating}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#3b82f6',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      cursor: isLocating ? 'not-allowed' : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.25rem',
                      padding: '0',
                    }}
                  >
                    <RotateCw size={13} className={isLocating ? 'animate-spin' : ''} />
                    <span>Refresh GPS</span>
                  </button>
                </div>
                <div
                  style={{
                    padding: '0.85rem 1rem',
                    borderRadius: '14px',
                    backgroundColor: 'var(--bg-input)',
                    border: '1px solid var(--border-color)',
                    color: 'var(--text-primary)',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.85rem',
                    fontWeight: 700,
                    wordBreak: 'break-word',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.6rem',
                  }}
                >
                  <Navigation size={18} color="#3b82f6" style={{ flexShrink: 0 }} />
                  {isLocating ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)' }}>
                      <Loader2 size={16} className="animate-spin" />
                      <span>Detecting real device location & GPS...</span>
                    </div>
                  ) : (
                    <span>{currentAddress || 'Real Device Location Active'}</span>
                  )}
                </div>
              </div>

              {/* Copy & Save Action Buttons */}
              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => setActiveLocationLog(null)}
                  style={{
                    flex: 1,
                    padding: '0.75rem',
                    borderRadius: '12px',
                    backgroundColor: 'var(--bg-tertiary)',
                    color: 'var(--text-primary)',
                    border: '1px solid var(--border-color)',
                    fontWeight: 800,
                    fontSize: '0.82rem',
                    cursor: 'pointer',
                  }}
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={copyLocationAddressAndIp}
                  disabled={isLocating || !currentAddress}
                  style={{
                    flex: 1.5,
                    padding: '0.75rem',
                    borderRadius: '12px',
                    backgroundColor: isCopied ? '#16a34a' : '#3b82f6',
                    color: '#ffffff',
                    border: 'none',
                    fontWeight: 900,
                    fontSize: '0.82rem',
                    cursor: isLocating || !currentAddress ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.4rem',
                    boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)',
                    transition: 'all 0.2s ease',
                  }}
                >
                  {isCopied ? (
                    <>
                      <Check size={16} />
                      <span>Copied All!</span>
                    </>
                  ) : (
                    <>
                      <Copy size={16} />
                      <span>Copy Address & IP</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Logs Items List (Compact Rows) */}
      {filteredLogs.length === 0 ? (
        <div className="card" style={{ padding: '2.5rem 1.5rem', textAlign: 'center', borderRadius: '16px' }}>
          <History size={36} color="var(--text-muted)" style={{ marginBottom: '0.5rem' }} />
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', margin: 0, fontWeight: 700 }}>
            No activity history logs found.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {filteredLogs.map((item) => {
            const isLoginLog =
              item.action.toUpperCase().includes('LOGIN') ||
              item.action.toUpperCase().includes('AUTH') ||
              item.action.toUpperCase().includes('SYSTEM');

            return (
              <div
                key={item.id}
                className="card"
                style={{
                  padding: '0.65rem 0.85rem',
                  borderRadius: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  boxShadow: 'var(--shadow-sm)',
                }}
              >
                {getLogIcon(item.action)}

                <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: '0.15rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', minWidth: 0 }}>
                      {/* Location Icon on Left Side for Login Logs */}
                      {isLoginLog && (
                        <button
                          type="button"
                          onClick={() => openLocationModal(item)}
                          title="Click to view & copy device location"
                          style={{
                            background: 'rgba(59, 130, 246, 0.15)',
                            border: '1px solid rgba(59, 130, 246, 0.35)',
                            color: '#3b82f6',
                            borderRadius: '8px',
                            padding: '0.2rem 0.45rem',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.3rem',
                            cursor: 'pointer',
                            fontSize: '0.72rem',
                            fontWeight: 800,
                            flexShrink: 0,
                            transition: 'all 0.15s ease',
                          }}
                        >
                          <MapPin size={13} color="#3b82f6" />
                          <span>Location</span>
                        </button>
                      )}

                      <h4
                        style={{
                          fontSize: '0.82rem',
                          fontWeight: 900,
                          margin: 0,
                          color: 'var(--text-primary)',
                          textTransform: 'uppercase',
                          letterSpacing: '0.02em',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}
                      >
                        {item.action}
                      </h4>
                    </div>

                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.25rem',
                        color: '#d97706',
                        fontSize: '0.7rem',
                        fontWeight: 700,
                        flexShrink: 0,
                      }}
                    >
                      <Clock size={12} />
                      <span>{item.dateString}</span>
                    </div>
                  </div>

                  <p
                    style={{
                      fontSize: '0.78rem',
                      color: 'var(--text-secondary)',
                      margin: 0,
                      lineHeight: 1.3,
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {item.detail}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
