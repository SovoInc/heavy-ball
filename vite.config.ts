import { defineConfig } from "vite";

export default defineConfig({
  base: "/g/heavy-ball/",
  build: {
    outDir: "dist",
    emptyOutDir: true,
  },
  server: {
    proxy: {
      "/api": "http://localhost:3002",
    },
  },
});
