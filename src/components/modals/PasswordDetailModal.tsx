import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  ArrowLeft,
  Copy,
  Eye,
  EyeOff,
  Share2,
  Trash2,
  Edit2,
  Plus,
  ExternalLink,
  Check,
} from 'lucide-react';
import { PasswordAvatar } from '../PasswordAvatar';
import { PasswordItem } from '../../types';

export const PasswordDetailModal: React.FC = () => {
  const {
    detailModalData,
    setDetailModalData,
    passwords,
    openPasswordEditor,
    deletePasswordItem,
    showConfirmModal,
    addToast,
    selectedDomainGroup,
    setSelectedDomainGroup,
  } = useApp();

  // State for unmasking passwords by item ID
  const [unmaskedMap, setUnmaskedMap] = useState<{ [id: string]: boolean }>({});
  const [copiedField, setCopiedField] = useState<string | null>(null);

  if (!detailModalData || detailModalData.type !== 'pass') return null;

  // Find all items belonging to this domain/group
  const primaryItem = passwords.find((p) => p.id === detailModalData.id);
  if (!primaryItem && (!selectedDomainGroup || selectedDomainGroup.items.length === 0)) {
    return null;
  }

  // Get domain name & URL
  const extractDomain = (item: PasswordItem) => {
    if (item.siteUrl && item.siteUrl.trim()) {
      try {
        const u = item.siteUrl.startsWith('http') ? item.siteUrl : `https://${item.siteUrl}`;
        return new URL(u).hostname.replace(/^www\./, '');
      } catch (e) {}
    }
    return item.title;
  };

  const domainName = selectedDomainGroup?.domainKey || (primaryItem ? extractDomain(primaryItem) : '');
  const siteUrl = selectedDomainGroup?.siteUrl || primaryItem?.siteUrl || `www.${domainName}`;
  const posterUrl = selectedDomainGroup?.posterUrl || primaryItem?.posterUrl;

  // All accounts under this domain
  const accounts: PasswordItem[] = selectedDomainGroup
    ? passwords.filter((p) => extractDomain(p) === domainName || selectedDomainGroup.items.some((i: PasswordItem) => i.id === p.id))
    : primaryItem
    ? [primaryItem]
    : [];

  const handleClose = () => {
    setDetailModalData(null);
    if (setSelectedDomainGroup) setSelectedDomainGroup(null);
  };

  const togglePasswordVisibility = (id: string) => {
    setUnmaskedMap((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const copyToClipboard = (text: string, label: string, fieldKey: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedField(fieldKey);
    addToast(`Copied ${label}`, 'success');
    setTimeout(() => {
      setCopiedField(null);
    }, 2000);
  };

  const handleShare = (item: PasswordItem) => {
    if (navigator.share) {
      navigator.share({
        title: item.title,
        text: `Account for ${item.title}: ${item.userId || ''}`,
      }).catch(() => {});
    } else {
      copyToClipboard(`${item.userId || ''} / ${item.audioUrl}`, 'Account Details', `share-${item.id}`);
    }
  };

  const handleDelete = (item: PasswordItem) => {
    showConfirmModal(
      'Delete password?',
      `Delete password for ${item.userId || item.title}? This can't be undone.`,
      () => {
        deletePasswordItem(item.id);
        if (accounts.length <= 1) {
          handleClose();
        }
      },
      true,
      false
    );
  };

  const handleEdit = (item: PasswordItem) => {
    handleClose();
    openPasswordEditor(item.id);
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: '#111412',
        zIndex: 1000,
        display: 'flex',
        flexDirection: 'column',
        overflowY: 'auto',
      }}
    >
      <div
        style={{
          maxWidth: '680px',
          width: '100%',
          margin: '0 auto',
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          padding: '0.75rem 1.25rem 3rem',
        }}
      >
        {/* Top Header Bar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingBottom: '0.5rem',
          }}
        >
          <button
            onClick={handleClose}
            style={{
              background: 'none',
              border: 'none',
              color: '#e3e3df',
              cursor: 'pointer',
              padding: '0.4rem',
              display: 'flex',
              alignItems: 'center',
              borderRadius: '50%',
            }}
          >
            <ArrowLeft size={24} />
          </button>
        </div>

        {/* Domain Profile Icon & Title Header (matching Photo 3 & 4) */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
            margin: '0.5rem 0 1.5rem',
            gap: '0.6rem',
          }}
        >
          <PasswordAvatar
            posterUrl={posterUrl}
            siteUrl={siteUrl}
            title={domainName}
            size={56}
            style={{ borderRadius: '14px' }}
          />
          <div>
            <h2
              style={{
                fontSize: '1.4rem',
                fontWeight: 600,
                color: '#f0f2ee',
                margin: 0,
              }}
            >
              {domainName}
            </h2>
            <div
              style={{
                fontSize: '0.9rem',
                color: '#9ba39c',
                marginTop: '0.2rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.35rem',
              }}
            >
              <span>{siteUrl.startsWith('http') ? siteUrl : `www.${domainName}`}</span>
            </div>
          </div>
        </div>

        {/* Account Cards List (One or Multiple Accounts Stacked) */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
          {accounts.map((item, idx) => {
            const isUnmasked = !!unmaskedMap[item.id];
            const usernameKey = `user-${item.id}`;
            const passwordKey = `pass-${item.id}`;

            return (
              <div
                key={item.id}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.85rem',
                  paddingBottom: idx < accounts.length - 1 ? '1.5rem' : '0',
                  borderBottom: idx < accounts.length - 1 ? '1px solid #28302a' : 'none',
                }}
              >
                {/* Multi-account URL Subtitle indicator if multiple accounts */}
                {accounts.length > 1 && (
                  <div
                    style={{
                      fontSize: '0.85rem',
                      color: '#8ba892',
                      fontWeight: 600,
                      marginBottom: '-0.2rem',
                    }}
                  >
                    Account {idx + 1}
                  </div>
                )}

                {/* Username Box (matching Photo 3 & 4) */}
                <div
                  style={{
                    backgroundColor: '#1b201d',
                    borderRadius: '16px',
                    border: '1px solid #28312a',
                    padding: '0.85rem 1rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '0.75rem',
                  }}
                >
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <span
                      style={{
                        fontSize: '0.96rem',
                        color: item.userId ? '#f0f2ee' : '#7a827b',
                        fontWeight: item.userId ? 500 : 400,
                        wordBreak: 'break-all',
                      }}
                    >
                      {item.userId || 'Add username'}
                    </span>
                  </div>
                  {item.userId && (
                    <button
                      onClick={() => copyToClipboard(item.userId || '', 'Username', usernameKey)}
                      title="Copy Username"
                      style={{
                        background: 'none',
                        border: 'none',
                        color: copiedField === usernameKey ? '#00d668' : '#9ba39c',
                        cursor: 'pointer',
                        padding: '0.35rem',
                        display: 'flex',
                        alignItems: 'center',
                        borderRadius: '50%',
                      }}
                    >
                      {copiedField === usernameKey ? <Check size={20} /> : <Copy size={20} />}
                    </button>
                  )}
                </div>

                {/* Password Box (matching Photo 3 & 4) */}
                <div
                  style={{
                    backgroundColor: '#1b201d',
                    borderRadius: '16px',
                    border: '1px solid #28312a',
                    padding: '0.85rem 1rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '0.75rem',
                  }}
                >
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <span
                      style={{
                        fontSize: '1rem',
                        color: '#f0f2ee',
                        fontFamily: isUnmasked ? 'var(--font-mono)' : 'sans-serif',
                        letterSpacing: isUnmasked ? 'normal' : '0.2em',
                        wordBreak: 'break-all',
                        fontWeight: 600,
                      }}
                    >
                      {isUnmasked ? item.audioUrl : '••••••••••'}
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexShrink: 0 }}>
                    <button
                      onClick={() => togglePasswordVisibility(item.id)}
                      title={isUnmasked ? 'Hide password' : 'Show password'}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#9ba39c',
                        cursor: 'pointer',
                        padding: '0.35rem',
                        display: 'flex',
                        alignItems: 'center',
                        borderRadius: '50%',
                      }}
                    >
                      {isUnmasked ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                    <button
                      onClick={() => copyToClipboard(item.audioUrl, 'Password', passwordKey)}
                      title="Copy Password"
                      style={{
                        background: 'none',
                        border: 'none',
                        color: copiedField === passwordKey ? '#00d668' : '#9ba39c',
                        cursor: 'pointer',
                        padding: '0.35rem',
                        display: 'flex',
                        alignItems: 'center',
                        borderRadius: '50%',
                      }}
                    >
                      {copiedField === passwordKey ? <Check size={20} /> : <Copy size={20} />}
                    </button>
                  </div>
                </div>

                {/* Note Box (matching Photo 3 & 4) */}
                <div
                  style={{
                    backgroundColor: '#1b201d',
                    borderRadius: '16px',
                    border: '1px solid #28312a',
                    padding: '0.85rem 1rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <span
                    style={{
                      fontSize: '0.94rem',
                      color: item.note || (item.dynamicNotes && item.dynamicNotes.length > 0) ? '#e3e3df' : '#7a827b',
                    }}
                  >
                    {item.note ||
                      (item.dynamicNotes && item.dynamicNotes.length > 0
                        ? item.dynamicNotes.map((n) => `${n.name}: ${n.val}`).join(' • ')
                        : 'Add note')}
                  </span>
                </div>

                {/* Bottom Action Row (Share icon on left, Edit & Delete green pill buttons on right) */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginTop: '0.3rem',
                  }}
                >
                  {/* Share Icon */}
                  <button
                    onClick={() => handleShare(item)}
                    title="Share credentials"
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#a0a7a0',
                      cursor: 'pointer',
                      padding: '0.5rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderRadius: '50%',
                    }}
                  >
                    <Share2 size={22} color="#9ba39c" />
                  </button>

                  {/* Right Actions: Edit & Delete Green Pill Buttons */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                    <button
                      onClick={() => handleEdit(item)}
                      style={{
                        padding: '0.55rem 1.4rem',
                        borderRadius: '24px',
                        backgroundColor: '#00d668',
                        color: '#003915',
                        border: 'none',
                        fontWeight: 700,
                        fontSize: '0.92rem',
                        cursor: 'pointer',
                        transition: 'opacity 0.15s ease',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.88')}
                      onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
                    >
                      Edit
                    </button>

                    <button
                      onClick={() => handleDelete(item)}
                      style={{
                        padding: '0.55rem 1.4rem',
                        borderRadius: '24px',
                        backgroundColor: '#00d668',
                        color: '#003915',
                        border: 'none',
                        fontWeight: 700,
                        fontSize: '0.92rem',
                        cursor: 'pointer',
                        transition: 'opacity 0.15s ease',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.88')}
                      onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Add another account for this domain */}
        <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'center' }}>
          <button
            onClick={() => {
              handleClose();
              openPasswordEditor(null);
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.65rem 1.25rem',
              borderRadius: '24px',
              backgroundColor: '#1b201d',
              border: '1px solid #2d3630',
              color: '#00d668',
              fontWeight: 600,
              fontSize: '0.88rem',
              cursor: 'pointer',
            }}
          >
            <Plus size={16} color="#00d668" />
            <span>Add another account for this site</span>
          </button>
        </div>
      </div>
    </div>
  );
};
