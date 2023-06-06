import { getNativeAuthClient } from 'src/utils/getNativeAuthClient';
import {
  setLoginInfoState,
  loginInfoState,
  setLoggingInState,
} from '../../store/auth';

export const getLoginToken = async () => {
  const client = getNativeAuthClient();
  let token = loginInfoState.loginToken;

  if (!token) {
    setLoggingInState('pending', true);
    token = await client.initialize();
    setLoggingInState('pending', false);
  }

  setLoginInfoState('loginToken', token);
  return token;
};
