import React, { useState, useEffect } from 'react';
import { X, FileText, Paperclip, Trash2, Upload, Bold, Italic, Underline, List } from 'lucide-react';
import { PageItem, PageTabItem, Attachment } from '../types';

interface PageModalProps {
  isOpen: boolean;
  item: PageItem | null;
  tabs: PageTabItem[];
  onClose: () => void;
  onSave: (itemData: Partial<PageItem>) => void;
}

export const PageModal: React.FC<PageModalProps> = ({
  isOpen,
  item,
  tabs,
  onClose,
  onSave,
}) => {
  const [title, setTitle] = useState('');
  const [tabId, setTabId] = useState('');
  const [content, setContent] = useState('');
  const [attachments, setAttachments] = useState<Attachment[]>([]);

  useEffect(() => {
    if (item) {
      setTitle(item.title || '');
      setTabId(item.tabId || (tabs[0]?.id || ''));
      setContent(item.content || '');
      setAttachments(item.attachments || []);
    } else {
      setTitle('');
      setTabId(tabs[0]?.id || '');
      setContent('');
      setAttachments([]);
    }
  }, [item, isOpen, tabs]);

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file: File) => {
      if (file.size > 10 * 1024 * 1024) {
        alert(`File ${file.name} exceeds 10MB limit and was skipped.`);
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        setAttachments((prev) => [...prev, { name: file.name, url: result }]);
      };
      reader.readAsDataURL(file);
    });
    e.target.value = '';
  };

  const handleRemoveAttachment = (idx: number) => {
    setAttachments(attachments.filter((_, i) => i !== idx));
  };

  const insertFormatting = (tag: string) => {
    if (tag === 'b') setContent((prev) => `${prev} <b>Bold Text</b> `);
    if (tag === 'i') setContent((prev) => `${prev} <i>Italic Text</i> `);
    if (tag === 'u') setContent((prev) => `${prev} <u>Underline Text</u> `);
    if (tag === 'ul') setContent((prev) => `${prev}\n<ul>\n  <li>List Item 1</li>\n  <li>List Item 2</li>\n</ul>\n`);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      alert('Page Title is required.');
      return;
    }

    onSave({
      id: item?.id,
      title: title.trim(),
      tabId: tabId || (tabs[0]?.id || ''),
      content,
      attachments
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-[#161b2c] border border-white/10 rounded-3xl p-6 max-w-lg w-full space-y-5 shadow-2xl relative max-h-[90vh] overflow-y-auto my-auto no-scrollbar">
        <div className="flex justify-between items-center pb-3 border-b border-white/10 sticky top-0 bg-[#161b2c] z-10">
          <h3 className="text-base font-black uppercase text-amber-400 flex items-center gap-2">
            <FileText className="w-5 h-5" />
            {item ? 'Edit Notebook Page' : 'New Encrypted Page'}
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
              Page Title *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="E.g. Master Backup Protocols, Server IP Table..."
              required
              className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white font-bold focus:outline-none focus:border-amber-500"
            />
          </div>

          {/* Tab Selector */}
          <div>
            <label className="block text-[11px] font-extrabold uppercase text-gray-400 mb-1">
              Notebook Category Tab
            </label>
            <select
              value={tabId}
              onChange={(e) => setTabId(e.target.value)}
              className="w-full bg-slate-900 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white font-bold focus:outline-none focus:border-amber-500 cursor-pointer"
            >
              {tabs.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>

          {/* Rich Content Editor */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-[11px] font-extrabold uppercase text-gray-400">
                Page Content / HTML Notes
              </label>

              {/* Toolbar */}
              <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-lg border border-white/10">
                <button
                  type="button"
                  onClick={() => insertFormatting('b')}
                  className="p-1 text-gray-400 hover:text-amber-400 rounded cursor-pointer"
                  title="Bold"
                >
                  <Bold className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => insertFormatting('i')}
                  className="p-1 text-gray-400 hover:text-amber-400 rounded cursor-pointer"
                  title="Italic"
                >
                  <Italic className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => insertFormatting('u')}
                  className="p-1 text-gray-400 hover:text-amber-400 rounded cursor-pointer"
                  title="Underline"
                >
                  <Underline className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => insertFormatting('ul')}
                  className="p-1 text-gray-400 hover:text-amber-400 rounded cursor-pointer"
                  title="List"
                >
                  <List className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <textarea
              rows={8}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Enter encrypted document markup or plain notes..."
              className="w-full bg-slate-900 border border-white/10 rounded-xl p-3.5 text-xs text-gray-200 font-mono leading-relaxed focus:outline-none focus:border-amber-500"
            />
          </div>

          {/* Attachments Section */}
          <div className="space-y-2 pt-2 border-t border-white/10">
            <div className="flex justify-between items-center">
              <label className="text-[11px] font-extrabold uppercase text-gray-300 flex items-center gap-1.5">
                <Paperclip className="w-3.5 h-3.5 text-blue-400" />
                Attached Document Files ({attachments.length})
              </label>

              <label className="text-[10px] font-extrabold text-blue-400 hover:text-blue-300 flex items-center gap-1 bg-blue-500/10 px-2.5 py-1 rounded-lg border border-blue-500/20 cursor-pointer">
                <Upload className="w-3 h-3" />
                Attach Files
                <input
                  type="file"
                  multiple
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>

            {attachments.length > 0 && (
              <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                {attachments.map((att, idx) => (
                  <div
                    key={idx}
                    className="bg-slate-900 border border-white/5 p-2.5 rounded-xl flex items-center justify-between text-xs text-gray-300"
                  >
                    <span className="truncate max-w-[200px] font-mono text-[11px]">{att.name}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveAttachment(idx)}
                      className="text-red-400 hover:text-red-300 p-1 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Action Buttons */}
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
              className="flex-1 btn-orange bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 justify-center py-3 text-xs"
            >
              {item ? 'Update Page' : 'Save Page'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
