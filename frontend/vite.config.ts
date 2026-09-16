import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  base: process.env.GITHUB_PAGES === "true" || process.env.GITHUB_ACTIONS ? "/arbitrum-nexus/" : "/",
  plugins: [react()],
  server: {
    port: 5173,
    host: true,
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ["react", "react-dom"],
          viem: ["viem"],
          icons: ["lucide-react"],
        },
      },
    },
  },
});
