export interface DynamicNote {
  id?: string;
  name: string; // e.g. "Security Answer", "PIN"
  val: string;
}

export interface AttachmentFile {
  name: string;
  url: string;
  type?: string;
  size?: number;
}
export type Attachment = AttachmentFile;

export interface PasswordItem {
  id: string;
  title: string;
  posterUrl?: string; // Image thumbnail / icon URL
  siteUrl?: string; // Web URL
  userId?: string; // Username / Email / User ID
  audioUrl: string; // Used as the main Password string field
  status: 'Published' | 'Draft';
  dynamicNotes?: DynamicNote[]; // Array of custom key-value pairs
  note?: string; // Legacy note text
  labels: string[]; // Tag names array e.g. ["WORK", "PERSONAL"]
  views: number; // View counter
  isPinned: boolean; // Favorite / Pinned to top
  dateString: string; // Formatted date string
  createdAt: number; // Timestamp
  updatedAt?: number;
}

export interface PageItem {
  id: string;
  title: string;
  content: string; // Documentation / Rich text / Code
  isCodeMode?: boolean; // Toggle for monospace code view
  tabId: string; // Belongs to custom PageTab
  attachments?: AttachmentFile[];
  views: number;
  dateString: string;
  createdAt: number;
  updatedAt?: number;
  status?: 'Published' | 'Draft';
}

export interface PageTab {
  id: string;
  name: string; // Category tab name e.g. "NOTES", "SERVERS"
  createdAt: number;
}
export type PageTabItem = PageTab;

export interface LabelItem {
  id: string;
  name: string; // Tag name e.g. "SOCIAL", "BANKING"
  color?: string;
  createdAt?: number;
}

export interface ActivityLog {
  id: string;
  action: string;
  detail: string;
  dateString: string;
  createdAt: number;
  location?: string;
  ip?: string;
}

export interface PasskeyData {
  id: string;
  name: string;
  createdAt: number;
}

export interface DeclinedSite {
  id: string;
  name: string;
  domain: string;
  icon?: string;
  dateAdded?: number;
}

export type ViewTab =
  | 'accounts'
  | 'checkup'
  | 'settings'
  | 'password'
  | 'dashboard'
  | 'labels'
  | 'pages'
  | 'export-import'
  | 'history'
  | 'drafts';

export type ToastType = 'info' | 'success' | 'warning' | 'error';

export interface ToastMessage {
  id: string;
  type: ToastType;
  message: string;
}

export interface ImportProgressState {
  isImporting: boolean;
  progress: number;
  isComplete: boolean;
  total?: number;
  current?: number;
}
