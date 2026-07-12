import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// The same Vite config drives two very different builds:
//   BUILD_MODE=lib  -> the publishable ES library (src/index.ts), React externalised
//   default         -> the interactive demo (index.html) deployed to GitHub Pages
// BASE_URL lets the Pages workflow set the repo sub-path (/magnetic-grid/).
const isLibBuild = process.env.BUILD_MODE === "lib";

export default defineConfig({
  plugins: [react()],
  base: process.env.BASE_URL ?? "/",
  ...(isLibBuild
    ? {
        build: {
          lib: {
            entry: "src/index.ts",
            name: "MagneticGrid",
            formats: ["es"] as const,
            fileName: "magnetic-grid",
          },
          rollupOptions: {
            external: ["react", "react-dom", "react/jsx-runtime"],
            output: {
              globals: {
                react: "React",
                "react-dom": "ReactDOM",
              },
            },
          },
        },
      }
    : {
        build: {
          outDir: "dist-demo",
          rollupOptions: {
            input: "index.html",
          },
        },
      }),
});
