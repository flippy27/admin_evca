/**
 * JWT utilities - decode and extract claims
 */

import { logger } from '../services/logger';

export function decodeJWT(token: string): Record<string, any> {
  try {
    const parts = token.split('.');
    console.log('[JWT decode] Token parts count:', parts.length);

    if (parts.length !== 3) {
      throw new Error(`Invalid JWT format: expected 3 parts, got ${parts.length}`);
    }

    const payload = parts[1];
    console.log('[JWT decode] Payload (base64url) length:', payload.length);

    // Add padding if needed
    const paddedPayload = payload + '='.repeat((4 - (payload.length % 4)) % 4);
    console.log('[JWT decode] Padded payload length:', paddedPayload.length);

    // Decode base64url to string
    const decodedStr = atob(paddedPayload);
    console.log('[JWT decode] Decoded string length:', decodedStr.length);
    console.log('[JWT decode] Decoded string:', decodedStr.substring(0, 100) + '...');

    // Parse JSON
    const parsed = JSON.parse(decodedStr);
    console.log('[JWT decode] Parsed successfully');
    return parsed;
  } catch (error) {
    console.error('[JWT decode] Error:', error);
    logger.error('Failed to decode JWT:', {
      error: error instanceof Error ? error.message : String(error),
    });
    return {};
  }
}

export function getJWTClaims(token: string) {
  console.log('[JWT] Token first 50 chars:', token.substring(0, 50));
  console.log('[JWT] Token length:', token.length);

  const decoded = decodeJWT(token);
  console.log('[JWT] Decoded payload:', {
    user_id_local: decoded.user_id_local,
    company_id_local: decoded.company_id_local,
    company_external_id: decoded.company_external_id,
    email: decoded.email,
    name: decoded.name,
  });

  const claims = {
    userId: decoded.user_id_local,
    companyId: decoded.company_id_local,
    email: decoded.email,
    name: decoded.name,
    sub: decoded.sub,
  };

  logger.info('JWT Claims extracted', {
    userId: claims.userId,
    companyId: claims.companyId,
    email: claims.email,
    name: claims.name,
    allClaims: decoded,
  });

  console.log('[JWT] Final claims:', {
    userId: claims.userId,
    companyId: claims.companyId,
    email: claims.email,
  });

  return claims;
}
