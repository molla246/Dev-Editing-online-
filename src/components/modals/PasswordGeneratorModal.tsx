import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { X, Key, RefreshCw, Copy, ShieldCheck } from 'lucide-react';

export const PasswordGeneratorModal: React.FC = () => {
  const { isPasswordGeneratorOpen, setIsPasswordGeneratorOpen, addToast } = useApp();

  const [length, setLength] = useState<number>(16);
  const [useUpper, setUseUpper] = useState<boolean>(true);
  const [useLower, setUseLower] = useState<boolean>(true);
  const [useNumbers, setUseNumbers] = useState<boolean>(true);
  const [useSymbols, setUseSymbols] = useState<boolean>(true);
  const [generatedPassword, setGeneratedPassword] = useState<string>('');

  const generatePassword = () => {
    let chars = '';
    if (useUpper) chars += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    if (useLower) chars += 'abcdefghijklmnopqrstuvwxyz';
    if (useNumbers) chars += '0123456789';
    if (useSymbols) chars += '!@#$%^&*()_+-=[]{}|;:,.<>?';

    if (!chars) {
      setGeneratedPassword('');
      return;
    }

    let result = '';
    const array = new Uint32Array(length);
    window.crypto.getRandomValues(array);
    for (let i = 0; i < length; i++) {
      result += chars[array[i] % chars.length];
    }
    setGeneratedPassword(result);
  };

  useEffect(() => {
    if (isPasswordGeneratorOpen) {
      generatePassword();
    }
  }, [isPasswordGeneratorOpen, length, useUpper, useLower, useNumbers, useSymbols]);

  if (!isPasswordGeneratorOpen) return null;

  const handleCopy = () => {
    if (!generatedPassword) return;
    navigator.clipboard.writeText(generatedPassword);
    addToast('Generated password copied to clipboard!', 'success');
  };

  // Calculate Password Strength
  const getStrengthScore = () => {
    let score = 0;
    if (length >= 12) score += 25;
    if (length >= 16) score += 25;
    if (useUpper && useLower) score += 20;
    if (useNumbers) score += 15;
    if (useSymbols) score += 15;
    return score;
  };

  const strength = getStrengthScore();

  const getStrengthLabel = () => {
    if (strength >= 80) return { label: 'Strong Security Key', color: 'var(--success)' };
    if (strength >= 50) return { label: 'Medium Strength', color: 'var(--warning)' };
    return { label: 'Weak Key', color: 'var(--danger)' };
  };

  const strInfo = getStrengthLabel();

  return (
    <div className="modal-overlay">
      <div className="modal-container" style={{ maxWidth: '480px' }}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Key size={20} color="var(--warning)" />
            <h3 style={{ fontSize: '1.1rem' }}>Password & Secret Generator</h3>
          </div>
          <button className="btn-icon" onClick={() => setIsPasswordGeneratorOpen(false)}>
            <X size={18} />
          </button>
        </div>

        <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Output Display */}
          <div
            style={{
              padding: '1rem',
              borderRadius: 'var(--radius-lg)',
              backgroundColor: 'var(--bg-primary)',
              border: '1px solid var(--border-color)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '0.75rem',
            }}
          >
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '1.1rem',
                fontWeight: 700,
                color: 'var(--primary)',
                wordBreak: 'break-all',
              }}
            >
              {generatedPassword || 'Select at least 1 set'}
            </span>

            <div style={{ display: 'flex', gap: '0.4rem' }}>
              <button onClick={generatePassword} className="btn-icon" title="Regenerate">
                <RefreshCw size={16} />
              </button>
              <button onClick={handleCopy} className="btn btn-primary" style={{ padding: '0.4rem 0.75rem' }}>
                <Copy size={16} />
                <span>Copy</span>
              </button>
            </div>
          </div>

          {/* Strength Meter */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem', fontSize: '0.8rem' }}>
              <span style={{ fontWeight: 700, color: 'var(--text-muted)' }}>SECURITY SCORE</span>
              <span style={{ fontWeight: 700, color: strInfo.color }}>{strInfo.label}</span>
            </div>
            <div style={{ height: '8px', backgroundColor: 'var(--bg-tertiary)', borderRadius: '4px', overflow: 'hidden' }}>
              <div
                style={{
                  height: '100%',
                  width: `${strength}%`,
                  backgroundColor: strInfo.color,
                  transition: 'width 0.3s ease',
                }}
              />
            </div>
          </div>

          {/* Length Slider */}
          <div className="form-group" style={{ marginBottom: 0 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
              <label className="form-label">Character Length</label>
              <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 800, color: 'var(--primary)' }}>
                {length} Characters
              </span>
            </div>
            <input
              type="range"
              min="8"
              max="32"
              value={length}
              onChange={(e) => setLength(Number(e.target.value))}
              style={{ width: '100%', accentColor: 'var(--primary)', cursor: 'pointer' }}
            />
          </div>

          {/* Toggles Grid */}
          <div className="grid-cols-2">
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.85rem' }}>
              <input
                type="checkbox"
                checked={useUpper}
                onChange={(e) => setUseUpper(e.target.checked)}
                style={{ width: '18px', height: '18px' }}
              />
              <span>Uppercase (A-Z)</span>
            </label>

            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.85rem' }}>
              <input
                type="checkbox"
                checked={useLower}
                onChange={(e) => setUseLower(e.target.checked)}
                style={{ width: '18px', height: '18px' }}
              />
              <span>Lowercase (a-z)</span>
            </label>

            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.85rem' }}>
              <input
                type="checkbox"
                checked={useNumbers}
                onChange={(e) => setUseNumbers(e.target.checked)}
                style={{ width: '18px', height: '18px' }}
              />
              <span>Numbers (0-9)</span>
            </label>

            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.85rem' }}>
              <input
                type="checkbox"
                checked={useSymbols}
                onChange={(e) => setUseSymbols(e.target.checked)}
                style={{ width: '18px', height: '18px' }}
              />
              <span>Symbols (!@#$)</span>
            </label>
          </div>
        </div>

        <div className="modal-footer">
          <button onClick={() => setIsPasswordGeneratorOpen(false)} className="btn btn-primary" style={{ width: '100%' }}>
            <ShieldCheck size={16} />
            <span>Done</span>
          </button>
        </div>
      </div>
    </div>
  );
};
