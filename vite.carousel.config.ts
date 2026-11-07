import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// Bundle the real React carousel as a classic script so index.html also works from disk.
export default defineConfig({
  plugins: [react(), tailwindcss()],
  define: { "process.env.NODE_ENV": JSON.stringify("production") },
  build: {
    outDir: "assets",
    emptyOutDir: false,
    minify: true,
    lib: {
      entry: "src/main.tsx",
      name: "JessicaProjectCarousel",
      formats: ["iife"],
      fileName: () => "project-carousel.js",
      cssFileName: "project-carousel",
    },
  },
});
