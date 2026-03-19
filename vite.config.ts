import { defineConfig } from "vite";

export default defineConfig({
  base: "/g/heavy-ball/",
  build: {
    outDir: "dist",
    emptyOutDir: true,
  },
  server: {
    proxy: {
      "/g/heavy-ball/api": {
        target: "http://localhost:3002",
        rewrite: (path) => path.replace(/^\/g\/heavy-ball/, ""),
      },
    },
  },
});
