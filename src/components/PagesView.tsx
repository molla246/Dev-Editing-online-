import React, { useState } from 'react';
import { FileText, Plus, Folder, Trash2, Edit, Eye, Paperclip, Download, Layers } from 'lucide-react';
import { PageItem, PageTabItem } from '../types';

interface PagesViewProps {
  pages: PageItem[];
  pageTabs: PageTabItem[];
  searchQuery: string;
  onOpenCreate: () => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onShowDetail: (id: string) => void;
  onAddTab: (name: string) => void;
  onDeleteTab: (id: string) => void;
}

export const PagesView: React.FC<PagesViewProps> = ({
  pages,
  pageTabs,
  searchQuery,
  onOpenCreate,
  onEdit,
  onDelete,
  onShowDetail,
  onAddTab,
  onDeleteTab,
}) => {
  const [activeTabId, setActiveTabId] = useState<string>('ALL');
  const [newTabName, setNewTabName] = useState('');
  const [showTabManager, setShowTabManager] = useState(false);

  let filtered = pages.filter((pg) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      !q ||
      (pg.title || '').toLowerCase().includes(q) ||
      (pg.content || '').toLowerCase().includes(q);

    const matchesTab = activeTabId === 'ALL' || pg.tabId === activeTabId;

    return matchesSearch && matchesTab;
  });

  const handleCreateTab = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTabName.trim()) {
      onAddTab(newTabName.trim());
      setNewTabName('');
    }
  };

  const calculateSizeKb = (content: string, attachments: any[] = []) => {
    let bytes = content ? new Blob([content]).size : 0;
    attachments.forEach((att) => {
      if (att.url) bytes += Math.round((att.url.length * 3) / 4);
    });
    return (bytes / 1024).toFixed(1);
  };

  return (
    <div id="view-pages" className="space-y-4 animate-fadeIn pb-12">
      {/* Tab Navigation Row */}
      <div className="bg-[#161b2c] border border-white/10 p-4 rounded-2xl space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-black uppercase text-white tracking-wider flex items-center gap-2">
            <Layers className="w-4 h-4 text-amber-500" />
            Notebook Categories
          </h2>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowTabManager(!showTabManager)}
              className="text-xs font-bold text-amber-400 bg-amber-500/10 hover:bg-amber-500/20 px-3 py-1.5 rounded-xl border border-amber-500/30 transition-all cursor-pointer"
            >
              {showTabManager ? 'Close Tabs' : 'Manage Tabs'}
            </button>
            <button
              onClick={onOpenCreate}
              className="btn-orange text-xs py-1.5 px-3"
            >
              <Plus className="w-4 h-4" />
              <span>New Page</span>
            </button>
          </div>
        </div>

        {/* Tab List Pill Bar */}
        <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar items-center">
          <button
            onClick={() => setActiveTabId('ALL')}
            className={`whitespace-nowrap font-extrabold px-4 py-2 rounded-xl text-xs uppercase tracking-wider transition-all cursor-pointer ${
              activeTabId === 'ALL'
                ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg'
                : 'bg-slate-900 text-gray-400 hover:text-white border border-white/10'
            }`}
          >
            All ({pages.length})
          </button>

          {pageTabs.map((tab) => {
            const count = pages.filter((p) => p.tabId === tab.id).length;
            const isActive = activeTabId === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTabId(tab.id)}
                className={`whitespace-nowrap font-extrabold px-4 py-2 rounded-xl text-xs uppercase tracking-wider transition-all cursor-pointer ${
                  isActive
                    ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg'
                    : 'bg-slate-900 text-gray-400 hover:text-white border border-white/10'
                }`}
              >
                {tab.name} ({count})
              </button>
            );
          })}
        </div>

        {/* Tab Manager Section */}
        {showTabManager && (
          <div className="pt-3 border-t border-white/10 space-y-3">
            <form onSubmit={handleCreateTab} className="flex gap-2">
              <input
                type="text"
                value={newTabName}
                onChange={(e) => setNewTabName(e.target.value)}
                placeholder="New Category Tab Name..."
                className="flex-1 bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
              />
              <button
                type="submit"
                className="bg-amber-500 hover:bg-amber-600 text-white text-xs font-extrabold px-4 rounded-xl uppercase tracking-wider cursor-pointer"
              >
                Add Tab
              </button>
            </form>

            <div className="flex flex-wrap gap-2 pt-1">
              {pageTabs.map((t) => (
                <div
                  key={t.id}
                  className="bg-slate-900 border border-white/10 px-3 py-1.5 rounded-xl flex items-center gap-2 text-xs font-bold text-gray-300"
                >
                  <span>{t.name}</span>
                  <button
                    onClick={() => onDeleteTab(t.id)}
                    className="text-red-400 hover:text-red-300 ml-1 cursor-pointer"
                    title="Delete Tab"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Pages Grid */}
      {filtered.length === 0 ? (
        <div className="bg-[#161b2c] border border-white/10 rounded-2xl p-12 text-center text-gray-400">
          <Folder className="w-12 h-12 mx-auto text-gray-600 mb-3" />
          <p className="font-bold text-sm uppercase tracking-wider text-gray-300">No Pages Found</p>
          <p className="text-xs text-gray-500 mt-1">Create a new page note or choose another category tab</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((pg, idx) => {
            const currentTab = pageTabs.find((t) => t.id === pg.tabId);
            const sizeKb = calculateSizeKb(pg.content, pg.attachments);

            return (
              <div
                key={pg.id}
                id={`page-card-${pg.id}`}
                onClick={() => onShowDetail(pg.id)}
                className="bg-[#161b2c] border border-white/10 hover:border-amber-500/40 p-5 rounded-2xl flex flex-col justify-between gap-3 transition-all cursor-pointer group"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono text-gray-500">#{idx + 1}</span>
                      <h3 className="font-black text-base text-white group-hover:text-amber-400 transition-colors">
                        {pg.title || 'Untitled Page'}
                      </h3>
                    </div>

                    <span className="text-[9px] font-bold bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded-full uppercase shrink-0">
                      {currentTab ? currentTab.name : 'Uncategorized'}
                    </span>
                  </div>

                  {/* HTML Content Preview */}
                  <div
                    className="text-xs text-gray-300 line-clamp-3 bg-slate-900/60 p-3 rounded-xl border border-white/5 font-sans leading-relaxed break-words"
                    dangerouslySetInnerHTML={{
                      __html: pg.content || '<em class="text-gray-500">Empty Page Content</em>'
                    }}
                  />
                </div>

                <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-white/5 text-xs text-gray-400">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-gray-500">{pg.dateString || 'No Date'}</span>
                    <span className="text-[9px] font-mono bg-white/5 px-2 py-0.5 rounded text-gray-400">
                      {sizeKb} KB
                    </span>
                    {pg.attachments && pg.attachments.length > 0 && (
                      <span className="text-[9px] font-bold text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-full flex items-center gap-1">
                        <Paperclip className="w-3 h-3" />
                        {pg.attachments.length} Files
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onShowDetail(pg.id);
                      }}
                      className="text-indigo-400 hover:text-indigo-300 font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      View
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onEdit(pg.id);
                      }}
                      className="text-amber-400 hover:text-amber-300 font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <Edit className="w-3.5 h-3.5" />
                      Edit
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDelete(pg.id);
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
