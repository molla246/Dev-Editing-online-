import React, { useState } from 'react';
import { Shield, KeyRound, Lock } from 'lucide-react';

interface LoginModalProps {
  onUnlock: (key: string) => boolean;
}

export const LoginModal: React.FC<LoginModalProps> = ({ onUnlock }) => {
  const [securityKey, setSecurityKey] = useState('123456');
  const [error, setError] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const success = onUnlock(securityKey);
    if (!success) {
      setError(true);
    }
  };

  return (
    <div id="login-modal" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="bg-[#161b2c] border border-white/10 rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl relative">
        <div className="w-16 h-16 bg-gradient-to-tr from-orange-500 to-amber-500 rounded-2xl mx-auto flex items-center justify-center text-white shadow-lg mb-4">
          <Shield className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-black italic uppercase tracking-wider text-orange-500">DATA Vault</h1>
        <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-1 mb-6">Offline Password Manager</p>

        <form onSubmit={handleSubmit} className="space-y-4 text-left">
          <div>
            <label className="block text-[10px] font-extrabold uppercase text-gray-400 mb-1">Security Key / Password</label>
            <div className="relative">
              <KeyRound className="w-4 h-4 text-orange-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                id="login-pass"
                type="password"
                value={securityKey}
                onChange={(e) => {
                  setSecurityKey(e.target.value);
                  setError(false);
                }}
                required
                className="w-full bg-slate-900/80 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm text-white focus:outline-none focus:border-orange-500 font-mono tracking-widest"
              />
            </div>
          </div>

          {error && (
            <p className="text-xs text-red-400 font-semibold text-center">
              Invalid Security Key! Default key is 123456
            </p>
          )}

          <button
            type="submit"
            id="login-btn"
            className="w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-extrabold py-3.5 px-4 rounded-xl text-xs uppercase tracking-wider shadow-lg shadow-orange-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Lock className="w-4 h-4" />
            Unlock Offline Vault
          </button>
        </form>

        <p className="text-[11px] text-gray-400 font-bold mt-5">
          Default Key: <code className="text-orange-400 bg-slate-900 px-2 py-0.5 rounded font-mono">123456</code>
        </p>
      </div>
    </div>
  );
};
