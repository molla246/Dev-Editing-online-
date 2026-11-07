import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, Shield, Key, Link as LinkIcon, User, Image as ImageIcon } from 'lucide-react';
import { PasswordItem, LabelItem, DynamicNote } from '../types';
import { PasswordAvatar } from './PasswordAvatar';
import { getFaviconUrl } from '../utils/favicon';

interface PasswordModalProps {
  isOpen: boolean;
  item: PasswordItem | null;
  labels: LabelItem[];
  onClose: () => void;
  onSave: (itemData: Partial<PasswordItem>) => void;
  onOpenGenerator: () => void;
}

export const PasswordModal: React.FC<PasswordModalProps> = ({
  isOpen,
  item,
  labels,
  onClose,
  onSave,
  onOpenGenerator,
}) => {
  const [title, setTitle] = useState('');
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [siteUrl, setSiteUrl] = useState('');
  const [posterUrl, setPosterUrl] = useState('');
  const [status, setStatus] = useState<'Published' | 'Draft'>('Published');
  const [selectedLabels, setSelectedLabels] = useState<string[]>([]);
  const [dynamicNotes, setDynamicNotes] = useState<DynamicNote[]>([]);

  useEffect(() => {
    if (item) {
      setTitle(item.title || '');
      setUserId(item.userId || '');
      setPassword(item.audioUrl || '');
      setSiteUrl(item.siteUrl || '');
      setPosterUrl(item.posterUrl || '');
      setStatus((item.status as any) || 'Published');
      setSelectedLabels(item.labels || []);
      setDynamicNotes(item.dynamicNotes || []);
    } else {
      setTitle('');
      setUserId('');
      setPassword('');
      setSiteUrl('');
      setPosterUrl('');
      setStatus('Published');
      setSelectedLabels([]);
      setDynamicNotes([]);
    }
  }, [item, isOpen]);

  if (!isOpen) return null;

  const handleAddDynamicNote = () => {
    if (dynamicNotes.length >= 5) {
      alert('Maximum 5 custom detail boxes allowed per item.');
      return;
    }
    setDynamicNotes([...dynamicNotes, { name: 'Note Name', val: '' }]);
  };

  const handleUpdateDynamicNote = (index: number, field: 'name' | 'val', value: string) => {
    const updated = [...dynamicNotes];
    updated[index] = { ...updated[index], [field]: value };
    setDynamicNotes(updated);
  };

  const handleRemoveDynamicNote = (index: number) => {
    setDynamicNotes(dynamicNotes.filter((_, i) => i !== index));
  };

  const toggleLabel = (labelName: string) => {
    if (selectedLabels.includes(labelName)) {
      setSelectedLabels(selectedLabels.filter((l) => l !== labelName));
    } else {
      setSelectedLabels([...selectedLabels, labelName]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !password.trim()) {
      alert('Title and Password key are required.');
      return;
    }

    onSave({
      id: item?.id,
      title: title.trim(),
      userId: userId.trim(),
      audioUrl: password.trim(),
      siteUrl: siteUrl.trim(),
      posterUrl: posterUrl.trim(),
      status,
      labels: selectedLabels,
      dynamicNotes
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-[#161b2c] border border-white/10 rounded-3xl p-6 max-w-lg w-full space-y-5 shadow-2xl relative max-h-[90vh] overflow-y-auto my-auto no-scrollbar">
        <div className="flex justify-between items-center pb-3 border-b border-white/10 sticky top-0 bg-[#161b2c] z-10">
          <h3 className="text-base font-black uppercase text-orange-500 flex items-center gap-2">
            <Shield className="w-5 h-5" />
            {item ? 'Edit Password Item' : 'New Vault Password'}
          </h3>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-white rounded-lg hover:bg-white/10 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Title */}
          <div>
            <label className="block text-[11px] font-extrabold uppercase text-gray-400 mb-1">
              Account / Site Name *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="E.g. Google Workspace, AWS Cloud, PayPal..."
              required
              className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white font-bold focus:outline-none focus:border-orange-500"
            />
          </div>

          {/* User ID / Email & Password Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-extrabold uppercase text-gray-400 mb-1 flex items-center gap-1">
                <User className="w-3.5 h-3.5 text-orange-400" />
                Username / User ID
              </label>
              <input
                type="text"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                placeholder="admin@example.com"
                className="w-full bg-slate-900 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-orange-500"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-[11px] font-extrabold uppercase text-gray-400 flex items-center gap-1">
                  <Key className="w-3.5 h-3.5 text-orange-400" />
                  Password Key *
                </label>
                <button
                  type="button"
                  onClick={onOpenGenerator}
                  className="text-[10px] text-emerald-400 hover:underline font-bold cursor-pointer"
                >
                  ⚡ Generate
                </button>
              </div>
              <input
                type="text"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter secret password..."
                required
                className="w-full bg-slate-900 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-amber-300 font-mono focus:outline-none focus:border-orange-500"
              />
            </div>
          </div>

          {/* Site URL & Poster Image URL */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-extrabold uppercase text-gray-400 mb-1 flex items-center gap-1">
                <LinkIcon className="w-3.5 h-3.5 text-blue-400" />
                Website URL
              </label>
              <input
                type="url"
                value={siteUrl}
                onChange={(e) => setSiteUrl(e.target.value)}
                placeholder="https://accounts.google.com"
                className="w-full bg-slate-900 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-orange-500"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-[11px] font-extrabold uppercase text-gray-400 flex items-center gap-1">
                  <ImageIcon className="w-3.5 h-3.5 text-purple-400" />
                  Icon / Logo Image URL
                </label>
                {(siteUrl || title || posterUrl) && (
                  <button
                    type="button"
                    onClick={() => {
                      const autoFav = getFaviconUrl(siteUrl || posterUrl) || getFaviconUrl(title);
                      if (autoFav) setPosterUrl(autoFav);
                    }}
                    className="text-[10px] font-bold text-orange-400 hover:text-orange-300 cursor-pointer"
                  >
                    + Auto-Set Favicon
                  </button>
                )}
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="url"
                  value={posterUrl}
                  onChange={(e) => setPosterUrl(e.target.value)}
                  placeholder="https://... (or leave blank for auto favicon)"
                  className="w-full bg-slate-900 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-orange-500"
                />
                <PasswordAvatar
                  posterUrl={posterUrl}
                  siteUrl={siteUrl}
                  title={title || 'Icon'}
                  size={36}
                />
              </div>
            </div>
          </div>

          {/* Visibility Status */}
          <div>
            <label className="block text-[11px] font-extrabold uppercase text-gray-400 mb-1">
              Vault State
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as any)}
              className="w-full bg-slate-900 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white font-bold focus:outline-none focus:border-orange-500 cursor-pointer"
            >
              <option value="Published">Published (Active)</option>
              <option value="Draft">Draft (Hidden Vault)</option>
            </select>
          </div>

          {/* Label Selectors */}
          <div>
            <label className="block text-[11px] font-extrabold uppercase text-gray-400 mb-2">
              Category Tags / Labels
            </label>
            <div className="flex flex-wrap gap-1.5 bg-slate-900/60 p-3 rounded-xl border border-white/5">
              {labels.map((lb) => {
                const isSelected = selectedLabels.includes(lb.name);
                return (
                  <button
                    key={lb.id}
                    type="button"
                    onClick={() => toggleLabel(lb.name)}
                    className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-orange-500 text-white shadow-md'
                        : 'bg-slate-800 text-gray-400 hover:text-white border border-white/10'
                    }`}
                  >
                    {lb.name}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Custom Text Boxes / Dynamic Notes */}
          <div className="space-y-2 pt-2 border-t border-white/10">
            <div className="flex justify-between items-center">
              <label className="text-[11px] font-extrabold uppercase text-gray-300">
                Custom Detail Fields (2FA, Recovery Codes)
              </label>
              <button
                type="button"
                onClick={handleAddDynamicNote}
                className="text-[10px] font-extrabold text-orange-400 hover:text-orange-300 flex items-center gap-1 bg-orange-500/10 px-2.5 py-1 rounded-lg border border-orange-500/20 cursor-pointer"
              >
                <Plus className="w-3 h-3" />
                Add Field
              </button>
            </div>

            <div className="space-y-2">
              {dynamicNotes.map((dn, idx) => (
                <div
                  key={idx}
                  className="bg-slate-900 border border-dashed border-orange-500/30 p-3 rounded-xl space-y-2 relative"
                >
                  <div className="flex justify-between items-center gap-2">
                    <input
                      type="text"
                      value={dn.name}
                      onChange={(e) => handleUpdateDynamicNote(idx, 'name', e.target.value)}
                      placeholder="Field Name (E.g. 2FA Secret, Pin, API Key)"
                      className="bg-transparent border-b border-white/10 text-orange-400 font-extrabold text-xs uppercase outline-none flex-1 py-0.5"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveDynamicNote(idx)}
                      className="text-red-400 hover:text-red-300 p-1 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <input
                    type="text"
                    value={dn.val}
                    onChange={(e) => handleUpdateDynamicNote(idx, 'val', e.target.value)}
                    placeholder="Field Value..."
                    className="w-full bg-slate-950 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-gray-200 font-mono focus:outline-none"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Form Action Buttons */}
          <div className="flex gap-2 pt-4 border-t border-white/10">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 bg-white/10 hover:bg-white/15 text-gray-300 font-bold rounded-xl text-xs uppercase cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 btn-orange justify-center py-3 text-xs"
            >
              {item ? 'Update Password' : 'Save Password'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
