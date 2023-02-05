import { proxy, ref } from 'valtio';
import { DappProvider } from '../types/network';
import { ApiNetworkProvider } from '@multiversx/sdk-network-providers';

export interface NetworkState extends Record<string, unknown> {
  dappProvider: DappProvider | null;
  apiNetworkProvider: ApiNetworkProvider | null;
}

// It doesn't have to be tracked or persistent, it will init on every hard refresh
const initialState: NetworkState = {
  dappProvider: null,
  apiNetworkProvider: null,
};

export const networkState = proxy(initialState);

export function setNetworkState(
  key: keyof NetworkState,
  value: DappProvider | ApiNetworkProvider
) {
  networkState[key] = ref(value);
}

export const clearNetworkState = () => {
  networkState.dappProvider = null;
  networkState.apiNetworkProvider = null;
};

export const clearDappProvider = () => {
  networkState['dappProvider'] = null;
};
