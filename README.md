## useElven core

Please be aware that versions below 1.0.0 will still have breaking changes. Till then, please 'freeze' the version of useElven in your app, and decide when to upgrade.

### About

`useElven` is a set of hooks and tools designed to work with React-base applications.

It is a wrapper for [sdk-js](https://docs.multiversx.com/sdk-and-tools/sdk-js/) - a set of Typescript/Javascript libraries.

### Docs

- [useElven.com](https://www.useElven.com)

Below are a couple of steps for a quick start, but please check the docs and example apps.

### Install

```bash
npm install @useelven/core --save
```

Initialize:

```jsx
import { useNetworkSync } from '@useelven/core';

const NextJSDappTemplate = ({ Component, pageProps }: AppProps) => {

  useNetworkSync({
    chainType: 'devnet',
    // If you want to use xPortal signing, 
    // you would need to configure your Wallet Connect project id here: https://cloud.walletconnect.com
    walletConnectV2ProjectId: '<your_wallet_connect_project_id_here>'
    // Check for all configuration options in the docs
  });

  return (
    <Component {...pageProps} />
  );
};
```

Login:

```jsx
import { useLogin } from '@useelven/core';

(...)

const { login, isLoggedIn, error } = useLogin();
```

Sign and send transaction:

```jsx
import { useTransaction } from '@useelven/core';
import { TransactionPayload, TokenTransfer } from '@multiversx/sdk-core';

(...)

const { pending, triggerTx, transaction, txResult, error } = useTransaction();

const handleSendTx = () => {
  const demoMessage = 'Transaction demo!';
  triggerTx({
    address: 'erd123.....',
    gasLimit: 50000 + 1500 * demoMessage.length, // When guarded additional 50000 will be added internally
    data: new TransactionPayload(demoMessage),
    value: BigInt('1000000000000000000'),
  });
};
```

Check all of the hooks here: [SDK Reference](https://www.useElven.com/docs/sdk-reference.html)

### UI

Components required in every dapp. Like auth button, QR code, WC pairings list, ProtectedRoute, Authenticated, etc. are implemented in [Next.js Dapp Template](https://github.com/xdevguild/nextjs-dapp-template) and [React + Vite Dapp Template](https://github.com/useElven/react-vite).

### Examples

See ready to use demo templates: 

- [Next.js Dapp Template (App Router with Shadcn UI, Tailwind, Radix UI)](https://github.com/xdevguild/nextjs-dapp-template)
- [React + Vite Dapp Template (with Chakra UI)](https://github.com/useElven/react-vite)

Check [buildo.dev](https://www.buildo.dev) as a real world app that uses useElven lib.

### Development

- `npm install`
- `npm run build` - after each change
- `npm link` or `npm pack`
- `npm link @useelven/core` or `npm install ./link/to/the/package.gz`

### More tools

- [Buildo.dev](https://www.buildo.dev) - Buildo.dev is a MultiversX app that helps with blockchain interactions, like issuing tokens and querying smart contracts.
- [Elven Tools](https://www.elven.tools) - a set of tools for running your PFP NFT collection on the MultiversX blockchain
- [Elven.js](https://www.elvenjs.com) - compact browser only SDK for MultiversX blockchain interaction - no build steps 

### Contact me

- [@theJulianIo](https://twitter.com/theJulianIo)
