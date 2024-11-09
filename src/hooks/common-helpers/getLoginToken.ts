import { getNativeAuthClient } from '../../utils/getNativeAuthClient';
import {
  setLoginInfoState,
  loginInfoState,
  setLoggingInState,
} from '../../store/auth';
import { errorParse } from '../../utils/errorParse';

export const getLoginToken = async () => {
  const client = getNativeAuthClient();
  let token = loginInfoState.loginToken;

  if (!token) {
    try {
      setLoggingInState('pending', true);
      token = await client.initialize({
        timestamp: `${Math.floor(Date.now() / 1000)}`,
      });
    } catch (e) {
      setLoggingInState('error', errorParse(e));
    } finally {
      setLoggingInState('pending', false);
    }
  }

  setLoginInfoState('loginToken', token);
  return token;
};
