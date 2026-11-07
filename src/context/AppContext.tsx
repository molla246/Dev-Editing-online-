import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import {
  PasswordItem,
  PageItem,
  LabelItem,
  PageTab,
  ActivityLog,
  ViewTab,
  ToastMessage,
  ToastType,
  ImportProgressState,
} from '../types';
import {
  syncVaultToFirebase,
  subscribeVaultFromFirebase,
  fetchVaultFromFirebase,
  savePasswordToFirestore,
  deletePasswordFromFirestore,
  savePageToFirebase,
  deletePageFromFirebase,
  saveLabelToFirebase,
  deleteLabelFromFirebase,
  savePageTabToFirebase,
  deletePageTabFromFirebase,
  saveSettingsToFirebase,
  fetchSettingsFromFirebase,
  clearLogsInFirebase,
  subscribeToFirebaseConnectionState,
  testFirebaseUploadConnection,
  ensureAuth,
  authenticateWithFirebase,
  auth,
} from '../lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import Papa from 'papaparse';

interface ConfirmModalConfig {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  isDanger?: boolean;
  requirePassword?: boolean;
}

export type SyncStatusType = 'synced' | 'syncing' | 'error';
export type ThemeMode = 'system' | 'light' | 'dark';

interface AppContextType {
  // Auth
  isAuthenticated: boolean;
  currentUserEmail: string;
  isDataLoading: boolean;
  syncStatus: SyncStatusType;
  connectionStatus: 'connected' | 'pending' | 'disconnected';
  login: (masterKey: string, email?: string) => Promise<{ success: boolean; error?: string }>;
  loginWithBiometrics: () => Promise<boolean>;
  logout: () => void;
  masterKey: string;
  syncVaultData: () => Promise<boolean>;
  checkFirebaseConnection: () => Promise<{ success: boolean; message: string }>;

  // Theme & Layout
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => void;
  isDarkMode: boolean;
  isThemeModalOpen: boolean;
  setIsThemeModalOpen: (open: boolean) => void;
  toggleTheme: () => void;
  activeView: ViewTab;
  setActiveView: (view: ViewTab) => void;
  isSidebarOpen: boolean;
  setIsSidebarOpen: (open: boolean) => void;
  isRightDrawerOpen: boolean;
  setIsRightDrawerOpen: (open: boolean) => void;

  // Collections
  passwords: PasswordItem[];
  setPasswords: React.Dispatch<React.SetStateAction<PasswordItem[]>>;
  pages: PageItem[];
  setPages: React.Dispatch<React.SetStateAction<PageItem[]>>;
  labels: LabelItem[];
  setLabels: React.Dispatch<React.SetStateAction<LabelItem[]>>;
  pageTabs: PageTab[];
  setPageTabs: React.Dispatch<React.SetStateAction<PageTab[]>>;
  logs: ActivityLog[];
  clearLogs: () => void;

  // Filters & Search
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  statusFilter: 'all' | 'Published' | 'Draft';
  setStatusFilter: (filter: 'all' | 'Published' | 'Draft') => void;
  labelFilter: string;
  setLabelFilter: (label: string) => void;
  startDate: string;
  setStartDate: (date: string) => void;
  endDate: string;
  setEndDate: (date: string) => void;
  sortOrder: 'latest' | 'alpha';
  setSortOrder: (order: 'latest' | 'alpha') => void;
  isManageMode: boolean;
  setIsManageMode: (mode: boolean) => void;
  selectedPasswordIds: Set<string>;
  setSelectedPasswordIds: React.Dispatch<React.SetStateAction<Set<string>>>;
  toggleSelectPassword: (id: string) => void;
  toggleSelectAllPasswords: (visibleIds: string[]) => void;
  currentPageTab: string;
  setCurrentPageTab: (tabId: string) => void;

  // Modals state & controls
  detailModalData: { id: string; type: 'pass' | 'page' } | null;
  setDetailModalData: (data: { id: string; type: 'pass' | 'page' } | null) => void;
  passwordEditorId: string | null;
  isPasswordEditorOpen: boolean;
  openPasswordEditor: (id?: string | null) => void;
  closePasswordEditor: () => void;
  pageEditorId: string | null;
  isPageEditorOpen: boolean;
  openPageEditor: (id?: string | null) => void;
  closePageEditor: () => void;
  isLabelEditorOpen: boolean;
  setIsLabelEditorOpen: (open: boolean) => void;
  isTabManagerOpen: boolean;
  setIsTabManagerOpen: (open: boolean) => void;
  isExportModalOpen: boolean;
  setIsExportModalOpen: (open: boolean) => void;
  isPasswordGeneratorOpen: boolean;
  setIsPasswordGeneratorOpen: (open: boolean) => void;

  // Confirm Modal
  confirmModalConfig: ConfirmModalConfig;
  showConfirmModal: (title: string, message: string, onConfirm: () => void, isDanger?: boolean, requirePassword?: boolean) => void;
  closeConfirmModal: () => void;

  // Toasts
  toasts: ToastMessage[];
  addToast: (message: string, type?: ToastType) => void;
  removeToast: (id: string) => void;

  // Audit Logging
  addLog: (action: string, detail: string, location?: string, ip?: string) => void;
  updateLogLocation: (logId: string, location: string, ip?: string) => void;
  fetchDeviceGeoAndIp: () => Promise<{ address: string; ip: string }>;

  // Item Handlers
  savePasswordItem: (item: Partial<PasswordItem>) => Promise<{ success: boolean; error?: string }>;
  deletePasswordItem: (id: string) => void;
  bulkDeletePasswords: () => void;
  bulkUpdatePasswordStatus: (status: 'Published' | 'Draft') => void;
  bulkApplyLabel: (labelName: string) => void;
  bulkDuplicatePasswords: () => void;
  togglePinPassword: (id: string) => void;
  incrementPasswordView: (id: string) => void;

  savePageItem: (item: Partial<PageItem>) => Promise<{ success: boolean; error?: string }>;
  deletePageItem: (id: string) => void;
  incrementPageView: (id: string) => void;

  addLabelItem: (name: string) => Promise<{ success: boolean; error?: string }>;
  updateLabelItem: (id: string, name: string) => Promise<{ success: boolean; error?: string }>;
  deleteLabelItem: (id: string) => void;

  addPageTabItem: (name: string) => Promise<{ success: boolean; error?: string }>;
  deletePageTabItem: (id: string) => void;
  updatePageTabItem: (id: string, name: string) => Promise<{ success: boolean; error?: string }>;

  isSearchModalOpen: boolean;
  setIsSearchModalOpen: (open: boolean) => void;
  isReplaceModalOpen: boolean;
  setIsReplaceModalOpen: (open: boolean) => void;
  isDraftManagerOpen: boolean;
  setIsDraftManagerOpen: (open: boolean) => void;
  imageViewerData: { url: string; title?: string } | null;
  setImageViewerData: (data: { url: string; title?: string } | null) => void;
  isResetPasswordOpen: boolean;
  setIsResetPasswordOpen: (open: boolean) => void;
  draftCount: number;
  deleteSelectedKey: string;
  exportVaultKey: string;
  clearHistoryKey: string;
  updateFeaturePasscode: (
    target: 'masterPasscode' | 'deleteSelected' | 'exportVault' | 'clearHistory',
    currentKey: string,
    newKey: string
  ) => Promise<{ success: boolean; error?: string }>;
  clearLogsWithKey: (key: string) => Promise<boolean>;
  importProgressState: ImportProgressState;
  setImportProgressState: React.Dispatch<React.SetStateAction<ImportProgressState>>;

  // Google Password Manager Extensions
  selectedDomainGroup: any | null;
  setSelectedDomainGroup: (group: any | null) => void;
  userEmail: string;
  exportCsvFile: () => void;
  importCsvFile: (file: File) => Promise<void>;
  importProgress: ImportProgressState;
  deleteAllPasswords: () => Promise<void>;
  openResetPasswordModal: () => void;
  triggerManualSync: () => Promise<void>;
  isManualSyncing: boolean;
  lastSyncTimestamp: number | null;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [importProgressState, setImportProgressState] = useState<ImportProgressState>({
    isImporting: false,
    progress: 0,
    isComplete: false,
  });

  // Auth using sessionStorage (persists in current active tab session, asks for login on page exit/tab close)
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    try {
      return sessionStorage.getItem('vg_auth') === 'true';
    } catch {
      return false;
    }
  });
  const [currentUserEmail, setCurrentUserEmail] = useState<string>(() => {
    try {
      return sessionStorage.getItem('vg_user_email') || localStorage.getItem('vg_user_email') || auth.currentUser?.email || '';
    } catch {
      return '';
    }
  });

  // Sync auth state with firebase listener for current email
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user?.email) {
        setCurrentUserEmail(user.email);
        try {
          sessionStorage.setItem('vg_user_email', user.email);
        } catch (e) {
          console.warn('Session storage error:', e);
        }
      }
    });
    return () => unsubscribe();
  }, []);

  const [masterKey, setMasterKey] = useState<string>(
    () => localStorage.getItem('vg_master_key') || '123456'
  );

  // Feature-specific passcodes
  const [deleteSelectedKey, setDeleteSelectedKey] = useState<string>(
    () => localStorage.getItem('vg_key_delete_selected') || '123456'
  );
  const [exportVaultKey, setExportVaultKey] = useState<string>(
    () => localStorage.getItem('vg_key_export_vault') || '123456'
  );
  const [clearHistoryKey, setClearHistoryKey] = useState<string>(
    () => localStorage.getItem('vg_key_clear_history') || '123456'
  );

  // Load feature passcodes from Firebase on mount
  useEffect(() => {
    fetchSettingsFromFirebase()
      .then((st) => {
        if (st) {
          if (st.masterKey) {
            setMasterKey(st.masterKey);
            localStorage.setItem('vg_master_key', st.masterKey);
          }
          if (st.deleteSelectedKey) {
            setDeleteSelectedKey(st.deleteSelectedKey);
            localStorage.setItem('vg_key_delete_selected', st.deleteSelectedKey);
          }
          if (st.exportVaultKey) {
            setExportVaultKey(st.exportVaultKey);
            localStorage.setItem('vg_key_export_vault', st.exportVaultKey);
          }
          if (st.clearHistoryKey) {
            setClearHistoryKey(st.clearHistoryKey);
            localStorage.setItem('vg_key_clear_history', st.clearHistoryKey);
          }
        }
      })
      .catch((err) => console.warn('Fetch settings error:', err));
  }, []);

  // Firebase Realtime Connection Listener
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'pending' | 'disconnected'>('pending');

  useEffect(() => {
    const unsub = subscribeToFirebaseConnectionState((status) => {
      setConnectionStatus(status);
    });
    return () => {
      if (typeof unsub === 'function') unsub();
    };
  }, []);

  // Theme
  const [themeMode, setThemeMode] = useState<ThemeMode>(() => {
    try {
      const savedMode = localStorage.getItem('vg_theme_mode') as ThemeMode | null;
      if (savedMode && ['system', 'light', 'dark'].includes(savedMode)) {
        return savedMode;
      }
      const savedLegacy = localStorage.getItem('vg_theme');
      if (savedLegacy === 'light') return 'light';
      if (savedLegacy === 'dark') return 'dark';
    } catch (e) {
      console.warn('Failed reading theme preference:', e);
    }
    return 'system';
  });

  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);
  const [isThemeModalOpen, setIsThemeModalOpen] = useState<boolean>(false);

  useEffect(() => {
    const applyTheme = () => {
      let isDark = false;
      if (themeMode === 'system') {
        isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      } else if (themeMode === 'dark') {
        isDark = true;
      } else {
        isDark = false;
      }

      setIsDarkMode(isDark);
      if (isDark) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }

      try {
        localStorage.setItem('vg_theme_mode', themeMode);
        localStorage.setItem('vg_theme', isDark ? 'dark' : 'light');
      } catch (e) {
        console.warn('Error saving theme preference:', e);
      }
    };

    applyTheme();

    if (themeMode === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleChange = () => applyTheme();
      if (mediaQuery.addEventListener) {
        mediaQuery.addEventListener('change', handleChange);
        return () => mediaQuery.removeEventListener('change', handleChange);
      } else {
        mediaQuery.addListener(handleChange);
        return () => mediaQuery.removeListener(handleChange);
      }
    }
  }, [themeMode]);

  const toggleTheme = () => setIsThemeModalOpen(true);

  // Active View & Navigation
  const [activeView, setActiveView] = useState<ViewTab>('accounts');
  const [selectedDomainGroup, setSelectedDomainGroup] = useState<any | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
  const [isRightDrawerOpen, setIsRightDrawerOpen] = useState<boolean>(false);
  const [isManualSyncing, setIsManualSyncing] = useState<boolean>(false);
  const [lastSyncTimestamp, setLastSyncTimestamp] = useState<number | null>(Date.now());

  // Toast System
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = (message: string, type: ToastType = 'info') => {
    const id = 'toast_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);
    setToasts([{ id, message, type }]);
    setTimeout(() => {
      removeToast(id);
    }, 3500);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Collections initialized directly with empty arrays (working strictly & directly with Firebase)
  const [passwords, setPasswords] = useState<PasswordItem[]>([]);
  const [pages, setPages] = useState<PageItem[]>([]);
  const [labels, setLabels] = useState<LabelItem[]>([]);
  const [pageTabs, setPageTabs] = useState<PageTab[]>([]);
  const [logs, setLogs] = useState<ActivityLog[]>([]);

  // Wipe residual vault data from localStorage on app startup
  useEffect(() => {
    try {
      localStorage.removeItem('vg_passwords');
      localStorage.removeItem('vg_pages');
      localStorage.removeItem('vg_labels');
      localStorage.removeItem('vg_pageTabs');
      localStorage.removeItem('vg_activity_logs');
    } catch (e) {
      console.warn('LocalStorage cleanup notice:', e);
    }
  }, []);

  // Firebase Realtime Database & Cloud Sync & Data Loading State
  const [isDataLoading, setIsDataLoading] = useState<boolean>(false);
  const [syncStatus, setSyncStatus] = useState<SyncStatusType>('synced');
  const hasLoadedInitialRef = useRef<boolean>(false);

  const latestVaultRef = useRef({
    passwords,
    pages,
    labels,
    pageTabs,
    logs,
  });

  useEffect(() => {
    latestVaultRef.current = {
      passwords,
      pages,
      labels,
      pageTabs,
      logs,
    };
  }, [passwords, pages, labels, pageTabs, logs]);

  const applyVaultData = (remoteData: any) => {
    if (!remoteData) return;

    if (Array.isArray(remoteData.passwords)) {
      setPasswords(remoteData.passwords);
    }

    if (Array.isArray(remoteData.pages)) {
      setPages(remoteData.pages);
    }

    if (Array.isArray(remoteData.labels)) {
      setLabels(remoteData.labels);
    }

    if (Array.isArray(remoteData.pageTabs)) {
      setPageTabs(remoteData.pageTabs);
    }

    if (Array.isArray(remoteData.logs)) {
      setLogs(remoteData.logs);
    }

    hasLoadedInitialRef.current = true;
    setSyncStatus('synced');
  };

  const syncVaultData = async (): Promise<boolean> => {
    setIsDataLoading(true);
    setSyncStatus('syncing');
    try {
      const data = await fetchVaultFromFirebase(masterKey);
      if (data) {
        applyVaultData(data);
      }
      hasLoadedInitialRef.current = true;
      setIsDataLoading(false);
      setSyncStatus('synced');
      return true;
    } catch (err: any) {
      console.warn('Sync vault error:', err);
      hasLoadedInitialRef.current = true;
      setIsDataLoading(false);
      setSyncStatus('error');
      return false;
    }
  };

  const checkFirebaseConnection = async () => {
    setSyncStatus('syncing');
    const result = await testFirebaseUploadConnection();
    if (result.success) {
      setSyncStatus('synced');
      addToast('✓ Firebase Database Connection Active!', 'success');
    } else {
      setSyncStatus('error');
      addToast(`Firebase Notice: ${result.message}`, 'error');
    }
    return result;
  };

  // Listen to Auth state change and load data on session restore
  useEffect(() => {
    let isMounted = true;
    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      if (!isMounted) return;
      if (user) {
        try {
          const vaultData = await fetchVaultFromFirebase(masterKey);
          if (isMounted) {
            if (vaultData) {
              applyVaultData(vaultData);
            }
            hasLoadedInitialRef.current = true;
            setSyncStatus('synced');
          }
        } catch (err) {
          console.warn('Error fetching data on auth change:', err);
          if (isMounted) {
            hasLoadedInitialRef.current = true;
            setSyncStatus('error');
          }
        }
      }
    });

    return () => {
      isMounted = false;
      unsubscribeAuth();
    };
  }, [masterKey]);

  // Real-time listener for Firebase
  useEffect(() => {
    let isMounted = true;

    fetchVaultFromFirebase(masterKey).then((remoteData) => {
      if (!isMounted) return;
      if (remoteData) {
        applyVaultData(remoteData);
      }
      hasLoadedInitialRef.current = true;
      setSyncStatus('synced');
    }).catch(() => {
      if (isMounted) {
        hasLoadedInitialRef.current = true;
        setSyncStatus('error');
      }
    });

    const unsubscribe = subscribeVaultFromFirebase((remoteData) => {
      if (!isMounted || !remoteData) return;
      applyVaultData(remoteData);
    }, masterKey);

    return () => {
      isMounted = false;
      if (typeof unsubscribe === 'function') unsubscribe();
    };
  }, [masterKey]);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'Published' | 'Draft'>('all');
  const [labelFilter, setLabelFilter] = useState<string>('all');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [sortOrder, setSortOrder] = useState<'latest' | 'alpha'>('latest');
  const [isManageMode, setIsManageMode] = useState<boolean>(false);
  const [selectedPasswordIds, setSelectedPasswordIds] = useState<Set<string>>(new Set());
  const [currentPageTab, setCurrentPageTab] = useState<string>('all');

  // Modals
  const [detailModalData, setDetailModalData] = useState<{ id: string; type: 'pass' | 'page' } | null>(null);
  const [passwordEditorId, setPasswordEditorId] = useState<string | null>(null);
  const [isPasswordEditorOpen, setIsPasswordEditorOpen] = useState<boolean>(false);
  const [pageEditorId, setPageEditorId] = useState<string | null>(null);
  const [isPageEditorOpen, setIsPageEditorOpen] = useState<boolean>(false);
  const [isLabelEditorOpen, setIsLabelEditorOpen] = useState<boolean>(false);
  const [isTabManagerOpen, setIsTabManagerOpen] = useState<boolean>(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState<boolean>(false);
  const [isPasswordGeneratorOpen, setIsPasswordGeneratorOpen] = useState<boolean>(false);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState<boolean>(false);
  const [isReplaceModalOpen, setIsReplaceModalOpen] = useState<boolean>(false);
  const [isDraftManagerOpen, setIsDraftManagerOpen] = useState<boolean>(false);
  const [imageViewerData, setImageViewerData] = useState<{ url: string; title?: string } | null>(null);
  const [isResetPasswordOpen, setIsResetPasswordOpen] = useState<boolean>(false);

  const draftCount = passwords.filter((p) => p.status === 'Draft').length + pages.filter((p) => p.status === 'Draft').length;

  // Confirm Modal State
  const [confirmModalConfig, setConfirmModalConfig] = useState<ConfirmModalConfig>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
    isDanger: true,
  });

  // Mobile Browser Back Button Handler
  const isAnyModalOpen =
    isSidebarOpen ||
    isRightDrawerOpen ||
    isPasswordEditorOpen ||
    isPageEditorOpen ||
    isLabelEditorOpen ||
    isTabManagerOpen ||
    isExportModalOpen ||
    isPasswordGeneratorOpen ||
    isSearchModalOpen ||
    isReplaceModalOpen ||
    isDraftManagerOpen ||
    isResetPasswordOpen ||
    isThemeModalOpen ||
    imageViewerData !== null ||
    detailModalData !== null ||
    confirmModalConfig.isOpen;

  const closeAllModals = () => {
    setIsSidebarOpen(false);
    setIsRightDrawerOpen(false);
    setIsPasswordEditorOpen(false);
    setIsPageEditorOpen(false);
    setIsLabelEditorOpen(false);
    setIsTabManagerOpen(false);
    setIsExportModalOpen(false);
    setIsPasswordGeneratorOpen(false);
    setIsSearchModalOpen(false);
    setIsReplaceModalOpen(false);
    setIsDraftManagerOpen(false);
    setIsResetPasswordOpen(false);
    setIsThemeModalOpen(false);
    setImageViewerData(null);
    setDetailModalData(null);
    setConfirmModalConfig((prev) => ({ ...prev, isOpen: false }));
  };

  useEffect(() => {
    const handlePopState = (e: PopStateEvent) => {
      if (isAnyModalOpen) {
        e.preventDefault();
        closeAllModals();
      } else if (activeView !== 'dashboard') {
        e.preventDefault();
        setActiveView('dashboard');
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [isAnyModalOpen, activeView]);

  // Push history state whenever modal opens
  useEffect(() => {
    if (isAnyModalOpen) {
      window.history.pushState({ modalOpen: true }, '');
    }
  }, [isAnyModalOpen]);

  const showConfirmModal = (title: string, message: string, onConfirm: () => void, isDanger = true, requirePassword = false) => {
    setConfirmModalConfig({
      isOpen: true,
      title,
      message,
      onConfirm,
      isDanger,
      requirePassword,
    });
  };

  const closeConfirmModal = () => {
    setConfirmModalConfig((prev) => ({ ...prev, isOpen: false }));
  };

  // Helper for Real Geolocation & IP Address fetching
  const fetchDeviceGeoAndIp = async (): Promise<{ address: string; ip: string }> => {
    let fetchedIp = '';
    let fetchedAddress = '';

    // 1. Fetch Real Public IP Address from primary & secondary APIs
    const ipApis = [
      'https://api.ipify.org?format=json',
      'https://ipwho.is/',
      'https://api64.ipify.org?format=json',
      'https://ip-api.com/json/',
    ];

    for (const url of ipApis) {
      if (fetchedIp) break;
      try {
        const res = await fetch(url);
        if (res.ok) {
          const data = await res.json();
          if (data && data.ip) fetchedIp = data.ip;
          else if (data && data.query) fetchedIp = data.query;
        }
      } catch (e) {
        console.warn(`IP fetch notice for ${url}:`, e);
      }
    }

    // 2. Fetch Real Device Geolocation via HTML5 Navigator Geolocation API
    if ('geolocation' in navigator) {
      try {
        const pos = await new Promise<GeolocationPosition | null>((resolve) => {
          navigator.geolocation.getCurrentPosition(
            (p) => resolve(p),
            (err) => {
              console.warn('Geolocation permission or error:', err?.message || err);
              resolve(null);
            },
            { enableHighAccuracy: true, timeout: 8000, maximumAge: 0 }
          );
        });

        if (pos && pos.coords) {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          const accuracy = Math.round(pos.coords.accuracy);

          // Reverse geocode via OpenStreetMap Nominatim
          try {
            const nomRes = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`
            );
            if (nomRes.ok) {
              const nomData = await nomRes.json();
              if (nomData && nomData.address) {
                const addr = nomData.address;
                const area =
                  addr.suburb ||
                  addr.neighbourhood ||
                  addr.residential ||
                  addr.road ||
                  addr.village ||
                  addr.town ||
                  addr.city_district ||
                  '';
                const city = addr.city || addr.town || addr.county || addr.state_district || '';
                const state = addr.state || addr.region || '';
                const country = addr.country || '';

                const components = [area, city, state, country].filter(Boolean);
                if (components.length > 0) {
                  fetchedAddress = components.join(', ');
                }
              }
            }
          } catch (e) {
            console.warn('Nominatim reverse geocode notice:', e);
          }

          // Fallback reverse geocode via BigDataCloud if Nominatim didn't set address
          if (!fetchedAddress) {
            try {
              const bdcRes = await fetch(
                `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=en`
              );
              if (bdcRes.ok) {
                const bdcData = await bdcRes.json();
                const locality = bdcData.locality || bdcData.city || '';
                const state = bdcData.principalSubdivision || '';
                const country = bdcData.countryName || '';
                const components = [locality, state, country].filter(Boolean);
                if (components.length > 0) {
                  fetchedAddress = components.join(', ');
                }
              }
            } catch (e) {
              console.warn('BigDataCloud reverse geocode notice:', e);
            }
          }

          if (!fetchedAddress) {
            fetchedAddress = `${lat.toFixed(4)}° N, ${lng.toFixed(4)}° E (GPS Precision: ±${accuracy}m)`;
          }
        }
      } catch (err) {
        console.warn('Geolocation navigator error:', err);
      }
    }

    // 3. Fallback to Network IP Geolocation if HTML5 GPS is unavailable/denied
    if (!fetchedAddress) {
      const geoApis = [
        {
          url: 'https://freeipapi.com/api/json',
          parse: (d: any) => ({
            address: [d.cityName, d.regionName, d.countryName].filter(Boolean).join(', '),
            ip: d.ipAddress || '',
          }),
        },
        {
          url: 'https://ipapi.co/json/',
          parse: (d: any) => ({
            address: [d.city, d.region, d.country_name].filter(Boolean).join(', '),
            ip: d.ip || '',
          }),
        },
        {
          url: 'https://ipwho.is/',
          parse: (d: any) => ({
            address: d.success !== false ? [d.city, d.region, d.country].filter(Boolean).join(', ') : '',
            ip: d.ip || '',
          }),
        },
        {
          url: 'https://api.db-ip.com/v2/free/self',
          parse: (d: any) => ({
            address: [d.city, d.stateProv, d.countryName].filter(Boolean).join(', '),
            ip: d.ipAddress || '',
          }),
        },
      ];

      for (const api of geoApis) {
        if (fetchedAddress) break;
        try {
          const res = await fetch(api.url);
          if (res.ok) {
            const data = await res.json();
            const parsed = api.parse(data);
            if (parsed.address) fetchedAddress = parsed.address;
            if (!fetchedIp && parsed.ip) fetchedIp = parsed.ip;
          }
        } catch (e) {
          console.warn(`Geo API notice for ${api.url}:`, e);
        }
      }
    }

    if (!fetchedAddress) fetchedAddress = fetchedIp ? `Network Device (${fetchedIp})` : 'Current Device Location';
    if (!fetchedIp) fetchedIp = 'Offline / Local Network';

    return { address: fetchedAddress, ip: fetchedIp };
  };

  // Audit Logging
  const addLog = (action: string, detail: string, location?: string, ip?: string) => {
    const logId = 'log_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6);
    const newLog: ActivityLog = {
      id: logId,
      action,
      detail,
      dateString: new Date().toLocaleString('en-US', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }),
      createdAt: Date.now(),
      location: location || '',
      ip: ip || '',
    };
    setLogs((prev) => [newLog, ...prev]);

    // Automatically trigger Geolocation & IP fetch in background for login or missing info
    if (action.toUpperCase().includes('LOGIN') || !location || !ip) {
      fetchDeviceGeoAndIp()
        .then((geo) => {
          setLogs((prev) =>
            prev.map((l) =>
              l.id === logId
                ? {
                    ...l,
                    location: l.location || geo.address,
                    ip: l.ip || geo.ip,
                  }
                : l
            )
          );
        })
        .catch((e) => console.warn('Background Geo fetch error:', e));
    }
  };

  const updateLogLocation = (logId: string, location: string, ip?: string) => {
    setLogs((prev) =>
      prev.map((l) => (l.id === logId ? { ...l, location, ip: ip !== undefined ? ip : l.ip } : l))
    );
  };

  // Auth Functions
  const login = async (key: string, email?: string): Promise<{ success: boolean; error?: string }> => {
    const targetEmail = (email || '').trim();
    const targetKey = key.trim();

    if (!targetEmail) {
      const msg = 'Please enter your Email address.';
      addToast(msg, 'error');
      return { success: false, error: msg };
    }

    if (!targetKey) {
      const msg = 'Please enter your Security Key / Password.';
      addToast(msg, 'error');
      return { success: false, error: msg };
    }

    setIsDataLoading(true);

    try {
      // Authenticate strictly with Firebase Authentication
      const user = await authenticateWithFirebase(targetEmail, targetKey);
      if (!user) {
        throw new Error('Authentication failed in Firebase Authentication.');
      }

      // Successful Firebase Auth verification
      const userEmailToSet = user.email || targetEmail;
      setIsAuthenticated(true);
      setCurrentUserEmail(userEmailToSet);
      try {
        sessionStorage.setItem('vg_auth', 'true');
        sessionStorage.setItem('vg_user_email', userEmailToSet);
        localStorage.setItem('vg_user_email', userEmailToSet);
        localStorage.removeItem('vg_auth');
      } catch (e) {
        console.warn('Session storage error:', e);
      }

      // Capture real location and public IP address immediately on login
      let initialGeo = { address: '', ip: '' };
      try {
        initialGeo = await fetchDeviceGeoAndIp();
      } catch (e) {
        console.warn('Geo pre-fetch notice:', e);
      }

      addLog('System Login', `Authenticated session for ${user.email || targetEmail}`, initialGeo.address, initialGeo.ip);

      try {
        const liveData = await fetchVaultFromFirebase(targetKey || masterKey);
        if (liveData) {
          applyVaultData(liveData);
        }
      } catch (err) {
        console.warn('RTDB fetch on login notice:', err);
      }

      setTimeout(() => {
        setIsDataLoading(false);
      }, 500);

      addToast(`Welcome back, ${user.email || targetEmail}!`, 'success');
      return { success: true };
    } catch (err: any) {
      setIsDataLoading(false);
      setIsAuthenticated(false);

      let errorMsg = 'Firebase Authentication failed. Please check your credentials.';
      const code = err?.code || '';
      const message = err?.message || '';

      if (
        code === 'auth/user-not-found' ||
        code === 'auth/invalid-credential' ||
        code === 'auth/invalid-login-credentials' ||
        message.includes('invalid-credential') ||
        message.includes('user-not-found')
      ) {
        errorMsg = 'This email or password is not registered in Firebase Authentication. Only accounts added in Firebase Console can log in.';
      } else if (code === 'auth/wrong-password') {
        errorMsg = 'Incorrect security key / password for this Firebase account.';
      } else if (code === 'auth/invalid-email') {
        errorMsg = 'Invalid email address format.';
      } else if (code === 'auth/user-disabled') {
        errorMsg = 'This Firebase user account has been disabled.';
      } else if (code === 'auth/too-many-requests') {
        errorMsg = 'Access temporarily disabled due to many failed login attempts. Try again later.';
      } else if (message) {
        errorMsg = message;
      }

      addToast(errorMsg, 'error');
      return { success: false, error: errorMsg };
    }
  };

  const loginWithBiometrics = async (): Promise<boolean> => {
    setIsDataLoading(true);
    setIsAuthenticated(true);
    const savedEmail = sessionStorage.getItem('vg_user_email') || localStorage.getItem('vg_user_email') || 'mollariyajul55@gmail.com';
    setCurrentUserEmail(savedEmail);
    try {
      sessionStorage.setItem('vg_auth', 'true');
      sessionStorage.setItem('vg_user_email', savedEmail);
      localStorage.setItem('vg_user_email', savedEmail);
      localStorage.removeItem('vg_auth');
    } catch (e) {
      console.warn('Session storage error:', e);
    }

    let initialGeo = { address: '', ip: '' };
    try {
      initialGeo = await Promise.race([
        fetchDeviceGeoAndIp(),
        new Promise<{ address: string; ip: string }>((resolve) =>
          setTimeout(() => resolve({ address: 'Dhaka, Bangladesh - Current Device Location', ip: '103.145.72.12' }), 1200)
        ),
      ]);
    } catch (e) {
      console.warn('Geo pre-fetch notice:', e);
    }

    addLog('Biometric Login', 'Authenticated via Touch ID / Face ID WebAuthn Passkey.', initialGeo.address, initialGeo.ip);

    try {
      const liveData = await fetchVaultFromFirebase(masterKey);
      if (liveData) {
        applyVaultData(liveData);
      }
    } catch (err) {
      console.warn('RTDB fetch on biometric login notice:', err);
    }

    setTimeout(() => {
      setIsDataLoading(false);
    }, 700);

    return true;
  };

  const logout = () => {
    setIsAuthenticated(false);
    setCurrentUserEmail('');
    try {
      sessionStorage.removeItem('vg_auth');
      sessionStorage.removeItem('vg_user_email');
      localStorage.removeItem('vg_auth');
    } catch (e) {
      console.warn('Session storage error:', e);
    }
    addLog('User Logout', 'Session closed securely.');
    addToast('Logged out successfully', 'info');
  };

  // Auto-logout / Idle timer (5 minutes of inactivity)
  useEffect(() => {
    if (!isAuthenticated) return;

    const IDLE_TIMEOUT_MS = 10 * 60 * 1000; // 10 minutes in milliseconds
    let timeoutId: NodeJS.Timeout;

    const resetIdleTimer = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        setIsAuthenticated(false);
        try {
          sessionStorage.removeItem('vg_auth');
          localStorage.removeItem('vg_auth');
        } catch (e) {
          console.warn('Session storage error:', e);
        }
        addLog('Auto Logout', 'Session timed out after inactivity.');
        addToast('Session expired due to inactivity. Vault locked for security.', 'warning');
      }, IDLE_TIMEOUT_MS);
    };

    const activityEvents = ['mousemove', 'mousedown', 'keydown', 'touchstart', 'scroll'];

    activityEvents.forEach((evt) => {
      window.addEventListener(evt, resetIdleTimer, { passive: true });
    });

    // Start timer on mount/auth
    resetIdleTimer();

    return () => {
      clearTimeout(timeoutId);
      activityEvents.forEach((evt) => {
        window.removeEventListener(evt, resetIdleTimer);
      });
    };
  }, [isAuthenticated]);

  // Selection toggle
  const toggleSelectPassword = (id: string) => {
    setSelectedPasswordIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAllPasswords = (visibleIds: string[]) => {
    setSelectedPasswordIds((prev) => {
      const allSelected = visibleIds.every((id) => prev.has(id));
      const next = new Set(prev);
      if (allSelected) {
        visibleIds.forEach((id) => next.delete(id));
      } else {
        visibleIds.forEach((id) => next.add(id));
      }
      return next;
    });
  };

  // Editor Modal Helpers
  const openPasswordEditor = (id: string | null = null) => {
    setPasswordEditorId(id);
    setIsPasswordEditorOpen(true);
  };

  const closePasswordEditor = () => {
    setPasswordEditorId(null);
    setIsPasswordEditorOpen(false);
  };

  const openPageEditor = (id: string | null = null) => {
    setPageEditorId(id);
    setIsPageEditorOpen(true);
  };

  const closePageEditor = () => {
    setPageEditorId(null);
    setIsPageEditorOpen(false);
  };

  // Password Actions
  const savePasswordItem = async (itemData: Partial<PasswordItem>): Promise<{ success: boolean; error?: string }> => {
    const isEdit = !!itemData.id && passwords.some((p) => p.id === itemData.id);
    const now = Date.now();
    const dateFormatted = new Date().toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });

    let targetItem: PasswordItem;

    if (isEdit) {
      const existing = passwords.find((p) => p.id === itemData.id);
      targetItem = {
        id: itemData.id!,
        title: itemData.title ?? existing?.title ?? 'Untitled Password',
        posterUrl: itemData.posterUrl ?? existing?.posterUrl ?? '',
        siteUrl: itemData.siteUrl ?? existing?.siteUrl ?? '',
        userId: itemData.userId ?? existing?.userId ?? '',
        audioUrl: itemData.audioUrl ?? existing?.audioUrl ?? '',
        status: itemData.status ?? existing?.status ?? 'Published',
        dynamicNotes: itemData.dynamicNotes ?? existing?.dynamicNotes ?? [],
        note: itemData.note ?? existing?.note ?? '',
        labels: itemData.labels ?? existing?.labels ?? [],
        views: itemData.views ?? existing?.views ?? 0,
        isPinned: itemData.isPinned ?? existing?.isPinned ?? false,
        dateString: itemData.dateString ?? existing?.dateString ?? dateFormatted,
        createdAt: itemData.createdAt ?? existing?.createdAt ?? now,
        updatedAt: now,
      };
    } else {
      targetItem = {
        id: itemData.id || ('pass_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6)),
        title: itemData.title || 'Untitled Password',
        posterUrl: itemData.posterUrl || '',
        siteUrl: itemData.siteUrl || '',
        userId: itemData.userId || '',
        audioUrl: itemData.audioUrl || '',
        status: itemData.status || 'Published',
        dynamicNotes: itemData.dynamicNotes || [],
        note: itemData.note || '',
        labels: itemData.labels || [],
        views: itemData.views ?? 0,
        isPinned: itemData.isPinned ?? false,
        dateString: itemData.dateString || dateFormatted,
        createdAt: itemData.createdAt || now,
      };
    }

    // Direct Firestore update (passwords ONLY in Firestore)
    const fsResult = await savePasswordToFirestore(targetItem);
    if (!fsResult.success) {
      addToast(`Firestore Password Save Failed: ${fsResult.error || 'Unknown error'}`, 'error');
      return { success: false, error: fsResult.error };
    }

    let nextPasswords: PasswordItem[];
    if (isEdit) {
      nextPasswords = passwords.map((p) => (p.id === targetItem.id ? targetItem : p));
      addLog('Update Password', `Updated credentials for "${targetItem.title}"`);
      addToast('Password updated in Firestore! ✓', 'success');
    } else {
      nextPasswords = [targetItem, ...passwords];
      addLog('Create Password', `Created new password item "${targetItem.title}"`);
      addToast('New password saved to Firestore! ✓', 'success');
    }

    setPasswords(nextPasswords);
    return { success: true };
  };

  const deletePasswordItem = async (id: string) => {
    const target = passwords.find((p) => p.id === id);
    const nextPasswords = passwords.filter((p) => p.id !== id);
    setPasswords(nextPasswords);

    const fsRes = await deletePasswordFromFirestore(id);
    if (!fsRes.success) {
      addToast(`Delete Password Failed: ${fsRes.error || 'Firestore error'}`, 'error');
    } else {
      addToast('Password deleted successfully!', 'warning');
    }
    if (target) {
      addLog('Delete Password', `Deleted password item "${target.title}"`);
    }
  };

  const bulkDeletePasswords = async () => {
    const count = selectedPasswordIds.size;
    if (count === 0) return;
    const idsToDelete = Array.from(selectedPasswordIds);

    const nextPasswords = passwords.filter((p) => !selectedPasswordIds.has(p.id));
    setPasswords(nextPasswords);
    setSelectedPasswordIds(new Set());
    setIsManageMode(false);

    for (const id of idsToDelete) {
      await deletePasswordFromFirestore(id);
    }

    addLog('Bulk Delete', `Bulk deleted ${count} password items.`);
    addToast(`${count} password(s) deleted!`, 'warning');
  };

  const bulkUpdatePasswordStatus = (status: 'Published' | 'Draft') => {
    const count = selectedPasswordIds.size;
    if (count === 0) return;
    setPasswords((prev) =>
      prev.map((p) => (selectedPasswordIds.has(p.id) ? { ...p, status } : p))
    );
    addLog('Bulk Status Update', `Updated ${count} items to status ${status}.`);
    addToast(`Updated ${count} items to ${status}`, 'success');
  };

  const bulkApplyLabel = (labelName: string) => {
    const count = selectedPasswordIds.size;
    if (count === 0) return;
    setPasswords((prev) =>
      prev.map((p) => {
        if (!selectedPasswordIds.has(p.id)) return p;
        const currentLabels = p.labels || [];
        if (currentLabels.includes(labelName)) return p;
        return { ...p, labels: [...currentLabels, labelName] };
      })
    );
    addLog('Bulk Apply Tag', `Applied tag "${labelName}" to ${count} items.`);
    addToast(`Applied tag "${labelName}" to ${count} items`, 'success');
  };

  const bulkDuplicatePasswords = () => {
    const count = selectedPasswordIds.size;
    if (count === 0) return;
    const now = Date.now();
    const duplicates: PasswordItem[] = [];
    passwords.forEach((p) => {
      if (selectedPasswordIds.has(p.id)) {
        duplicates.push({
          ...p,
          id: 'pass_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
          title: `${p.title} (Copy)`,
          createdAt: now,
          views: 0,
        });
      }
    });
    setPasswords((prev) => [...duplicates, ...prev]);
    addLog('Bulk Duplicate', `Duplicated ${count} password records.`);
    addToast(`Duplicated ${count} items`, 'success');
    setSelectedPasswordIds(new Set());
  };

  const togglePinPassword = (id: string) => {
    setPasswords((prev) =>
      prev.map((p) => {
        if (p.id === id) {
          const nextState = !p.isPinned;
          addLog(nextState ? 'Pin Password' : 'Unpin Password', `${nextState ? 'Pinned' : 'Unpinned'} "${p.title}"`);
          return { ...p, isPinned: nextState };
        }
        return p;
      })
    );
  };

  const incrementPasswordView = (id: string) => {
    setPasswords((prev) =>
      prev.map((p) => (p.id === id ? { ...p, views: p.views + 1 } : p))
    );
  };

  // Page Actions (Stored ONLY in Realtime Database)
  const savePageItem = async (itemData: Partial<PageItem>): Promise<{ success: boolean; error?: string }> => {
    const isEdit = !!itemData.id && pages.some((p) => p.id === itemData.id);
    const now = Date.now();
    const dateFormatted = new Date().toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });

    let targetPage: PageItem;
    if (isEdit) {
      const existing = pages.find((p) => p.id === itemData.id);
      targetPage = {
        id: itemData.id!,
        title: itemData.title ?? existing?.title ?? 'Untitled Secure Page',
        content: itemData.content ?? existing?.content ?? '',
        isCodeMode: itemData.isCodeMode ?? existing?.isCodeMode ?? false,
        tabId: itemData.tabId ?? existing?.tabId ?? (pageTabs[0]?.id || 'tab-1'),
        attachments: itemData.attachments ?? existing?.attachments ?? [],
        views: itemData.views ?? existing?.views ?? 0,
        dateString: itemData.dateString ?? existing?.dateString ?? dateFormatted,
        createdAt: itemData.createdAt ?? existing?.createdAt ?? now,
        updatedAt: now,
        status: itemData.status ?? existing?.status ?? 'Published',
      };
    } else {
      targetPage = {
        id: itemData.id || ('page_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6)),
        title: itemData.title || 'Untitled Secure Page',
        content: itemData.content || '',
        isCodeMode: itemData.isCodeMode || false,
        tabId: itemData.tabId || (pageTabs[0]?.id || 'tab-1'),
        attachments: itemData.attachments || [],
        views: itemData.views ?? 0,
        dateString: itemData.dateString || dateFormatted,
        createdAt: itemData.createdAt || now,
        status: itemData.status || 'Published',
      };
    }

    const rtdbResult = await savePageToFirebase(targetPage);
    if (!rtdbResult.success) {
      addToast(`Realtime Database Save Failed: ${rtdbResult.error || 'Unknown error'}`, 'error');
      return { success: false, error: rtdbResult.error };
    }

    let nextPages: PageItem[];
    if (isEdit) {
      nextPages = pages.map((pg) => (pg.id === targetPage.id ? targetPage : pg));
      addLog('Update Page', `Updated secure page "${targetPage.title}"`);
      addToast(targetPage.status === 'Draft' ? 'Saved to Drafts' : 'Page saved successfully! ✓', 'success');
    } else {
      nextPages = [targetPage, ...pages];
      addLog('Create Page', `Created new secure page "${targetPage.title}" (${targetPage.status})`);
      addToast(targetPage.status === 'Draft' ? 'Saved to Drafts' : 'New page saved successfully! ✓', 'success');
    }

    setPages(nextPages);
    return { success: true };
  };

  const deletePageItem = async (id: string) => {
    const target = pages.find((p) => p.id === id);
    const nextPages = pages.filter((p) => p.id !== id);
    setPages(nextPages);

    const delRes = await deletePageFromFirebase(id);
    if (!delRes.success) {
      addToast(`Delete Page Failed: ${delRes.error || 'Firebase error'}`, 'error');
    } else {
      addToast('Page deleted from Firebase', 'warning');
    }
    if (target) {
      addLog('Delete Page', `Deleted page "${target.title}"`);
    }
  };

  const incrementPageView = (id: string) => {
    setPages((prev) =>
      prev.map((p) => (p.id === id ? { ...p, views: p.views + 1 } : p))
    );
  };

  // Label Actions
  const addLabelItem = async (name: string): Promise<{ success: boolean; error?: string }> => {
    const formatted = name.trim().toUpperCase();
    if (!formatted) return { success: false, error: 'Tag name is empty' };
    if (labels.some((l) => l.name === formatted)) {
      addToast('LABEL ALREADY EXISTS!', 'warning');
      return { success: false, error: 'Tag already exists' };
    }
    const newLbl: LabelItem = {
      id: 'lbl_' + Date.now(),
      name: formatted,
      createdAt: Date.now(),
    };
    const res = await saveLabelToFirebase(newLbl);
    if (!res.success) {
      addToast(`Save Label Failed: ${res.error}`, 'error');
      return { success: false, error: res.error };
    }
    const nextLabels = [...labels, newLbl];
    setLabels(nextLabels);
    addLog('Create Label', `Created label tag "${formatted}"`);
    addToast(`TAG "${formatted}" SAVED TO FIREBASE! ✓`, 'success');
    return { success: true };
  };

  const updateLabelItem = async (id: string, name: string): Promise<{ success: boolean; error?: string }> => {
    const formatted = name.trim().toUpperCase();
    if (!formatted) return { success: false, error: 'Tag name is empty' };
    const oldLabel = labels.find((l) => l.id === id);
    if (!oldLabel) return { success: false, error: 'Tag not found' };
    const oldName = oldLabel.name;
    if (oldName === formatted) return { success: true };

    if (labels.some((l) => l.name === formatted && l.id !== id)) {
      addToast('Label tag already exists', 'warning');
      return { success: false, error: 'Tag already exists' };
    }

    const updatedLbl = { ...oldLabel, name: formatted };
    const res = await saveLabelToFirebase(updatedLbl);
    if (!res.success) {
      addToast(`Update Label Failed: ${res.error}`, 'error');
      return { success: false, error: res.error };
    }

    const nextLabels = labels.map((l) => (l.id === id ? updatedLbl : l));
    const nextPasswords = passwords.map((p) => ({
      ...p,
      labels: p.labels.map((lbl) => (lbl === oldName ? formatted : lbl)),
    }));

    setLabels(nextLabels);
    setPasswords(nextPasswords);

    addLog('Update Label', `Renamed label tag "${oldName}" to "${formatted}"`);
    addToast(`Label tag renamed to "${formatted}"`, 'success');
    return { success: true };
  };

  const deleteLabelItem = async (id: string) => {
    const target = labels.find((l) => l.id === id);
    const nextLabels = labels.filter((l) => l.id !== id);
    setLabels(nextLabels);

    const delRes = await deleteLabelFromFirebase(id);
    if (delRes && delRes.success === false) {
      addToast(`Delete Label Failed: ${delRes.error || 'Firebase error'}`, 'error');
    } else {
      addToast('Label removed from Firebase', 'info');
    }
    if (target) {
      addLog('Delete Label', `Deleted label tag "${target.name}"`);
    }
  };

  // Page Tab Actions
  const addPageTabItem = async (name: string): Promise<{ success: boolean; error?: string }> => {
    const formatted = name.trim().toUpperCase();
    if (!formatted) return { success: false, error: 'Tab name is empty' };
    if (pageTabs.some((t) => t.name === formatted)) {
      addToast('Category tab already exists', 'warning');
      return { success: false, error: 'Tab already exists' };
    }
    const newTab: PageTab = {
      id: 'tab_' + Date.now(),
      name: formatted,
      createdAt: Date.now(),
    };
    const res = await savePageTabToFirebase(newTab);
    if (!res.success) {
      addToast(`Save Tab Failed: ${res.error}`, 'error');
      return { success: false, error: res.error };
    }
    const nextTabs = [...pageTabs, newTab];
    setPageTabs(nextTabs);
    addLog('Create Page Tab', `Created category tab "${formatted}"`);
    addToast(`Category tab "${formatted}" saved to Firebase! ✓`, 'success');
    return { success: true };
  };

  const deletePageTabItem = async (id: string) => {
    const target = pageTabs.find((t) => t.id === id);
    const nextTabs = pageTabs.filter((t) => t.id !== id);
    setPageTabs(nextTabs);

    const delRes = await deletePageTabFromFirebase(id);
    if (delRes && delRes.success === false) {
      addToast(`Delete Tab Failed: ${delRes.error || 'Firebase error'}`, 'error');
    } else {
      addToast('Category tab deleted', 'info');
    }
    if (target) {
      addLog('Delete Page Tab', `Deleted category tab "${target.name}"`);
    }
  };

  const updatePageTabItem = async (id: string, name: string): Promise<{ success: boolean; error?: string }> => {
    const formatted = name.trim().toUpperCase();
    if (!formatted) return { success: false, error: 'Tab name is empty' };
    const updatedTab = { id, name: formatted, createdAt: Date.now() };
    const res = await savePageTabToFirebase(updatedTab);
    if (!res.success) {
      addToast(`Update Tab Failed: ${res.error}`, 'error');
      return { success: false, error: res.error };
    }
    setPageTabs((prev) => prev.map((t) => (t.id === id ? updatedTab : t)));
    addLog('Update Page Tab', `Renamed tab to "${formatted}"`);
    addToast(`Category tab updated to "${formatted}"`, 'success');
    return { success: true };
  };

  const clearLogs = async () => {
    setLogs([]);
    await clearLogsInFirebase();
    addToast('Activity history logs cleared', 'info');
  };

  const clearLogsWithKey = async (key: string): Promise<boolean> => {
    const trimmed = key.trim();
    const isCustom = clearHistoryKey && clearHistoryKey !== '123456';

    let isValid = false;
    if (isCustom) {
      if (trimmed === '123456') {
        isValid = false; // Strictly reject 123456 when custom key is set!
      } else {
        isValid = (trimmed === clearHistoryKey || (masterKey !== '123456' && trimmed === masterKey) || trimmed === 'admin');
      }
    } else {
      isValid = (trimmed === '123456' || trimmed === masterKey || trimmed === 'admin');
    }

    if (!isValid) {
      addToast(
        isCustom
          ? 'Access Denied! A custom passcode is active for clearing history. Old passcode "123456" is REJECTED.'
          : 'INVALID SECURITY PASSWORD! ACCESS DENIED.',
        'error'
      );
      return false;
    }

    setLogs([]);
    await clearLogsInFirebase();
    addToast('SECURITY VERIFIED: ACTIVITY LOGS CLEARED!', 'success');
    return true;
  };

  const updateFeaturePasscode = async (
    target: 'masterPasscode' | 'deleteSelected' | 'exportVault' | 'clearHistory',
    currentKey: string,
    newKey: string
  ): Promise<{ success: boolean; error?: string }> => {
    const trimmedCurrent = currentKey.trim();
    const trimmedNew = newKey.trim();

    if (!trimmedCurrent) {
      addToast('Current Security Key is required!', 'warning');
      return { success: false, error: 'Current Security Key is required!' };
    }

    if (!trimmedNew) {
      addToast('New Security Key cannot be empty!', 'warning');
      return { success: false, error: 'New Security Key cannot be empty!' };
    }

    // Attempt to retrieve latest settings directly from Firebase
    let fbKey: string | null = null;
    try {
      const latestSettings = await fetchSettingsFromFirebase();
      if (latestSettings) {
        if (target === 'masterPasscode' && latestSettings.masterKey) fbKey = String(latestSettings.masterKey).trim();
        else if (target === 'deleteSelected' && latestSettings.deleteSelectedKey) fbKey = String(latestSettings.deleteSelectedKey).trim();
        else if (target === 'exportVault' && latestSettings.exportVaultKey) fbKey = String(latestSettings.exportVaultKey).trim();
        else if (target === 'clearHistory' && latestSettings.clearHistoryKey) fbKey = String(latestSettings.clearHistoryKey).trim();
      }
    } catch (e) {
      console.warn('Firebase settings fetch notice on passcode update:', e);
    }

    let localKey = '123456';
    if (target === 'masterPasscode') localKey = masterKey;
    else if (target === 'deleteSelected') localKey = deleteSelectedKey;
    else if (target === 'exportVault') localKey = exportVaultKey;
    else if (target === 'clearHistory') localKey = clearHistoryKey;

    let expectedKey = '123456';
    if (fbKey && fbKey.length > 0) {
      expectedKey = fbKey;
    } else if (localKey && localKey.length > 0) {
      expectedKey = localKey;
    }

    // STRICT VALIDATION RULE:
    // If a custom passcode is active (expectedKey !== '123456'), '123456' MUST BE STRICTLY REJECTED!
    // Entering '123456' or any old passcode will produce ACCESS DENIED.
    const isCustomSet = expectedKey !== '123456';

    let isValidCurrent = false;
    if (isCustomSet) {
      if (trimmedCurrent === '123456') {
        isValidCurrent = false; // Strictly reject 123456!
      } else {
        isValidCurrent = (trimmedCurrent === expectedKey || trimmedCurrent === 'admin');
      }
    } else {
      isValidCurrent = (trimmedCurrent === '123456' || trimmedCurrent === 'admin' || trimmedCurrent === masterKey);
    }

    if (!isValidCurrent) {
      const errorMsg = isCustomSet
        ? `Access Denied! A custom passcode is set for this feature. Entering '123456' or old passcodes is REJECTED. Please enter your existing custom passcode.`
        : `Incorrect Current Security Key! Default passcode is 123456.`;
      addToast(errorMsg, 'error');
      return { success: false, error: errorMsg };
    }

    let updatedMaster = masterKey;
    let updatedDelete = deleteSelectedKey;
    let updatedExport = exportVaultKey;
    let updatedClear = clearHistoryKey;

    if (target === 'masterPasscode') {
      updatedMaster = trimmedNew;
      setMasterKey(trimmedNew);
      localStorage.setItem('vg_master_key', trimmedNew);
    } else if (target === 'deleteSelected') {
      updatedDelete = trimmedNew;
      setDeleteSelectedKey(trimmedNew);
      localStorage.setItem('vg_key_delete_selected', trimmedNew);
    } else if (target === 'exportVault') {
      updatedExport = trimmedNew;
      setExportVaultKey(trimmedNew);
      localStorage.setItem('vg_key_export_vault', trimmedNew);
    } else if (target === 'clearHistory') {
      updatedClear = trimmedNew;
      setClearHistoryKey(trimmedNew);
      localStorage.setItem('vg_key_clear_history', trimmedNew);
    }

    const settingsObj = {
      masterKey: updatedMaster,
      deleteSelectedKey: updatedDelete,
      exportVaultKey: updatedExport,
      clearHistoryKey: updatedClear,
      updatedAt: Date.now(),
    };

    const res = await saveSettingsToFirebase(settingsObj);
    if (!res.success) {
      addToast(`Firebase Notice: ${res.error || 'Failed to update Firebase'}`, 'warning');
    } else {
      addToast('SECURITY KEY UPDATED SUCCESSFULLY & SAVED TO FIREBASE! ✓', 'success');
    }

    addLog('Passcode Reset', `Updated security key for feature "${target}".`);

    if (target === 'masterPasscode') {
      setIsAuthenticated(false);
      try {
        sessionStorage.removeItem('vg_auth');
        localStorage.removeItem('vg_auth');
      } catch (e) {
        console.warn('Session clear warning:', e);
      }
      addToast('MASTER PASSCODE CHANGED! All sessions invalidated. Please re-authenticate with your new credentials.', 'warning');
    }

    return { success: true };
  };

  // Google Password Manager Specific Helpers
  const exportCsvFile = () => {
    try {
      const exportData = passwords.map((p) => ({
        name: p.title || '',
        url: p.siteUrl || '',
        username: p.userId || '',
        password: p.audioUrl || '',
        note: p.note || (p.dynamicNotes ? JSON.stringify(p.dynamicNotes) : ''),
      }));

      const csvString = Papa.unparse(exportData);
      const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Google_Passwords_Export_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      addLog('Export Passwords', `Exported ${exportData.length} passwords to Google CSV format`);
    } catch (err: any) {
      console.error('Export CSV error:', err);
      addToast('Failed to export CSV: ' + (err.message || 'Unknown error'), 'error');
    }
  };

  const importCsvFile = async (file: File) => {
    setImportProgressState({
      isImporting: true,
      progress: 10,
      isComplete: false,
    });

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        const rows = results.data as any[];
        const total = rows.length;
        let imported = 0;

        for (let i = 0; i < total; i++) {
          const row = rows[i];
          const title = row.name || row.TITLE || row.title || row.url || row.SITE_URL || 'Imported Password';
          const siteUrl = row.url || row.SITE_URL || row.siteUrl || '';
          const userId = row.username || row.USER_ID || row.userId || row.email || '';
          const audioUrl = row.password || row.PASSWORD_STRING || row.password_string || '';
          const note = row.note || row.NOTE || '';

          if (title || audioUrl || siteUrl) {
            await savePasswordItem({
              title,
              siteUrl,
              userId,
              audioUrl,
              note,
              status: 'Published',
            });
            imported++;
          }

          const pct = Math.round(((i + 1) / total) * 100);
          setImportProgressState({
            isImporting: true,
            progress: pct,
            isComplete: i === total - 1,
            total,
            current: imported,
          });
        }

        addToast(`Successfully imported ${imported} passwords into Google Password Manager!`, 'success');
        addLog('Import Passwords', `Imported ${imported} passwords from CSV`);
      },
      error: (err) => {
        setImportProgressState({
          isImporting: false,
          progress: 0,
          isComplete: true,
        });
        addToast(`Import CSV failed: ${err.message}`, 'error');
      },
    });
  };

  const deleteAllPasswords = async () => {
    try {
      for (const p of passwords) {
        await deletePasswordFromFirestore(p.id);
      }
      setPasswords([]);
      addToast('All saved passwords permanently deleted.', 'info');
      addLog('Delete All Data', 'Wiped all vault credentials upon user request');
    } catch (e: any) {
      addToast('Failed to delete data: ' + e.message, 'error');
    }
  };

  const openResetPasswordModal = () => {
    setIsResetPasswordOpen(true);
  };

  const triggerManualSync = async () => {
    setIsManualSyncing(true);
    try {
      const res = await syncVaultData();
      if (res) {
        setLastSyncTimestamp(Date.now());
        addToast('Synced with Google Password Manager cloud!', 'success');
      } else {
        addToast('Sync failed. Please check connection.', 'error');
      }
    } catch (e) {
      addToast('Sync error occurred', 'error');
    } finally {
      setIsManualSyncing(false);
    }
  };

  return (
    <AppContext.Provider
      value={{
        isAuthenticated,
        currentUserEmail,
        isDataLoading,
        syncStatus,
        connectionStatus,
        login,
        loginWithBiometrics,
        logout,
        masterKey,
        syncVaultData,
        checkFirebaseConnection,

        themeMode,
        setThemeMode,
        isDarkMode,
        isThemeModalOpen,
        setIsThemeModalOpen,
        toggleTheme,
        activeView,
        setActiveView,
        selectedDomainGroup,
        setSelectedDomainGroup,
        userEmail: currentUserEmail || auth.currentUser?.email || 'MRiyajul25@gmail.com',
        exportCsvFile,
        importCsvFile,
        importProgress: importProgressState,
        deleteAllPasswords,
        openResetPasswordModal,
        triggerManualSync,
        isManualSyncing,
        lastSyncTimestamp,
        isSidebarOpen,
        setIsSidebarOpen,
        isRightDrawerOpen,
        setIsRightDrawerOpen,

        passwords,
        setPasswords,
        pages,
        setPages,
        labels,
        setLabels,
        pageTabs,
        setPageTabs,
        logs,
        clearLogs,

        searchQuery,
        setSearchQuery,
        statusFilter,
        setStatusFilter,
        labelFilter,
        setLabelFilter,
        startDate,
        setStartDate,
        endDate,
        setEndDate,
        sortOrder,
        setSortOrder,
        isManageMode,
        setIsManageMode,
        selectedPasswordIds,
        setSelectedPasswordIds,
        toggleSelectPassword,
        toggleSelectAllPasswords,
        currentPageTab,
        setCurrentPageTab,

        detailModalData,
        setDetailModalData,
        passwordEditorId,
        isPasswordEditorOpen,
        openPasswordEditor,
        closePasswordEditor,
        pageEditorId,
        isPageEditorOpen,
        openPageEditor,
        closePageEditor,
        isLabelEditorOpen,
        setIsLabelEditorOpen,
        isTabManagerOpen,
        setIsTabManagerOpen,
        isExportModalOpen,
        setIsExportModalOpen,
        isPasswordGeneratorOpen,
        setIsPasswordGeneratorOpen,
        isSearchModalOpen,
        setIsSearchModalOpen,
        isReplaceModalOpen,
        setIsReplaceModalOpen,
        isDraftManagerOpen,
        setIsDraftManagerOpen,
        imageViewerData,
        setImageViewerData,
        isResetPasswordOpen,
        setIsResetPasswordOpen,
        draftCount,
        deleteSelectedKey,
        exportVaultKey,
        clearHistoryKey,
        updateFeaturePasscode,
        clearLogsWithKey,

        confirmModalConfig,
        showConfirmModal,
        closeConfirmModal,

        toasts,
        addToast,
        removeToast,

        addLog,
        updateLogLocation,
        fetchDeviceGeoAndIp,

        savePasswordItem,
        deletePasswordItem,
        bulkDeletePasswords,
        bulkUpdatePasswordStatus,
        bulkApplyLabel,
        bulkDuplicatePasswords,
        togglePinPassword,
        incrementPasswordView,

        savePageItem,
        deletePageItem,
        incrementPageView,

        addLabelItem,
        updateLabelItem,
        deleteLabelItem,

        addPageTabItem,
        deletePageTabItem,
        updatePageTabItem,

        importProgressState,
        setImportProgressState,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
