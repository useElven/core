import { useRef, MutableRefObject } from 'react';
import { ApiNetworkProvider } from '@multiversx/sdk-network-providers';
import { WalletProvider } from '@multiversx/sdk-web-wallet-provider';
import {
  WalletConnectV2Provider,
  SessionEventTypes,
} from '@multiversx/sdk-wallet-connect-provider';
import { ExtensionProvider } from '@multiversx/sdk-extension-provider';
import { setNetworkState } from '../../store/network';
import { HWProvider } from '@multiversx/sdk-hw-provider';
import { DappProvider } from '../../types/network';
import { DAPP_INIT_ROUTE } from '../../config/network';
import { getRelayAddressFromNetwork } from '../../utils/relayAddress';
import { getParamFromUrl } from '../../utils/getParamFromUrl';
import { LoginMethodsEnum, LocalstorageKeys } from '../../types/enums';
import { WcOnLogin } from '../../utils/walletConnectCbs';
import { clearDappProvider } from '../../store/network';
import {
  clearAuthStates,
  setAccountState,
  setLoginInfoState,
} from '../../store/auth';
import {
  getNewLoginExpiresTimestamp,
  isLoginExpired,
} from '../../utils/expiresAt';
import { useEffectOnlyOnUpdate } from '../useEffectOnlyOnUpdate';
import { Address, Account } from '@multiversx/sdk-core';
import { useLogout } from '../useLogout';
import { useConfig } from '../useConfig';
import { useAccount } from '../useAccount';
import { useLoginInfo } from '../useLoginInfo';
import { getNativeAuthClient } from '../../utils/getNativeAuthClient';
import { decodeNativeAuthToken } from '../../utils/decode-native-auth-token';
import { WebviewProvider } from '@multiversx/sdk-webview-provider';

export const useDappProvidersSync = (
  accountDone: boolean,
  loginInfoDone: boolean,
  apiNetworkProviderRef: MutableRefObject<ApiNetworkProvider | undefined>
) => {
  const dappProviderRef = useRef<DappProvider>();
  const { logout } = useLogout();

  const accountSnap = useAccount();
  const loginInfoSnap = useLoginInfo();
  const configStateSnap = useConfig();

  useEffectOnlyOnUpdate(() => {
    const askForDappProvider = async () => {
      const loginMethod = loginInfoSnap.loginMethod;
      const loginToken = loginInfoSnap.loginToken;
      const loginExpires = loginInfoSnap.expires;

      let dappProvider = dappProviderRef?.current;

      if (loginExpires && isLoginExpired(loginExpires)) {
        clearAuthStates();
        clearDappProvider();
        localStorage.removeItem(LocalstorageKeys.account);
        localStorage.removeItem(LocalstorageKeys.loginInfo);
        return;
      }

      if (!dappProvider) {
        switch (loginMethod) {
          // Browser extension auth
          case LoginMethodsEnum.extension: {
            dappProvider = ExtensionProvider.getInstance();
            try {
              await dappProvider.init();
              if (!dappProvider.isInitialized()) {
                console.warn(
                  'Something went wrong trying to sync with the extension! Try to connect again.'
                );
                await logout();
              } else {
                dappProvider.setAddress(accountSnap.address);
                setNetworkState('dappProvider', dappProvider);
              }
            } catch (e) {
              console.warn("Can't initialize the Dapp Provider!");
            }
            break;
          }
          // xPortal mobile app auth
          case LoginMethodsEnum.walletconnect: {
            if (!configStateSnap.shortId || !configStateSnap.chainType) {
              console.warn(
                'Please configure chainType in useSyncNetwork hook!'
              );
              return;
            }

            if (!configStateSnap.walletConnectV2ProjectId) {
              console.warn(
                'Please configure walletConnectV2ProjectId in useSyncNetwork hook!'
              );
              return;
            }

            const providerHandlers = {
              onClientLogin: () =>
                WcOnLogin(
                  apiNetworkProviderRef?.current,
                  dappProviderRef?.current as WalletConnectV2Provider
                ),
              onClientLogout: () =>
                logout({ dappProvider: dappProviderRef?.current }),
              onClientEvent: (event: SessionEventTypes['event']) => {
                console.info('wc2 session event: ', event);
              },
            };

            const relayAddress = getRelayAddressFromNetwork(
              configStateSnap.walletConnectV2RelayAddresses as string[]
            );

            if (!relayAddress) {
              console.warn(
                "Can't read the relay address. Try to provide one in useSyncNetwok hook!"
              );
              return;
            }

            dappProvider = new WalletConnectV2Provider(
              providerHandlers,
              configStateSnap.shortId,
              relayAddress,
              configStateSnap.walletConnectV2ProjectId
            );
            dappProviderRef.current = dappProvider;
            try {
              await dappProvider.init();
              if (!dappProvider.isInitialized()) {
                console.warn(
                  'Something went wrong trying to sync with the xPortal app!'
                );
                await logout();
              } else {
                setNetworkState('dappProvider', dappProvider);
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
              setNetworkState('dappProvider', dappProvider);
              const userAddressInstance = new Address(address);
              const userAccountInstance = new Account(userAddressInstance);
              setAccountState('address', userAccountInstance.address.bech32());
            }

            if (signature && address && loginToken) {
              const nativeAuthClient = getNativeAuthClient();
              const accessToken = nativeAuthClient.getToken(
                address,
                loginToken,
                signature
              );
              setLoginInfoState('accessToken', accessToken);
              dappProviderRef.current = dappProvider;
            }
            break;
          }
          // xAlias auth
          case LoginMethodsEnum.xalias: {
            const address = getParamFromUrl('address') || accountSnap?.address;
            const signature = getParamFromUrl('signature');
            if (signature) {
              setLoginInfoState('signature', signature);
            }

            if (address) {
              dappProvider = new WalletProvider(
                `${configStateSnap.xAliasAddress}${DAPP_INIT_ROUTE}`
              );
              setNetworkState('dappProvider', dappProvider);
              const userAddressInstance = new Address(address);
              const userAccountInstance = new Account(userAddressInstance);
              setAccountState('address', userAccountInstance.address.bech32());
            }

            if (signature && address && loginToken) {
              const nativeAuthClient = getNativeAuthClient();
              const accessToken = nativeAuthClient.getToken(
                address,
                loginToken,
                signature
              );
              setLoginInfoState('accessToken', accessToken);
              dappProviderRef.current = dappProvider;
            }
            break;
          }
          // Ledger Hardware Wallet auth
          case LoginMethodsEnum.ledger: {
            dappProvider = new HWProvider();
            dappProviderRef.current = dappProvider;
            setNetworkState('dappProvider', dappProvider);
            try {
              await dappProvider.init();
              if (!dappProvider.isInitialized()) {
                console.warn(
                  'Something went wrong trying to sync with the Ledger!'
                );
                await logout();
              } else {
                dappProvider.setAddressIndex(accountSnap.addressIndex);
                setNetworkState('dappProvider', dappProvider);
              }
            } catch {
              console.warn("Can't initialize the Dapp Provider!");
            }
            break;
          }
          // xPortal or Web wallet apps hub auth
          case LoginMethodsEnum.hub: {
            const accessToken = getParamFromUrl('accessToken');
            if (accessToken) {
              const nativeAuthInfo = decodeNativeAuthToken(accessToken);

              if (!nativeAuthInfo) {
                localStorage.removeItem(LocalstorageKeys.loginInfo);
                return;
              }

              const { signature, address, body } = nativeAuthInfo;

              setLoginInfoState('loginToken', body);
              setLoginInfoState('accessToken', accessToken);
              setLoginInfoState('signature', signature);
              setLoginInfoState('loginMethod', LoginMethodsEnum.hub);
              setLoginInfoState('expires', getNewLoginExpiresTimestamp());

              setAccountState('address', address);

              dappProvider = new WebviewProvider();

              setNetworkState('dappProvider', dappProvider);
            }

            break;
          }
        }
      }
    };
    askForDappProvider();
  }, [accountDone, loginInfoDone]);
};
