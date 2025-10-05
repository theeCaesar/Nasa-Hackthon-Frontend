// vite.config.ts or vite.config.js
import { defineConfig } from "vite";

export default defineConfig({
  // If you ever run dev on Render (not typical), this helps too:
  server: {
    host: true, // 0.0.0.0
    strictPort: true,
    port: process.env.PORT ? Number(process.env.PORT) : 5173,
  },
  preview: {
    host: true, // 0.0.0.0
    strictPort: true,
    port: process.env.PORT ? Number(process.env.PORT) : 4173,
    // ✅ Add your Render host here
    allowedHosts: ["nasa-hackthon-frontend.onrender.com"],
    // If you prefer to allow any host (less strict), some Vite versions support:
    // allowedHosts: true
  },
  // If you serve from a subpath, set `base` accordingly. Otherwise omit.
  // base: '/'
});
