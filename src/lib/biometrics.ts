// WebAuthn Biometric Authentication Utility
// Supports Touch ID, Face ID, Windows Hello, Android Biometrics & Security Keys

export interface PasskeyData {
  id: string;
  name: string;
  createdAt: string;
  type: string;
}

const PASSKEYS_STORAGE_KEY = 'data_passwords_webauthn_passkeys';

// Helper functions: ArrayBuffer to Base64URL and vice-versa
function bufferToBase64Url(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let string = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    string += String.fromCharCode(bytes[i]);
  }
  return btoa(string)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}

function base64UrlToBuffer(base64Url: string): ArrayBuffer {
  let base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
  while (base64.length % 4) {
    base64 += '=';
  }
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}

/**
 * Check if WebAuthn and platform authenticators (Touch ID, Face ID, Windows Hello) are supported
 */
export async function isWebAuthnSupported(): Promise<boolean> {
  if (
    typeof window === 'undefined' ||
    !window.PublicKeyCredential ||
    !navigator.credentials ||
    !navigator.credentials.create
  ) {
    return false;
  }

  try {
    if (typeof PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable === 'function') {
      const available = await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
      return available;
    }
    return true;
  } catch (e) {
    return true; // Fallback check
  }
}

/**
 * Get all stored passkeys from localStorage
 */
export function getStoredPasskeys(): PasskeyData[] {
  try {
    const raw = localStorage.getItem(PASSKEYS_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

/**
 * Save a new passkey to storage
 */
export function savePasskey(passkey: PasskeyData): void {
  const passkeys = getStoredPasskeys();
  const filtered = passkeys.filter((p) => p.id !== passkey.id);
  filtered.push(passkey);
  localStorage.setItem(PASSKEYS_STORAGE_KEY, JSON.stringify(filtered));
}

/**
 * Delete a stored passkey by ID
 */
export function removePasskey(id: string): void {
  const passkeys = getStoredPasskeys();
  const filtered = passkeys.filter((p) => p.id !== id);
  localStorage.setItem(PASSKEYS_STORAGE_KEY, JSON.stringify(filtered));
}

/**
 * Clear all stored passkeys from storage
 */
export function clearAllPasskeys(): void {
  localStorage.removeItem(PASSKEYS_STORAGE_KEY);
}

/**
 * Register a new Biometric Passkey on this device using WebAuthn API
 */
export async function registerBiometricPasskey(
  username: string = 'Administrator'
): Promise<{ success: boolean; credentialId?: string; error?: string; isIframeRestricted?: boolean }> {
  try {
    const isSupported = await isWebAuthnSupported();
    if (!isSupported) {
      return {
        success: false,
        error: 'WebAuthn / Biometrics is not supported or enabled on this browser / device.',
      };
    }

    // Generate random 32-byte challenge
    const challenge = new Uint8Array(32);
    crypto.getRandomValues(challenge);

    // Generate user ID
    const userId = new Uint8Array(16);
    crypto.getRandomValues(userId);

    const creationOptions: PublicKeyCredentialCreationOptions = {
      challenge,
      rp: {
        name: 'DATA Password Admin',
      },
      user: {
        id: userId,
        name: username,
        displayName: `DATA Admin (${username})`,
      },
      pubKeyCredParams: [
        { alg: -7, type: 'public-key' }, // ES256
        { alg: -257, type: 'public-key' }, // RS256
      ],
      authenticatorSelection: {
        userVerification: 'preferred',
      },
      timeout: 60000,
      attestation: 'none',
    };

    const credential = (await navigator.credentials.create({
      publicKey: creationOptions,
    })) as PublicKeyCredential | null;

    if (!credential) {
      return { success: false, error: 'Registration failed. No credential returned.' };
    }

    const credentialId = bufferToBase64Url(credential.rawId);

    const newPasskey: PasskeyData = {
      id: credentialId,
      name: `${username}'s Device Biometrics`,
      createdAt: new Date().toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }),
      type: 'Platform Biometric / Passkey',
    };

    savePasskey(newPasskey);

    return { success: true, credentialId };
  } catch (err: any) {
    console.error('WebAuthn Registration Error:', err);
    const isIframe = typeof window !== 'undefined' && window.self !== window.top;
    const errMsg = (err.message || '').toLowerCase();
    const errName = err.name || '';

    if (
      errName === 'SecurityError' ||
      errMsg.includes('publickey-credentials') ||
      errMsg.includes('feature is not enabled') ||
      errMsg.includes('permissions policy') ||
      errMsg.includes('cross-origin') ||
      errMsg.includes('not allowed in this document') ||
      (isIframe && errName === 'NotAllowedError')
    ) {
      return {
        success: false,
        error:
          'Biometric passkeys are restricted inside embedded preview frames. Click "Open in New Tab" to setup or sign in with Touch ID / Face ID.',
        isIframeRestricted: true,
      };
    }

    if (errName === 'NotAllowedError') {
      return {
        success: false,
        error: 'Biometric registration was cancelled, timed out, or rejected by device security.',
      };
    }

    if (errName === 'InvalidStateError') {
      return {
        success: false,
        error: 'This biometric passkey is already registered on this device.',
      };
    }

    return {
      success: false,
      error:
        isIframe
          ? 'Biometrics restricted in preview frame. Please open the app in a new tab to use Touch ID / Face ID.'
          : err.message || 'Failed to register biometric credentials.',
      isIframeRestricted: isIframe,
    };
  }
}

/**
 * Authenticate user with registered WebAuthn Biometrics
 */
export async function authenticateWithBiometrics(): Promise<{
  success: boolean;
  credentialId?: string;
  error?: string;
  isIframeRestricted?: boolean;
}> {
  try {
    const isSupported = await isWebAuthnSupported();
    if (!isSupported) {
      return {
        success: false,
        error: 'Biometric sensor is not supported or accessible on this browser/device.',
      };
    }

    const storedPasskeys = getStoredPasskeys();

    // Challenge
    const challenge = new Uint8Array(32);
    crypto.getRandomValues(challenge);

    const allowCredentials = storedPasskeys.map((p) => ({
      id: base64UrlToBuffer(p.id),
      type: 'public-key' as const,
    }));

    const requestOptions: PublicKeyCredentialRequestOptions = {
      challenge,
      timeout: 60000,
      userVerification: 'preferred',
      ...(allowCredentials.length > 0 ? { allowCredentials } : {}),
    };

    const assertion = (await navigator.credentials.get({
      publicKey: requestOptions,
    })) as PublicKeyCredential | null;

    if (!assertion) {
      return { success: false, error: 'Biometric verification failed.' };
    }

    const credentialId = bufferToBase64Url(assertion.rawId);

    return { success: true, credentialId };
  } catch (err: any) {
    console.error('WebAuthn Authentication Error:', err);
    const isIframe = typeof window !== 'undefined' && window.self !== window.top;
    const errMsg = (err.message || '').toLowerCase();
    const errName = err.name || '';

    if (
      errName === 'SecurityError' ||
      errMsg.includes('publickey-credentials') ||
      errMsg.includes('feature is not enabled') ||
      errMsg.includes('permissions policy') ||
      errMsg.includes('cross-origin') ||
      errMsg.includes('not allowed in this document') ||
      (isIframe && errName === 'NotAllowedError')
    ) {
      return {
        success: false,
        error:
          'Biometric verification is restricted in embedded preview frames. Click "Open in New Tab" to sign in with Touch ID / Face ID.',
        isIframeRestricted: true,
      };
    }

    if (errName === 'NotAllowedError') {
      return {
        success: false,
        error: 'Biometric verification was cancelled, timed out, or failed.',
      };
    }

    return {
      success: false,
      error:
        isIframe
          ? 'Biometrics restricted in preview frame. Please open the app in a new tab to use Touch ID / Face ID.'
          : err.message || 'Failed to register biometric credentials.',
      isIframeRestricted: isIframe,
    };
  }
}
