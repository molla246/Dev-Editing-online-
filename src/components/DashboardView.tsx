import React from 'react';
import { Shield, FileText, Tag, Eye, Plus, Key, Zap, CheckCircle2, AlertTriangle, RefreshCw } from 'lucide-react';
import { PasswordItem, PageItem, LabelItem } from '../types';

interface DashboardViewProps {
  passwords: PasswordItem[];
  pages: PageItem[];
  labels: LabelItem[];
  onNavigate: (view: string) => void;
  onOpenCreateModal: (type: 'password' | 'pages' | 'labels') => void;
  onOpenGenerator: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  passwords,
  pages,
  labels,
  onNavigate,
  onOpenCreateModal,
  onOpenGenerator,
}) => {
  const totalViews = [...passwords, ...pages].reduce((sum, item) => sum + (item.views || 0), 0);
  const weakPasswords = passwords.filter((p) => (p.audioUrl || '').length < 8).length;
  const publishedCount = passwords.filter((p) => p.status === 'Published').length;

  return (
    <div id="view-dashboard" className="space-y-6 animate-fadeIn">
      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div
          id="stat-card-passwords"
          onClick={() => onNavigate('password')}
          className="bg-[#161b2c] border border-white/10 p-5 rounded-2xl hover:border-orange-500/50 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-2">
            <p className="text-[11px] font-extrabold uppercase text-gray-400 tracking-wider">Passwords</p>
            <Shield className="w-5 h-5 text-orange-500 group-hover:scale-110 transition-transform" />
          </div>
          <h3 className="text-3xl font-black text-orange-500">{passwords.length}</h3>
          <p className="text-[10px] text-gray-500 font-bold mt-1">{publishedCount} Active Vaults</p>
        </div>

        <div
          id="stat-card-pages"
          onClick={() => onNavigate('pages')}
          className="bg-[#161b2c] border border-white/10 p-5 rounded-2xl hover:border-amber-500/50 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-2">
            <p className="text-[11px] font-extrabold uppercase text-gray-400 tracking-wider">Pages</p>
            <FileText className="w-5 h-5 text-amber-500 group-hover:scale-110 transition-transform" />
          </div>
          <h3 className="text-3xl font-black text-amber-500">{pages.length}</h3>
          <p className="text-[10px] text-gray-500 font-bold mt-1">Encrypted Notebooks</p>
        </div>

        <div
          id="stat-card-labels"
          onClick={() => onNavigate('labels')}
          className="bg-[#161b2c] border border-white/10 p-5 rounded-2xl hover:border-emerald-500/50 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-2">
            <p className="text-[11px] font-extrabold uppercase text-gray-400 tracking-wider">Labels</p>
            <Tag className="w-5 h-5 text-emerald-500 group-hover:scale-110 transition-transform" />
          </div>
          <h3 className="text-3xl font-black text-emerald-500">{labels.length}</h3>
          <p className="text-[10px] text-gray-500 font-bold mt-1">Categories Tagged</p>
        </div>

        <div id="stat-card-views" className="bg-[#161b2c] border border-white/10 p-5 rounded-2xl">
          <div className="flex items-center justify-between mb-2">
            <p className="text-[11px] font-extrabold uppercase text-gray-400 tracking-wider">Activity Clicks</p>
            <Eye className="w-5 h-5 text-indigo-400" />
          </div>
          <h3 className="text-3xl font-black text-indigo-400">{totalViews}</h3>
          <p className="text-[10px] text-gray-500 font-bold mt-1">Vault Access Count</p>
        </div>
      </div>

      {/* Quick Action Panel */}
      <div className="bg-[#161b2c] border border-white/10 p-6 rounded-2xl space-y-4 shadow-xl">
        <div className="flex items-center justify-between">
          <h3 className="font-black uppercase text-sm text-gray-200 tracking-wide flex items-center gap-2">
            <Zap className="w-4 h-4 text-orange-500" />
            Quick Vault Actions
          </h3>
          <span className="text-[10px] bg-orange-500/20 text-orange-400 font-black px-2.5 py-1 rounded-full uppercase">
            Offline Ready
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <button
            id="dash-add-pass-btn"
            onClick={() => onOpenCreateModal('password')}
            className="p-4 bg-slate-900/90 border border-white/10 hover:border-orange-500/50 hover:bg-slate-800 rounded-xl text-left transition-all cursor-pointer group"
          >
            <div className="flex items-center gap-2 mb-1 text-orange-400 font-extrabold text-xs uppercase">
              <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform" />
              New Password
            </div>
            <p className="text-[11px] text-gray-400">Save site credentials & notes</p>
          </button>

          <button
            id="dash-add-page-btn"
            onClick={() => onOpenCreateModal('pages')}
            className="p-4 bg-slate-900/90 border border-white/10 hover:border-amber-500/50 hover:bg-slate-800 rounded-xl text-left transition-all cursor-pointer group"
          >
            <div className="flex items-center gap-2 mb-1 text-amber-400 font-extrabold text-xs uppercase">
              <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform" />
              New Page Note
            </div>
            <p className="text-[11px] text-gray-400">Store encrypted code/documents</p>
          </button>

          <button
            id="dash-gen-pass-btn"
            onClick={onOpenGenerator}
            className="p-4 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 rounded-xl text-left transition-all cursor-pointer shadow-lg shadow-emerald-900/30"
          >
            <div className="flex items-center gap-2 mb-1 text-white font-extrabold text-xs uppercase">
              <Key className="w-4 h-4" />
              Password Generator
            </div>
            <p className="text-[11px] text-emerald-100">Create high-entropy secret keys</p>
          </button>
        </div>
      </div>

      {/* Security Health Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-[#161b2c] border border-white/10 p-6 rounded-2xl space-y-3">
          <h4 className="font-extrabold text-xs uppercase text-gray-300 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            Vault Status
          </h4>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between py-1.5 border-b border-white/5">
              <span className="text-gray-400">Storage Location</span>
              <span className="font-bold text-gray-200">Local Browser Memory (Offline)</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-white/5">
              <span className="text-gray-400">Encryption Method</span>
              <span className="font-mono text-orange-400">Client-Side Vault Sync</span>
            </div>
            <div className="flex justify-between py-1.5">
              <span className="text-gray-400">Master Key Lock</span>
              <span className="font-mono text-emerald-400 font-bold">ACTIVE (123456)</span>
            </div>
          </div>
        </div>

        <div className="bg-[#161b2c] border border-white/10 p-6 rounded-2xl space-y-3">
          <h4 className="font-extrabold text-xs uppercase text-gray-300 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            Security Advisory
          </h4>
          <div className="text-xs space-y-2 text-gray-400 leading-relaxed">
            <p>
              {weakPasswords > 0 ? (
                <span className="text-amber-400 font-bold">
                  ⚠️ {weakPasswords} passwords in your vault are short (under 8 characters).
                </span>
              ) : (
                <span className="text-emerald-400 font-bold">
                  ✓ All stored password keys meet standard minimum length requirements.
                </span>
              )}
            </p>
            <p>
              Export periodic CSV/JSON backups under <strong>Backup & Sync</strong> to avoid losing data if browser cache is cleared.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
