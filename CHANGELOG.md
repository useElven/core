### [0.2.1](https://github.com/useElven/core/releases/tag/v0.2.1) (2023-04-25)
- fixed a bug related to WalletConnect pairings removal and state management in UI

### [0.2.0](https://github.com/useElven/core/releases/tag/v0.2.0) (2023-04-23)
- migration to new major versions of `sdk-core` and `sdk-hw-provider`
- other minor dependecies updates
- adjustments in the code

### [0.1.0](https://github.com/useElven/core/releases/tag/v0.1.0) (2023-03-05)
- migration to Wallet Connect 2. Check the changes in [configuration](https://www.useelven.com/docs/sdk-reference.html). You will need your own WC project id.

### [0.0.8](https://github.com/useElven/core/releases/tag/v0.0.8) (2023-03-04)
- bugfix for not passing the configuration setup in `useNetworkSync`

### [0.0.7](https://github.com/useElven/core/releases/tag/v0.0.7) (2023-03-01)
- export `TransactionArgs` type
- dependencies update

### [0.0.6](https://github.com/useElven/core/releases/tag/v0.0.6) (2023-02-22)
- useTransaction now takes `ITransactionValue` instead of `Number` for value

### [0.0.5](https://github.com/useElven/core/releases/tag/v0.0.5) (2023-02-22)
- fix for useConfig, missing IPFSGateway param

### [0.0.4](https://github.com/useElven/core/releases/tag/v0.0.4) (2023-02-22)
- added public MultiversX IPFS gateways to the default configuration

### [0.0.3](https://github.com/useElven/core/releases/tag/v0.0.3) (2023-02-19)
- fix package.json configuration
- improvements in extension signing states management
- return transaction data in useTransaction before it is completed on chain

### [0.0.2](https://github.com/useElven/core/releases/tag/v0.0.2) (2023-02-15)
- fixed browser extension states handling
- dependencies updates

### [0.0.1](https://github.com/useElven/core/releases/tag/v0.0.1) (2023-02-14)
- initial code - fundamental hooks that were previously used in Next.js Dapp Template
