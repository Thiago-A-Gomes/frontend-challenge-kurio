import tseslint from 'typescript-eslint';
import hooks from 'eslint-plugin-react-hooks';

// Regras úteis para TypeScript e hooks, sem aplicar no código gerado do MSW.
export default [{ ignores: ['dist/**', 'node_modules/**', 'public/**', 'playwright-report/**', 'test-results/**'] }, {
  files: ['src/**/*.{ts,tsx}'],
  languageOptions: { parser: tseslint.parser, parserOptions: { ecmaVersion: 2022, sourceType: 'module', ecmaFeatures: { jsx: true } } },
  plugins: { '@typescript-eslint': tseslint.plugin, 'react-hooks': hooks },
  rules: { '@typescript-eslint/no-explicit-any': 'error', '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }], 'react-hooks/rules-of-hooks': 'error' },
}];
