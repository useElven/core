import { getNativeAuthClient } from 'src/utils/getNativeAuthClient';
import {
  setLoginInfoState,
  loginInfoState,
  setLoggingInState,
} from '../../store/auth';
import { errorParse } from 'src/utils/errorParse';

export const getLoginToken = async () => {
  const client = getNativeAuthClient();
  let token = loginInfoState.loginToken;

  if (!token) {
    try {
      setLoggingInState('pending', true);
      token = await client.initialize();
    } catch (e) {
      setLoggingInState('error', errorParse(e));
    } finally {
      setLoggingInState('pending', false);
    }
  }

  setLoginInfoState('loginToken', token);
  return token;
};
