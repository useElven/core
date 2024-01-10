export enum LoginMethodsEnum {
  ledger = 'ledger',
  walletconnect = 'walletconnect',
  wallet = 'wallet',
  extension = 'extension',
  xalias = 'xalias',
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

export enum WebWalletUrlParamsEnum {
  hasWebWalletGuardianSign = 'hasWebWalletGuardianSign',
}

export enum ESDTType {
  FungibleESDT = 'FungibleESDT',
  MetaESDT = 'MetaESDT',
  NonFungibleESDT = 'NonFungibleESDT',
  SemiFungibleESDT = 'SemiFungibleESDT',
}
