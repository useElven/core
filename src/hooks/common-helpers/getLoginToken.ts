import { getNativeAuthClient } from '../../utils/getNativeAuthClient';
import {
  setLoginInfoState,
  loginInfoState,
  setLoggingInState,
} from '../../store/auth';
import { errorParse } from '../../utils/errorParse';
import { configState } from '../../store/config';

export const getLoginToken = async () => {
  const client = getNativeAuthClient();
  let token = loginInfoState.loginToken;

  if (!token) {
    try {
      setLoggingInState('pending', true);
      token = await client.initialize({
        apiUrl: configState?.apiAddress || '',
        origin:
          typeof window !== 'undefined' &&
          typeof window.location !== 'undefined'
            ? window.location.origin
            : '',
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
