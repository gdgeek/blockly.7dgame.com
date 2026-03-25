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
  globals: {
    __BUILD_TIME__: "readonly",
  },
  extends: [
    "plugin:vue/vue3-essential",
    "eslint:recommended",
    "@vue/eslint-config-prettier",
    "plugin:prettier/recommended", // 添加 Prettier 推荐配置
  ],
  rules: {
    "no-empty-function": ["warn", { allow: ["arrowFunctions", "methods"] }],
    "no-unused-vars": [
      "warn",
      { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
    ],
    "no-empty-pattern": "warn",
    "prettier/prettier": [
      "error",
      {
        endOfLine: "auto", // 自动适配行尾序列，兼容 CI 环境
      },
    ],
  },
  overrides: [
    {
      // TypeScript 文件使用 @typescript-eslint 解析器和推荐规则
      files: ["**/*.ts"],
      parser: "@typescript-eslint/parser",
      plugins: ["@typescript-eslint"],
      extends: ["plugin:@typescript-eslint/recommended"],
      rules: {
        // 使用 @typescript-eslint 版本替代基础规则，避免冲突
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
      // 测试文件：允许 any 类型（mock 对象常用）
      files: ["src/__tests__/**/*.ts"],
      rules: {
        "@typescript-eslint/no-explicit-any": "off",
      },
    },
    {
      // 积木块定义文件：parameters/resource/block/generator 是 Blockly API 约定的函数签名参数
      files: ["src/blocks/**/*.js"],
      rules: {
        "no-unused-vars": [
          "warn",
          {
            argsIgnorePattern: "^_|^parameters$|^resource$|^generator$|^block$",
            varsIgnorePattern: "^_",
          },
        ],
        "no-empty-pattern": "off", // 空解构模式 {} 是积木块 API 的标准签名
      },
    },
    {
      // 积木块 TypeScript 文件：关闭基础 no-unused-vars，只用 @typescript-eslint 版本
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
        "no-empty-pattern": "off", // 空解构模式 {} 是积木块 API 的标准签名
      },
    },
  ],
};
