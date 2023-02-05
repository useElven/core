import { useProxy } from './useProxy';
import { loggingInState } from '../store/auth';

export const useLoggingIn = () => {
  const { pending, error, loggedIn } = useProxy(loggingInState);

  return { pending, error, loggedIn };
};
