import pluginJs from "@eslint/js";
import tseslint from "@typescript-eslint/eslint-plugin";
import parser from "@typescript-eslint/parser"; 

export default [
  {
    files: ["**/*.{js,mjs,cjs,ts}"],
    parser: parser,
    parserOptions: {
      ecmaVersion: 2020,
      sourceType: "module", // Allows the use of import/export
    },
    env: {
      browser: true,
      node: true,
    },
    extends: [
      pluginJs.configs.recommended,
      ...tseslint.configs.recommended,
    ],
    rules: {
      // will add as we go
    },
  },
];
