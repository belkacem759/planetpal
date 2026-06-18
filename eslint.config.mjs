import nkzwConfig from "@nkzw/eslint-config";

const eslintConfig = [
  ...nkzwConfig,
  {
    ignores: [
      "node_modules/**",
      ".next/**",
      "out/**",
      "build/**",
      "dist/**",
    ],
  },
];

export default eslintConfig;
