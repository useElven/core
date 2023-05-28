import { Address, Account } from '@multiversx/sdk-core';
import { HWProvider } from '@multiversx/sdk-hw-provider';
import { LoginMethodsEnum } from '../types/enums';
import { optionalRedirect } from '../utils/optionalRedirect';
import {
  setAccountState,
  setLoginInfoState,
  setLoggingInState,
} from '../store/auth';
import { setNetworkState } from '../store/network';
import { getNewLoginExpiresTimestamp } from '../utils/expiresAt';
import { useLogout } from './useLogout';
import { Login } from '../types/account';
import { useLoggingIn } from './useLoggingIn';
import { errorParse } from '../utils/errorParse';
import { useNetwork } from './useNetwork';
import { useNativeAuthLoginToken } from './useNativeAuthLoginToken';

export const useLedgerLogin = (params?: Login) => {
  const { logout } = useLogout();
  const { loggedIn, pending, error } = useLoggingIn();
  const networkStateSnap = useNetwork();
  const { loginToken, nativeAuthClient } = useNativeAuthLoginToken();

  const login = async (addressIndex = 0) => {
    if (!loginToken) {
      setLoggingInState(
        'error',
        'Login token is not present. Please try again.'
      );
      setLoggingInState('pending', false);
      return;
    }

    const apiNetworkProvider = networkStateSnap.apiNetworkProvider;
    const dappProvider = networkStateSnap.dappProvider;

    if (!dappProvider || !(dappProvider instanceof HWProvider)) {
      try {
        const hwWalletProvider = new HWProvider();
        await hwWalletProvider.init();
        setNetworkState('dappProvider', hwWalletProvider);
      } catch (e) {
        const err = errorParse(e);
        console.warn(err);
        setLoggingInState('error', `Error logging in ${err}`);
        return;
      }
    }

    setLoginInfoState('loginMethod', LoginMethodsEnum.ledger);
    setLoginInfoState('loginToken', loginToken);
    setAccountState('addressIndex', addressIndex);

    let userAddress;

    try {
      if (dappProvider instanceof HWProvider) {
        const loginInfo = await dappProvider.tokenLogin({
          token: Buffer.from(`${loginToken}{}`),
          addressIndex,
        });

        if (loginInfo.address) {
          userAddress = loginInfo.address;
        }

        if (loginInfo.signature && nativeAuthClient) {
          const sigString = loginInfo.signature.toString('hex');
          setLoginInfoState('signature', sigString);
          const accessToken = nativeAuthClient.getToken(
            loginInfo.address,
            loginToken,
            sigString
          );
          setLoginInfoState('accessToken', accessToken);
        }
      }

      setLoggingInState('pending', true);

      if (userAddress) {
        setAccountState('address', userAddress);
        setLoggingInState('loggedIn', Boolean(userAddress));

        if (apiNetworkProvider) {
          const addressInstance = new Address(userAddress);
          const userAccountInstance = new Account(addressInstance);
          const userAccountOnNetwork = await apiNetworkProvider.getAccount(
            addressInstance
          );
          userAccountInstance.update(userAccountOnNetwork);

          setAccountState('nonce', userAccountInstance.nonce.valueOf());
          setAccountState('balance', userAccountInstance.balance.toString());
        }
      }

      setLoginInfoState('expires', getNewLoginExpiresTimestamp());

      optionalRedirect(params?.callbackRoute);
    } catch (e) {
      const err = errorParse(e);
      setLoggingInState('error', `Error logging in ${err}`);
    } finally {
      setLoggingInState('pending', false);
    }
  };

  const getHWAccounts = async (page = 0, pageSize = 10) => {
    try {
      const hwWalletProvider =
        networkStateSnap.dappProvider instanceof HWProvider
          ? networkStateSnap.dappProvider
          : new HWProvider();
      !hwWalletProvider.isInitialized() && (await hwWalletProvider.init());
      setNetworkState('dappProvider', hwWalletProvider);
      return await hwWalletProvider.getAccounts(page, pageSize);
    } catch (e) {
      const err = errorParse(e);
      console.warn(err);
      setLoggingInState('error', `Error logging in ${err}`);
      return [];
    }
  };

  return {
    login,
    loggedIn,
    pending,
    getHWAccounts,
    error,
    logout,
    setLoggingInState,
  };
};
