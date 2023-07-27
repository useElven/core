import { useProxy } from './useProxy';
import { networkState, NetworkState } from '../store/network';

export const useNetwork = () => {
  const { dappProvider, apiNetworkProvider } = useProxy(
    networkState
  ) as NetworkState;
  return { dappProvider, apiNetworkProvider };
};
