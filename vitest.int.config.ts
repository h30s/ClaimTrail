import path from "node:path";
import { defineConfig } from "vitest/config";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    environment: "node",
    include: ["src/**/*.int.test.ts"],
    fileParallelism: false,
    testTimeout: 60000,
    hookTimeout: 60000,
    setupFiles: ["./test/int-setup.ts"],
  },
  resolve: {
    alias: {
      "server-only": path.resolve(__dirname, "./test/empty.ts"),
    },
  },
});
