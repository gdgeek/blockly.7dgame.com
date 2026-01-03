// /* eslint-env node */
// require('@rushstack/eslint-patch/modern-module-resolution');

// module.exports = {
//   root: true,
//   extends: [
//     'plugin:vue/vue3-essential',
//     'eslint:recommended',
//     '@vue/eslint-config-prettier',
//   ],
// };

require("@rushstack/eslint-patch/modern-module-resolution");

module.exports = {
  root: true,
  env: {
    browser: true,
    es2021: true,
    node: true,
  },
  extends: [
    "plugin:vue/vue3-essential",
    "eslint:recommended",
    "@vue/eslint-config-prettier",
    "plugin:prettier/recommended", // 添加 Prettier 推荐配置
  ],
  rules: {
    "no-empty-function": "off",
    "no-unused-vars": "off",
    "no-empty-pattern": "off",
    "prettier/prettier": [
      "error",
      {
        endOfLine: "crlf", // 确保使用 CRLF 行尾序列
      },
    ],
  },
};
