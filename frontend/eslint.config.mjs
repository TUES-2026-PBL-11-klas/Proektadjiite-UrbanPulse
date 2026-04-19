// @ts-check
import nextConfig from 'eslint-config-next/core-web-vitals';

export default [
  ...nextConfig,
  {
    linterOptions: {
      // Suppress warnings about eslint-disable comments that no longer apply
      // (e.g. @typescript-eslint/no-explicit-any directives from older config)
      reportUnusedDisableDirectives: false,
    },
    rules: {
      // Cosmetic — HTML entity encoding is not a functional issue
      'react/no-unescaped-entities': 'off',

      // React 19 strict experimental rules — the codebase uses common patterns
      // (setState in effects, Math.random in useMemo) that these flag
      'react-hooks/set-state-in-effect': 'off',
      'react-hooks/purity': 'off',

      // Informational — img elements work, optimisation can be tackled separately
      '@next/next/no-img-element': 'off',
    },
  },
];
