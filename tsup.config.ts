import { defineConfig } from 'tsup';

export default defineConfig({
  entry: {
    index: 'src/index.ts',
    'ui/index': 'src/ui/index.ts',
  },
  format: ['esm', 'cjs'],
  target: 'es2022',
  dts: true,
  sourcemap: true,
  clean: true,
  treeshake: true,
  splitting: false,
  minify: false,
  // Ship the Odyssey CSS as static, importable stylesheets alongside the bundle.
  onSuccess: 'mkdir -p dist/ui && cp src/ui/tokens.css src/ui/odyssey.css dist/ui/',
});
