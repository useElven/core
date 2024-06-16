import { MutableRefObject } from 'react';
import { ApiNetworkProvider } from '@multiversx/sdk-network-providers';
import { errorParse } from '../../utils/errorParse';
import { useEffectOnlyOnUpdate } from '../useEffectOnlyOnUpdate';
import { isLoginExpired } from '../../utils/expiresAt';
import { setAccountState, setLoggingInState } from '../../store/auth';
import { Address, Account } from '@multiversx/sdk-core';
import { useAccount } from '../useAccount';
import { useLoginInfo } from '../useLoginInfo';

export const useAccountNetworkSync = (
  apiNetworkProviderRef: MutableRefObject<ApiNetworkProvider | undefined>
) => {
  const accountSnap = useAccount();
  const loginInfoSnap = useLoginInfo();

  useEffectOnlyOnUpdate(() => {
    const askForAccount = async () => {
      const address = accountSnap.address;
      const loginExpires = loginInfoSnap.expires;
      const apiNetworkProvider = apiNetworkProviderRef.current;
      const loginExpired = loginExpires && isLoginExpired(loginExpires);
      if (!loginExpired && address && apiNetworkProvider) {
        setLoggingInState('pending', true);
        const userAddressInstance = new Address(address);
        const userAccountInstance = new Account(userAddressInstance);
        try {
          const userAccountOnNetwork =
            await apiNetworkProvider.getAccount(userAddressInstance);
          const userGuardianOnNetwork =
            await apiNetworkProvider.getGuardianData(userAddressInstance);

          userAccountInstance.update(userAccountOnNetwork);
          setAccountState('address', address);
          setAccountState('nonce', userAccountInstance.nonce.valueOf());
          setAccountState('balance', userAccountInstance.balance.toString());
          setAccountState(
            'activeGuardianAddress',
            userGuardianOnNetwork.guarded &&
              userGuardianOnNetwork.activeGuardian?.address.bech32()
              ? userGuardianOnNetwork.activeGuardian.address.bech32()
              : ''
          );
          setLoggingInState('loggedIn', Boolean(address));
        } catch (e) {
          const err = errorParse(e);
          console.warn(
            `Something went wrong trying to synchronize the user account: ${err}`
          );
        } finally {
          setLoggingInState('pending', false);
        }
      }
    };

    askForAccount();
  }, [accountSnap?.address]);
};
