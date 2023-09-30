### [0.9.4](https://github.com/useElven/core/releases/tag/v0.9.4) (2023-09-30)
- export `TransactionParams` type
- update dependencies

### [0.9.3](https://github.com/useElven/core/releases/tag/v0.9.3) (2023-09-28)
- support domains with the port number in native auth token initialization
- pass api url configuration (overwrite) to native auth token initialization
- update dependencies

### [0.9.2](https://github.com/useElven/core/releases/tag/v0.9.2) (2023-09-23)
- fix unnecessary calls for guardian data
- update dependencies

### [0.9.1](https://github.com/useElven/core/releases/tag/v0.9.1) (2023-08-27)
- add 'use client' banner (preparing for better support of the Next.js 'app router' architecture)
- update dependencies

### [0.9.0](https://github.com/useElven/core/releases/tag/v0.9.0) (2023-07-28)
- support for guardians (big thanks to @radumojic)
- update all dependencies

### [0.8.0](https://github.com/useElven/core/releases/tag/v0.8.0) (2023-06-29)
- switch to tsup instead of bare esbuild and tsc, now the configuration should be more reliable
- remove problematic export of `PairingTypes` (**breaking change**). Now it is a custom `PairingTypesStruct`, which is similar to the original one from WalletConnect
- update dependencies

### [0.7.0](https://github.com/useElven/core/releases/tag/v0.7.0) (2023-06-18)
- A new `useTokenTransfer` hook. It is a wrapper over `useTransaction` and should simplify transfering tokens, also to smart contracts with or without calling endpoints. You can still achieve the same using `useTransaction` with payload builders.
- updated dependencies

### [0.6.1](https://github.com/useElven/core/releases/tag/v0.6.1) (2023-06-07)
- fix native auth login token handling

### [0.6.0](https://github.com/useElven/core/releases/tag/v0.6.0) (2023-06-04)
- improvements for nonce incrementation to let trigger multiple transactions at the same time. The logic is slightly different, but it shouldn't break anything (you can test it [here](https://useelven-react-vite-demo.netlify.app/). For now, additional steps are required for the Web Wallet to manage the pending states in UI properly. They solution is presented in the [demo here](https://github.com/useElven/react-vite/blob/main/src/components/demo/EgldTx.tsx)). There will be more improvements in that regard.

### [0.5.0](https://github.com/useElven/core/releases/tag/v0.5.0) (2023-05-28)
- Breaking: switch to using sdk-native-auth-client instead passing string-based login tokens. There is no fallback or other option, so it is a breaking change. Native Auth is recommended. The old way of doing that will be deprecated. Please freeze the previous version if you are not ready to switch yet
- update dependencies

### [0.4.0](https://github.com/useElven/core/releases/tag/v0.4.0) (2023-05-14)
- update HW and Web Wallet providers, adjust the code
- fix HW initialization when other provider was used before

### [0.3.0](https://github.com/useElven/core/releases/tag/v0.3.0) (2023-05-06)
- update HW provider
- fix bugs related to state handling

### [0.2.1](https://github.com/useElven/core/releases/tag/v0.2.1) (2023-04-25)
- fixed a bug related to WalletConnect pairings removal and state management in UI
- dependencies update

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
