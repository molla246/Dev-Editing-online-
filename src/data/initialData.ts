import { PasswordItem, PageItem, LabelItem, PageTabItem, ActivityLog } from '../types';

export const initialPasswords: PasswordItem[] = [
  {
    id: "pass-1",
    title: "Google Workspace Account",
    posterUrl: "https://images.unsplash.com/photo-1573804633927-bfcbcd909acd?auto=format&fit=crop&w=300&q=80",
    siteUrl: "https://accounts.google.com",
    userId: "admin@company.com",
    status: "Published",
    audioUrl: "Gg#892!kL9$2026",
    dynamicNotes: [
      { name: "Recovery Code", val: "9842-1102-3948-2201" },
      { name: "2FA Backup Key", val: "JBSWY3DPEHPK3PXP" }
    ],
    labels: ["WORK", "PERSONAL"],
    views: 15,
    isPinned: true,
    dateString: "25 Jul 2026",
    createdAt: 1784934475603
  },
  {
    id: "pass-2",
    title: "Production AWS Cloud Vault",
    posterUrl: "https://images.unsplash.com/photo-1607799279861-4dd421887fb3?auto=format&fit=crop&w=300&q=80",
    siteUrl: "https://aws.amazon.com/console",
    userId: "aws-root-admin",
    status: "Published",
    audioUrl: "AwsSecretVault#2026!Key",
    dynamicNotes: [
      { name: "Region", val: "us-east-1 (N. Virginia)" },
      { name: "Access Key ID", val: "AKIAIOSFODNN7EXAMPLE" }
    ],
    labels: ["SERVERS", "WORK"],
    views: 32,
    isPinned: false,
    dateString: "22 Jul 2026",
    createdAt: 1784680460469
  },
  {
    id: "pass-3",
    title: "Facebook Creator Portal",
    posterUrl: "https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?auto=format&fit=crop&w=300&q=80",
    siteUrl: "https://facebook.com",
    userId: "MRiyajul25@gmail.com",
    status: "Published",
    audioUrl: "Fb$Pass#883921",
    dynamicNotes: [
      { name: "Page ID", val: "109283748293" }
    ],
    labels: ["SOCIAL"],
    views: 11,
    isPinned: false,
    dateString: "21 Jul 2026",
    createdAt: 1784766860469
  },
  {
    id: "pass-4",
    title: "Bank Vault Online Banking",
    posterUrl: "https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&w=300&q=80",
    siteUrl: "https://banking.example.com",
    userId: "user_vault_992",
    status: "Draft",
    audioUrl: "SecureBank$991823!",
    dynamicNotes: [
      { name: "Account Number", val: "2019-3382-9910-4412" }
    ],
    labels: ["BANKING", "PERSONAL"],
    views: 3,
    isPinned: false,
    dateString: "20 Jul 2026",
    createdAt: 1784507660469
  }
];

export const initialPages: PageItem[] = [
  {
    id: "pg-1",
    title: "Master Backup Procedures",
    content: "<h3 style='color: #f97316;'>Master Backup Protocol</h3><p>Ensure exported CSV/JSON backups are stored safely in encrypted cold storage.</p><p>Default decryption master key hint: <strong>123456</strong></p>",
    tabId: "tab-1",
    attachments: [],
    views: 8,
    dateString: "23 Jul 2026",
    createdAt: 1784934475603
  },
  {
    id: "pg-2",
    title: "Server Deployment Checklist",
    content: "<p>Check SSL certificates, verify firewall rules on port 3000, and ensure automated daily vault snapshots are running.</p>",
    tabId: "tab-2",
    attachments: [],
    views: 12,
    dateString: "24 Jul 2026",
    createdAt: 1784934475604
  }
];

export const initialLabels: LabelItem[] = [
  { id: "lbl-1", name: "BANKING", color: "#f97316" },
  { id: "lbl-2", name: "SERVERS", color: "#6366f1" },
  { id: "lbl-3", name: "PERSONAL", color: "#10b981" },
  { id: "lbl-4", name: "WORK", color: "#3b82f6" },
  { id: "lbl-5", name: "SOCIAL", color: "#ec4899" }
];

export const initialPageTabs: PageTabItem[] = [
  { id: "tab-1", name: "GENERAL", createdAt: 1784861911892 },
  { id: "tab-2", name: "SECURITY", createdAt: 1784933700517 }
];

export const initialLogs: ActivityLog[] = [
  {
    id: "log-1",
    action: "System Login",
    detail: "User unlocked the vault with Security Key.",
    dateString: "25 Jul 2026",
    createdAt: Date.now() - 3600000
  },
  {
    id: "log-2",
    action: "Data Backup",
    detail: "Vault records initialized and ready for offline use.",
    dateString: "25 Jul 2026",
    createdAt: Date.now() - 7200000
  }
];
