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
    xAliasAddress,
    walletAddress,
    apiAddress,
    explorerAddress,
    apiTimeout,
    txWatcherTimeout,
    txWatcherPatience,
    IPFSGateway,
    walletConnectV2RelayAddresses,
    walletConnectV2ProjectId,
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
    xAliasAddress,
    walletAddress,
    apiAddress,
    explorerAddress,
    apiTimeout,
    txWatcherTimeout,
    txWatcherPatience,
    IPFSGateway,
    walletConnectV2RelayAddresses,
    walletConnectV2ProjectId,
  };
};
