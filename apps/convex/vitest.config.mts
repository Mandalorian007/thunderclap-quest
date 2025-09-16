import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "edge-runtime",
    server: { deps: { inline: ["convex-test"] } },
    // Look for tests in the parallel tests/ directory
    include: ["tests/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}"],
    // Exclude any test files that might still be in convex/
    exclude: ["convex/**/*.{test,spec}.*", "node_modules/**"]
  }
});