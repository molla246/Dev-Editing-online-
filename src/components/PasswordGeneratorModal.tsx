import React, { useState, useEffect } from 'react';
import { Key, Copy, RefreshCw, X, Check } from 'lucide-react';

interface PasswordGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCopy: (pass: string) => void;
}

export const PasswordGeneratorModal: React.FC<PasswordGeneratorModalProps> = ({
  isOpen,
  onClose,
  onCopy,
}) => {
  const [length, setLength] = useState(16);
  const [useUpper, setUseUpper] = useState(true);
  const [useLower, setUseLower] = useState(true);
  const [useNums, setUseNums] = useState(true);
  const [useSyms, setUseSyms] = useState(true);
  const [generatedPassword, setGeneratedPassword] = useState('');
  const [copied, setCopied] = useState(false);

  const generatePassword = () => {
    let charset = '';
    if (useUpper) charset += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    if (useLower) charset += 'abcdefghijklmnopqrstuvwxyz';
    if (useNums) charset += '0123456789';
    if (useSyms) charset += '!@#$%^&*()_+-=[]{}|;:,.<>?';

    if (!charset) {
      setGeneratedPassword('Select at least one character type!');
      return;
    }

    let result = '';
    for (let i = 0; i < length; i++) {
      result += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    setGeneratedPassword(result);
    setCopied(false);
  };

  useEffect(() => {
    if (isOpen) {
      generatePassword();
    }
  }, [isOpen, length, useUpper, useLower, useNums, useSyms]);

  if (!isOpen) return null;

  const handleCopy = () => {
    if (generatedPassword && !generatedPassword.includes('Select')) {
      onCopy(generatedPassword);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const getStrength = () => {
    if (length < 10) return { label: 'Weak', color: 'bg-red-500' };
    if (length < 14) return { label: 'Medium', color: 'bg-amber-500' };
    if (length < 20) return { label: 'Strong', color: 'bg-emerald-500' };
    return { label: 'Ultra Secure', color: 'bg-indigo-500' };
  };

  const strength = getStrength();

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-[#161b2c] border border-white/10 rounded-3xl p-6 max-w-md w-full space-y-5 shadow-2xl relative">
        <div className="flex justify-between items-center pb-2 border-b border-white/10">
          <h3 className="text-base font-black uppercase text-emerald-400 flex items-center gap-2">
            <Key className="w-5 h-5" />
            Password Generator
          </h3>
          <button
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-white rounded-lg hover:bg-white/10 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Output Password Box */}
        <div className="bg-slate-900 border border-white/10 p-4 rounded-2xl space-y-2">
          <div className="flex items-center justify-between font-mono text-base text-amber-300 font-bold break-all select-all">
            <span>{generatedPassword}</span>
            <button
              onClick={generatePassword}
              className="p-2 text-gray-400 hover:text-emerald-400 transition-colors cursor-pointer shrink-0 ml-2"
              title="Generate New Password"
            >
              <RefreshCw className="w-5 h-5" />
            </button>
          </div>

          {/* Strength Bar */}
          <div className="flex items-center justify-between pt-2 border-t border-white/5 text-[10px] font-extrabold uppercase">
            <span className="text-gray-400">Entropy Strength:</span>
            <div className="flex items-center gap-2">
              <span className="text-white">{strength.label}</span>
              <div className="w-16 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                <div className={`h-full ${strength.color} transition-all w-full`} />
              </div>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="space-y-4 text-xs">
          <div>
            <div className="flex justify-between font-bold text-gray-300 mb-1">
              <span>Password Length</span>
              <span className="text-emerald-400 font-mono text-sm">{length} Chars</span>
            </div>
            <input
              type="range"
              min="8"
              max="32"
              value={length}
              onChange={(e) => setLength(parseInt(e.target.value))}
              className="w-full accent-emerald-500 cursor-pointer"
            />
          </div>

          <div className="grid grid-cols-2 gap-2 pt-1 font-bold text-gray-300">
            <label className="flex items-center gap-2 bg-slate-900/80 p-2.5 rounded-xl border border-white/5 cursor-pointer">
              <input
                type="checkbox"
                checked={useUpper}
                onChange={(e) => setUseUpper(e.target.checked)}
                className="accent-emerald-500 w-4 h-4"
              />
              <span>A-Z Uppercase</span>
            </label>

            <label className="flex items-center gap-2 bg-slate-900/80 p-2.5 rounded-xl border border-white/5 cursor-pointer">
              <input
                type="checkbox"
                checked={useLower}
                onChange={(e) => setUseLower(e.target.checked)}
                className="accent-emerald-500 w-4 h-4"
              />
              <span>a-z Lowercase</span>
            </label>

            <label className="flex items-center gap-2 bg-slate-900/80 p-2.5 rounded-xl border border-white/5 cursor-pointer">
              <input
                type="checkbox"
                checked={useNums}
                onChange={(e) => setUseNums(e.target.checked)}
                className="accent-emerald-500 w-4 h-4"
              />
              <span>0-9 Numbers</span>
            </label>

            <label className="flex items-center gap-2 bg-slate-900/80 p-2.5 rounded-xl border border-white/5 cursor-pointer">
              <input
                type="checkbox"
                checked={useSyms}
                onChange={(e) => setUseSyms(e.target.checked)}
                className="accent-emerald-500 w-4 h-4"
              />
              <span>!@# Symbols</span>
            </label>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex gap-2 pt-2">
          <button
            onClick={generatePassword}
            className="flex-1 py-3 bg-white/10 hover:bg-white/15 text-gray-200 font-extrabold rounded-xl text-xs uppercase cursor-pointer"
          >
            Regenerate
          </button>
          <button
            onClick={handleCopy}
            className="flex-1 btn-orange bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 justify-center py-3 text-xs"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                Copy Password
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
