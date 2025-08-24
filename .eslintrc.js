module.exports = {
  root: true,
  env: {
    browser: true,
    es2022: true,
    node: true,
  },
  extends: [
    'google',
    'eslint:recommended',
    '@typescript-eslint/recommended',
    '@typescript-eslint/recommended-requiring-type-checking',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
    'plugin:import/recommended',
    'plugin:import/typescript',
    'plugin:security/recommended',
    'prettier', // Must be last to override other formatting rules
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: 'latest',
    sourceType: 'module',
    project: ['./tsconfig.json', './packages/*/tsconfig.json'],
    tsconfigRootDir: __dirname,
  },
  plugins: [
    'react',
    'react-hooks',
    '@typescript-eslint',
    'jsdoc',
    'prefer-arrow',
    'import',
    'security',
  ],
  settings: {
    react: {
      version: 'detect',
    },
    'import/resolver': {
      typescript: {
        alwaysTryTypes: true,
        project: ['./tsconfig.json', './packages/*/tsconfig.json'],
      },
    },
  },
  rules: {
    // Google Style Guide overrides
    'max-len': ['error', { code: 80, ignoreUrls: true, ignoreStrings: true }],
    'require-jsdoc': 'off', // TypeScript provides type information
    'valid-jsdoc': 'off', // Use TypeScript instead
    
    // React specific
    'react/react-in-jsx-scope': 'off',
    'react/prop-types': 'off', // TypeScript handles prop validation
    'react/jsx-uses-react': 'off',
    'react/jsx-uses-vars': 'error',
    
    // TypeScript specific
    '@typescript-eslint/no-unused-vars': [
      'error', 
      { 
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_',
        destructuredArrayIgnorePattern: '^_',
      }
    ],
    '@typescript-eslint/explicit-function-return-type': 'error',
    '@typescript-eslint/explicit-module-boundary-types': 'error',
    '@typescript-eslint/no-explicit-any': 'error',
    '@typescript-eslint/no-unsafe-any': 'error',
    '@typescript-eslint/no-unsafe-assignment': 'error',
    '@typescript-eslint/no-unsafe-call': 'error',
    '@typescript-eslint/no-unsafe-member-access': 'error',
    '@typescript-eslint/no-unsafe-return': 'error',
    '@typescript-eslint/prefer-readonly': 'error',
    '@typescript-eslint/prefer-readonly-parameter-types': 'off', // Too strict for game development
    '@typescript-eslint/strict-boolean-expressions': 'error',
    
    // Import rules
    'import/order': [
      'error',
      {
        groups: [
          'builtin',
          'external',
          'internal',
          'parent',
          'sibling',
          'index',
        ],
        'newlines-between': 'always',
        alphabetize: {
          order: 'asc',
          caseInsensitive: true,
        },
      },
    ],
    'import/no-default-export': 'error', // Prefer named exports for better tree shaking
    'import/prefer-default-export': 'off',
    'import/no-cycle': 'error',
    'import/no-self-import': 'error',
    
    // General code quality
    'prefer-const': 'error',
    'no-var': 'error',
    'no-console': 'warn',
    'no-debugger': 'error',
    'complexity': ['error', { max: 10 }],
    'max-depth': ['error', { max: 4 }],
    'max-params': ['error', { max: 4 }],
    
    // Security
    'security/detect-object-injection': 'off', // Too many false positives
    
    // JSDoc (when used)
    'jsdoc/check-alignment': 'error',
    'jsdoc/check-indentation': 'error',
    'jsdoc/newline-after-description': 'error',
  },
  overrides: [
    {
      // Test files
      files: ['**/*.test.ts', '**/*.test.tsx', '**/*.spec.ts', '**/*.spec.tsx'],
      env: {
        jest: true,
        'vitest-globals/env': true,
      },
      extends: ['plugin:vitest-globals/recommended'],
      rules: {
        '@typescript-eslint/no-explicit-any': 'off', // Tests often need any for mocking
        '@typescript-eslint/no-unsafe-any': 'off',
        '@typescript-eslint/no-unsafe-assignment': 'off',
        '@typescript-eslint/no-unsafe-call': 'off',
        '@typescript-eslint/no-unsafe-member-access': 'off',
        'max-len': 'off', // Test descriptions can be long
        'no-console': 'off', // Allow console in tests
      },
    },
    {
      // Configuration files
      files: ['**/*.config.{js,ts}', '**/.*rc.{js,ts}'],
      rules: {
        'import/no-default-export': 'off', // Config files often use default exports
        '@typescript-eslint/no-var-requires': 'off',
      },
    },
    {
      // Main app entry points
      files: ['**/src/index.{ts,tsx}', '**/src/main.{ts,tsx}', '**/src/App.{ts,tsx}'],
      rules: {
        'import/no-default-export': 'off', // Entry points often need default exports
      },
    },
  ],
};