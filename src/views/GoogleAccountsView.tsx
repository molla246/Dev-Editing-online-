import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import {
  Plus,
  Check,
  Globe,
  Key,
  Smartphone,
  Router,
  ChevronRight,
  Shield,
  Search,
} from 'lucide-react';
import { PasswordItem } from '../types';
import { PasswordAvatar } from '../components/PasswordAvatar';

export interface DomainGroup {
  domainKey: string;
  displayTitle: string;
  siteUrl?: string;
  posterUrl?: string;
  items: PasswordItem[];
  type: 'password' | 'passkey' | 'network';
}

export const GoogleAccountsView: React.FC = () => {
  const {
    passwords,
    searchQuery,
    setSearchQuery,
    openPasswordEditor,
    setDetailModalData,
    setSelectedDomainGroup,
  } = useApp();

  const [activeChip, setActiveChip] = useState<'all' | 'passwords' | 'passkeys' | 'network'>('all');

  // Helper to extract clean domain name from title/siteUrl
  const extractDomainKey = (item: PasswordItem): string => {
    if (item.siteUrl && item.siteUrl.trim()) {
      try {
        const urlStr = item.siteUrl.startsWith('http') ? item.siteUrl : `https://${item.siteUrl}`;
        const parsed = new URL(urlStr);
        return parsed.hostname.replace(/^www\./, '').toLowerCase();
      } catch (e) {
        // fallback
      }
    }
    return item.title.trim().toLowerCase();
  };

  // Group items by domain/service
  const domainGroups = useMemo(() => {
    const groupsMap = new Map<string, DomainGroup>();

    passwords.forEach((item) => {
      // Filter drafts out
      if (item.status === 'Draft' || (item.status as string) === 'draft') return;

      const domainKey = extractDomainKey(item);
      const isPasskey = item.title.toLowerCase().includes('passkey') || (item.userId && item.userId.toLowerCase().includes('passkey'));

      if (!groupsMap.has(domainKey)) {
        groupsMap.set(domainKey, {
          domainKey,
          displayTitle: item.title,
          siteUrl: item.siteUrl,
          posterUrl: item.posterUrl,
          items: [item],
          type: isPasskey ? 'passkey' : 'password',
        });
      } else {
        const grp = groupsMap.get(domainKey)!;
        grp.items.push(item);
        if (!grp.siteUrl && item.siteUrl) grp.siteUrl = item.siteUrl;
        if (!grp.posterUrl && item.posterUrl) grp.posterUrl = item.posterUrl;
      }
    });

    return Array.from(groupsMap.values());
  }, [passwords]);

  // Filter groups based on active chip and search query
  const filteredGroups = useMemo(() => {
    return domainGroups.filter((group) => {
      // Chip Filter
      if (activeChip === 'passwords' && group.type !== 'password') return false;
      if (activeChip === 'passkeys' && group.type !== 'passkey') return false;
      if (activeChip === 'network' && group.type !== 'network') return false;

      // Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = group.displayTitle.toLowerCase().includes(q);
        const matchDomain = group.domainKey.toLowerCase().includes(q);
        const matchAnyAccount = group.items.some(
          (p) =>
            (p.userId || '').toLowerCase().includes(q) ||
            p.title.toLowerCase().includes(q) ||
            (p.siteUrl || '').toLowerCase().includes(q)
        );
        if (!matchTitle && !matchDomain && !matchAnyAccount) return false;
      }

      return true;
    }).sort((a, b) => a.domainKey.localeCompare(b.domainKey));
  }, [domainGroups, activeChip, searchQuery]);

  const handleGroupClick = (group: DomainGroup) => {
    // If the group has 1 or more items, open detail view
    if (setSelectedDomainGroup) {
      setSelectedDomainGroup(group);
    }
    // Also trigger modal detail for single item compatibility
    if (group.items.length > 0) {
      setDetailModalData({
        type: 'pass',
        id: group.items[0].id,
      });
    }
  };

  return (
    <div
      style={{
        maxWidth: '800px',
        margin: '0 auto',
        padding: '0.5rem 1rem 5rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.85rem',
      }}
    >
      {/* Filter Chips Bar (Horizontal Scrollable) */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          overflowX: 'auto',
          paddingBottom: '0.25rem',
          scrollbarWidth: 'none',
        }}
      >
        {/* All Chip */}
        <button
          onClick={() => setActiveChip('all')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.35rem',
            padding: '0.45rem 0.95rem',
            borderRadius: '20px',
            border: activeChip === 'all' ? '1px solid #3d5e4b' : '1px solid #28302a',
            backgroundColor: activeChip === 'all' ? '#1c3d2c' : '#1d231f',
            color: activeChip === 'all' ? '#bcf0ce' : '#c2c8c3',
            fontSize: '0.84rem',
            fontWeight: 600,
            cursor: 'pointer',
            whiteSpace: 'nowrap',
            transition: 'all 0.15s ease',
          }}
        >
          {activeChip === 'all' && <Check size={14} color="#00d668" strokeWidth={3} />}
          <span>All</span>
        </button>

        {/* Passwords Chip */}
        <button
          onClick={() => setActiveChip('passwords')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.35rem',
            padding: '0.45rem 0.95rem',
            borderRadius: '20px',
            border: activeChip === 'passwords' ? '1px solid #3d5e4b' : '1px solid #28302a',
            backgroundColor: activeChip === 'passwords' ? '#1c3d2c' : '#1d231f',
            color: activeChip === 'passwords' ? '#bcf0ce' : '#c2c8c3',
            fontSize: '0.84rem',
            fontWeight: 600,
            cursor: 'pointer',
            whiteSpace: 'nowrap',
            transition: 'all 0.15s ease',
          }}
        >
          {activeChip === 'passwords' && <Check size={14} color="#00d668" strokeWidth={3} />}
          <span>Passwords</span>
        </button>

        {/* Passkeys Chip */}
        <button
          onClick={() => setActiveChip('passkeys')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.35rem',
            padding: '0.45rem 0.95rem',
            borderRadius: '20px',
            border: activeChip === 'passkeys' ? '1px solid #3d5e4b' : '1px solid #28302a',
            backgroundColor: activeChip === 'passkeys' ? '#1c3d2c' : '#1d231f',
            color: activeChip === 'passkeys' ? '#bcf0ce' : '#c2c8c3',
            fontSize: '0.84rem',
            fontWeight: 600,
            cursor: 'pointer',
            whiteSpace: 'nowrap',
            transition: 'all 0.15s ease',
          }}
        >
          {activeChip === 'passkeys' && <Check size={14} color="#00d668" strokeWidth={3} />}
          <span>Passkeys</span>
        </button>

        {/* Network devices Chip */}
        <button
          onClick={() => setActiveChip('network')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.35rem',
            padding: '0.45rem 0.95rem',
            borderRadius: '20px',
            border: activeChip === 'network' ? '1px solid #3d5e4b' : '1px solid #28302a',
            backgroundColor: activeChip === 'network' ? '#1c3d2c' : '#1d231f',
            color: activeChip === 'network' ? '#bcf0ce' : '#c2c8c3',
            fontSize: '0.84rem',
            fontWeight: 600,
            cursor: 'pointer',
            whiteSpace: 'nowrap',
            transition: 'all 0.15s ease',
          }}
        >
          {activeChip === 'network' && <Check size={14} color="#00d668" strokeWidth={3} />}
          <span>Network devices</span>
        </button>
      </div>

      {/* Main Password & Account List Container */}
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
        {/* Top Item: Add Password Row */}
        <button
          onClick={() => openPasswordEditor()}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.9rem',
            padding: '0.95rem 1.15rem',
            background: 'none',
            border: 'none',
            borderBottom: '1px solid #262e28',
            color: '#e3e3df',
            cursor: 'pointer',
            textAlign: 'left',
            transition: 'background-color 0.15s ease',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#242b26')}
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
            <Plus size={20} color="#00d668" strokeWidth={2.5} />
          </div>
          <span style={{ fontSize: '0.96rem', fontWeight: 600, color: '#e3e3df' }}>
            Add password
          </span>
        </button>

        {/* Password Group Items List */}
        {filteredGroups.length === 0 ? (
          <div
            style={{
              padding: '3rem 1.5rem',
              textAlign: 'center',
              color: '#8e9690',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '0.75rem',
            }}
          >
            <Shield size={36} color="#364239" />
            <div style={{ fontSize: '0.95rem', fontWeight: 600, color: '#b5bcb6' }}>
              {searchQuery ? `No passwords matching "${searchQuery}"` : 'No passwords saved yet'}
            </div>
            <div style={{ fontSize: '0.8rem', color: '#7a827b' }}>
              Tap "+ Add password" above or import your CSV backup
            </div>
          </div>
        ) : (
          filteredGroups.map((group, index) => {
            const hasMultipleAccounts = group.items.length > 1;

            return (
              <button
                key={group.domainKey || index}
                onClick={() => handleGroupClick(group)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '0.85rem',
                  padding: '0.85rem 1.15rem',
                  background: 'none',
                  border: 'none',
                  borderBottom:
                    index < filteredGroups.length - 1 ? '1px solid #232a25' : 'none',
                  color: '#e3e3df',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'background-color 0.15s ease',
                  width: '100%',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#232a25')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
              >
                {/* Left: Domain Avatar + Domain Name */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.9rem',
                    minWidth: 0,
                    flex: 1,
                  }}
                >
                  <PasswordAvatar
                    posterUrl={group.posterUrl}
                    siteUrl={group.siteUrl || group.domainKey}
                    title={group.displayTitle}
                    size={38}
                    style={{ borderRadius: '10px' }}
                  />
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div
                      style={{
                        fontSize: '0.93rem',
                        fontWeight: 500,
                        color: '#f0f2ee',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {group.domainKey}
                    </div>
                  </div>
                </div>

                {/* Right: Multi-accounts Counter or Passkey indicator */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0 }}>
                  {hasMultipleAccounts ? (
                    <span
                      style={{
                        fontSize: '0.84rem',
                        color: '#8ba892',
                        fontWeight: 500,
                      }}
                    >
                      {group.items.length} accounts
                    </span>
                  ) : (
                    group.type === 'passkey' && (
                      <span
                        style={{
                          fontSize: '0.75rem',
                          color: '#00d668',
                          fontWeight: 600,
                        }}
                      >
                        Passkey
                      </span>
                    )
                  )}
                </div>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
};
