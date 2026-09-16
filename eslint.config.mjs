import nextConfig from 'eslint-config-next/core-web-vitals';

const config = [
  {
    ignores: ['.next/**', 'out/**', 'coverage/**', 'node_modules/**'],
  },
  ...nextConfig,
  {
    rules: {
      // Existing client hydration and browser-storage synchronization use these intentional effects.
      'react-hooks/set-state-in-effect': 'off',
      'react-hooks/use-memo': 'off',
    },
  },
];

export default config;
