/**
 * Required for xPortal and Web wallet Hub integration
 * Based on sdk-dapp webview provider implementation
 * It will probably be replaced with separate library in the future
 */

import { decodeBase64 } from './base64-utils';

export interface DecodedLoginTokenType {
  blockHash: string;
  extraInfo?: { timestamp: number };
  origin: string;
  ttl: number;
}

export const decodeLoginToken = (
  loginToken: string
): DecodedLoginTokenType | null => {
  if (
    !loginToken ||
    Object.prototype.toString.call(loginToken) !== '[object String]'
  ) {
    return null;
  }

  const parts = loginToken.split('.');

  if (parts.length !== 4) {
    return null;
  }

  try {
    const [origin, blockHash, ttl, extraInfo] = parts;
    const parsedExtraInfo = JSON.parse(decodeBase64(extraInfo));
    const parsedOrigin = decodeBase64(origin);

    return {
      ttl: Number(ttl),
      extraInfo: parsedExtraInfo,
      origin: parsedOrigin,
      blockHash,
    };
  } catch (e) {
    console.error(`Error trying to decode ${loginToken}:`, e);

    return null;
  }
};
