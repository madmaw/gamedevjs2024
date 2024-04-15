/* eslint-env node */
module.exports = {
  root: true,
  settings: {
    'import/parsers': {
      '@typescript-eslint/parser': [
        '.ts',
        '.tsx',
      ],
    },
    'import/resolver': {
      typescript: {
        alwaysTryTypes: true, // always try to resolve types under `<root>@types` directory even it doesn't contain any source code, like `@types/unist`
        project: ['tsconfig.json'],
      },
    },
    react: {
      version: 'detect',
    },
  },
  ignorePatterns: [
    // folders starting with . ignored by default
    '!.storybook',
    'dist',
    'node_modules',
    '**/locales/**',
    'public/**',
  ],
  plugins: [
    'dprint-integration',
    '@typescript-eslint',
    'import-newlines',
    'import',
    'unused-imports',
    'no-relative-import-paths',
    'lingui',
  ],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:dprint-integration/recommended',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
    'plugin:storybook/recommended',
    'plugin:@eslint-community/eslint-comments/recommended',
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: true,
    tsconfigRootDir: './',
    sourceType: 'module',
  },
  rules: {
    'dprint-integration/dprint': [
      'error',
      {},
      {
        typescript: {
          quoteStyle: 'alwaysSingle',
          'functionExpression.spaceBeforeParentheses': true,
          trailingCommas: 'onlyMultiLine',
          quoteProps: 'asNeeded',
          'parameters.preferHanging': 'onlySingleItem',
          preferHanging: true,
          preferSingleLine: false,
          'jsx.bracketPosition': 'nextLine',
          'jsx.forceNewLinesSurroundingContent': true,
          'module.sortImportDeclarations': 'caseInsensitive',
          'module.sortExportDeclarations': 'caseInsensitive',
          'importDeclaration.sortNamedImports': 'caseInsensitive',
          'typeLiteral.separatorKind': 'comma',
          'jsx.multiLineParens': 'always',
        },
        json: {},
      },
    ],
    'no-console': ['warn'],
    'no-alert': ['warn'],
    'no-debugger': ['warn'],
    eqeqeq: [
      'warn',
      'always',
      {
        null: 'never',
      },
    ],
    'comma-dangle': [
      'warn',
      {
        arrays: 'always-multiline',
        objects: 'always-multiline',
        imports: 'always-multiline',
        exports: 'always-multiline',
        functions: 'always-multiline',
      },
    ],
    'object-curly-newline': [
      'warn',
      {
        multiline: true,
        minProperties: 2,
        consistent: true,
      },
    ],
    'object-property-newline': [
      'warn',
      {
        allowMultiplePropertiesPerLine: false,
      },
    ],
    'array-bracket-newline': [
      'warn',
      {
        multiline: true,
        minItems: 2,
      },
    ],
    'array-element-newline': [
      'warn',
      {
        multiline: true,
        minItems: 2,
      },
    ],
    'import-newlines/enforce': [
      'warn',
      {
        items: 1,
        semi: true,
      },
    ],
    'no-multi-spaces': ['warn'],
    'no-unused-vars': 'off', // or "@typescript-eslint/no-unused-vars": "off",
    '@typescript-eslint/no-unused-vars': 'off',
    'unused-imports/no-unused-imports': 'error',
    'unused-imports/no-unused-vars': [
      'warn',
      {
        vars: 'all',
        varsIgnorePattern: '^_',
        args: 'after-used',
        argsIgnorePattern: '^_',
      },
    ],
    'default-case': ['error'],
    'no-multiple-empty-lines': [
      'warn',
      {
        max: 1,
        maxBOF: 0,
        maxEOF: 1,
      },
    ],
    'import/no-relative-packages': ['error'],
    'import/no-cycle': ['error'],
    'import/no-self-import': ['error'],
    'import/no-unresolved': 'error',
    'no-relative-import-paths/no-relative-import-paths': [
      'warn',
      {
        allowSameFolder: true,
        rootDir: 'src',
      },
    ],
    '@eslint-community/eslint-comments/no-unused-disable': ['error'],
    // incompatible with three/fiber
    'react/no-unknown-property': ['off'],
    'react/display-name': ['off'],
    'react/react-in-jsx-scope': ['off'],
    'react/prop-types': ['off'],
    'react/jsx-max-props-per-line': [
      'warn',
      {
        maximum: 1,
      },
    ],
    'react/jsx-boolean-value': [
      'warn',
      'always',
    ],
    'react/jsx-indent-props': [
      'warn',
      2,
    ],
    'react/jsx-one-expression-per-line': [
      'warn',
      { allow: 'literal' },
    ],
    'react/jsx-first-prop-new-line': [
      'warn',
      'multiline-multiprop',
    ],
    // handled by dprint
    'react/jsx-closing-bracket-location': ['off'],
    'react-hooks/exhaustive-deps': [
      'error',
      {
        additionalHooks: '(usePartialComponent|usePartialObserverComponent)',
      },
    ],
    '@typescript-eslint/consistent-type-imports': [
      'warn',
      {
        prefer: 'type-imports',
        fixStyle: 'inline-type-imports',
      },
    ],
    '@typescript-eslint/switch-exhaustiveness-check': ['error'],
    '@typescript-eslint/consistent-type-definitions': [
      'warn',
      'type',
    ],
    '@typescript-eslint/prefer-readonly': ['warn'],
    '@typescript-eslint/consistent-type-assertions': [
      'warn',
      {
        assertionStyle: 'never',
      },
    ],
    '@typescript-eslint/ban-types': [
      'warn',
      {
        types: {
          '{}': false,
        },
        extendDefaults: true,
      },
    ],
  },
};
