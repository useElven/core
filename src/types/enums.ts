export enum LoginMethodsEnum {
  ledger = 'ledger',
  walletconnect = 'walletconnect',
  wallet = 'wallet',
  extension = 'extension',
  extra = 'extra',
  none = '',
}

export enum EnvironmentsEnum {
  testnet = 'testnet',
  devnet = 'devnet',
  mainnet = 'mainnet',
  notDefined = '',
}

export enum LocalstorageKeys {
  account = 'useElven_dapp__account',
  loginInfo = 'useElven_dapp__loginInfo',
}
