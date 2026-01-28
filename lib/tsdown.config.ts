import { defineConfig } from 'tsdown';

export default defineConfig({
  exports: true,
  entry: 'src/index.ts',
  dts: {
    sourcemap: false,
  },
  format: ['esm', 'cjs'],
  treeshake: true,
  minify: true,
  sourcemap: false,
});
