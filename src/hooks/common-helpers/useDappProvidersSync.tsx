import { useRef, MutableRefObject } from 'react';
import { ApiNetworkProvider } from '@multiversx/sdk-network-providers';
import { WalletProvider } from '@multiversx/sdk-web-wallet-provider';
import { WalletConnectProvider } from '@multiversx/sdk-wallet-connect-provider';
import { ExtensionProvider } from '@multiversx/sdk-extension-provider';
import * as network from '../../store/network';
import { HWProvider } from '@multiversx/sdk-hw-provider';
import { DappProvider } from '../../types/network';
import { DAPP_INIT_ROUTE } from '../../config/network';
import { getBridgeAddressFromNetwork } from '../../utils/bridgeAddress';
import { getParamFromUrl } from '../../utils/getParamFromUrl';
import { LoginMethodsEnum } from '../../types/enums';
import { WcOnLogin } from '../../utils/walletConnectCbs';
import { clearDappProvider } from '../../store/network';
import {
  clearAuthStates,
  setAccountState,
  setLoginInfoState,
} from '../../store/auth';
import { isLoginExpired } from '../../utils/expiresAt';
import { useEffectOnlyOnUpdate } from '../useEffectOnlyOnUpdate';
import { Address, Account } from '@multiversx/sdk-core';
import { useLogout } from '../useLogout';
import { useConfig } from '../useConfig';
import { useAccount } from '../useAccount';
import { useLoginInfo } from '../useLoginInfo';

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
};
