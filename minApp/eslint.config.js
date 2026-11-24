import js from '@eslint/js';

// ---------------------------------------------------------------------------
// ESLint 10 med flat config.
//
// ESLint kjenner ikke miljøet vårt av seg selv: den vet ikke at «process»
// finnes på serveren eller at «document» finnes i nettleseren. Derfor lister vi
// opp globalene per mappe. Da får vi feil på ekte skrivefeil («documnt»), men
// ikke på ting som faktisk finnes.
// ---------------------------------------------------------------------------

const nodeGlobals = {
  process: 'readonly',
  console: 'readonly',
  URL: 'readonly',
  URLSearchParams: 'readonly',
  setTimeout: 'readonly',
  clearTimeout: 'readonly',
  fetch: 'readonly',
};

const nettleserGlobals = {
  window: 'readonly',
  document: 'readonly',
  fetch: 'readonly',
  bootstrap: 'readonly', // fra bootstrap.bundle.min.js, lastet før vårt skript
  console: 'readonly',
  setTimeout: 'readonly',
  clearTimeout: 'readonly',
  URL: 'readonly',
  URLSearchParams: 'readonly',
};

export default [
  { ignores: ['node_modules/**', 'coverage/**', 'package-lock.json'] },

  js.configs.recommended,

  {
    files: ['**/*.js'],
    languageOptions: {
      ecmaVersion: 2024,
      sourceType: 'module',
      globals: nodeGlobals,
    },
    rules: {
      // Kvalitetsregler som er verdt å ha når man lærer bort god praksis.
      eqeqeq: ['error', 'smart'],
      'no-var': 'error',
      'prefer-const': 'error',
      'no-console': 'off', // vi bruker console i scripts/ og i feilsøking
      'no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', destructuredArrayIgnorePattern: '^_' },
      ],
    },
  },

  {
    // Frontend-koden kjører i nettleseren, ikke i Node.
    files: ['public/js/**/*.js'],
    languageOptions: {
      sourceType: 'module',
      globals: nettleserGlobals,
    },
  },
];
