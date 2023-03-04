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
    walletAddress,
    apiAddress,
    explorerAddress,
    apiTimeout,
    IPFSGateway,
    walletConnectV2RelayAddresses,
    walletConnectV2ProjectId,
  };
};
