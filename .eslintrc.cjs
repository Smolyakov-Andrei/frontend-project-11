module.exports = {
  env: {
    browser: true,
    es2021: true,
  },
  extends: [
    'airbnb-base',
  ],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  rules: {
    'import/extensions': ['error', 'always', {
      js: 'never',
    }],
    
    'no-param-reassign': [2, { props: false }],
    'import/prefer-default-export': 'off',
    'no-console': 0,
    'max-len': 'off',
  },
  settings: {
    'import/resolver': {
      node: {
        extensions: ['.js'],
      },
    },
  },
};
