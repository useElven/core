/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, MutableRefObject } from 'react';
import { ApiNetworkProvider } from '@multiversx/sdk-network-providers';
import { useConfig } from '../useConfig';
import { setNetworkState } from '../../store/network';

export const useApiProviderSync = (
  apiNetworkProviderRef: MutableRefObject<ApiNetworkProvider | undefined>
) => {
  const configStateSnap = useConfig();

  useEffect(() => {
    const askForApiNetworkProvider = async () => {
      let apiNetworkProvider = apiNetworkProviderRef?.current;
      if (!apiNetworkProvider) {
        const publicApiEndpoint = configStateSnap.apiAddress;
        if (publicApiEndpoint) {
          apiNetworkProvider = new ApiNetworkProvider(publicApiEndpoint, {
            timeout: Number(configStateSnap.apiTimeout),
          });
          apiNetworkProviderRef.current = apiNetworkProvider;
          setNetworkState('apiNetworkProvider', apiNetworkProvider);
        } else {
          throw Error(
            'There is no public api configured! Check configuration.'
          );
        }
      }
    };
    askForApiNetworkProvider();
  }, []);
};
