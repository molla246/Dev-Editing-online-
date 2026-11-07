import React, { useMemo } from 'react';
import { useApp } from '../context/AppContext';
import {
  ShieldCheck,
  AlertTriangle,
  RefreshCw,
  CheckCircle2,
  Key,
  Lock,
  ChevronRight,
  ShieldAlert,
} from 'lucide-react';
import { PasswordAvatar } from '../components/PasswordAvatar';

export const GoogleCheckupView: React.FC = () => {
  const { passwords, openPasswordEditor } = useApp();

  const activePasswords = useMemo(
    () => passwords.filter((p) => p.status !== 'Draft' && (p.status as string) !== 'draft'),
    [passwords]
  );

  // Analysis
  const analysis = useMemo(() => {
    // 1. Reused passwords
    const passMap = new Map<string, typeof activePasswords>();
    activePasswords.forEach((p) => {
      const val = p.audioUrl.trim();
      if (!val) return;
      if (!passMap.has(val)) {
        passMap.set(val, []);
      }
      passMap.get(val)!.push(p);
    });

    const reusedGroups = Array.from(passMap.values()).filter((arr) => arr.length > 1);
    const reusedCount = reusedGroups.reduce((acc, g) => acc + g.length, 0);

    // 2. Weak passwords (< 8 characters or simple)
    const weakList = activePasswords.filter((p) => {
      const val = p.audioUrl.trim();
      return val.length < 8 || /^[a-zA-Z]+$/.test(val) || /^[0-9]+$/.test(val);
    });

    // 3. Compromised (none by default unless extremely common)
    const compromisedList = activePasswords.filter((p) => {
      const val = p.audioUrl.toLowerCase().trim();
      return ['123456', 'password', '12345678', 'admin', 'qwerty', '12345'].includes(val);
    });

    return {
      total: activePasswords.length,
      reusedGroups,
      reusedCount,
      weakList,
      compromisedList,
      safeCount: Math.max(0, activePasswords.length - weakList.length - compromisedList.length),
    };
  }, [activePasswords]);

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
      {/* Top Banner Card */}
      <div
        style={{
          backgroundColor: '#1b201d',
          borderRadius: '24px',
          border: '1px solid #28302a',
          padding: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          gap: '1.25rem',
        }}
      >
        <div
          style={{
            width: '56px',
            height: '56px',
            borderRadius: '50%',
            backgroundColor: '#193928',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <ShieldCheck size={32} color="#00d668" strokeWidth={2.2} />
        </div>
        <div>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#f0f2ee', margin: 0 }}>
            {analysis.total} passwords checked
          </h2>
          <div style={{ fontSize: '0.85rem', color: '#9ba39c', marginTop: '0.25rem' }}>
            Google Password Checkup helps you strengthen security by auditing all saved credentials.
          </div>
        </div>
      </div>

      {/* Compromised Passwords Section */}
      <div
        style={{
          backgroundColor: '#1b201d',
          borderRadius: '22px',
          border: '1px solid #262e28',
          overflow: 'hidden',
          padding: '1.25rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
          {analysis.compromisedList.length === 0 ? (
            <CheckCircle2 size={22} color="#00d668" />
          ) : (
            <ShieldAlert size={22} color="#ef4444" />
          )}
          <span style={{ fontSize: '1rem', fontWeight: 600, color: '#f0f2ee' }}>
            {analysis.compromisedList.length === 0
              ? '0 compromised passwords'
              : `${analysis.compromisedList.length} compromised passwords`}
          </span>
        </div>
        <div style={{ fontSize: '0.84rem', color: '#9ba39c', lineHeight: 1.5 }}>
          {analysis.compromisedList.length === 0
            ? 'No passwords found in known public data breaches.'
            : 'These passwords have appeared in known data breaches. Change them immediately.'}
        </div>

        {analysis.compromisedList.length > 0 && (
          <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {analysis.compromisedList.map((p) => (
              <div
                key={p.id}
                onClick={() => openPasswordEditor(p.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.75rem 1rem',
                  backgroundColor: '#241a1a',
                  border: '1px solid #3d2323',
                  borderRadius: '12px',
                  cursor: 'pointer',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <PasswordAvatar siteUrl={p.siteUrl} title={p.title} size={30} />
                  <div>
                    <div style={{ fontSize: '0.9rem', fontWeight: 600, color: '#f0f2ee' }}>{p.title}</div>
                    <div style={{ fontSize: '0.75rem', color: '#ef4444' }}>{p.userId || 'No username'}</div>
                  </div>
                </div>
                <button
                  style={{
                    padding: '0.35rem 0.85rem',
                    borderRadius: '14px',
                    backgroundColor: '#ef4444',
                    color: '#ffffff',
                    border: 'none',
                    fontWeight: 700,
                    fontSize: '0.78rem',
                  }}
                >
                  Change
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Reused Passwords Section */}
      <div
        style={{
          backgroundColor: '#1b201d',
          borderRadius: '22px',
          border: '1px solid #262e28',
          overflow: 'hidden',
          padding: '1.25rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
          {analysis.reusedCount === 0 ? (
            <CheckCircle2 size={22} color="#00d668" />
          ) : (
            <AlertTriangle size={22} color="#eab308" />
          )}
          <span style={{ fontSize: '1rem', fontWeight: 600, color: '#f0f2ee' }}>
            {analysis.reusedCount === 0
              ? '0 reused passwords'
              : `${analysis.reusedCount} reused passwords across ${analysis.reusedGroups.length} groups`}
          </span>
        </div>
        <div style={{ fontSize: '0.84rem', color: '#9ba39c', lineHeight: 1.5 }}>
          Using unique passwords for every account helps protect your accounts if one site is compromised.
        </div>

        {analysis.reusedGroups.length > 0 && (
          <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {analysis.reusedGroups.map((group, gIdx) => (
              <div
                key={gIdx}
                style={{
                  backgroundColor: '#222824',
                  borderRadius: '14px',
                  padding: '0.85rem',
                  border: '1px solid #2d3830',
                }}
              >
                <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#eab308', marginBottom: '0.5rem' }}>
                  Reused across {group.length} accounts:
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  {group.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => openPasswordEditor(item.id)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '0.5rem 0.75rem',
                        backgroundColor: '#1b201d',
                        borderRadius: '10px',
                        cursor: 'pointer',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                        <PasswordAvatar siteUrl={item.siteUrl} title={item.title} size={26} />
                        <span style={{ fontSize: '0.86rem', color: '#e3e3df', fontWeight: 500 }}>
                          {item.title} {item.userId ? `(${item.userId})` : ''}
                        </span>
                      </div>
                      <ChevronRight size={16} color="#7a827b" />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Weak Passwords Section */}
      <div
        style={{
          backgroundColor: '#1b201d',
          borderRadius: '22px',
          border: '1px solid #262e28',
          overflow: 'hidden',
          padding: '1.25rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
          {analysis.weakList.length === 0 ? (
            <CheckCircle2 size={22} color="#00d668" />
          ) : (
            <AlertTriangle size={22} color="#eab308" />
          )}
          <span style={{ fontSize: '1rem', fontWeight: 600, color: '#f0f2ee' }}>
            {analysis.weakList.length === 0
              ? '0 weak passwords'
              : `${analysis.weakList.length} weak passwords`}
          </span>
        </div>
        <div style={{ fontSize: '0.84rem', color: '#9ba39c', lineHeight: 1.5 }}>
          Weak passwords are easy for attackers to guess. Use passwords with at least 12 characters including symbols.
        </div>

        {analysis.weakList.length > 0 && (
          <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            {analysis.weakList.map((item) => (
              <div
                key={item.id}
                onClick={() => openPasswordEditor(item.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.65rem 0.85rem',
                  backgroundColor: '#222824',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  border: '1px solid #2f3830',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <PasswordAvatar siteUrl={item.siteUrl} title={item.title} size={28} />
                  <div>
                    <div style={{ fontSize: '0.88rem', fontWeight: 600, color: '#f0f2ee' }}>{item.title}</div>
                    <div style={{ fontSize: '0.74rem', color: '#9ba39c' }}>{item.userId || 'No username'}</div>
                  </div>
                </div>
                <button
                  style={{
                    padding: '0.35rem 0.85rem',
                    borderRadius: '14px',
                    backgroundColor: '#00d668',
                    color: '#003915',
                    border: 'none',
                    fontWeight: 700,
                    fontSize: '0.78rem',
                  }}
                >
                  Improve
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
