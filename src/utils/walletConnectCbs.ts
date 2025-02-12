import { Address, Account } from '@multiversx/sdk-core';
import { WalletConnectV2Provider } from '@multiversx/sdk-wallet-connect-provider';
import { ApiNetworkProvider } from '@multiversx/sdk-core';
import { setAccountState, setLoginInfoState } from '../store/auth';
import { LoginMethodsEnum } from '../types/enums';
import { optionalRedirect } from '../utils/optionalRedirect';
import { errorParse } from './errorParse';
import { getCallbackUrl } from './getCallbackUrl';

export const WcOnLogin = async (
  apiNetworkProvider?: ApiNetworkProvider,
  dappProvider?: WalletConnectV2Provider,
  callbackUrl?: string
) => {
  const address = dappProvider?.getAddress();

  if (apiNetworkProvider && address) {
    const userAddressInstance = new Address(address);
    const userAccountInstance = new Account(userAddressInstance);

    try {
      const userAccountOnNetwork =
        await apiNetworkProvider.getAccount(userAddressInstance);
      const userGuardianOnNetwork =
        await apiNetworkProvider.getGuardianData(userAddressInstance);
      userAccountInstance.update(userAccountOnNetwork);
      setAccountState('address', userAccountInstance.address.bech32());
      setAccountState(
        'activeGuardianAddress',
        userGuardianOnNetwork.guarded &&
          userGuardianOnNetwork.activeGuardian?.address.bech32()
          ? userGuardianOnNetwork.activeGuardian.address.bech32()
          : ''
      );
    } catch (e) {
      const err = errorParse(e);
      console.warn(
        `Something went wrong trying to synchronize the user account: ${err}`
      );
    }
  }

  setLoginInfoState('loginMethod', LoginMethodsEnum.walletconnect);

  if (callbackUrl) {
    optionalRedirect(getCallbackUrl(callbackUrl));
  }
};
