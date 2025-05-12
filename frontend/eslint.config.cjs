const { FlatCompat } = require("@eslint/eslintrc");

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

module.exports = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    plugins: ["@next/next"],
    rules: {
      "@next/next/no-html-link-for-pages": ["error", "src/app"],
    },
  },
];
