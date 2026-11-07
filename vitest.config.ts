import { defineConfig } from "vitest/config";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
    exclude: ["src/**/*.int.test.ts"],
    coverage: {
      include: ["src/features/**/domain/**", "src/lib/format.ts"],
      thresholds: { lines: 90 },
    },
  },
});
