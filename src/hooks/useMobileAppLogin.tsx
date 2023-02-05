/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useRef } from 'react';
import { Account, Address } from '@multiversx/sdk-core';
import { WalletConnectProvider } from '@multiversx/sdk-wallet-connect-provider';
import { LoginMethodsEnum } from '../types/enums';
import {
  setAccountState,
  setLoggingInState,
  setLoginInfoState,
} from '../store/auth';
import { setNetworkState } from '../store/network';
import { getBridgeAddressFromNetwork } from '../utils/bridgeAddress';
import { getNewLoginExpiresTimestamp } from '../utils/expiresAt';
import { WcOnLogin } from '../utils/walletConnectCbs';
import { useLogout } from './useLogout';
import { Login } from '../types/account';
import { useLoggingIn } from './useLoggingIn';
import { errorParse } from '../utils/errorParse';
import { DappProvider } from '../types/network';
import { ApiNetworkProvider } from '@multiversx/sdk-network-providers/out';
import { useConfig } from './useConfig';
import { useNetwork } from './useNetwork';

export const useMobileAppLogin = (params?: Login) => {
  const { logout } = useLogout();
  const { loggedIn, pending, error } = useLoggingIn();
  const [walletConnectUri, setWalletConnectUri] = useState('');
  const networkStateSnap = useNetwork();
  const configStateSnap = useConfig();

  const dappProviderRef = useRef<DappProvider>(
    networkStateSnap.dappProvider as DappProvider
  );

  const handleOnLogout = () => {
    logout({
      callbackRoute: params?.callbackRoute,
      dappProvider: dappProviderRef?.current,
    });
  };

  const login = async () => {
    const bridgeAddress = getBridgeAddressFromNetwork(
      configStateSnap.walletConnectBridgeAddresses as string[]
    );

    if (!bridgeAddress || !networkStateSnap.apiNetworkProvider) {
      throw Error(
        "Something wen't wrong with the initialization (ApiNetworkProvider or Wallet Connect Bridge address), plese try to refresh the page!"
      );
    }

    const providerHandlers = {
      onClientLogin: async () => {
        if (dappProviderRef.current instanceof WalletConnectProvider) {
          const address = await dappProviderRef.current.getAddress();
          const signature = await dappProviderRef.current.getSignature();
          const account = new Account(new Address(address));

          setAccountState('address', address);
          setAccountState('balance', account.balance.toString());
          setAccountState('nonce', account.nonce.valueOf());

          setLoggingInState('loggedIn', Boolean(address));
          if (signature) {
            setLoginInfoState('signature', signature);
          }
          if (params?.token) {
            setLoginInfoState('loginToken', params?.token);
          }

          setNetworkState('dappProvider', dappProviderRef.current);

          WcOnLogin(
            networkStateSnap.apiNetworkProvider as ApiNetworkProvider,
            dappProviderRef.current,
            params?.callbackRoute
          );
        }
      },
      onClientLogout: handleOnLogout,
    };

    const generateWcUri = (bridgeAddress: string, walletConnectUri: string) => {
      if (!bridgeAddress) return;

      const hasUri = Boolean(walletConnectUri);

      if (!hasUri) return;

      if (!params?.token) {
        setWalletConnectUri(walletConnectUri);
      } else {
        const wcUriWithToken = `${walletConnectUri}&token=${params.token}`;
        setWalletConnectUri(wcUriWithToken);
      }
    };

    const providerInstance = new WalletConnectProvider(
      bridgeAddress,
      providerHandlers
    );

    try {
      const walletConnectUri: string | undefined =
        await providerInstance.login();

      dappProviderRef.current = providerInstance;

      setLoginInfoState('expires', getNewLoginExpiresTimestamp());
      setLoginInfoState('loginMethod', LoginMethodsEnum.walletconnect);

      generateWcUri(bridgeAddress, walletConnectUri);
      setLoggingInState('pending', true);
    } catch (e) {
      const err = errorParse(e);
      setLoggingInState('error', `Error logging in ${err}`);
    } finally {
      setLoggingInState('pending', false);
    }
  };

  return {
    login,
    walletConnectUri,
    loggedIn,
    pending,
    error,
    logout,
  };
};
