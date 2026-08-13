import js from "@eslint/js";
import tsPlugin from "@typescript-eslint/eslint-plugin";
import tsParser from "@typescript-eslint/parser";
import prettierConfig from "@vue/eslint-config-prettier";
import globals from "globals";
import vuePlugin from "eslint-plugin-vue";

const sourceFiles = ["**/*.{js,jsx,mjs,cjs,ts,tsx,mts,cts,vue}"];
const typescriptFiles = ["**/*.{ts,tsx,mts,cts}"];

// The plugin's flat recommended preset deliberately has an unscoped base
// entry. Scope every entry so vue-eslint-parser remains in control of SFCs.
const typescriptRecommended = tsPlugin.configs["flat/recommended"].map(
  (config) => ({
    ...config,
    files: typescriptFiles,
  })
);

export default [
  {
    name: "project/ignores",
    ignores: [
      "**/node_modules/**",
      "**/dist/**",
      "**/dist-ssr/**",
      "**/coverage/**",
      "**/logs/**",
      "**/*.log",
      "**/*.local",
      "cypress/videos/**",
      "cypress/screenshots/**",
      ".vscode/**",
      ".idea/**",
      ".lh/**",
    ],
  },

  js.configs.recommended,
  ...vuePlugin.configs["flat/essential"],

  {
    name: "project/base",
    files: sourceFiles,
    languageOptions: {
      ecmaVersion: 2021,
      globals: {
        ...globals.browser,
        ...globals.es2021,
        ...globals.node,
        __BUILD_TIME__: "readonly",
      },
    },
    rules: {
      "no-empty-function": ["warn", { allow: ["arrowFunctions", "methods"] }],
      "no-unused-vars": [
        "warn",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
      "no-empty-pattern": "warn",
      // ESLint 10 added this to its recommended preset. Keep the migration
      // behaviour-compatible with the previous ESLint 8 recommended rules;
      // any cleanup can be enabled in a separate change.
      "no-useless-assignment": "off",
    },
  },

  {
    name: "project/vue-typescript-parser",
    files: ["**/*.vue"],
    languageOptions: {
      parserOptions: {
        parser: tsParser,
        ecmaVersion: 2021,
        sourceType: "module",
        extraFileExtensions: [".vue"],
      },
    },
  },

  ...typescriptRecommended,

  {
    name: "project/typescript",
    files: typescriptFiles,
    rules: {
      "no-unused-vars": "off",
      "@typescript-eslint/no-unused-vars": [
        "warn",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
      "no-empty-function": "off",
      "@typescript-eslint/no-empty-function": [
        "warn",
        { allow: ["arrowFunctions", "methods"] },
      ],
    },
  },

  {
    name: "project/tests",
    files: ["src/__tests__/**/*.ts"],
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
    },
  },

  {
    name: "project/block-definitions-javascript",
    files: ["src/blocks/**/*.js"],
    rules: {
      "no-unused-vars": [
        "warn",
        {
          argsIgnorePattern: "^_|^parameters$|^resource$|^generator$|^block$",
          varsIgnorePattern: "^_",
        },
      ],
      "no-empty-pattern": "off",
    },
  },

  {
    name: "project/block-definitions-typescript",
    files: ["src/blocks/**/*.ts"],
    rules: {
      "no-unused-vars": "off",
      "@typescript-eslint/no-unused-vars": [
        "warn",
        {
          argsIgnorePattern: "^_|^parameters$|^resource$|^generator$|^block$",
          varsIgnorePattern: "^_",
        },
      ],
      "no-empty-pattern": "off",
    },
  },

  // Keep this after all recommended configs so formatting-conflicting rules
  // stay disabled. The final entry restores the repository's error severity
  // and cross-platform line-ending behaviour.
  prettierConfig,
  {
    name: "project/prettier",
    files: sourceFiles,
    rules: {
      "prettier/prettier": [
        "error",
        {
          // Preserve the Prettier 2 behaviour used by the legacy config while
          // upgrading the formatter itself to Prettier 3.
          trailingComma: "es5",
          endOfLine: "auto",
        },
      ],
    },
  },
];
