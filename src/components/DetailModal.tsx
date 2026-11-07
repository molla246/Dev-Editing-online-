import React from 'react';
import { X, Copy, ExternalLink, Download, Key, Shield, User, FileText, Paperclip, Eye } from 'lucide-react';
import { PasswordItem, PageItem } from '../types';

interface DetailModalProps {
  isOpen: boolean;
  type: 'pass' | 'page';
  item: PasswordItem | PageItem | null;
  onClose: () => void;
  onCopy: (text: string) => void;
}

export const DetailModal: React.FC<DetailModalProps> = ({
  isOpen,
  type,
  item,
  onClose,
  onCopy,
}) => {
  if (!isOpen || !item) return null;

  const passItem = type === 'pass' ? (item as PasswordItem) : null;
  const pageItem = type === 'page' ? (item as PageItem) : null;

  const downloadAsHtml = () => {
    if (!pageItem) return;
    const fullHtml = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>${pageItem.title}</title>
  <style>
    body { font-family: system-ui, sans-serif; padding: 2rem; background: #0b0f1a; color: #f3f4f6; }
    h1 { color: #f97316; }
    .box { background: #161b2c; border: 1px solid rgba(255,255,255,0.1); padding: 1.5rem; border-radius: 1rem; }
  </style>
</head>
<body>
  <div class="box">
    <h1>${pageItem.title}</h1>
    <div>${pageItem.content}</div>
  </div>
</body>
</html>`;

    const blob = new Blob([fullHtml], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${pageItem.title.replace(/[^a-z0-9]/gi, '_')}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-[#161b2c] border border-white/10 rounded-3xl p-6 max-w-lg w-full space-y-5 shadow-2xl relative max-h-[90vh] overflow-y-auto my-auto no-scrollbar">
        {/* Header */}
        <div className="flex justify-between items-center pb-3 border-b border-white/10 sticky top-0 bg-[#161b2c] z-10">
          <div className="flex items-center gap-2">
            {type === 'pass' ? (
              <Shield className="w-5 h-5 text-orange-500" />
            ) : (
              <FileText className="w-5 h-5 text-amber-500" />
            )}
            <h3 className="text-base font-black uppercase text-white tracking-wider">
              {item.title}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-white rounded-lg hover:bg-white/10 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        {passItem && (
          <div className="space-y-4 text-xs">
            {/* User ID Box */}
            {passItem.userId && (
              <div className="bg-slate-900 border border-white/10 p-3.5 rounded-xl relative flex justify-between items-center">
                <div>
                  <p className="text-[10px] font-black uppercase text-gray-400 mb-0.5 flex items-center gap-1">
                    <User className="w-3 h-3 text-orange-400" /> User ID / Username
                  </p>
                  <p className="font-extrabold text-sm text-white select-all">{passItem.userId}</p>
                </div>
                <button
                  onClick={() => onCopy(passItem.userId || '')}
                  className="p-2 text-orange-400 hover:bg-orange-500/10 rounded-lg cursor-pointer"
                  title="Copy Username"
                >
                  <Copy className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Secret Password Box */}
            <div className="bg-slate-900 border border-white/10 p-3.5 rounded-xl relative flex justify-between items-center">
              <div>
                <p className="text-[10px] font-black uppercase text-gray-400 mb-0.5 flex items-center gap-1">
                  <Key className="w-3 h-3 text-amber-400" /> Secret Key / Password
                </p>
                <p className="font-mono text-sm text-amber-300 font-bold select-all break-all pr-2">
                  {passItem.audioUrl || '(Empty)'}
                </p>
              </div>
              <button
                onClick={() => onCopy(passItem.audioUrl || '')}
                className="p-2 text-amber-400 hover:bg-amber-500/10 rounded-lg cursor-pointer shrink-0"
                title="Copy Password"
              >
                <Copy className="w-4 h-4" />
              </button>
            </div>

            {/* Site URL */}
            {passItem.siteUrl && (
              <div className="bg-slate-900 border border-white/10 p-3.5 rounded-xl flex justify-between items-center">
                <div className="overflow-hidden pr-2">
                  <p className="text-[10px] font-black uppercase text-gray-400 mb-0.5">Website Link</p>
                  <a
                    href={passItem.siteUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-blue-400 hover:underline font-bold truncate block"
                  >
                    {passItem.siteUrl}
                  </a>
                </div>
                <a
                  href={passItem.siteUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 text-blue-400 hover:bg-blue-500/10 rounded-lg shrink-0 cursor-pointer"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            )}

            {/* Dynamic Custom Fields */}
            {passItem.dynamicNotes && passItem.dynamicNotes.length > 0 && (
              <div className="space-y-2 pt-2 border-t border-white/10">
                <p className="text-[11px] font-extrabold uppercase text-gray-400">Additional Vault Fields</p>
                {passItem.dynamicNotes.map((dn, idx) => (
                  <div key={idx} className="bg-slate-900/80 border border-white/5 p-3 rounded-xl flex justify-between items-center">
                    <div>
                      <p className="text-[10px] font-black uppercase text-orange-400">{dn.name}</p>
                      <p className="text-xs text-gray-200 font-mono select-all mt-0.5">{dn.val}</p>
                    </div>
                    <button
                      onClick={() => onCopy(dn.val)}
                      className="p-1.5 text-gray-400 hover:text-orange-400 cursor-pointer"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {pageItem && (
          <div className="space-y-4 text-xs">
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-mono text-gray-400">{pageItem.dateString}</span>
              <button
                onClick={downloadAsHtml}
                className="btn-orange py-1.5 px-3 text-[11px] flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                Download HTML
              </button>
            </div>

            {/* HTML Note Render */}
            <div
              className="bg-slate-900 border border-white/10 p-4 rounded-xl text-gray-200 font-sans leading-relaxed space-y-2 max-h-72 overflow-y-auto no-scrollbar"
              dangerouslySetInnerHTML={{ __html: pageItem.content }}
            />

            {/* Attachments */}
            {pageItem.attachments && pageItem.attachments.length > 0 && (
              <div className="space-y-2 pt-2 border-t border-white/10">
                <p className="text-[11px] font-extrabold uppercase text-gray-400 flex items-center gap-1.5">
                  <Paperclip className="w-3.5 h-3.5 text-blue-400" /> Attached Files ({pageItem.attachments.length})
                </p>
                <div className="space-y-1.5">
                  {pageItem.attachments.map((att, idx) => (
                    <div
                      key={idx}
                      className="bg-slate-900 border border-white/5 p-2.5 rounded-xl flex items-center justify-between text-xs text-gray-300"
                    >
                      <span className="truncate font-mono">{att.name}</span>
                      <a
                        href={att.url}
                        download={att.name}
                        className="text-blue-400 hover:underline text-[11px] font-bold flex items-center gap-1"
                      >
                        <Download className="w-3.5 h-3.5" /> Download
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Close */}
        <div className="pt-3 border-t border-white/10 flex justify-end">
          <button
            onClick={onClose}
            className="w-full py-3 bg-white/10 hover:bg-white/15 text-gray-300 font-bold rounded-xl text-xs uppercase cursor-pointer"
          >
            Close Details
          </button>
        </div>
      </div>
    </div>
  );
};
