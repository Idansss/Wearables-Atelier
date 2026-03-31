import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./src/tests/setup.ts"],
    coverage: {
      provider: "v8",
      reporter: ["text", "lcov", "html"],
      include: ["src/app/lib/**/*.ts"],
      exclude: ["src/app/lib/supabase.ts"],
      thresholds: {
        // Thresholds apply only to the pure utility libs (errors.ts, validation.ts).
        // db.ts / email.ts / logger.ts require Supabase/network and are covered
        // by integration tests, not unit tests — so overall line % is intentionally low.
        lines: 10,
        functions: 60,
        branches: 60,
      },
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
