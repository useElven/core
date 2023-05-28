import { NativeAuthClient } from '@multiversx/sdk-native-auth-client';
import { useConfig } from './useConfig';
import { useEffect, useState } from 'react';

export const useNativeAuthLoginToken = () => {
  const [loginToken, setLoginToken] = useState<string>();
  const [nativeAuthClient, setNativeAuthClient] = useState<NativeAuthClient>();
  const { apiAddress } = useConfig();

  useEffect(() => {
    const getToken = async () => {
      const client = new NativeAuthClient({ apiUrl: apiAddress });
      const loginToken = await client.initialize();

      setLoginToken(loginToken);
      setNativeAuthClient(client);
    };

    if (apiAddress) {
      getToken();
    }
  }, [apiAddress]);

  return {
    loginToken,
    nativeAuthClient,
  };
};
