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

export const useLedgerLogin = (params?: Login) => {
  const { logout } = useLogout();
  const { loggedIn, pending, error } = useLoggingIn();
  const networkStateSnap = useNetwork();

  const login = async (addressIndex = 0) => {
    const apiNetworkProvider = networkStateSnap.apiNetworkProvider;
    const dappProvider = networkStateSnap.dappProvider;

    if (!dappProvider) {
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

    if (params?.token) {
      setLoginInfoState('loginToken', String(params.token));
    }

    setAccountState('addressIndex', addressIndex);

    let userAddress;

    try {
      if (params?.token) {
        if (dappProvider instanceof HWProvider) {
          const loginInfo = await dappProvider.tokenLogin({
            token: Buffer.from(`${params?.token}{}`),
            addressIndex,
          });

          if (loginInfo.address) {
            userAddress = loginInfo.address;
          }

          if (loginInfo.signature) {
            setLoginInfoState('signature', loginInfo.signature.hex());
          }
        }
      } else {
        if (dappProvider instanceof HWProvider) {
          const address = await dappProvider.login({ addressIndex });
          if (address) {
            userAddress = address;
          }
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
      const dappProvider = networkStateSnap.dappProvider;
      let hwWalletProvider;

      if (dappProvider instanceof HWProvider) {
        hwWalletProvider = dappProvider;
        if (!hwWalletProvider.isInitialized()) await hwWalletProvider.init();
      } else {
        hwWalletProvider = new HWProvider();
        await hwWalletProvider.init();
        setNetworkState('dappProvider', hwWalletProvider);
      }
      return hwWalletProvider.getAccounts(page, pageSize);
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
