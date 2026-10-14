import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  // tsconfig keeps jsx: "preserve" for Next; tests that import a component need
  // vite to compile JSX itself.
  oxc: { jsx: { runtime: "automatic" } },
  test: {
    environment: "node",
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "."),
    },
  },
});
