import { WalletProvider } from '@multiversx/sdk-web-wallet-provider';
import { WalletConnectV2Provider } from '@multiversx/sdk-wallet-connect-provider';
import { ExtensionProvider } from '@multiversx/sdk-extension-provider';
import {
  ApiNetworkProvider,
  ProxyNetworkProvider,
} from '@multiversx/sdk-network-providers';
import { HWProvider } from '@multiversx/sdk-hw-provider';

export interface BaseNetworkType
  extends Record<string, string | string[] | undefined> {
  chainType?: string;
  shortId?: string;
  name?: string;
  egldLabel?: string;
  egldDenomination?: string;
  decimals?: string;
  gasPerDataByte?: string;
  walletConnectDeepLink?: string;
  xAliasAddress?: string;
  walletAddress?: string;
  apiAddress?: string;
  explorerAddress?: string;
  IPFSGateway?: string;
  apiTimeout?: string;
}

export interface NetworkType extends BaseNetworkType {
  walletConnectV2RelayAddresses?: string[];
  walletConnectV2ProjectId?: string;
}

export type DappProvider =
  | ExtensionProvider
  | WalletConnectV2Provider
  | WalletProvider
  | HWProvider;

export type NetworkProvider = ApiNetworkProvider | ProxyNetworkProvider;
