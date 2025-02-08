import { useState, useRef } from 'react';
import { ApiNetworkProvider } from '@multiversx/sdk-core';
import { NetworkType } from '../types/network';

import { useLocalStorageSync } from './common-helpers/useLocalStorageSync';
import { useApiProviderSync } from './common-helpers/useApiProviderSync';
import { useDappProvidersSync } from './common-helpers/useDappProvidersSync';
import { useAccountNetworkSync } from './common-helpers/useAccountNetworkSync';
import { initConfigState } from '../store/config';

export const useNetworkSync = (config?: NetworkType) => {
  // Sync main configuration
  initConfigState(config);

  const [accountDone, setAccountDone] = useState(false);
  const [loginInfoDone, setLoginInfoDone] = useState(false);

  const apiNetworkProviderRef = useRef<ApiNetworkProvider>(undefined);

  // Sync data from local storage
  useLocalStorageSync(setAccountDone, setLoginInfoDone);

  // Api provider sync
  useApiProviderSync(apiNetworkProviderRef);

  // Dapp Providers sync
  // Each provider has a little bit different logic on sync
  useDappProvidersSync(accountDone, loginInfoDone, apiNetworkProviderRef);

  // Account network sync
  useAccountNetworkSync(apiNetworkProviderRef);
};
