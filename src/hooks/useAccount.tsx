import { useProxy } from './useProxy';
import { accountState } from '../store/auth';

export const useAccount = () => {
  const { addressIndex, address, balance, nonce, activeGuardianAddress } =
    useProxy(accountState);

  return { addressIndex, address, balance, nonce, activeGuardianAddress };
};
