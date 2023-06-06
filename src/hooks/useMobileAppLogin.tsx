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
import { getLoginToken } from './common-helpers/loginTokenState';
import { getNativeAuthClient } from 'src/utils/getNativeAuthClient';

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
    const loginToken = await getLoginToken();

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

          const nativeAuthClient = getNativeAuthClient();

          if (signature && nativeAuthClient) {
            setLoginInfoState('signature', signature);
            const accessToken = nativeAuthClient.getToken(
              address,
              loginToken,
              signature
            );
            setLoginInfoState('accessToken', accessToken);
          }
          setLoginInfoState('loginToken', loginToken);

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

      const wcUriWithToken = `${walletConnectUri}&token=${loginToken}`;
      setWalletConnectUri(wcUriWithToken);
    };

    const providerInstance = new WalletConnectV2Provider(
      providerHandlers,
      configStateSnap.shortId,
      relayAddress,
      configStateSnap.walletConnectV2ProjectId
    );

    try {
      dappProviderRef.current = providerInstance;

      await providerInstance.init();

      const { uri: walletConnectUri, approval } =
        await providerInstance.connect({
          methods: ['mvx_cancelAction'],
        });

      if (walletConnectUri) {
        setLoginInfoState('loginMethod', LoginMethodsEnum.walletconnect);
        generateWcUri(relayAddress, walletConnectUri);
        setWalletConnectPairings(providerInstance.pairings);

        await providerInstance.login({
          token: loginToken,
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
      setLoggingInState('pending', true);
      try {
        const { approval } = await dappProvider.connect({
          topic,
          methods: ['mvx_cancelAction'],
        });

        setLoginInfoState('loginMethod', LoginMethodsEnum.walletconnect);

        const loginToken = await getLoginToken();

        await dappProvider.login({
          token: loginToken,
          approval,
        });

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
        const activePairings = walletConnectPairings?.filter(
          (pairing) => pairing.topic !== topic
        );
        setWalletConnectPairings(activePairings);
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
    setLoggingInState,
  };
};
