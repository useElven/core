/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect } from 'react';
import {
  setAccountState,
  setLoggingInState,
  setLoginInfoState,
} from '../../store/auth';
import { useEffectOnlyOnUpdate } from '../useEffectOnlyOnUpdate';
import { useAccount } from '../useAccount';
import { useLoginInfo } from '../useLoginInfo';
import { LocalstorageKeys } from '../../types/enums';

export const useLocalStorageSync = (
  setAccountDone: (state: boolean) => void,
  setLoginInfoDone: (state: boolean) => void
) => {
  const accountSnap = useAccount();
  const loginInfoSnap = useLoginInfo();

  useEffect(() => {
    const accountStorage = localStorage.getItem(LocalstorageKeys.account);
    const parsedStorage = accountStorage ? JSON.parse(accountStorage) : null;

    if (!parsedStorage?.address) {
      setLoggingInState('pending', false);
      return;
    }

    setAccountState('address', parsedStorage.address);
    setAccountState('nonce', parsedStorage.nonce);
    setAccountState('balance', parsedStorage.balance);
    setAccountState('addressIndex', parsedStorage.addressIndex);
    setAccountDone(true);
  }, []);

  useEffect(() => {
    const loginInfoStorage = localStorage.getItem(LocalstorageKeys.loginInfo);
    if (loginInfoStorage) {
      const parsedStorage = JSON.parse(loginInfoStorage);
      setLoginInfoState('loginMethod', parsedStorage.loginMethod);
      setLoginInfoState('expires', parsedStorage.expires);
      setLoginInfoState('loginToken', parsedStorage.loginToken);
      setLoginInfoState('signature', parsedStorage.signature);
      setLoginInfoDone(true);
    }
  }, []);

  useEffectOnlyOnUpdate(() => {
    localStorage.setItem(LocalstorageKeys.account, JSON.stringify(accountSnap));
  }, [
    accountSnap.address,
    accountSnap.nonce,
    accountSnap.balance,
    accountSnap.addressIndex,
  ]);

  useEffectOnlyOnUpdate(() => {
    localStorage.setItem(
      LocalstorageKeys.loginInfo,
      JSON.stringify(loginInfoSnap)
    );
  }, [
    loginInfoSnap.loginMethod,
    loginInfoSnap.expires,
    loginInfoSnap.loginToken,
    loginInfoSnap.signature,
  ]);
};
