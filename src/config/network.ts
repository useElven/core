import { NetworkType } from '../types/network';

// Default MultiversX network configuration (constants).

export const DAPP_INIT_ROUTE = '/dapp/init';

export const networkConfig: Record<string, NetworkType> = {
  devnet: {
    chainType: 'devnet',
    shortId: 'D',
    name: 'Devnet',
    egldLabel: 'xEGLD',
    egldDenomination: '18',
    decimals: '4',
    gasPerDataByte: '1500',
    walletConnectDeepLink:
      'https://maiar.page.link/?apn=com.elrond.maiar.wallet&isi=1519405832&ibi=com.elrond.maiar.wallet&link=https://xportal.com/',
    walletConnectV2RelayAddresses: ['wss://relay.walletconnect.com'],
    walletConnectV2ProjectId: '',
    walletAddress: 'https://devnet-wallet.multiversx.com',
    apiAddress: 'https://devnet-api.multiversx.com',
    explorerAddress: 'https://devnet-explorer.multiversx.com',
    IPFSGateway: 'https://devnet-media.multiversx.com/nfts/asset/',
    apiTimeout: '4000',
  },

  testnet: {
    chainType: 'testnet',
    shortId: 'T',
    name: 'Testnet',
    egldLabel: 'xEGLD',
    egldDenomination: '18',
    decimals: '4',
    gasPerDataByte: '1500',
    walletConnectDeepLink:
      'https://maiar.page.link/?apn=com.elrond.maiar.wallet&isi=1519405832&ibi=com.elrond.maiar.wallet&link=https://xportal.com/',
    walletConnectV2RelayAddresses: ['wss://relay.walletconnect.com'],
    walletConnectV2ProjectId: '',
    walletAddress: 'https://testnet-wallet.multiversx.com',
    apiAddress: 'https://testnet-api.multiversx.com',
    explorerAddress: 'https://testnet-explorer.multiversx.com',
    IPFSGateway: 'https://testnet-media.multiversx.com/nfts/asset/',
    apiTimeout: '4000',
  },

  mainnet: {
    chainType: 'mainnet',
    shortId: '1',
    name: 'Mainnet',
    egldLabel: 'EGLD',
    egldDenomination: '18',
    decimals: '4',
    gasPerDataByte: '1500',
    walletConnectDeepLink:
      'https://maiar.page.link/?apn=com.elrond.maiar.wallet&isi=1519405832&ibi=com.elrond.maiar.wallet&link=https://xportal.com/',
    walletConnectV2RelayAddresses: ['wss://relay.walletconnect.com'],
    walletConnectV2ProjectId: '',
    walletAddress: 'https://wallet.multiversx.com',
    apiAddress: 'https://api.multiversx.com',
    explorerAddress: 'https://explorer.multiversx.com',
    IPFSGateway: 'https://media.multiversx.com/nfts/asset/',
    apiTimeout: '4000',
  },
};
