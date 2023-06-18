/* eslint-disable @typescript-eslint/no-var-requires */

const { build } = require('esbuild');
const pkg = require('./package.json');

const shared = {
  entryPoints: ['./src/index.tsx'],
  bundle: true,
  target: 'ES2020',
  minify: true,
  external: [
    ...Object.keys(pkg.dependencies),
    ...Object.keys(pkg.peerDependencies),
  ],
};

build({
  ...shared,
  format: 'esm',
  outfile: './build/index.esm.js',
}).catch(() => process.exit(1));

build({
  ...shared,
  format: 'cjs',
  outfile: './build/index.cjs.js',
}).catch(() => process.exit(1));
