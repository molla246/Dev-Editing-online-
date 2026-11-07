import { initializeApp, getApps, getApp } from 'firebase/app';
import { getDatabase, ref, set, get, onValue } from 'firebase/database';
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  deleteDoc,
  getDocs,
  collection,
  onSnapshot,
} from 'firebase/firestore';
import {
  getAuth,
  signInAnonymously,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  setPersistence,
  browserSessionPersistence,
} from 'firebase/auth';
import appletConfig from '../../firebase-applet-config.json';
import { decryptData } from '../utils/crypto';

export const firebaseConfig = {
  apiKey: appletConfig.apiKey || "AIzaSyBJXxREGB5A3yuOgVP18nIb0cFzkZUba3c",
  authDomain: appletConfig.authDomain || "mollariyajul-8bb15.firebaseapp.com",
  databaseURL: (appletConfig as any).databaseURL || "https://mollariyajul-8bb15-default-rtdb.firebaseio.com",
  projectId: appletConfig.projectId || "mollariyajul-8bb15",
  storageBucket: appletConfig.storageBucket || "mollariyajul-8bb15.firebasestorage.app",
  messagingSenderId: appletConfig.messagingSenderId || "405239285317",
  appId: appletConfig.appId || "1:405239285317:web:77e75377cd5c5dbea7452c",
  measurementId: appletConfig.measurementId || "G-48EX96JEP9",
};

// Initialize Firebase App
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

export const rtdb = getDatabase(app, firebaseConfig.databaseURL);
export const db = getFirestore(app);
export const auth = getAuth(app);

// Set Auth persistence to SESSION
try {
  setPersistence(auth, browserSessionPersistence).catch((err) => {
    console.warn('Firebase Session Persistence notice:', err);
  });
} catch (err) {
  console.warn('Firebase Session Persistence catch:', err);
}

let authPromise: Promise<any> | null = null;

export async function authenticateWithFirebase(email: string, pass: string) {
  if (!email || !pass) {
    throw new Error('Email and password are required for Firebase Authentication.');
  }
  const cleanEmail = email.trim();
  const cleanPass = pass.trim();

  const cred = await signInWithEmailAndPassword(auth, cleanEmail, cleanPass);
  return cred.user;
}

export async function ensureAuth(email?: string, pass?: string) {
  try {
    if (email && pass) {
      try {
        const cred = await signInWithEmailAndPassword(auth, email, pass);
        if (cred?.user) return cred.user;
      } catch (err: any) {
        console.warn('Firebase Email/Password Auth notice:', err?.message || err);
      }
    }

    if (auth.currentUser) {
      return auth.currentUser;
    }

    if (authPromise) {
      return authPromise;
    }

    authPromise = new Promise((resolve) => {
      try {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
          if (user) {
            unsubscribe();
            resolve(user);
          } else {
            signInAnonymously(auth)
              .then((cred) => {
                unsubscribe();
                resolve(cred?.user || null);
              })
              .catch((err) => {
                console.warn('Firebase Anonymous Auth notice:', err?.message || err);
                unsubscribe();
                resolve(null);
              });
          }
        });
      } catch (e) {
        console.warn('Firebase Auth listener catch:', e);
        resolve(null);
      }
    });

    return authPromise;
  } catch (err) {
    console.warn('ensureAuth catch:', err);
    return null;
  }
}

/**
 * Helper to safely attempt JSON parsing and AES decryption with common master keys
 */
export function tryDecryptOrParse(val: any, masterKey: string = '123456'): any {
  if (!val) return null;

  if (typeof val === 'string') {
    const keysToTry = [masterKey, '123456', 'admin', 'password', 'MRiyajul25@gmail.com'];
    for (const k of keysToTry) {
      if (!k) continue;
      const decrypted = decryptData(val, k);
      if (decrypted) return decrypted;
    }
    try {
      return JSON.parse(val);
    } catch {
      return val;
    }
  }

  return val;
}

/**
 * Normalizes object maps or arrays into clean Javascript arrays, preserving keys/ids
 */
export function normalizeFirebaseData(val: any, masterKey?: string): any[] {
  if (!val) return [];

  let unwrapped = val;
  if (typeof val === 'string') {
    unwrapped = tryDecryptOrParse(val, masterKey);
  }

  if (!unwrapped) return [];

  let list: any[] = [];
  if (Array.isArray(unwrapped)) {
    list = unwrapped.map((item, idx) => {
      if (item && typeof item === 'object') {
        return { id: item.id || `item_${idx}`, ...item };
      }
      return item;
    });
  } else if (typeof unwrapped === 'object') {
    list = Object.entries(unwrapped).map(([key, item]: [string, any]) => {
      if (item && typeof item === 'object') {
        return { id: key, key: key, ...item };
      }
      return { id: key, key: key, value: item };
    });
  } else {
    return [];
  }

  return list;
}

/**
 * Helper to convert list of objects to key-value object map
 */
export function arrayToObjMap(arr: any[]): Record<string, any> {
  const obj: Record<string, any> = {};
  arr.forEach((item, index) => {
    if (item && typeof item === 'object') {
      const key = item.id || item.key || `item_${index}`;
      const copy = { ...item };
      delete copy.id;
      delete copy.key;
      obj[key] = copy;
    }
  });
  return obj;
}

/**
 * Normalizes password items into standard PasswordItem schema
 */
function normalizePasswordItems(arr: any[]): any[] {
  const dateStr = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  const now = Date.now();
  const seenIds = new Set<string>();

  const list: any[] = [];
  arr.forEach((item, index) => {
    if (typeof item === 'string') {
      const parsed = tryDecryptOrParse(item);
      if (parsed && typeof parsed === 'object') item = parsed;
    }
    if (!item || typeof item !== 'object') {
      let id = `pass_${index}_${now}`;
      if (seenIds.has(id)) return;
      seenIds.add(id);
      list.push({
        id,
        title: String(item || 'Untitled'),
        userId: '',
        audioUrl: '',
        siteUrl: '',
        status: 'Published',
        note: '',
        labels: [],
        views: 0,
        isPinned: false,
        dateString: dateStr,
        createdAt: now,
        updatedAt: now,
      });
      return;
    }

    const title = String(item.title || item.name || item.site || item.service || item.label || item.heading || 'Untitled');
    const userId = String(item.userId || item.username || item.user || item.email || item.login || item.account || item.userid || '');
    const audioUrl = String(item.audioUrl || item.password || item.pass || item.secret || item.value || item.pwd || '');
    const siteUrl = String(item.siteUrl || item.url || item.website || item.link || item.domain || item.site_url || '');
    const note = String(item.note || item.notes || item.description || item.comment || item.details || '');
    const isPinned = Boolean(item.isPinned || item.favorite || item.isFavorite || item.fav || item.is_favorite);
    const labels = Array.isArray(item.labels) ? item.labels.map(String) : (item.label ? [String(item.label)] : []);
    const views = typeof item.views === 'number' ? item.views : 0;
    const status = item.status === 'Draft' ? 'Draft' : 'Published';
    const createdAt = typeof item.createdAt === 'number' ? item.createdAt : now;
    const dateString = String(item.dateString || dateStr);
    let id = String(item.id || item.key || item._id || item.uuid || `pass_${index}_${now}`);

    if (seenIds.has(id)) {
      return; // Skip duplicate ID entry
    }
    seenIds.add(id);

    list.push({
      id,
      title,
      userId,
      audioUrl,
      siteUrl,
      status,
      note,
      labels,
      views,
      isPinned,
      dateString,
      createdAt,
      updatedAt: typeof item.updatedAt === 'number' ? item.updatedAt : now,
      dynamicNotes: Array.isArray(item.dynamicNotes) ? item.dynamicNotes : [],
      posterUrl: item.posterUrl ? String(item.posterUrl) : undefined,
    });
  });

  return list;
}

function normalizePageItems(arr: any[]): any[] {
  const dateStr = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  const now = Date.now();
  const seenIds = new Set<string>();
  const list: any[] = [];

  arr.forEach((item, index) => {
    if (typeof item === 'string') {
      const parsed = tryDecryptOrParse(item);
      if (parsed && typeof parsed === 'object') item = parsed;
      else item = { id: `page_${index}`, title: 'Untitled Page', content: item, tabId: 'tab_1', views: 0, dateString: dateStr, createdAt: now };
    }
    if (!item || typeof item !== 'object') return;

    const id = String(item.id || item.key || `page_${index}_${now}`);
    if (seenIds.has(id)) return;
    seenIds.add(id);

    list.push({
      id,
      title: String(item.title || item.name || item.heading || 'Untitled Page'),
      content: String(item.content || item.body || item.text || item.description || item.notes || ''),
      tabId: String(item.tabId || item.category || 'tab_1'),
      views: typeof item.views === 'number' ? item.views : 0,
      dateString: String(item.dateString || dateStr),
      createdAt: typeof item.createdAt === 'number' ? item.createdAt : now,
      updatedAt: typeof item.updatedAt === 'number' ? item.updatedAt : now,
      status: item.status === 'Draft' ? 'Draft' : 'Published',
      isCodeMode: Boolean(item.isCodeMode),
      attachments: Array.isArray(item.attachments) ? item.attachments : [],
    });
  });

  return list;
}

function normalizeLabelItems(arr: any[]): any[] {
  const now = Date.now();
  const seenIds = new Set<string>();
  const list: any[] = [];

  arr.forEach((item, index) => {
    if (typeof item === 'string') {
      item = { id: `lbl_${index}`, name: item, createdAt: now };
    }
    if (!item || typeof item !== 'object') return;

    const id = String(item.id || item.key || `lbl_${index}_${now}`);
    if (seenIds.has(id)) return;
    seenIds.add(id);

    list.push({
      id,
      name: String(item.name || item.title || item.label || 'LABEL'),
      createdAt: typeof item.createdAt === 'number' ? item.createdAt : now,
    });
  });

  return list;
}

function normalizePageTabItems(arr: any[]): any[] {
  const now = Date.now();
  const seenIds = new Set<string>();
  const list: any[] = [];

  arr.forEach((item, index) => {
    if (typeof item === 'string') {
      item = { id: `tab_${index}`, name: item, createdAt: now };
    }
    if (!item || typeof item !== 'object') return;

    const id = String(item.id || item.key || `tab_${index}_${now}`);
    if (seenIds.has(id)) return;
    seenIds.add(id);

    list.push({
      id,
      name: String(item.name || item.title || item.tab || 'TAB'),
      createdAt: typeof item.createdAt === 'number' ? item.createdAt : now,
    });
  });

  return list;
}

function normalizeLogItems(arr: any[]): any[] {
  const dateStr = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  const now = Date.now();
  const seenIds = new Set<string>();
  const list: any[] = [];

  arr.forEach((item, index) => {
    if (typeof item === 'string') {
      item = { id: `log_${index}`, action: 'Activity', detail: item, dateString: dateStr, createdAt: now };
    }
    if (!item || typeof item !== 'object') return;

    const id = String(item.id || item.key || `log_${index}_${now}`);
    if (seenIds.has(id)) return;
    seenIds.add(id);

    list.push({
      id,
      action: String(item.action || item.type || item.event || item.title || 'Activity'),
      detail: String(item.detail || item.details || item.description || item.note || item.message || ''),
      dateString: String(item.dateString || dateStr),
      createdAt: typeof item.createdAt === 'number' ? item.createdAt : now,
      location: item.location ? String(item.location) : '',
      ip: item.ip ? String(item.ip) : '',
    });
  });

  return list;
}

/**
 * Inspects any raw root or node snapshot and extracts passwords, pages, labels, pageTabs, logs
 */
export function extractVaultFromRaw(val: any, masterKey: string = '123456'): any {
  if (!val) return null;

  const parsed = tryDecryptOrParse(val, masterKey);
  if (!parsed || typeof parsed !== 'object') return null;

  let passwordsRaw =
    parsed.password ||
    parsed.passwords ||
    parsed.accounts ||
    parsed.items ||
    parsed.vault ||
    parsed.data;
  let pagesRaw =
    parsed.pages ||
    parsed.page ||
    parsed.notes ||
    parsed.documents;
  let labelsRaw =
    parsed.labels ||
    parsed.label ||
    parsed.categories ||
    parsed.tags;
  let pageTabsRaw =
    parsed.pageTabs ||
    parsed.tabs;
  let logsRaw =
    parsed.activity_logs ||
    parsed.activity_log ||
    parsed.logs ||
    parsed.log ||
    parsed.history ||
    parsed.activity;

  // Only fallback to vaultData if top-level collection lists are missing
  if (parsed.vaultData) {
    const vd = tryDecryptOrParse(parsed.vaultData, masterKey);
    const primary = vd?.primary ? tryDecryptOrParse(vd.primary, masterKey) : vd;
    if (primary && typeof primary === 'object') {
      const pPass = primary.password || primary.passwords || primary.accounts || primary.items;
      const pPages = primary.pages || primary.page || primary.notes;
      const pLabels = primary.labels || primary.label || primary.categories || primary.tags;
      const pTabs = primary.pageTabs || primary.tabs;
      const pLogs = primary.activity_logs || primary.logs || primary.history;

      if ((!passwordsRaw || (Array.isArray(passwordsRaw) && passwordsRaw.length === 0)) && pPass !== undefined) passwordsRaw = pPass;
      if ((!pagesRaw || (Array.isArray(pagesRaw) && pagesRaw.length === 0)) && pPages !== undefined) pagesRaw = pPages;
      if ((!labelsRaw || (Array.isArray(labelsRaw) && labelsRaw.length === 0)) && pLabels !== undefined) labelsRaw = pLabels;
      if ((!pageTabsRaw || (Array.isArray(pageTabsRaw) && pageTabsRaw.length === 0)) && pTabs !== undefined) pageTabsRaw = pTabs;
      if ((!logsRaw || (Array.isArray(logsRaw) && logsRaw.length === 0)) && pLogs !== undefined) logsRaw = pLogs;
    }
  }

  if (!passwordsRaw && !pagesRaw && !labelsRaw) {
    const values = Object.values(parsed);
    const looksLikePasswordList = values.some((v: any) => {
      const item = tryDecryptOrParse(v, masterKey);
      return (
        item &&
        typeof item === 'object' &&
        (item.password || item.pass || item.username || item.user || item.title || item.name || item.site || item.url)
      );
    });

    if (looksLikePasswordList) {
      passwordsRaw = values;
    }
  }

  const rawPassList = normalizeFirebaseData(passwordsRaw, masterKey);
  const rawPagesList = normalizeFirebaseData(pagesRaw, masterKey);
  const rawLabelsList = normalizeFirebaseData(labelsRaw, masterKey);
  const rawPageTabsList = normalizeFirebaseData(pageTabsRaw, masterKey);
  const rawLogsList = normalizeFirebaseData(logsRaw, masterKey);

  const passwords = normalizePasswordItems(rawPassList);
  const pages = normalizePageItems(rawPagesList);
  const labels = normalizeLabelItems(rawLabelsList);
  const pageTabs = normalizePageTabItems(rawPageTabsList);
  const logs = normalizeLogItems(rawLogsList);

  return { passwords, pages, labels, pageTabs, logs };
}

/**
 * Firestore & RTDB CRUD functions strictly separated per user requirements:
 * - Pages & PageTabs / Notebooks -> Realtime Database ONLY (rtdb)
 * - Passwords, Labels, Activity Logs & Settings -> Firestore ONLY (db)
 */
export async function testFirebaseUploadConnection(): Promise<{ success: boolean; message: string }> {
  try {
    await ensureAuth();
    const now = new Date().toISOString();
    const testDocRef = doc(db, '_connection_test', 'status');
    await setDoc(testDocRef, {
      status: 'online',
      lastUploadTest: now,
      projectId: firebaseConfig.projectId,
      appId: firebaseConfig.appId,
    });
    await set(ref(rtdb, '_connection_test'), {
      status: 'online',
      lastUploadTest: now,
    }).catch(() => {});
    return {
      success: true,
      message: `Firebase connection active & upload verified! Project: ${firebaseConfig.projectId}`,
    };
  } catch (err: any) {
    console.warn('testFirebaseUploadConnection error:', err);
    return {
      success: false,
      message: err?.message || 'Firebase upload connection check failed',
    };
  }
}

// PASSWORDS (Firestore ONLY)
export async function savePasswordToFirestore(item: any): Promise<{ success: boolean; error?: string }> {
  try {
    await ensureAuth();
    if (!item.id) {
      item.id = 'pass_' + Date.now();
    }
    const docRef = doc(db, 'passwords', String(item.id));
    await setDoc(docRef, item, { merge: true });
    return { success: true };
  } catch (err: any) {
    console.warn('savePasswordToFirestore error:', err?.message || err);
    return { success: false, error: err?.message || 'Firestore password update failed' };
  }
}

export async function deletePasswordFromFirestore(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    await ensureAuth();
    const docRef = doc(db, 'passwords', String(id));
    await deleteDoc(docRef);
    return { success: true };
  } catch (err: any) {
    console.warn('deletePasswordFromFirestore error:', err?.message || err);
    return { success: false, error: err?.message || 'Firestore password deletion failed' };
  }
}

// PAGES & NOTEBOOK (Realtime Database ONLY)
export async function savePageToFirebase(item: any): Promise<{ success: boolean; error?: string }> {
  try {
    await ensureAuth();
    if (!item.id) {
      item.id = 'page_' + Date.now();
    }
    await set(ref(rtdb, `pages/${item.id}`), item);
    return { success: true };
  } catch (err: any) {
    console.warn('savePageToFirebase error:', err?.message || err);
    return { success: false, error: err?.message || 'Realtime Database page update failed' };
  }
}

export async function deletePageFromFirebase(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    await ensureAuth();
    await set(ref(rtdb, `pages/${id}`), null);
    return { success: true };
  } catch (err: any) {
    console.warn('deletePageFromFirebase error:', err?.message || err);
    return { success: false, error: err?.message || 'Realtime Database page deletion failed' };
  }
}

// LABELS (Firestore ONLY)
export async function saveLabelToFirebase(item: any): Promise<{ success: boolean; error?: string }> {
  try {
    await ensureAuth();
    if (!item.id) {
      item.id = 'lbl_' + Date.now();
    }
    await setDoc(doc(db, 'labels', String(item.id)), item, { merge: true });
    return { success: true };
  } catch (err: any) {
    console.warn('saveLabelToFirebase error:', err?.message || err);
    return { success: false, error: err?.message || 'Firestore label update failed' };
  }
}

export async function deleteLabelFromFirebase(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    await ensureAuth();
    await deleteDoc(doc(db, 'labels', String(id)));
    return { success: true };
  } catch (err: any) {
    console.warn('deleteLabelFromFirebase error:', err?.message || err);
    return { success: false, error: err?.message || 'Firestore label deletion failed' };
  }
}

// PAGE TABS / NOTEBOOKS (Realtime Database ONLY)
export async function savePageTabToFirebase(item: any): Promise<{ success: boolean; error?: string }> {
  try {
    await ensureAuth();
    if (!item.id) {
      item.id = 'tab_' + Date.now();
    }
    await set(ref(rtdb, `pageTabs/${item.id}`), item);
    return { success: true };
  } catch (err: any) {
    console.warn('savePageTabToFirebase error:', err?.message || err);
    return { success: false, error: err?.message || 'Realtime Database tab update failed' };
  }
}

export async function deletePageTabFromFirebase(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    await ensureAuth();
    await set(ref(rtdb, `pageTabs/${id}`), null);
    return { success: true };
  } catch (err: any) {
    console.warn('deletePageTabFromFirebase error:', err?.message || err);
    return { success: false, error: err?.message || 'Realtime Database tab deletion failed' };
  }
}

export function subscribeToFirebaseConnectionState(
  callback: (status: 'connected' | 'pending' | 'disconnected') => void
): () => void {
  callback('pending');
  try {
    const connectedRef = ref(rtdb, '.info/connected');
    const unsub = onValue(
      connectedRef,
      (snap) => {
        if (snap.val() === true) {
          callback('connected');
        } else {
          callback('disconnected');
        }
      },
      (err) => {
        console.warn('Firebase RTDB connection listener notice:', err);
        callback('disconnected');
      }
    );
    return unsub;
  } catch (err) {
    console.warn('subscribeToFirebaseConnectionState catch:', err);
    callback('disconnected');
    return () => {};
  }
}

export async function fetchFirestoreCollection(collName: string): Promise<any[]> {
  try {
    await ensureAuth();
    const snap = await getDocs(collection(db, collName));
    const list: any[] = [];
    snap.forEach((d) => {
      list.push({ id: d.id, ...d.data() });
    });
    return list;
  } catch (err) {
    console.warn(`Firestore fetch ${collName} notice:`, err);
    return [];
  }
}

export async function fetchPasswordsFromFirestore(): Promise<any[]> {
  return fetchFirestoreCollection('passwords');
}

// SETTINGS (Firestore ONLY)
export async function saveSettingsToFirebase(settingsData: Record<string, any>): Promise<{ success: boolean; error?: string }> {
  try {
    await ensureAuth();
    await setDoc(doc(db, 'settings', 'featurePasscodes'), settingsData, { merge: true });
    return { success: true };
  } catch (err: any) {
    console.warn('saveSettingsToFirebase error:', err?.message || err);
    return { success: false, error: err?.message || 'Firestore settings update failed' };
  }
}

// LOGS (Firestore ONLY + RTDB cleanup)
export async function clearLogsInFirebase(): Promise<{ success: boolean; error?: string }> {
  try {
    await ensureAuth();
    const snapshot = await getDocs(collection(db, 'activity_logs'));
    const deletePromises = snapshot.docs.map((docSnap) => deleteDoc(doc(db, 'activity_logs', docSnap.id)));
    await Promise.all(deletePromises);

    try {
      await Promise.all([
        set(ref(rtdb, 'activity_logs'), null),
        set(ref(rtdb, 'logs'), null),
        set(ref(rtdb, 'vaultData/primary/logs'), null),
      ]);
    } catch (rtdbErr) {
      console.warn('RTDB logs cleanup notice:', rtdbErr);
    }

    return { success: true };
  } catch (err: any) {
    console.warn('clearLogsInFirebase error:', err?.message || err);
    return { success: false, error: err?.message || 'Failed to clear logs in Firestore' };
  }
}

export async function fetchSettingsFromFirebase(): Promise<Record<string, any> | null> {
  try {
    await ensureAuth();
    const docSnap = await getDoc(doc(db, 'settings', 'featurePasscodes'));
    if (docSnap.exists()) {
      return docSnap.data();
    }
  } catch (err) {
    console.warn('fetchSettingsFromFirebase notice:', err);
  }
  return null;
}

/**
 * Fetch vault data directly:
 * - Passwords, Labels, Activity Logs from Firestore
 * - Pages, PageTabs from Realtime Database
 */
export async function fetchVaultFromFirebase(masterKey: string = '123456') {
  try {
    await ensureAuth();

    // 1. Fetch Passwords, Labels, Logs from Firestore
    const [firestorePasswords, firestoreLabels, firestoreLogs] = await Promise.all([
      fetchFirestoreCollection('passwords'),
      fetchFirestoreCollection('labels'),
      fetchFirestoreCollection('activity_logs'),
    ]);

    // 2. Fetch Pages, PageTabs from Realtime Database ONLY
    let pagesSnap: any, tabsSnap: any;
    try {
      [pagesSnap, tabsSnap] = await Promise.all([
        get(ref(rtdb, 'pages')),
        get(ref(rtdb, 'pageTabs')),
      ]);
    } catch (rtdbErr) {
      console.warn('RTDB fetch pages/pageTabs notice:', rtdbErr);
    }

    const rawPagesList = pagesSnap?.exists() ? normalizeFirebaseData(pagesSnap.val(), masterKey) : [];
    const rawPageTabsList = tabsSnap?.exists() ? normalizeFirebaseData(tabsSnap.val(), masterKey) : [];

    const passwords = normalizePasswordItems(firestorePasswords);
    const labels = normalizeLabelItems(firestoreLabels);
    const logs = normalizeLogItems(firestoreLogs);
    const pages = normalizePageItems(rawPagesList);
    const pageTabs = normalizePageTabItems(rawPageTabsList);

    return { passwords, pages, labels, pageTabs, logs };
  } catch (error: any) {
    console.warn('Firebase fetch notice:', error?.message || error);
  }
  return null;
}

/**
 * Save vault data reliably:
 * - Passwords, Labels, Activity Logs strictly to Firestore
 * - Pages and PageTabs strictly to Realtime Database
 */
export async function syncVaultToFirebase(vaultData: {
  passwords?: any[];
  pages?: any[];
  labels?: any[];
  pageTabs?: any[];
  logs?: any[];
  allowEmptyPages?: boolean;
}): Promise<{ success: boolean; error?: string }> {
  try {
    await ensureAuth();

    // 1. Save Passwords, Labels, Logs strictly to Firestore
    if (Array.isArray(vaultData.passwords) && vaultData.passwords.length > 0) {
      await Promise.all(
        vaultData.passwords.map((p) => {
          if (!p.id) p.id = 'pass_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6);
          return setDoc(doc(db, 'passwords', String(p.id)), p, { merge: true });
        })
      );
    }
    if (Array.isArray(vaultData.labels) && vaultData.labels.length > 0) {
      await Promise.all(
        vaultData.labels.map((l) => setDoc(doc(db, 'labels', String(l.id)), l, { merge: true }))
      );
    }
    if (Array.isArray(vaultData.logs) && vaultData.logs.length > 0) {
      await Promise.all(
        vaultData.logs.map((log) => {
          if (!log.id) log.id = 'log_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6);
          return setDoc(doc(db, 'activity_logs', String(log.id)), log, { merge: true });
        })
      );
    }

    // 2. Save Pages and PageTabs strictly to Realtime Database
    try {
      if (Array.isArray(vaultData.pages) && (vaultData.pages.length > 0 || vaultData.allowEmptyPages)) {
        const pagesMap = arrayToObjMap(vaultData.pages);
        await set(ref(rtdb, 'pages'), pagesMap);
      }
      if (Array.isArray(vaultData.pageTabs) && vaultData.pageTabs.length > 0) {
        const pageTabsMap = arrayToObjMap(vaultData.pageTabs);
        await set(ref(rtdb, 'pageTabs'), pageTabsMap);
      }
    } catch (rtdbErr: any) {
      console.warn('Realtime Database save pages/pageTabs notice:', rtdbErr?.message || rtdbErr);
    }

    return { success: true };
  } catch (err: any) {
    const errMsg = err?.message || String(err);
    console.warn('Cloud Sync notice:', errMsg);
    return { success: false, error: errMsg };
  }
}

/**
 * Listen for live updates:
 * - Passwords, Labels, Activity Logs from Firestore
 * - Pages, PageTabs from Realtime Database
 */
export function subscribeVaultFromFirebase(
  onData: (data: any) => void,
  masterKey: string = '123456'
) {
  const unsubscribes: Array<() => void> = [];
  let isCancelled = false;

  const loadedNodes = new Set<string>();

  const nodeCache: Record<string, any> = {
    passwords: [],
    labels: [],
    activity_logs: [],
    pages: [],
    pageTabs: [],
  };

  const handleUpdate = () => {
    if (isCancelled) return;
    const payload: any = {};

    if (loadedNodes.has('passwords')) {
      payload.passwords = normalizePasswordItems(nodeCache.passwords || []);
    }
    if (loadedNodes.has('labels')) {
      payload.labels = normalizeLabelItems(nodeCache.labels || []);
    }
    if (loadedNodes.has('activity_logs')) {
      payload.logs = normalizeLogItems(nodeCache.activity_logs || []);
    }
    if (loadedNodes.has('pages')) {
      payload.pages = normalizePageItems(normalizeFirebaseData(nodeCache.pages, masterKey));
    }
    if (loadedNodes.has('pageTabs')) {
      payload.pageTabs = normalizePageTabItems(normalizeFirebaseData(nodeCache.pageTabs, masterKey));
    }

    onData(payload);
  };

  const setupListeners = () => {
    if (isCancelled) return;

    // 1. Subscribe to Firestore collections: passwords, labels, activity_logs
    const fsCollections = ['passwords', 'labels', 'activity_logs'];
    fsCollections.forEach((collName) => {
      try {
        const fsUnsub = onSnapshot(
          collection(db, collName),
          (snapshot) => {
            if (isCancelled) return;
            const list: any[] = [];
            snapshot.forEach((docSnap) => {
              list.push({ id: docSnap.id, ...docSnap.data() });
            });
            nodeCache[collName] = list;
            loadedNodes.add(collName);
            handleUpdate();
          },
          (err) => {
            console.warn(`Firestore ${collName} snapshot notice:`, err?.message || err);
          }
        );
        unsubscribes.push(fsUnsub);
      } catch (err: any) {
        console.warn(`Firestore subscription catch for ${collName}:`, err?.message || err);
      }
    });

    // 2. Subscribe to RTDB nodes: pages, pageTabs ONLY
    const rtdbNodes = ['pages', 'pageTabs'];
    rtdbNodes.forEach((nodeName) => {
      try {
        const nodeUnsub = onValue(
          ref(rtdb, nodeName),
          (snapshot) => {
            if (isCancelled) return;
            if (snapshot.exists()) {
              nodeCache[nodeName] = snapshot.val();
            } else {
              nodeCache[nodeName] = [];
            }
            loadedNodes.add(nodeName);
            handleUpdate();
          },
          (error) => {
            console.warn(`RTDB node '${nodeName}' subscription notice:`, error?.message || error);
          }
        );
        unsubscribes.push(nodeUnsub);
      } catch (err: any) {
        console.warn(`RTDB node '${nodeName}' subscribe catch:`, err?.message || err);
      }
    });
  };

  setupListeners();
  ensureAuth().catch((err) => console.warn('ensureAuth notice in subscribe:', err));

  return () => {
    isCancelled = true;
    unsubscribes.forEach((unsub) => {
      if (typeof unsub === 'function') unsub();
    });
  };
}
