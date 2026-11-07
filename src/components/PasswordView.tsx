import React, { useState } from 'react';
import {
  Shield,
  Eye,
  EyeOff,
  Copy,
  Star,
  Plus,
  Trash2,
  Edit,
  Filter,
  ArrowUpDown,
  ExternalLink,
  CheckSquare,
  Square,
  CopyPlus
} from 'lucide-react';
import { PasswordItem, LabelItem } from '../types';
import { PasswordAvatar } from './PasswordAvatar';

interface PasswordViewProps {
  passwords: PasswordItem[];
  labels: LabelItem[];
  searchQuery: string;
  onOpenCreate: () => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onTogglePin: (id: string) => void;
  onShowDetail: (id: string) => void;
  onCopy: (text: string) => void;
  onBulkDelete: (ids: string[]) => void;
  onBulkDuplicate: (ids: string[]) => void;
  onBulkStatusUpdate: (ids: string[], status: string) => void;
}

export const PasswordView: React.FC<PasswordViewProps> = ({
  passwords,
  labels,
  searchQuery,
  onOpenCreate,
  onEdit,
  onDelete,
  onTogglePin,
  onShowDetail,
  onCopy,
  onBulkDelete,
  onBulkDuplicate,
  onBulkStatusUpdate,
}) => {
  const [statusFilter, setStatusFilter] = useState<'all' | 'Published' | 'Draft'>('all');
  const [labelFilter, setLabelFilter] = useState<string>('all');
  const [sortOrder, setSortOrder] = useState<'latest' | 'alpha'>('latest');
  const [visiblePasswords, setVisiblePasswords] = useState<Record<string, boolean>>({});
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [manageMode, setManageMode] = useState<boolean>(false);

  // Filtering
  let filtered = passwords.filter((p) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      !q ||
      (p.title || '').toLowerCase().includes(q) ||
      (p.userId || '').toLowerCase().includes(q) ||
      (p.siteUrl || '').toLowerCase().includes(q);

    const matchesStatus = statusFilter === 'all' || p.status === statusFilter;
    const matchesLabel = labelFilter === 'all' || (p.labels && p.labels.includes(labelFilter));

    return matchesSearch && matchesStatus && matchesLabel;
  });

  // Sorting
  if (sortOrder === 'alpha') {
    filtered.sort((a, b) => (a.title || '').localeCompare(b.title || ''));
  } else {
    filtered.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
  }

  // Pinned items stay on top
  filtered.sort((a, b) => (b.isPinned ? 1 : 0) - (a.isPinned ? 1 : 0));

  const toggleVisibility = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setVisiblePasswords((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleSelect = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleSelectAll = () => {
    if (selectedIds.size === filtered.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filtered.map((p) => p.id)));
    }
  };

  return (
    <div id="view-password" className="space-y-4 animate-fadeIn pb-12">
      {/* Top Controls Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-[#161b2c] border border-white/10 p-4 rounded-2xl">
        <div className="flex flex-wrap items-center gap-2 text-xs">
          {/* Status Dropdown */}
          <div className="flex items-center gap-1 bg-slate-900 border border-white/10 px-3 py-1.5 rounded-xl text-gray-300">
            <Filter className="w-3.5 h-3.5 text-orange-400" />
            <select
              id="status-filter-select"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="bg-transparent text-white font-bold outline-none cursor-pointer"
            >
              <option value="all" className="bg-slate-900">All Status ({passwords.length})</option>
              <option value="Published" className="bg-slate-900">Published</option>
              <option value="Draft" className="bg-slate-900">Draft</option>
            </select>
          </div>

          {/* Label Filter Dropdown */}
          <div className="flex items-center gap-1 bg-slate-900 border border-white/10 px-3 py-1.5 rounded-xl text-gray-300">
            <select
              id="label-filter-select"
              value={labelFilter}
              onChange={(e) => setLabelFilter(e.target.value)}
              className="bg-transparent text-white font-bold outline-none cursor-pointer"
            >
              <option value="all" className="bg-slate-900">All Labels</option>
              {labels.map((lb) => (
                <option key={lb.id} value={lb.name} className="bg-slate-900">
                  {lb.name}
                </option>
              ))}
            </select>
          </div>

          {/* Sort Button */}
          <button
            id="sort-toggle-btn"
            onClick={() => setSortOrder(sortOrder === 'latest' ? 'alpha' : 'latest')}
            className="flex items-center gap-1 bg-slate-900 border border-white/10 hover:border-orange-500/50 px-3 py-1.5 rounded-xl text-gray-300 hover:text-white cursor-pointer transition-colors font-bold"
          >
            <ArrowUpDown className="w-3.5 h-3.5 text-orange-400" />
            <span>{sortOrder === 'latest' ? 'Sort: Latest' : 'Sort: A-Z'}</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            id="toggle-manage-btn"
            onClick={() => {
              setManageMode(!manageMode);
              if (manageMode) setSelectedIds(new Set());
            }}
            className={`px-4 py-1.5 rounded-xl text-xs font-extrabold uppercase transition-all cursor-pointer ${
              manageMode
                ? 'bg-orange-500 text-white shadow-lg'
                : 'bg-white/10 text-gray-300 hover:bg-white/20'
            }`}
          >
            {manageMode ? 'Done' : 'Manage'}
          </button>

          <button
            id="add-password-btn"
            onClick={onOpenCreate}
            className="btn-orange text-xs py-2 px-3.5"
          >
            <Plus className="w-4 h-4" />
            <span>New Item</span>
          </button>
        </div>
      </div>

      {/* Bulk Action Bar */}
      {manageMode && (
        <div className="bg-[#161b2c] border border-orange-500/30 p-4 rounded-2xl space-y-3 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-orange-400">
              {selectedIds.size} Item(s) Selected
            </span>
            <button
              onClick={handleSelectAll}
              className="text-[11px] font-bold text-gray-400 hover:text-white uppercase cursor-pointer"
            >
              {selectedIds.size === filtered.length ? 'Deselect All' : 'Select All Visible'}
            </button>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              disabled={selectedIds.size === 0}
              onClick={() => {
                onBulkStatusUpdate(Array.from(selectedIds), 'Published');
                setSelectedIds(new Set());
              }}
              className="px-3 py-1.5 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/30 rounded-xl text-xs font-extrabold uppercase disabled:opacity-40 cursor-pointer"
            >
              Mark Published
            </button>
            <button
              disabled={selectedIds.size === 0}
              onClick={() => {
                onBulkStatusUpdate(Array.from(selectedIds), 'Draft');
                setSelectedIds(new Set());
              }}
              className="px-3 py-1.5 bg-amber-500/20 text-amber-400 border border-amber-500/30 hover:bg-amber-500/30 rounded-xl text-xs font-extrabold uppercase disabled:opacity-40 cursor-pointer"
            >
              Mark Draft
            </button>
            <button
              disabled={selectedIds.size === 0}
              onClick={() => {
                onBulkDuplicate(Array.from(selectedIds));
                setSelectedIds(new Set());
              }}
              className="px-3 py-1.5 bg-blue-500/20 text-blue-400 border border-blue-500/30 hover:bg-blue-500/30 rounded-xl text-xs font-extrabold uppercase disabled:opacity-40 cursor-pointer flex items-center gap-1"
            >
              <CopyPlus className="w-3.5 h-3.5" />
              Duplicate
            </button>
            <button
              disabled={selectedIds.size === 0}
              onClick={() => {
                onBulkDelete(Array.from(selectedIds));
                setSelectedIds(new Set());
              }}
              className="px-3 py-1.5 bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30 rounded-xl text-xs font-extrabold uppercase disabled:opacity-40 cursor-pointer flex items-center gap-1"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Delete
            </button>
          </div>
        </div>
      )}

      {/* Item List Grid */}
      {filtered.length === 0 ? (
        <div className="bg-[#161b2c] border border-white/10 rounded-2xl p-12 text-center text-gray-400">
          <Shield className="w-12 h-12 mx-auto text-gray-600 mb-3" />
          <p className="font-bold text-sm uppercase tracking-wider text-gray-300">No passwords found</p>
          <p className="text-xs text-gray-500 mt-1">Try adjusting search or status filters</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((item, idx) => {
            const isSelected = selectedIds.has(item.id);
            const isRevealed = !!visiblePasswords[item.id];

            return (
              <div
                key={item.id}
                id={`pass-card-${item.id}`}
                onClick={() => onShowDetail(item.id)}
                className={`bg-[#161b2c] p-5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between gap-3 relative group ${
                  item.isPinned
                    ? 'border-amber-500/50 shadow-lg shadow-amber-500/5'
                    : 'border-white/10 hover:border-orange-500/40'
                } ${isSelected ? 'ring-2 ring-orange-500 bg-orange-950/20' : ''}`}
              >
                {/* Card Top */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    {manageMode && (
                      <button
                        onClick={(e) => toggleSelect(item.id, e)}
                        className="text-orange-400 hover:text-orange-300 cursor-pointer"
                      >
                        {isSelected ? <CheckSquare className="w-5 h-5" /> : <Square className="w-5 h-5 text-gray-500" />}
                      </button>
                    )}

                    <PasswordAvatar
                      posterUrl={item.posterUrl}
                      siteUrl={item.siteUrl}
                      title={item.title}
                      size={42}
                    />

                    <div className="overflow-hidden">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-mono text-gray-500">#{idx + 1}</span>
                        <h3 className="font-extrabold text-sm text-white truncate">{item.title}</h3>
                      </div>
                      <p className="text-xs text-gray-400 truncate">{item.userId || 'No Username'}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onTogglePin(item.id);
                      }}
                      className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                        item.isPinned
                          ? 'text-amber-400 bg-amber-500/10'
                          : 'text-gray-500 hover:text-amber-400 hover:bg-white/5'
                      }`}
                      title={item.isPinned ? 'Unpin' : 'Pin to top'}
                    >
                      <Star className={`w-4 h-4 ${item.isPinned ? 'fill-amber-400' : ''}`} />
                    </button>

                    <span
                      className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${
                        item.status === 'Draft'
                          ? 'bg-amber-500/20 text-amber-400'
                          : 'bg-emerald-500/20 text-emerald-400'
                      }`}
                    >
                      {item.status || 'PUB'}
                    </span>
                  </div>
                </div>

                {/* Password Box */}
                <div
                  className="bg-slate-900/90 border border-white/10 p-3 rounded-xl flex items-center justify-between font-mono text-xs text-amber-300"
                  onClick={(e) => e.stopPropagation()}
                >
                  <span className="truncate pr-2 select-all">
                    {isRevealed ? item.audioUrl || '(Empty)' : '••••••••••••'}
                  </span>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={(e) => toggleVisibility(item.id, e)}
                      className="p-1 text-gray-400 hover:text-white transition-colors cursor-pointer"
                      title={isRevealed ? 'Hide Password' : 'Show Password'}
                    >
                      {isRevealed ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onCopy(item.audioUrl || '');
                      }}
                      className="p-1 text-gray-400 hover:text-orange-400 transition-colors cursor-pointer"
                      title="Copy Password"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Tags and Site Link */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                  <div className="flex flex-wrap gap-1">
                    {(item.labels || []).map((lbl, lIdx) => (
                      <span
                        key={lIdx}
                        className="text-[9px] font-extrabold bg-orange-500/10 text-orange-400 border border-orange-500/20 px-2 py-0.5 rounded-md uppercase"
                      >
                        {lbl}
                      </span>
                    ))}
                  </div>

                  {item.siteUrl && (
                    <a
                      href={item.siteUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="text-[10px] text-blue-400 hover:underline flex items-center gap-1 font-bold"
                    >
                      <span>Visit Site</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>

                {/* Card Footer Actions */}
                <div className="flex items-center justify-between pt-2 border-t border-white/5 text-xs text-gray-400">
                  <span className="text-[10px] text-gray-500">{item.dateString || 'No Date'}</span>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onEdit(item.id);
                      }}
                      className="text-orange-400 hover:text-orange-300 font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <Edit className="w-3.5 h-3.5" />
                      Edit
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDelete(item.id);
                      }}
                      className="text-red-400 hover:text-red-300 font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
