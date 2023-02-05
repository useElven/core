import { clearDappProvider } from '../store/network';
import { clearAuthStates, setLoggingInState } from '../store/auth';
import { DappProvider } from '../types/network';
import { errorParse } from '../utils/errorParse';
import { useLoggingIn } from './useLoggingIn';
import { useNetwork } from './useNetwork';

export interface Logout {
  dappProvider?: DappProvider;
  callbackRoute?: string;
  redirectFn?: (callbackRoute?: string) => void;
}

export const useLogout = () => {
  const { pending, loggedIn, error } = useLoggingIn();
  const networkStateSnap = useNetwork();

  const logout = async (params?: Logout) => {
    const provider = params?.dappProvider || networkStateSnap.dappProvider;
    if (!provider) return;

    try {
      setLoggingInState('pending', true);
      await provider.logout();

      clearAuthStates();
      clearDappProvider();

      if (params?.callbackRoute) {
        if (typeof params?.redirectFn === 'function') {
          params?.redirectFn(params?.callbackRoute);
        } else if (typeof window !== 'undefined') {
          window.location.href = params?.callbackRoute;
        }
      }

      setLoggingInState('loggedIn', false);
    } catch (e) {
      const err = errorParse(e);
      console.error('error logging out', err);
      setLoggingInState('error', err);
    } finally {
      setLoggingInState('pending', false);
    }
  };

  return {
    logout,
    pending,
    loggedIn,
    error,
  };
};
