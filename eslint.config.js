import globals from "globals";
import pluginJs from "@eslint/js";

/** @type {import('eslint').Linter.Config[]} */
export default [
  {
    languageOptions: {
      globals: globals.node,
      ecmaVersion: 2021, // Specify the ECMAScript version
      sourceType: "module", // Specify the source type (module or script)
    },
    env: {
      node: true, // Enable Node.js global variables
      es2021: true, // Enable ECMAScript 2021 features
    },
    extends: [
      "eslint:recommended", // Use recommended ESLint rules
    ],
    rules: {
      // Add custom rules here
      "no-console": "off", // Allow console statements
      "no-unused-vars": ["warn", { argsIgnorePattern: "^_" }], // Warn on unused variables, but ignore those starting with _
    },
  },
  pluginJs.configs.recommended,
];
