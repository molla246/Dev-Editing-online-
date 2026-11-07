import { PasswordItem, PageItem, PageTab, LabelItem, ActivityLog } from '../types';

const now = Date.now();
const dateStr = new Date().toLocaleDateString('en-US', {
  year: 'numeric',
  month: 'short',
  day: 'numeric',
});

export const initialLabels: LabelItem[] = [
  { id: 'lbl_1', name: 'WORK', createdAt: now },
  { id: 'lbl_2', name: 'PERSONAL', createdAt: now },
  { id: 'lbl_3', name: 'BANKING', createdAt: now },
  { id: 'lbl_4', name: 'SOCIAL', createdAt: now },
];

export const initialPageTabs: PageTab[] = [
  { id: 'tab_1', name: 'GENERAL NOTES', createdAt: now },
  { id: 'tab_2', name: 'SERVER CONFIGS', createdAt: now },
  { id: 'tab_3', name: 'EMERGENCY BACKUP', createdAt: now },
];

export const initialPasswords: PasswordItem[] = [
  {
    id: 'pass_1',
    title: 'Google Account',
    userId: 'mriyajul25@gmail.com',
    audioUrl: 'vG#92xK!pL8@2026',
    siteUrl: 'https://accounts.google.com',
    status: 'Published',
    note: 'Primary Google Work & Admin Account',
    labels: ['WORK', 'PERSONAL'],
    views: 12,
    isPinned: true,
    dateString: dateStr,
    createdAt: now,
    updatedAt: now,
  },
  {
    id: 'pass_2',
    title: 'Firebase Admin Console',
    userId: 'mollariyajul55@gmail.com',
    audioUrl: 'aZ$88#mP@passwordadminpro',
    siteUrl: 'https://console.firebase.google.com',
    status: 'Published',
    note: 'Project ID: passwordadminpro\nDatabase: passwordadminpro-default-rtdb',
    labels: ['WORK'],
    views: 8,
    isPinned: true,
    dateString: dateStr,
    createdAt: now,
    updatedAt: now,
  },
  {
    id: 'pass_3',
    title: 'Facebook Account',
    userId: 'MRiyajul25@gmail.com',
    audioUrl: 'Fb_Pass_2026#Secure',
    siteUrl: 'https://facebook.com',
    status: 'Published',
    note: 'Personal Social Account',
    labels: ['SOCIAL'],
    views: 5,
    isPinned: false,
    dateString: dateStr,
    createdAt: now,
    updatedAt: now,
  },
  {
    id: 'pass_4',
    title: 'Office Wi-Fi Network',
    userId: 'VaultGuard_5G',
    audioUrl: 'WiFi-Pass-789#Secure',
    siteUrl: '',
    status: 'Published',
    note: '5GHz Main Router WPA3 Key',
    labels: ['WORK'],
    views: 3,
    isPinned: false,
    dateString: dateStr,
    createdAt: now,
    updatedAt: now,
  },
];

export const initialPages: PageItem[] = [
  {
    id: 'page_1',
    title: 'Security Recovery Keys',
    content: 'Master Recovery Codes:\n1. 4829-1029-8831\n2. 9931-2041-5582\n3. 1102-7742-9011\nKeep these codes stored securely offline.',
    tabId: 'tab_1',
    views: 15,
    dateString: dateStr,
    createdAt: now,
    updatedAt: now,
  },
  {
    id: 'page_2',
    title: 'Firebase RTDB Connection Details',
    content: 'Project ID: passwordadminpro\nDB URL: https://passwordadminpro-default-rtdb.firebaseio.com\nNodes: activity_logs, labels, pageTabs, pages, password',
    tabId: 'tab_2',
    views: 9,
    dateString: dateStr,
    createdAt: now,
    updatedAt: now,
  },
];

export const initialLogs: ActivityLog[] = [
  {
    id: 'log_1',
    action: 'Realtime Sync',
    detail: 'Connected to Firebase Realtime Database (passwordadminpro)',
    dateString: dateStr,
    createdAt: now,
  },
  {
    id: 'log_2',
    action: 'Vault Initialized',
    detail: 'AES-256 Vault Manager initialized successfully.',
    dateString: dateStr,
    createdAt: now,
  },
];
