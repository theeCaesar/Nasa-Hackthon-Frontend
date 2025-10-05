// vite.config.ts
import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import { fileURLToPath, URL } from "node:url";

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) },
  },
  server: {
    host: true, // 0.0.0.0 for dev (if ever used on Render)
    port: Number(process.env.PORT) || 5173,
    strictPort: true,
  },
  preview: {
    host: true, // 0.0.0.0 for preview
    port: Number(process.env.PORT) || 4173,
    strictPort: true,
    // ✅ allow your Render hostname
    allowedHosts: ["nasa-hackthon-frontend.onrender.com"],
    // If your Vite version supports it and you want to allow any:
    // allowedHosts: true
  },
});
