import { resolve } from "node:path";
import { defineConfig } from "vitest/config";

/**
 * Vitest Config
 * @param {string} path - The path to the project root directory. (`import.meta.dirname`)
 * @internal
 */
export default (path) =>
  defineConfig({
    resolve: {
      alias: {
        "@": resolve(path, "src/"),
      },
    },
    test: {
      environment: "jsdom",
      // exclude: ["**/node_modules/**", "**/dist/**", "**/index.ts"]
      coverage: {
        provider: "v8", // or 'istanbul'
        all: true,
        reporter: ["text"],
        include: ["src/**/*.{ts,tsx}"],
        exclude: [
          // 📁 configuration and build-related files
          "config/**",

          // ⚙️ environment or base setup files
          "**/*.base.ts",
          "**/*.dev.ts",
          "**/*.prod.ts",

          // 📄 type definitions
          "**/*.d.ts",
          "**/types.ts",

          // 📦 index files (re-export only)
          "**/index.ts",

          // 🔧 project configs and tooling
          "vite.config.*",
          "vitest.config.*",

          // 🧪 test and mock directories
          "**/__tests__/**",
          "**/__mocks__/**",
        ],
      },
    },
  });
