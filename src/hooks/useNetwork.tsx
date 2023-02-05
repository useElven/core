import { useProxy } from './useProxy';
import { networkState } from '../store/network';

export const useNetwork = () => {
  const { dappProvider, apiNetworkProvider } = useProxy(networkState);

  return { dappProvider, apiNetworkProvider };
};
