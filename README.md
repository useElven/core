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
  });

  return (
    <ChakraProvider theme={theme}>
      <Component {...pageProps} />
    </ChakraProvider>
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
    value: TokenTransfer.egldFromBigInteger(1_000_000_000_000_000_000),
  });
};
```

Check all of the hooks here: [SDK Reference](https://www.useElven.com/docs/sdk-reference.html)

### UI

There will be a separate package for React UI components. These will be simple components required in every dapp. Like auth button, QR code, WC pairings list, ProtectedRoute, Authenticated, etc.

All of these you can already find in [Next.js Dapp Template](https://github.com/xdevguild/nextjs-dapp-template), but soon they will land in a separate package. They won't rely on any CSS framework or way of styling.

### Examples

See ready to use demo templates: 

- [Next.js Dapp Template (with Shadcn UI, Tailwind, Radix UI)](https://github.com/xdevguild/nextjs-dapp-template)
- [React + Vite Dapp Template (witch Chakra UI)](https://github.com/useElven/react-vite)

### Development

- `npm install`
- `npm run build` - after each change
- `npm link` or `npm pack`
- `npm link @useelven/core` or `npm install ./link/to/the/package.gz`

### More tools
- [Buildo Begins](https://github.com/xdevguild/buildo-begins) - command line interface for interacting with the MultiversX blockchain
- [Elven Tools](https://www.elven.tools) - a set of tools for running your PFP NFT collection on the MultiversX blockchain
- [Elven.js](https://www.elvenjs.com) - compact browser only SDK for MultiversX blockchain interaction - no build steps 
