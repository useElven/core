import { Address, Account } from '@multiversx/sdk-core';
import { ExtensionProvider } from '@multiversx/sdk-extension-provider';
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

export const useExtensionLogin = (params?: Login) => {
  const { logout } = useLogout();
  const { loggedIn, pending, error } = useLoggingIn();
  const networkStateSnap = useNetwork();
  const { loginToken, nativeAuthClient } = useNativeAuthLoginToken();

  const login = async () => {
    if (!loginToken) {
      setLoggingInState(
        'error',
        'Login token is not present. Please try again.'
      );
      setLoggingInState('pending', false);
      return;
    }

    const providerInstance = ExtensionProvider.getInstance();

    try {
      if (!providerInstance.isInitialized()) {
        const isSuccessfullyInitialized: boolean =
          await providerInstance.init();

        if (!isSuccessfullyInitialized) {
          const error =
            'Something went wrong trying to redirect to wallet login..';
          console.warn(error);
          setLoggingInState('error', `Error logging in ${error}`);
          return;
        }
      }

      setLoginInfoState('loginMethod', LoginMethodsEnum.extension);

      const callbackUrl: string =
        typeof window !== 'undefined'
          ? encodeURIComponent(
              `${window.location.origin}${params?.callbackRoute}`
            )
          : '/';
      const providerLoginData = {
        callbackUrl,
        token: loginToken,
      };

      try {
        await providerInstance.login(providerLoginData);
        setLoggingInState('pending', true);
      } catch (e) {
        const err = errorParse(e);
        console.warn(err);
        setLoggingInState('error', `Error logging in ${err}`);
        return;
      }

      setNetworkState('dappProvider', providerInstance);

      const { signature, address } = providerInstance.account;

      const userAddressInstance = new Address(address);
      const userAccountInstance = new Account(userAddressInstance);

      if (networkStateSnap.apiNetworkProvider) {
        try {
          const userAccountOnNetwork =
            await networkStateSnap.apiNetworkProvider.getAccount(
              userAddressInstance
            );
          userAccountInstance.update(userAccountOnNetwork);

          setAccountState('address', userAccountInstance.address.bech32());
          setAccountState('nonce', userAccountInstance.nonce.valueOf());
          setAccountState('balance', userAccountInstance.balance.toString());
        } catch (e) {
          const err = errorParse(e);
          console.warn(err);
          setLoggingInState('error', `Error logging in ${err}`);
          return;
        }
      }

      setLoginInfoState('loginToken', loginToken);
      setLoginInfoState('expires', getNewLoginExpiresTimestamp());
      setLoggingInState('loggedIn', Boolean(address));

      if (signature && nativeAuthClient) {
        setLoginInfoState('signature', signature);
        const accessToken = nativeAuthClient.getToken(
          address,
          loginToken,
          signature
        );
        setLoginInfoState('accessToken', accessToken);
      }

      optionalRedirect(params?.callbackRoute);
    } catch (e) {
      const err = errorParse(e);
      setLoggingInState('error', `Error logging in ${err}`);
    } finally {
      setLoggingInState('pending', false);
    }
  };

  return {
    login,
    loggedIn,
    pending,
    error,
    logout,
    setLoggingInState,
  };
};
