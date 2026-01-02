import { defineConfig, mergeConfig } from "vitest/config";
import viteConfig from "./vite.config.js";

export default mergeConfig(
  viteConfig,
  defineConfig({
    test: {
      environment: "jsdom",
      globals: true,
      include: ["src/**/*.{test,spec}.{js,ts,vue}"],
      exclude: ["node_modules", "dist"],
      coverage: {
        provider: "v8",
        reporter: ["text", "json", "html"],
        exclude: ["node_modules/", "src/__tests__/setup.js"],
      },
      setupFiles: ["./src/__tests__/setup.js"],
    },
  })
);
