import { useWebWalletXaliasLogin } from './common-helpers/useWebWalletXaliasLogin';
import { Login } from '../types/account';

export const useXaliasLogin = (params: Login | undefined) => {
  return useWebWalletXaliasLogin('xalias', params);
};
