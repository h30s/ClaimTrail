import path from "node:path";
import { defineConfig } from "vitest/config";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    environment: "node",
    include: ["src/**/*.int.test.ts"],
    fileParallelism: false,
  },
  resolve: {
    alias: {
      "server-only": path.resolve(__dirname, "./test/empty.ts"),
    },
  },
});
