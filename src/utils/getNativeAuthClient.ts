import { NativeAuthClient } from '@multiversx/sdk-native-auth-client';
import { configState } from '../store/config';

export const getNativeAuthClient = () =>
  new NativeAuthClient({ apiUrl: configState.apiAddress });
