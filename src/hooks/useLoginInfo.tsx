import { useProxy } from './useProxy';
import { loginInfoState } from '../store/auth';

export const useLoginInfo = () => {
  const { loginMethod, expires, loginToken, signature } =
    useProxy(loginInfoState);

  return { loginMethod, expires, loginToken, signature };
};
