import React, { useState } from 'react';
import { Tag, Plus, Trash2, Shield, ChevronRight } from 'lucide-react';
import { LabelItem, PasswordItem } from '../types';

interface LabelsViewProps {
  labels: LabelItem[];
  passwords: PasswordItem[];
  onAddLabel: (name: string, color: string) => void;
  onDeleteLabel: (id: string) => void;
  onShowPasswordDetail: (id: string) => void;
}

export const LabelsView: React.FC<LabelsViewProps> = ({
  labels,
  passwords,
  onAddLabel,
  onDeleteLabel,
  onShowPasswordDetail,
}) => {
  const [newLabelName, setNewLabelName] = useState('');
  const [newLabelColor, setNewLabelColor] = useState('#f97316');
  const [selectedLabelName, setSelectedLabelName] = useState<string | null>(null);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (newLabelName.trim()) {
      onAddLabel(newLabelName.trim().toUpperCase(), newLabelColor);
      setNewLabelName('');
    }
  };

  const matchingPasswords = selectedLabelName
    ? passwords.filter((p) => p.labels && p.labels.includes(selectedLabelName))
    : [];

  return (
    <div id="view-labels" className="space-y-6 animate-fadeIn pb-12">
      {/* Create Label Form */}
      <div className="bg-[#161b2c] border border-white/10 p-6 rounded-2xl space-y-4 shadow-xl">
        <h2 className="text-base font-black uppercase text-white tracking-wider flex items-center gap-2">
          <Tag className="w-5 h-5 text-emerald-400" />
          Add Category Tag / Label
        </h2>

        <form onSubmit={handleAdd} className="flex flex-col sm:flex-row gap-3">
          <input
            id="label-name-input"
            type="text"
            value={newLabelName}
            onChange={(e) => setNewLabelName(e.target.value)}
            placeholder="E.G. BANKING, WORK, PERSONAL..."
            required
            className="flex-1 bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-emerald-500 uppercase tracking-wider font-bold"
          />

          <div className="flex items-center gap-2 bg-slate-900 border border-white/10 rounded-xl px-3 py-2">
            <label className="text-xs text-gray-400 font-bold uppercase">Badge Color:</label>
            <input
              type="color"
              value={newLabelColor}
              onChange={(e) => setNewLabelColor(e.target.value)}
              className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-0"
            />
          </div>

          <button
            type="submit"
            className="btn-orange bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 py-3 px-6 text-xs font-black"
          >
            <Plus className="w-4 h-4" />
            Save Label
          </button>
        </form>
      </div>

      {/* Labels List Chips */}
      <div className="bg-[#161b2c] border border-white/10 p-6 rounded-2xl space-y-4">
        <h3 className="text-sm font-extrabold uppercase text-gray-300">All Registered Labels ({labels.length})</h3>

        {labels.length === 0 ? (
          <p className="text-xs text-gray-500 italic">No category labels defined yet.</p>
        ) : (
          <div className="flex flex-wrap gap-3">
            {labels.map((lb) => {
              const count = passwords.filter((p) => p.labels && p.labels.includes(lb.name)).length;
              const isSelected = selectedLabelName === lb.name;

              return (
                <div
                  key={lb.id}
                  onClick={() => setSelectedLabelName(isSelected ? null : lb.name)}
                  className={`px-4 py-2.5 rounded-xl border flex items-center gap-3 transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-slate-800 border-emerald-400 ring-2 ring-emerald-500/30'
                      : 'bg-slate-900/90 border-white/10 hover:border-white/20'
                  }`}
                >
                  <span
                    className="w-3 h-3 rounded-full shrink-0"
                    style={{ backgroundColor: lb.color || '#f97316' }}
                  />
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-xs text-white uppercase tracking-wider">
                      {lb.name}
                    </span>
                    <span className="text-[10px] font-mono text-gray-400 bg-white/5 px-2 py-0.5 rounded-md">
                      {count}
                    </span>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteLabel(lb.id);
                    }}
                    className="text-gray-500 hover:text-red-400 transition-colors p-1 cursor-pointer"
                    title="Delete Label"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Filtered Item Preview */}
      {selectedLabelName && (
        <div className="bg-[#161b2c] border border-emerald-500/30 p-6 rounded-2xl space-y-4 shadow-xl">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-black uppercase text-emerald-400 flex items-center gap-2">
              <Shield className="w-4 h-4" />
              Vault Items Tagged With "{selectedLabelName}" ({matchingPasswords.length})
            </h3>
            <button
              onClick={() => setSelectedLabelName(null)}
              className="text-xs text-gray-400 hover:text-white font-bold cursor-pointer"
            >
              Close Preview
            </button>
          </div>

          {matchingPasswords.length === 0 ? (
            <p className="text-xs text-gray-400 italic">No passwords associated with this label yet.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {matchingPasswords.map((p) => (
                <div
                  key={p.id}
                  onClick={() => onShowPasswordDetail(p.id)}
                  className="bg-slate-900/90 border border-white/10 hover:border-emerald-500/40 p-3.5 rounded-xl flex items-center justify-between transition-all cursor-pointer group"
                >
                  <div className="flex items-center gap-3 overflow-hidden">
                    <div className="w-9 h-9 bg-emerald-500/10 text-emerald-400 font-bold rounded-lg flex items-center justify-center shrink-0">
                      {p.title.charAt(0).toUpperCase()}
                    </div>
                    <div className="overflow-hidden">
                      <h4 className="font-extrabold text-xs text-white group-hover:text-emerald-400 truncate">
                        {p.title}
                      </h4>
                      <p className="text-[10px] text-gray-400 truncate">{p.userId || 'No User ID'}</p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-500 group-hover:text-emerald-400 transition-colors shrink-0" />
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
