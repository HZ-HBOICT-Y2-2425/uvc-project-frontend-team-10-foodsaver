import globals from "globals";
import pluginJs from "@eslint/js";


/** @type {import('eslint').Linter.Config[]} */
export default [
    {
        ignores: [
          '**/.svelte-kit/**',  // Exclude all files in the .svelte-kit directory
        ],
      },
  {languageOptions: { globals: globals.browser }},
  pluginJs.configs.recommended,n
];