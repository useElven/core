import { useProxy } from './useProxy';
import { configState } from '../store/config';

export const useConfig = () => {
  const {
    chainType,
    shortId,
    name,
    egldLabel,
    egldDenomination,
    decimals,
    gasPerDataByte,
    walletConnectDeepLink,
    walletAddress,
    apiAddress,
    explorerAddress,
    apiTimeout,
    walletConnectBridgeAddresses,
  } = useProxy(configState);

  return {
    chainType,
    shortId,
    name,
    egldLabel,
    egldDenomination,
    decimals,
    gasPerDataByte,
    walletConnectDeepLink,
    walletAddress,
    apiAddress,
    explorerAddress,
    apiTimeout,
    walletConnectBridgeAddresses,
  };
};
