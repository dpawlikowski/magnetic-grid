import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// Separate build config for the standalone demo app (index.html), as
// opposed to vite.config.ts which builds the publishable library bundle.
// Used to produce the static site deployed to GitHub Pages.
export default defineConfig({
  plugins: [react()],
  base: process.env.DEMO_BASE_PATH ?? "/",
  build: {
    outDir: "dist-demo",
  },
});
