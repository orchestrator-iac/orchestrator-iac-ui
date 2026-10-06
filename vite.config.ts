import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: "/",
  resolve: {
    alias: {
      "@": "/src",
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          // Keep Ace's browser editor runtime separate from the CodeEditor
          // wrapper. This is a cacheable editor dependency, not route logic.
          if (id.includes("node_modules/ace-builds/src-noconflict/ace.js")) {
            return "ace-core";
          }
        },
      },
    },
  },
});
