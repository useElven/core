import { useWebWalletXaliasLogin } from './common-helpers/useWebWalletXaliasLogin';
import { Login } from '../types/account';

export const useWebWalletLogin = (params: Login | undefined) => {
  return useWebWalletXaliasLogin('webwallet', params);
};
