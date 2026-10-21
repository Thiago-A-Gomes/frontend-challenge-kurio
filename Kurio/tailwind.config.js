/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  // Mantém a base visual já validada; componentes novos usam utilitários reais.
  corePlugins: { preflight: false },
  theme: { extend: { colors: { primary: '#d58e49', foreground: '#f5f1eb', background: '#140d0a', panel: '#261813' }, fontFamily: { mono: ['Roboto Mono', 'monospace'] } } },
};
