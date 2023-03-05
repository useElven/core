import { WalletProvider } from '@multiversx/sdk-web-wallet-provider';
import { LoginMethodsEnum } from '../types/enums';
import { getNewLoginExpiresTimestamp } from '../utils/expiresAt';
import { DAPP_INIT_ROUTE } from '../config/network';
import { setLoginInfoState, setLoggingInState } from '../store/auth';
import { useLogout } from './useLogout';
import { Login } from '../types/account';
import { useLoggingIn } from './useLoggingIn';
import { errorParse } from '../utils/errorParse';
import { useConfig } from './useConfig';

export const useWebWalletLogin = (params?: Login) => {
  const { logout } = useLogout();
  const { loggedIn, pending, error } = useLoggingIn();
  const configStateSnap = useConfig();

  const login = async () => {
    setLoggingInState('pending', true);

    const providerInstance = new WalletProvider(
      `${configStateSnap.walletAddress}${DAPP_INIT_ROUTE}`
    );

    const callbackUrl: string =
      typeof window !== 'undefined'
        ? encodeURIComponent(
            `${window.location.origin}${params?.callbackRoute || '/'}`
          )
        : '/';
    const providerLoginData = {
      callbackUrl,
      ...(params?.token && { token: params?.token }),
    };

    try {
      setLoginInfoState('loginMethod', LoginMethodsEnum.wallet);
      await providerInstance.login(providerLoginData);
      setLoginInfoState('expires', getNewLoginExpiresTimestamp());
      if (params?.token) {
        setLoginInfoState('loginToken', params.token);
      }
    } catch (e) {
      const err = errorParse(e);
      setLoggingInState('error', `Error logging in ${err}`);
      setLoginInfoState('loginMethod', '');
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

export default useWebWalletLogin;
