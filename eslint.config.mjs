import { defineConfig, globalIgnores } from "eslint/config";
import tsParser from "@typescript-eslint/parser";
import path from "node:path";
import { fileURLToPath } from "node:url";
import js from "@eslint/js";
import { FlatCompat } from "@eslint/eslintrc";
import playwright from "eslint-plugin-playwright";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
    baseDirectory: __dirname,
    recommendedConfig: js.configs.recommended,
    allConfig: js.configs.all
});

export default defineConfig([
  globalIgnores(['projects/**/*']),
  {
    files: ['**/*.ts'],

    extends: compat.extends(
      'eslint:recommended',
      'plugin:@typescript-eslint/eslint-recommended',
      'plugin:@typescript-eslint/recommended'
    ),

    languageOptions: {
      parser: tsParser,
      ecmaVersion: 5,
      sourceType: 'script',

      parserOptions: {
        project: ['tsconfig.json', 'e2e/tsconfig.json'],
        createDefaultProgram: true,
      },
    },

    rules: {
      'no-unused-vars': 'off',
      'no-console': 'off',
      'no-prototype-builtins': 'off',
      '@typescript-eslint/no-unused-vars': ['error'],
      '@typescript-eslint/no-explicit-any': ['off'],

      '@typescript-eslint/ban-ts-comment': [
        'off',
        {
          'ts-ignore': 'allow-with-description',
        },
      ],
    },
  },
  {
    // Angular-specific rules belong to application code only; the e2e specs are
    // plain Playwright TS and have no components or directives.
    files: ['src/**/*.ts'],

    extends: compat.extends(
      'plugin:@angular-eslint/recommended',
      'plugin:@angular-eslint/template/process-inline-templates'
    ),

    rules: {
      '@angular-eslint/prefer-standalone': 'off',
      '@angular-eslint/component-selector': [
        'error',
        {
          prefix: 'app',
          style: 'kebab-case',
          type: 'element',
        },
      ],

      '@angular-eslint/directive-selector': [
        'error',
        {
          prefix: 'app',
          style: 'camelCase',
          type: 'attribute',
        },
      ],
    },
  },
  {
    files: ['e2e/**/*.ts'],
    extends: [playwright.configs['flat/recommended']],

    rules: {
      // The five rules that guard against tests which silently assert nothing.
      // Errors, not warnings: the angular-eslint builder defaults to
      // maxWarnings=-1, so a warning would never fail CI and the gate would be
      // decorative.
      'playwright/no-conditional-in-test': 'error',
      'playwright/no-conditional-expect': 'error',
      'playwright/no-wait-for-timeout': 'error',
      'playwright/no-skipped-test': 'error',
      // `waitForURL` rejects on timeout, so a navigation test whose only check
      // is a URL match really does assert something. `login` is the shared
      // helper in e2e/setup/auth.setup.ts; it asserts on the post-redirect URL,
      // which the rule cannot see through a function boundary.
      'playwright/expect-expect': [
        'error',
        { assertFunctionNames: ['waitForURL', 'login'] },
      ],

      // Style/idiom rules that flat/recommended raises to 'error'. Downgraded to
      // 'warn' so pre-existing violations don't block CI; they are cleanups, not
      // correctness gates, and are tracked separately from the five rules above.
      'playwright/prefer-web-first-assertions': 'warn',
      'playwright/valid-title': 'warn',
    },
  },
  {
    // Pre-existing violations from before these rules existed. Enforced
    // everywhere else, so no NEW conditional test logic can be added. Exempted
    // here rather than with in-file `eslint-disable` comments so that fixing a
    // file means deleting a line from this list.
    //
    // ran-filter-details.spec.ts, ran-templates-table.spec.ts
    //                          — `if (await x.isVisible())` around assertions,
    //                            so the assertions are skippable. Needs the same
    //                            treatment cm-actions.spec.ts got in TNAP-32099;
    //                            not yet ticketed.
    files: [
      'e2e/tests/ran-filter/ran-filter-details.spec.ts',
      'e2e/tests/ran-templates/ran-templates-table.spec.ts',
    ],
    rules: {
      'playwright/no-conditional-in-test': 'off',
      'playwright/no-conditional-expect': 'off',
    },
  },
  {
    // 'Can fill in Template Name, Description and Service Role' fills the form
    // and clicks Save without asserting the outcome. What Save should produce
    // cannot be determined without running the suite, so the rule is relaxed
    // for this file only rather than guessing at an assertion. Not yet ticketed.
    files: [
      'e2e/tests/slice-templates/slice-templates-edit/slice-templates-edit.spec.ts',
    ],
    rules: {
      'playwright/expect-expect': 'off',
    },
  },
  {
    files: ['**/*.html'],
    extends: compat.extends('plugin:@angular-eslint/template/recommended'),

    rules: {
      '@angular-eslint/template/valid-aria': ['error'],
      '@angular-eslint/template/role-has-required-aria': ['error'],
      '@angular-eslint/template/alt-text': ['error'],
    },
  },
]);
