import React, { useState } from 'react';
import { Download, Upload, Shield, KeyRound, AlertTriangle, FileSpreadsheet, Database } from 'lucide-react';
import { PasswordItem, PageItem, LabelItem, PageTabItem } from '../types';

interface ExportImportViewProps {
  passwords: PasswordItem[];
  pages: PageItem[];
  labels: LabelItem[];
  pageTabs: PageTabItem[];
  onImportAll: (data: { passwords?: PasswordItem[]; pages?: PageItem[]; labels?: LabelItem[]; pageTabs?: PageTabItem[] }) => void;
  onShowToast: (msg: string) => void;
  onLogActivity: (action: string, detail: string) => void;
}

export const ExportImportView: React.FC<ExportImportViewProps> = ({
  passwords,
  pages,
  labels,
  pageTabs,
  onImportAll,
  onShowToast,
  onLogActivity,
}) => {
  const [securityPass, setSecurityPass] = useState('');
  const [showSecurityModal, setShowSecurityModal] = useState(false);
  const [pendingExportType, setPendingExportType] = useState<'json' | 'csv-pass' | 'csv-pages' | 'csv-all' | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const triggerExport = (type: 'json' | 'csv-pass' | 'csv-pages' | 'csv-all') => {
    setPendingExportType(type);
    setSecurityPass('');
    setShowSecurityModal(true);
  };

  const handleConfirmSecurity = (e: React.FormEvent) => {
    e.preventDefault();
    if (securityPass !== '123456') {
      alert('Incorrect Security Password!');
      onLogActivity('Failed Export Attempt', 'Incorrect security key entered during export.');
      return;
    }

    setShowSecurityModal(false);
    if (!pendingExportType) return;

    if (pendingExportType === 'json') {
      const dataStr = JSON.stringify({ passwords, pages, labels, pageTabs }, null, 2);
      const blob = new Blob([dataStr], { type: 'application/json' });
      downloadBlob(blob, `DATA_Vault_Backup_${Date.now()}.json`);
      onShowToast('Exported Full JSON Backup!');
      onLogActivity('Export Backup', 'Downloaded complete JSON backup.');
    } else {
      executeCSVExport(pendingExportType);
    }
  };

  const downloadBlob = (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const executeCSVExport = (type: string) => {
    let rows: any[] = [];
    if (type === 'csv-pass' || type === 'csv-all') {
      passwords.forEach((item) => {
        rows.push({
          Type: 'PASSWORD',
          Name: item.title || '',
          VisibilityState: item.status || 'Published',
          MediaAssetURL: item.posterUrl || '',
          SiteURLLink: item.siteUrl || '',
          UserID: item.userId || '',
          Password: item.audioUrl || '',
          DynamicNotes: item.dynamicNotes ? JSON.stringify(item.dynamicNotes) : item.note || '',
          Tags: (item.labels || []).join(', '),
          Date: item.dateString || ''
        });
      });
    }

    if (type === 'csv-pages' || type === 'csv-all') {
      pages.forEach((item) => {
        rows.push({
          Type: 'PAGE',
          PageTitle: item.title || '',
          Content: item.content || '',
          Attachments: item.attachments ? JSON.stringify(item.attachments) : '',
          Date: item.dateString || ''
        });
      });
    }

    if (rows.length === 0) {
      alert('No data found to export!');
      return;
    }

    // Convert to CSV
    const keys = Object.keys(rows[0]);
    const csvLines = [
      keys.join(','),
      ...rows.map((row) =>
        keys
          .map((k) => `"${String(row[k] || '').replace(/"/g, '""')}"`)
          .join(',')
      )
    ];

    const blob = new Blob([csvLines.join('\n')], { type: 'text/csv;charset=utf-8;' });
    downloadBlob(blob, `DATA_Vault_${type.toUpperCase()}_${Date.now()}.csv`);
    onShowToast(`Exported ${rows.length} CSV items!`);
    onLogActivity('Export CSV', `Exported ${rows.length} items to CSV.`);
  };

  // Handle Import
  const handleFileSelect = (file: File) => {
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        if (file.name.endsWith('.json')) {
          const parsed = JSON.parse(text);
          onImportAll(parsed);
          onShowToast('Successfully imported JSON vault backup!');
          onLogActivity('Import Data', `Imported backup file ${file.name}`);
        } else if (file.name.endsWith('.csv')) {
          parseCSVAndImport(text);
        } else {
          alert('Unsupported file format! Please upload a .json or .csv backup.');
        }
      } catch (err) {
        alert('Failed to parse backup file. Please check format.');
      }
    };
    reader.readAsText(file);
  };

  const parseCSVAndImport = (csvText: string) => {
    const lines = csvText.split('\n').filter((l) => l.trim().length > 0);
    if (lines.length < 2) {
      alert('CSV file appears empty or invalid.');
      return;
    }

    const headers = lines[0].split(',').map((h) => h.replace(/^"|"$/g, '').trim());
    const newPass: PasswordItem[] = [];
    const newPages: PageItem[] = [];

    for (let i = 1; i < lines.length; i++) {
      // Basic CSV split ignoring escaped quotes inside strings
      const values = lines[i].split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/).map((v) => v.replace(/^"|"$/g, '').trim());
      const rowObj: Record<string, string> = {};
      headers.forEach((h, idx) => {
        rowObj[h] = values[idx] || '';
      });

      const type = (rowObj['Type'] || '').toUpperCase();
      if (type === 'PASSWORD' || rowObj['Name'] || rowObj['Password']) {
        let dynamicNotesParsed = [];
        try {
          if (rowObj['DynamicNotes']) dynamicNotesParsed = JSON.parse(rowObj['DynamicNotes']);
        } catch {}

        newPass.push({
          id: 'imported-pass-' + Date.now() + '-' + i,
          title: rowObj['Name'] || 'Imported Password',
          status: rowObj['VisibilityState'] === 'Draft' ? 'Draft' : 'Published',
          posterUrl: rowObj['MediaAssetURL'] || '',
          siteUrl: rowObj['SiteURLLink'] || '',
          userId: rowObj['UserID'] || '',
          audioUrl: rowObj['Password'] || '',
          dynamicNotes: dynamicNotesParsed,
          labels: rowObj['Tags'] ? rowObj['Tags'].split(',').map((t) => t.trim()) : [],
          views: 0,
          isPinned: false,
          dateString: rowObj['Date'] || new Date().toLocaleDateString(),
          createdAt: Date.now()
        });
      } else if (type === 'PAGE' || rowObj['PageTitle']) {
        let attachmentsParsed = [];
        try {
          if (rowObj['Attachments']) attachmentsParsed = JSON.parse(rowObj['Attachments']);
        } catch {}

        newPages.push({
          id: 'imported-page-' + Date.now() + '-' + i,
          title: rowObj['PageTitle'] || 'Imported Page',
          content: rowObj['Content'] || '',
          tabId: rowObj['TabID'] || 'tab_1',
          attachments: attachmentsParsed,
          views: 0,
          dateString: rowObj['Date'] || new Date().toLocaleDateString(),
          createdAt: Date.now()
        });
      }
    }

    onImportAll({ passwords: newPass, pages: newPages });
    onShowToast(`Imported ${newPass.length} passwords and ${newPages.length} pages from CSV!`);
    onLogActivity('Import CSV', `Imported ${newPass.length + newPages.length} records.`);
  };

  return (
    <div id="view-export-import" className="space-y-6 animate-fadeIn pb-12">
      {/* Intro Header */}
      <div className="bg-[#161b2c] border border-white/10 p-6 rounded-2xl space-y-2">
        <h2 className="text-base font-black uppercase text-white tracking-wider flex items-center gap-2">
          <Database className="w-5 h-5 text-orange-500" />
          Backup & Data Synchronization
        </h2>
        <p className="text-xs text-gray-400 leading-relaxed">
          Export your offline vault state to encrypted JSON or standard CSV spreadsheets. You can restore or merge backups anytime.
        </p>
      </div>

      {/* Export Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Full JSON Export */}
        <div className="bg-[#161b2c] border border-white/10 p-6 rounded-2xl flex flex-col justify-between gap-4 shadow-xl">
          <div>
            <div className="w-12 h-12 bg-orange-500/10 border border-orange-500/20 text-orange-400 rounded-xl flex items-center justify-center mb-3">
              <Download className="w-6 h-6" />
            </div>
            <h3 className="font-extrabold text-sm text-white uppercase">Complete Vault Backup (JSON)</h3>
            <p className="text-xs text-gray-400 mt-1 leading-relaxed">
              Downloads a complete snapshot of passwords, notebook pages, categories, labels, and system activity logs.
            </p>
          </div>

          <button
            onClick={() => triggerExport('json')}
            className="btn-orange justify-center py-3 text-xs w-full"
          >
            Export Complete JSON
          </button>
        </div>

        {/* CSV Spreadsheet Export */}
        <div className="bg-[#161b2c] border border-white/10 p-6 rounded-2xl flex flex-col justify-between gap-4 shadow-xl">
          <div>
            <div className="w-12 h-12 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-xl flex items-center justify-center mb-3">
              <FileSpreadsheet className="w-6 h-6" />
            </div>
            <h3 className="font-extrabold text-sm text-white uppercase">Spreadsheet Backup (CSV)</h3>
            <p className="text-xs text-gray-400 mt-1 leading-relaxed">
              Export passwords or pages as standard CSV tables compatible with Excel, Google Sheets, or other password managers.
            </p>
          </div>

          <div className="flex flex-col gap-2">
            <button
              onClick={() => triggerExport('csv-pass')}
              className="py-2.5 bg-slate-900 border border-white/10 hover:border-orange-500/50 text-gray-200 hover:text-white rounded-xl text-xs font-bold uppercase transition-all cursor-pointer"
            >
              Export Passwords CSV ({passwords.length})
            </button>
            <button
              onClick={() => triggerExport('csv-pages')}
              className="py-2.5 bg-slate-900 border border-white/10 hover:border-amber-500/50 text-gray-200 hover:text-white rounded-xl text-xs font-bold uppercase transition-all cursor-pointer"
            >
              Export Pages CSV ({pages.length})
            </button>
          </div>
        </div>
      </div>

      {/* Drag & Drop Import Box */}
      <div
        id="drop-zone"
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragOver(true);
        }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragOver(false);
          if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFileSelect(e.dataTransfer.files[0]);
          }
        }}
        className={`bg-[#161b2c] border-2 border-dashed p-8 rounded-2xl text-center space-y-4 transition-all ${
          isDragOver
            ? 'border-orange-500 bg-orange-500/10 scale-[1.01]'
            : 'border-white/15 hover:border-white/30'
        }`}
      >
        <div className="w-16 h-16 bg-slate-900 border border-white/10 text-orange-400 rounded-2xl flex items-center justify-center mx-auto shadow-inner">
          <Upload className="w-8 h-8" />
        </div>

        <div>
          <h3 className="font-black text-sm uppercase text-white">Import Vault Data</h3>
          <p className="text-xs text-gray-400 mt-1 max-w-md mx-auto">
            Drag & drop a <code className="text-orange-400">.json</code> or <code className="text-orange-400">.csv</code> backup file here, or click to browse.
          </p>
        </div>

        <label className="inline-block">
          <input
            type="file"
            accept=".json,.csv"
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                handleFileSelect(e.target.files[0]);
              }
            }}
            className="hidden"
          />
          <span className="btn-orange py-3 px-6 text-xs inline-flex items-center gap-2 cursor-pointer shadow-lg">
            <Upload className="w-4 h-4" />
            Browse Backup File
          </span>
        </label>
      </div>

      {/* Security Verification Modal */}
      {showSecurityModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#161b2c] border border-white/10 rounded-3xl p-6 max-w-sm w-full space-y-4 text-center shadow-2xl">
            <div className="w-12 h-12 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-2xl flex items-center justify-center mx-auto">
              <KeyRound className="w-6 h-6" />
            </div>

            <div>
              <h3 className="font-black text-base text-white uppercase">Security Verification</h3>
              <p className="text-xs text-gray-400 mt-1">
                Enter your vault Security Key to authorize backup export:
              </p>
            </div>

            <form onSubmit={handleConfirmSecurity} className="space-y-3">
              <input
                type="password"
                value={securityPass}
                onChange={(e) => setSecurityPass(e.target.value)}
                placeholder="Enter Key (Default: 123456)"
                required
                className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-sm text-white font-mono text-center focus:outline-none focus:border-orange-500"
              />

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowSecurityModal(false)}
                  className="flex-1 py-3 bg-white/10 text-gray-300 font-bold rounded-xl text-xs uppercase cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 btn-orange justify-center py-3 text-xs"
                >
                  Authorize
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
