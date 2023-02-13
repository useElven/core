## useElven core

**Please be aware that the tools are still in the development phase.**

### Docs

- [useElven.com](https://www.useElven.com)

### About

`useElven` is a set of hooks and tools designed to work with React-base applications.

The tool is a wrapper for [sdk-js](https://docs.multiversx.com/sdk-and-tools/sdk-js/) - a set of Typescript/Javascript libraries.

### Install

```bash
npm install @useelven/core --save
```

and then for example:

```jsx
import { useNetworkSync } from '@useelven/core';
```

Check all of the hooks here: [SDK Reference](https://www.useElven.com/docs/sdk-reference.html)

### Examples

See ready to use demo templates: 

- [Next.js Dapp Template]()
- [React + Vite Dapp Template]()

### Development

- `npm install`
- `npm run build` - after each change
- `npm link` or `npm pack`
- `npm link @useelven/core` or `npm install ./link/to/the/package.gz`

### More tools
- [Buildo Begins](https://github.com/xdevguild/buildo-begins) - command line interface for interacting with the MultiversX blockchain
- [Elven Tools](https://www.elven.tools) - a set of tools for running your PFP NFT collection on the MultiversX blockchain
- [Elven.js](https://www.elvenjs.com) - compact browser only SDK for MultiversX blockchain interaction - no build steps 
