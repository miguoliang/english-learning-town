/**
 * Prettier Configuration for English Learning Town Monorepo
 * Shared across all packages for consistent code formatting
 */

export default {
  // Core formatting rules
  printWidth: 100,
  tabWidth: 2,
  useTabs: false,
  semi: true,
  singleQuote: true,
  quoteProps: 'as-needed',
  trailingComma: 'es5',
  bracketSpacing: true,
  bracketSameLine: false,
  arrowParens: 'avoid',

  // Line endings and encoding
  endOfLine: 'lf',
  insertPragma: false,
  requirePragma: false,
  proseWrap: 'preserve',

  // Language-specific overrides
  overrides: [
    {
      files: '*.{js,jsx,ts,tsx}',
      options: {
        parser: 'typescript',
        singleQuote: true,
        trailingComma: 'es5',
      },
    },
    {
      files: '*.{json,jsonc}',
      options: {
        parser: 'json',
        tabWidth: 2,
        trailingComma: 'none',
      },
    },
    {
      files: '*.{css,scss}',
      options: {
        parser: 'css',
        singleQuote: false,
      },
    },
    {
      files: '*.md',
      options: {
        parser: 'markdown',
        printWidth: 80,
        proseWrap: 'always',
        tabWidth: 2,
      },
    },
    {
      files: '*.{yml,yaml}',
      options: {
        parser: 'yaml',
        tabWidth: 2,
        singleQuote: false,
      },
    },
  ],
};
