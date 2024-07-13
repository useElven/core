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
import { LocalstorageKeys, LoginMethodsEnum } from '../../types/enums';
import { getParamFromUrl } from '../../utils/getParamFromUrl';

export const useLocalStorageSync = (
  setAccountDone: (state: boolean) => void,
  setLoginInfoDone: (state: boolean) => void
) => {
  const accountSnap = useAccount();
  const loginInfoSnap = useLoginInfo();

  // Set Hub login method when detected
  useEffect(() => {
    const nativeAuthTokenFromUrl = getParamFromUrl('accessToken');
    if (nativeAuthTokenFromUrl) {
      localStorage.setItem(
        LocalstorageKeys.loginInfo,
        JSON.stringify({ loginMethod: LoginMethodsEnum.hub })
      );
    }
  }, []);

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
    setAccountState(
      'activeGuardianAddress',
      parsedStorage.activeGuardianAddress
    );
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
      setLoginInfoState('accessToken', parsedStorage.accessToken);
      setLoginInfoDone(true);
    }
  }, []);

  // When working for example with multiple tabs we need to synchronize at least the nonce
  useEffect(() => {
    function handleStorageChange(event: StorageEvent) {
      if (event.key === LocalstorageKeys.account) {
        const accountStorage = localStorage.getItem(LocalstorageKeys.account);
        if (accountStorage) {
          const parsedStorage = JSON.parse(accountStorage);
          setAccountState('nonce', parsedStorage.nonce);
          setAccountState('balance', parsedStorage.balance);
        }
      }
    }

    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  useEffectOnlyOnUpdate(() => {
    localStorage.setItem(LocalstorageKeys.account, JSON.stringify(accountSnap));
  }, [
    accountSnap.address,
    accountSnap.nonce,
    accountSnap.balance,
    accountSnap.addressIndex,
    accountSnap.activeGuardianAddress,
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
    loginInfoSnap.accessToken,
  ]);
};
