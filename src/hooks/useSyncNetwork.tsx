/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState, useRef } from 'react';
import {
  setAccountState,
  setLoggingInState,
  setLoginInfoState,
} from '../store/auth';
import * as network from '../store/network';
import { Address, Account } from '@multiversx/sdk-core';
import { WalletProvider } from '@multiversx/sdk-web-wallet-provider';
import { WalletConnectProvider } from '@multiversx/sdk-wallet-connect-provider';
import { ExtensionProvider } from '@multiversx/sdk-extension-provider';
import { ApiNetworkProvider } from '@multiversx/sdk-network-providers';
import { HWProvider } from '@multiversx/sdk-hw-provider';
import { DAPP_INIT_ROUTE } from '../config/network';
import { getBridgeAddressFromNetwork } from '../utils/bridgeAddress';
import { getParamFromUrl } from '../utils/getParamFromUrl';
import { LoginMethodsEnum } from '../types/enums';
import { WcOnLogin } from '../utils/walletConnectCbs';
import { useLogout } from './useLogout';
import { useEffectOnlyOnUpdate } from './useEffectOnlyOnUpdate';
import { isLoginExpired } from '../utils/expiresAt';
import { clearDappProvider } from '../store/network';
import { clearAuthStates } from '../store/auth';
import { DappProvider, NetworkType } from '../types/network';
import { errorParse } from '../utils/errorParse';
import { useConfig } from './useConfig';
import { useAccount } from './useAccount';
import { useLoginInfo } from './useLoginInfo';

export const useNetworkSync = (config?: NetworkType) => {
  const { logout } = useLogout();
  const [accountDone, setAccountDone] = useState(false);
  const [loginInfoDone, setLoginInfoDone] = useState(false);

  const accountSnap = useAccount();
  const loginInfoSnap = useLoginInfo();
  let configStateSnap = useConfig();

  const dappProviderRef = useRef<DappProvider>();
  const apiNetworkProviderRef = useRef<ApiNetworkProvider>();

  // Sync main configuration
  useEffect(() => {
    if (config) {
      configStateSnap = { ...configStateSnap, ...config };
    }
  }, []);

  // Sync data from local storage
  useEffect(() => {
    const accountStorage = localStorage.getItem('useElven_dapp__account');
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
    const loginInfoStorage = localStorage.getItem('useElven_dapp__loginInfo');
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
    localStorage.setItem('useElven_dapp__account', JSON.stringify(accountSnap));
  }, [
    accountSnap.address,
    accountSnap.nonce,
    accountSnap.balance,
    accountSnap.addressIndex,
  ]);

  useEffectOnlyOnUpdate(() => {
    localStorage.setItem(
      'useElven_dapp__loginInfo',
      JSON.stringify(loginInfoSnap)
    );
  }, [
    loginInfoSnap.loginMethod,
    loginInfoSnap.expires,
    loginInfoSnap.loginToken,
    loginInfoSnap.signature,
  ]);

  // Api provider sync
  useEffect(() => {
    const askForApiNetworkProvider = async () => {
      let apiNetworkProvider = apiNetworkProviderRef?.current;
      if (!apiNetworkProvider) {
        const publicApiEndpoint = configStateSnap.apiAddress;
        if (publicApiEndpoint) {
          apiNetworkProvider = new ApiNetworkProvider(publicApiEndpoint, {
            timeout: Number(configStateSnap.apiTimeout),
          });
          apiNetworkProviderRef.current = apiNetworkProvider;
          network.setNetworkState('apiNetworkProvider', apiNetworkProvider);
        } else {
          throw Error(
            'There is no public api configured! Check configuration.'
          );
        }
      }
    };
    askForApiNetworkProvider();
  }, []);

  // Dapp Providers sync
  // Each provider has a little bit different logic on sync
  useEffectOnlyOnUpdate(() => {
    const askForDappProvider = async () => {
      const loginMethod = loginInfoSnap.loginMethod;
      const loginExpires = loginInfoSnap.expires;
      let dappProvider = dappProviderRef?.current;

      if (loginExpires && isLoginExpired(loginExpires)) {
        clearAuthStates();
        clearDappProvider();
        localStorage.clear();
        return;
      }

      if (!dappProvider) {
        switch (loginMethod) {
          // Browser extension auth (MultiversX defi wallet)
          case LoginMethodsEnum.extension: {
            dappProvider = ExtensionProvider.getInstance();
            try {
              await dappProvider.init();

              if (!dappProvider.isInitialized()) {
                console.warn(
                  'Something went wrong trying to sync with the extension! Try to connect again.'
                );
                return;
              } else {
                dappProvider.setAddress(accountSnap.address);
                network.setNetworkState('dappProvider', dappProvider);
              }
            } catch (e) {
              console.warn("Can't initialize the Dapp Provider!");
            }
            break;
          }
          // xPortal mobile app auth
          case LoginMethodsEnum.walletconnect: {
            const providerHandlers = {
              onClientLogin: () =>
                WcOnLogin(
                  apiNetworkProviderRef?.current,
                  dappProviderRef?.current as WalletConnectProvider
                ),
              onClientLogout: () =>
                logout({ dappProvider: dappProviderRef?.current }),
            };

            const bridgeAddress = getBridgeAddressFromNetwork(
              configStateSnap.walletConnectBridgeAddresses as string[]
            );
            dappProvider = new WalletConnectProvider(
              bridgeAddress,
              providerHandlers
            );
            dappProviderRef.current = dappProvider;
            try {
              await dappProvider.init();
              if (!dappProvider.isInitialized()) {
                console.warn(
                  'Something went wrong trying to sync with the xPortal app!'
                );
              } else {
                network.setNetworkState('dappProvider', dappProvider);
              }
            } catch {
              console.warn("Can't initialize the Dapp Provider!");
            }
            break;
          }
          // Web wallet auth
          case LoginMethodsEnum.wallet: {
            const address = getParamFromUrl('address') || accountSnap?.address;
            const signature = getParamFromUrl('signature');
            if (signature) {
              setLoginInfoState('signature', signature);
            }
            if (address) {
              dappProvider = new WalletProvider(
                `${configStateSnap.walletAddress}${DAPP_INIT_ROUTE}`
              );
              dappProviderRef.current = dappProvider;
              network.setNetworkState('dappProvider', dappProvider);
              const userAddressInstance = new Address(address);
              const userAccountInstance = new Account(userAddressInstance);
              setAccountState('address', userAccountInstance.address.bech32());
            }
            break;
          }
          case LoginMethodsEnum.ledger: {
            dappProvider = new HWProvider();
            dappProviderRef.current = dappProvider;
            network.setNetworkState('dappProvider', dappProvider);
            try {
              await dappProvider.init();
              if (!dappProvider.isInitialized()) {
                console.warn(
                  'Something went wrong trying to sync with the Ledger!'
                );
              } else {
                dappProvider.setAddressIndex(accountSnap.addressIndex);
                network.setNetworkState('dappProvider', dappProvider);
              }
            } catch {
              console.warn("Can't initialize the Dapp Provider!");
            }
            break;
          }
        }
      }
    };
    askForDappProvider();
  }, [accountDone, loginInfoDone]);

  // Account network sync
  useEffectOnlyOnUpdate(() => {
    const askForAccount = async () => {
      const address = accountSnap.address;
      const loginExpires = loginInfoSnap.expires;
      const apiNetworkProvider = apiNetworkProviderRef.current;
      const loginExpired = loginExpires && isLoginExpired(loginExpires);
      if (!loginExpired && address && apiNetworkProvider) {
        setLoggingInState('pending', true);
        const userAddressInstance = new Address(address);
        const userAccountInstance = new Account(userAddressInstance);
        try {
          const userAccountOnNetwork = await apiNetworkProvider.getAccount(
            userAddressInstance
          );
          userAccountInstance.update(userAccountOnNetwork);
          setAccountState('address', address);
          setAccountState('nonce', userAccountInstance.nonce.valueOf());
          setAccountState('balance', userAccountInstance.balance.toString());
          setLoggingInState('loggedIn', Boolean(address));
        } catch (e) {
          const err = errorParse(e);
          console.warn(
            `Something went wrong trying to synchronize the user account: ${err}`
          );
        } finally {
          setLoggingInState('pending', false);
        }
      }
    };

    askForAccount();
  }, [accountSnap?.address]);
};
