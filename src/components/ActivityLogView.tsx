import React from 'react';
import { History, Trash2, Info, PlusCircle, Edit3, ShieldAlert, Key } from 'lucide-react';
import { ActivityLog } from '../types';

interface ActivityLogViewProps {
  logs: ActivityLog[];
  onClearLogs: () => void;
}

export const ActivityLogView: React.FC<ActivityLogViewProps> = ({ logs, onClearLogs }) => {
  const getLogIcon = (action: string) => {
    if (action.includes('Delete') || action.includes('Purge')) {
      return <Trash2 className="w-4 h-4 text-red-400" />;
    }
    if (action.includes('Create') || action.includes('Add')) {
      return <PlusCircle className="w-4 h-4 text-emerald-400" />;
    }
    if (action.includes('Update') || action.includes('Edit')) {
      return <Edit3 className="w-4 h-4 text-amber-400" />;
    }
    if (action.includes('Login') || action.includes('Auth')) {
      return <Key className="w-4 h-4 text-orange-400" />;
    }
    return <Info className="w-4 h-4 text-blue-400" />;
  };

  return (
    <div id="view-history" className="space-y-4 animate-fadeIn pb-12">
      <div className="bg-[#161b2c] border border-white/10 p-6 rounded-2xl flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-black uppercase text-white tracking-wider flex items-center gap-2">
            <History className="w-5 h-5 text-indigo-400" />
            Audit & Activity Logs ({logs.length})
          </h2>
          <p className="text-xs text-gray-400 mt-1">
            Real-time security log tracking all local changes made in your vault session.
          </p>
        </div>

        {logs.length > 0 && (
          <button
            onClick={onClearLogs}
            className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 rounded-xl text-xs font-extrabold uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Trash2 className="w-4 h-4" />
            Clear Activity History
          </button>
        )}
      </div>

      {logs.length === 0 ? (
        <div className="bg-[#161b2c] border border-white/10 rounded-2xl p-12 text-center text-gray-400">
          <History className="w-12 h-12 mx-auto text-gray-600 mb-3" />
          <p className="font-bold text-sm uppercase tracking-wider text-gray-300">No Activity Recorded</p>
          <p className="text-xs text-gray-500 mt-1">Vault events will appear here as you create or update items</p>
        </div>
      ) : (
        <div className="bg-[#161b2c] border border-white/10 rounded-2xl p-4 divide-y divide-white/5 space-y-1">
          {logs.map((lg) => (
            <div key={lg.id} className="py-3 flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-slate-900 border border-white/5 flex items-center justify-center shrink-0 mt-0.5">
                {getLogIcon(lg.action)}
              </div>
              <div className="flex-1 overflow-hidden">
                <div className="flex items-center justify-between gap-2">
                  <h4 className="font-extrabold text-xs text-white uppercase">{lg.action}</h4>
                  <span className="text-[10px] font-mono text-gray-500 shrink-0">{lg.dateString || ''}</span>
                </div>
                <p className="text-xs text-gray-300 mt-0.5 leading-relaxed break-words">{lg.detail}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
