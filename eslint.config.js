import globals from "globals"
import pluginJs from "@eslint/js"
import stylistic from '@stylistic/eslint-plugin'

export default [
  {
    files: ["**/*.{js,mjs}"],
    plugins: {
      '@stylistic': stylistic
    },
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        ...globals.browser,
        process: 'readonly',
      }
    },
    rules: {
      '@stylistic/semi': ['error', 'never'],
      '@stylistic/no-trailing-spaces': 'error',
      '@stylistic/arrow-parens': ['error', 'as-needed'],
      '@stylistic/brace-style': ['error', '1tbs', { allowSingleLine: true }],
      'no-console': 0,
    }
  }
]
