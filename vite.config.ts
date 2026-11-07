import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { cpSync, existsSync } from "node:fs";
import { fileURLToPath, URL } from "node:url";

export default defineConfig({
  base: "./",
  plugins: [
    react(),
    tailwindcss(),
    {
      name: "preserve-koi-portfolio",
      closeBundle() {
        for (const file of ["portfolio.html", "playground.html", "koi-pond.js", "koi-pond.css", "resume.pdf", "assets"]) {
          if (existsSync(file)) cpSync(file, `dist/${file}`, { recursive: true });
        }
      },
    },
  ],
  resolve: { alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) } },
});
