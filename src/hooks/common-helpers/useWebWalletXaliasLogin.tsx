import { WalletProvider } from '@multiversx/sdk-web-wallet-provider';
import { LoginMethodsEnum } from '../../types/enums';
import { getNewLoginExpiresTimestamp } from '../../utils/expiresAt';
import { DAPP_INIT_ROUTE } from '../../config/network';
import { setLoginInfoState, setLoggingInState } from '../../store/auth';
import { useLogout } from '../useLogout';
import { Login } from '../../types/account';
import { useLoggingIn } from '../useLoggingIn';
import { errorParse } from '../../utils/errorParse';
import { useConfig } from '../useConfig';
import { getLoginToken } from '../common-helpers/getLoginToken';
import { useEffect } from 'react';
import { getParamFromUrl } from '../../utils/getParamFromUrl';
import { getCallbackUrl } from '../../utils/getCallbackUrl';

export const useWebWalletXaliasLogin = (
  type: 'webwallet' | 'xalias',
  params?: Login
) => {
  const { logout } = useLogout();
  const { loggedIn, pending, error } = useLoggingIn();
  const configStateSnap = useConfig();

  // Web wallet cleanup after logging in
  useEffect(() => {
    const addressUrl = getParamFromUrl('address');
    const signatureUrl = getParamFromUrl('signature');
    if (addressUrl && signatureUrl && loggedIn) {
      window.history.replaceState(null, '', window.location.pathname);
    }
  }, [loggedIn]);

  const login = async () => {
    setLoggingInState('pending', true);

    const loginToken = await getLoginToken();

    const providerInstance = new WalletProvider(
      `${
        configStateSnap[type === 'xalias' ? 'xAliasAddress' : 'walletAddress']
      }${DAPP_INIT_ROUTE}`
    );

    const providerLoginData = {
      callbackUrl: getCallbackUrl(params?.callbackUrl),
      token: loginToken,
    };

    try {
      setLoginInfoState(
        'loginMethod',
        type === 'xalias' ? LoginMethodsEnum.xalias : LoginMethodsEnum.wallet
      );
      await providerInstance.login(providerLoginData);
      setLoginInfoState('expires', getNewLoginExpiresTimestamp());
      setLoginInfoState('loginToken', loginToken);
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
