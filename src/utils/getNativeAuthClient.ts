import { NativeAuthClient } from '@multiversx/sdk-native-auth-client';
import { configState } from '../store/config';

export const getNativeAuthClient = () =>
  new NativeAuthClient({
    apiUrl: configState?.apiAddress || '',
    origin:
      typeof window !== 'undefined' && typeof window.location !== 'undefined'
        ? window.location.origin
        : '',
  });
