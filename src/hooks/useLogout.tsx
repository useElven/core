import { clearDappProvider } from '../store/network';
import { clearAuthStates, setLoggingInState } from '../store/auth';
import { DappProvider } from '../types/network';
import { errorParse } from '../utils/errorParse';
import { useLoggingIn } from './useLoggingIn';
import { useNetwork } from './useNetwork';
import { optionalRedirect } from '../utils/optionalRedirect';
import { getCallbackUrl } from '../utils/getCallbackUrl';

export interface Logout {
  dappProvider?: DappProvider;
  callbackUrl?: string;
}

export const useLogout = () => {
  const { pending, loggedIn, error } = useLoggingIn();
  const networkStateSnap = useNetwork();

  const logout = async (params?: Logout) => {
    const dappProvider = params?.dappProvider || networkStateSnap.dappProvider;

    if (!dappProvider) {
      clearAuthStates();
      setLoggingInState('loggedIn', false);
    } else {
      try {
        setLoggingInState('pending', true);
        await dappProvider.logout();

        if (params?.callbackUrl) {
          optionalRedirect(getCallbackUrl(params?.callbackUrl));
        }

        setLoggingInState('loggedIn', false);
      } catch (e) {
        const err = errorParse(e);
        console.error('error logging out', err);
        setLoggingInState('error', err);
      } finally {
        setLoggingInState('pending', false);
        clearAuthStates();
        clearDappProvider();
      }
    }
  };

  return {
    logout,
    pending,
    loggedIn,
    error,
  };
};
