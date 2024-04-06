const path = require('path');

module.exports = {
  root: true,
  extends: [
    'airbnb-base',
    'airbnb-typescript/base',
  ],
  parserOptions: {
    project: [
      path.join(__dirname, 'tsconfig.json'),
      path.join(__dirname, 'tests/tsconfig.json'),
    ],
  },
  rules: {
      'sonarjs/cognitive-complexity': 'off',
      'import/no-extraneous-dependencies': 'off',
      'sonarjs/no-duplicate-string': 'off',
      'sonarjs/no-identical-functions': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      'no-restricted-imports': 'off',
      'class-methods-use-this': 'off',
      '@typescript-eslint/no-shadow': 'off',
      'consistent-return': 'off',
      'default-case': 'off',
      'prefer-regex-literals': 'off',
      'new-cap': 'off',
      'global-require': 'off',
      'import/no-cycle': 'off',
      '@typescript-eslint/no-use-before-define': 'off',
      'no-else-return': 'off',
      '@typescript-eslint/comma-dangle': ['error', 'always-multiline'],
      'arrow-body-style': 'off',
      '@typescript-eslint/lines-between-class-members': 'off',
      '@typescript-eslint/object-curly-spacing': 'off',
      'max-len': 'off',
      'no-param-reassign': 'off',
      'import/prefer-default-export': 'off',
      'no-await-in-loop': 'off',
      'no-restricted-syntax': 'off',
      '@typescript-eslint/naming-convention': 'off',
      '@typescript-eslint/dot-notation': 'off'
  },
  ignorePatterns: ['lib/**/*.js'],
};

