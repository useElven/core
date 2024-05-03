### [0.19.2](https://github.com/useElven/core/releases/tag/v0.19.2) (2024-05-03)
- export missing type
- update dependencies

### [0.19.1](https://github.com/useElven/core/releases/tag/v0.19.1) (2024-04-13)
- fix web wallet connect regression

### [0.19.0](https://github.com/useElven/core/releases/tag/v0.19.0) (2024-04-13)
- update @multiversx/sdk-core library (v13)
- **breaking**: with this version the @multiversx/sdk-core is now a peer dependency, you must have it in your project to work with useElven, at least v13.0.0. So, as always, freeze on 0.18.0 if you still need to use older sdk-core
- **breaking**: `useScDeploy` hook accepts different set of arguments
- **breaking**: `useMultiTokenTransfer` is renamed to `useTokenTransfer`. The old `useTokenTransfer` has been removed. You should use the same hook for single and multi-transfers. Now, gasLimit param is required when transferring to a smart contract using the provided endpoint name. For standard transfers, the gas limit isn't required
- added two simple utilities for parsing and formating amounts: `formatAmount` and `parseAmount`

### [0.18.0](https://github.com/useElven/core/releases/tag/v0.18.0) (2024-03-30)
- unify path calbacks for useLogin
- update dependencies

### [0.17.1](https://github.com/useElven/core/releases/tag/v0.17.1) (2024-02-28)
- fix the useTokenTransfer payload for Fungible ESDT
- fix typings where TypedValue was used
- update dependencies

### [0.17.0](https://github.com/useElven/core/releases/tag/v0.17.0) (2024-02-25)
- unify callbacks naming (could be a breaking change, see [docs](https://www.useelven.com/docs/sdk-reference.html) for updates)
- add transaction watcher timeout and patience configuration
- update dependencies

### [0.16.0](https://github.com/useElven/core/releases/tag/v0.16.0) (2024-01-11)
- allow `useMultiTokenTransfer` to call the endpoint
- some breaking changes when it comes to `useTokenTransfer` and `useMultiTokenTransfer` types and logic (check [docs](https://www.useElven.com))
- update dependencies

### [0.15.2](https://github.com/useElven/core/releases/tag/v0.15.2) (2023-12-29)
- fix import

### [0.15.1](https://github.com/useElven/core/releases/tag/v0.15.1) (2023-12-29)
- add missing transaction id logic for guardian 2FA hooks

### [0.15.0](https://github.com/useElven/core/releases/tag/v0.15.0) (2023-12-28)
- change the way we're getting the smart contract address in the useScDeploy hook
- add optional id for all hooks that use useTransaction. It helps with signing providers' logic based on redirections to diferentiate and track which hook triggered the redirection
- url cleanup after redirect for useLogin hook and web wallet

### [0.14.0](https://github.com/useElven/core/releases/tag/v0.14.0) (2023-12-24)
- make the sign message callback work the same as in the case of transactions
- add missing Ledger support in sign message hook
- add more gas limit automatically when transaction is guarded

### [0.13.2](https://github.com/useElven/core/releases/tag/v0.13.2) (2023-12-23)
 - update dependencies with npm audit fix

### [0.13.1](https://github.com/useElven/core/releases/tag/v0.13.1) (2023-12-12)
- bugfix: wrong imports. In some cases, it was breaking the app that used it

### [0.13.0](https://github.com/useElven/core/releases/tag/v0.13.0) (2023-12-03)
- add useScDeploy hook for smart contract deployments - check [docs](https://www.useElven.com/docs/sdk-reference.html#usescdeploy()) for more informations

### [0.12.0](https://github.com/useElven/core/releases/tag/v0.12.0) (2023-11-30)
- add useSignMessage hook - check [docs](https://www.useElven.com/docs/sdk-reference.html#usesignmessage()) for more informations
- min Node version is 18
- update dependencies

### [0.11.0](https://github.com/useElven/core/releases/tag/v0.11.0) (2023-11-04)
- add useMultiTokenTransfer 
- some changes in the useTransaction hook. Now you can also pass the whole Transaction object to the triggerTx function (in such a case, other param are not required). This is optional. Previous functionality stays the same. In some cases, it can be a breaking change.

### [0.10.3](https://github.com/useElven/core/releases/tag/v0.10.3) (2023-11-01)
- update MulitversX sdk-core lib

### [0.10.2](https://github.com/useElven/core/releases/tag/v0.10.2) (2023-10-28)
- fix NativeAuth configuration

### [0.10.1](https://github.com/useElven/core/releases/tag/v0.10.1) (2023-10-28)
- fix xAlias-related types

### [0.10.0](https://github.com/useElven/core/releases/tag/v0.10.0) (2023-10-28)
- add xAlias login support (check the [docs](https://www.useElven.com) and [demo example](https://multiversx-nextjs-dapp.netlify.app/))
- update dependencies

### [0.9.6](https://github.com/useElven/core/releases/tag/v0.9.6) (2023-10-10)
- fix the bug related to a hardcoded amount for token transfer in case of SFTs
- update dependencies

### [0.9.5](https://github.com/useElven/core/releases/tag/v0.9.5) (2023-10-02)
- fix the bug related to resetting the active guardian local storage entry on hard refresh
- update dependencies

### [0.9.4](https://github.com/useElven/core/releases/tag/v0.9.4) (2023-09-30)
- export `TransactionParams` type
- update dependencies

### [0.9.3](https://github.com/useElven/core/releases/tag/v0.9.3) (2023-09-28)
- support domains with the port number in native auth token initialization
- Pass API URL configuration (overwrite) to native auth token initialization
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
- A new `useTokenTransfer` hook. It is a wrapper over `useTransaction` and should simplify transferring tokens, also to smart contracts with or without calling endpoints. You can still achieve the same using `useTransaction` with payload builders.
- updated dependencies

### [0.6.1](https://github.com/useElven/core/releases/tag/v0.6.1) (2023-06-07)
- fix native auth login token handling

### [0.6.0](https://github.com/useElven/core/releases/tag/v0.6.0) (2023-06-04)
- improvements for nonce incrementation to let trigger multiple transactions at the same time. The logic is slightly different, but it shouldn't break anything (you can test it [here](https://useelven-react-vite-demo.netlify.app/). For now, additional steps are required for the Web Wallet to manage the pending states in UI properly. The solution is presented in the [demo here](https://github.com/useElven/react-vite/blob/main/src/components/demo/EgldTx.tsx)). There will be more improvements in that regard.

### [0.5.0](https://github.com/useElven/core/releases/tag/v0.5.0) (2023-05-28)
- Breaking: switch to using sdk-native-auth-client instead of passing string-based login tokens. There is no fallback or other option, so it is a breaking change. Native Auth is recommended. The old way of doing that will be deprecated. Please freeze the previous version if you are not ready to switch yet
- update dependencies

### [0.4.0](https://github.com/useElven/core/releases/tag/v0.4.0) (2023-05-14)
- update HW and Web Wallet providers, adjust the code
- fix HW initialization when another provider was used before

### [0.3.0](https://github.com/useElven/core/releases/tag/v0.3.0) (2023-05-06)
- update HW provider
- fix bugs related to state handling

### [0.2.1](https://github.com/useElven/core/releases/tag/v0.2.1) (2023-04-25)
- fixed a bug related to WalletConnect pairings removal and state management in UI
- dependencies update

### [0.2.0](https://github.com/useElven/core/releases/tag/v0.2.0) (2023-04-23)
- migration to new major versions of `sdk-core` and `sdk-hw-provider`
- other minor dependencies updates
- adjustments in the code

### [0.1.0](https://github.com/useElven/core/releases/tag/v0.1.0) (2023-03-05)
- migration to Wallet Connect 2. Check the changes in [configuration](https://www.useelven.com/docs/sdk-reference.html). You will need your own WC project ID.

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
- improvements in extension signing state management
- return transaction data in useTransaction before it is completed on the chain

### [0.0.2](https://github.com/useElven/core/releases/tag/v0.0.2) (2023-02-15)
- fixed browser extension states handling
- dependencies updates

### [0.0.1](https://github.com/useElven/core/releases/tag/v0.0.1) (2023-02-14)
- initial code - fundamental hooks that were previously used in Next.js Dapp Template
