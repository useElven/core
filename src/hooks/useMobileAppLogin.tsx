/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useRef } from 'react';
import { Account, Address } from '@multiversx/sdk-core';
import {
  WalletConnectV2Provider,
  SessionEventTypes,
  PairingTypes,
} from '@multiversx/sdk-wallet-connect-provider';
import { LoginMethodsEnum } from '../types/enums';
import {
  setAccountState,
  setLoggingInState,
  setLoginInfoState,
} from '../store/auth';
import { setNetworkState } from '../store/network';
import { getRelayAddressFromNetwork } from '../utils/relayAddress';
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
  const [walletConnectPairings, setWalletConnectPairings] = useState<
    PairingTypes.Struct[] | undefined
  >();
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
    const relayAddress = getRelayAddressFromNetwork(
      configStateSnap.walletConnectV2RelayAddresses as string[]
    );

    if (!relayAddress || !networkStateSnap.apiNetworkProvider) {
      const error =
        "Something wen't wrong with the initialization (ApiNetworkProvider or Wallet Connect Relay address), plese try to refresh the page!";
      console.warn(error);
      setLoggingInState('error', `Error logging in ${error}`);
      return;
    }

    if (!configStateSnap.shortId || !configStateSnap.chainType) {
      const error = 'Please configure chainType in useSyncNetwork hook!';
      console.warn(error);
      setLoggingInState('error', `Error logging in ${error}`);
      return;
    }

    if (!configStateSnap.walletConnectV2ProjectId) {
      const error =
        'Please configure walletConnectV2ProjectId in useSyncNetwork hook!';
      console.warn(error);
      setLoggingInState('error', `Error logging in ${error}`);
      return;
    }

    const providerHandlers = {
      onClientLogin: async () => {
        if (dappProviderRef.current instanceof WalletConnectV2Provider) {
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
      onClientEvent: (event: SessionEventTypes['event']) => {
        console.info('wc2 session event: ', event);
      },
    };

    const generateWcUri = (relayAddress: string, walletConnectUri: string) => {
      if (!relayAddress) return;

      const hasUri = Boolean(walletConnectUri);

      if (!hasUri) return;

      if (!params?.token) {
        setWalletConnectUri(walletConnectUri);
      } else {
        const wcUriWithToken = `${walletConnectUri}&token=${params.token}`;
        setWalletConnectUri(wcUriWithToken);
      }
    };

    const providerInstance = new WalletConnectV2Provider(
      providerHandlers,
      configStateSnap.shortId,
      relayAddress,
      configStateSnap.walletConnectV2ProjectId
    );

    try {
      dappProviderRef.current = providerInstance;

      const { uri: walletConnectUri, approval } =
        await providerInstance.connect({
          methods: ['erd_cancelAction'],
        });

      if (walletConnectUri) {
        setLoginInfoState('loginMethod', LoginMethodsEnum.walletconnect);
        generateWcUri(relayAddress, walletConnectUri);
        setWalletConnectPairings(providerInstance.pairings);

        await providerInstance.login({
          token: params?.token,
          approval,
        });

        setLoggingInState('pending', true);
        setLoginInfoState('expires', getNewLoginExpiresTimestamp());
      }
    } catch (e) {
      const err = errorParse(e);
      setLoggingInState('error', `Error logging in ${err}`);
    } finally {
      setLoggingInState('pending', false);
    }
  };

  const walletConnectPairingLogin = async (topic: string) => {
    const dappProvider = dappProviderRef.current;
    if (dappProvider instanceof WalletConnectV2Provider) {
      try {
        const { approval } = await dappProvider.connect({
          topic,
          methods: ['erd_cancelAction'],
        });

        setLoginInfoState('loginMethod', LoginMethodsEnum.walletconnect);

        await dappProvider.login({
          token: params?.token,
          approval,
        });

        setLoggingInState('pending', true);
        setLoginInfoState('expires', getNewLoginExpiresTimestamp());
      } catch (e) {
        const err = errorParse(e);
        setLoggingInState('error', `Error logging in ${err}`);
      } finally {
        setLoggingInState('pending', false);
      }
    }
  };

  const walletConnectRemovePairing = async (topic: string) => {
    const dappProvider = dappProviderRef.current;
    if (dappProvider instanceof WalletConnectV2Provider && topic) {
      try {
        await dappProvider.logout({
          topic,
        });
      } catch (e) {
        const err = errorParse(e);
        setLoggingInState(
          'error',
          `Something went wrong trying to remove the existing pairing: ${err}`
        );
      } finally {
        setWalletConnectPairings(dappProvider.pairings);
      }
    }
  };

  return {
    login,
    walletConnectUri,
    walletConnectPairings,
    walletConnectPairingLogin,
    walletConnectRemovePairing,
    loggedIn,
    pending,
    error,
    logout,
  };
};
