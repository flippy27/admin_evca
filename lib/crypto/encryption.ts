/**
 * AES-256-GCM decryption + HMAC-SHA256 verification
 * Uses @noble/ciphers (pure JS, no native modules)
 * Ported from ui-emobility-web EncryptionService
 */

import { gcm } from '@noble/ciphers/aes.js';
import { hmac } from '@noble/hashes/hmac.js';
import { sha256 } from '@noble/hashes/sha2.js';
import { ENV } from '../config/env';
import { EncryptedPayload, PermissionsData } from '../types/auth.types';

// Utility functions to replace @noble/hashes/utils
function utf8ToBytes(str: string): Uint8Array {
  const bytes: number[] = [];
  for (let i = 0; i < str.length; i++) {
    const code = str.charCodeAt(i);
    if (code < 0x80) {
      bytes.push(code);
    } else if (code < 0x800) {
      bytes.push(0xc0 | (code >> 6), 0x80 | (code & 0x3f));
    } else if (code < 0x10000) {
      bytes.push(0xe0 | (code >> 12), 0x80 | ((code >> 6) & 0x3f), 0x80 | (code & 0x3f));
    }
  }
  return new Uint8Array(bytes);
}

function bytesToHex(bytes: Uint8Array): string {
  let hex = '';
  for (let i = 0; i < bytes.length; i++) {
    const b = bytes[i].toString(16);
    hex += b.length === 1 ? '0' + b : b;
  }
  return hex;
}

// Polyfill for base64 decode (alternative to atob which may not be available)
function base64ToBytes(base64: string): Uint8Array {
  // React Native has Buffer polyfill, but use a safe implementation
  if (typeof atob !== 'undefined') {
    const binaryString = atob(base64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
  }
  // Fallback for environments without atob
  throw new Error('base64ToBytes: atob not available');
}

/**
 * Derive AES-256 key from the encryption key string
 * Key = SHA256(UTF-8 encoded encryption key string) → 32 bytes
 */
function deriveKey(keyString: string): Uint8Array {
  return sha256(utf8ToBytes(keyString));
}

/**
 * Decrypt AES-256-GCM encrypted data
 * @param encryptedData base64-encoded ciphertext (without auth tag)
 * @param iv base64-encoded IV (16 bytes)
 * @param authTag base64-encoded authentication tag (16 bytes)
 * @returns Decrypted JSON object
 */
async function decrypt(
  encryptedData: string,
  iv: string,
  authTag: string
): Promise<unknown> {
  const key = deriveKey(ENV.ENCRYPTION_KEY);
  const ivBytes = base64ToBytes(iv); // 16 bytes
  const dataBytes = base64ToBytes(encryptedData);
  const tagBytes = base64ToBytes(authTag); // 16 bytes

  // AES-GCM expects ciphertext || authTag as combined
  const combined = new Uint8Array([...dataBytes, ...tagBytes]);

  const cipher = gcm(key, ivBytes);
  const decrypted = cipher.decrypt(combined);

  // Decode to string and parse JSON
  const text = new TextDecoder().decode(decrypted);
  return JSON.parse(text);
}

/**
 * Verify HMAC-SHA256 signature
 * Signature over: { userId, email, applications, expiresAt }
 */
function verifySignature(data: PermissionsData, signature: string): boolean {
  const payload = {
    userId: data.user.id || data.user.externalId,
    email: data.user.email,
    applications: data.applications,
    expiresAt: data.expiresAt,
  };

  const expectedSig = bytesToHex(
    hmac(sha256, utf8ToBytes(ENV.HMAC_SECRET), utf8ToBytes(JSON.stringify(payload)))
  );

  return expectedSig === signature;
}

/**
 * Decrypt and verify encrypted permissions payload
 * Returns decrypted PermissionsData if signature is valid
 */
export async function decryptAndValidate<T = PermissionsData>(
  payload: EncryptedPayload
): Promise<T> {
  try {
    const decrypted = (await decrypt(
      payload.encryptedData,
      payload.iv,
      payload.authTag
    )) as PermissionsData;

    if (!verifySignature(decrypted, payload.signature)) {
      throw new Error('Invalid HMAC signature - data may be tampered');
    }

    return decrypted as T;
  } catch (error) {
    if (error instanceof Error && error.message.includes('Invalid HMAC')) {
      throw error;
    }
    throw new Error(
      `Decryption failed: ${error instanceof Error ? error.message : 'unknown error'}`
    );
  }
}
