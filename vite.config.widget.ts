import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// Build configuration for the standalone widget bundle
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    // Output to public directory so it can be served
    outDir: "public/widget-dist",
    // Library mode for bundling as a single file
    lib: {
      entry: path.resolve(__dirname, "src/widget-entry.tsx"),
      formats: ["iife"],
      name: "ValueBuildChatbot",
      fileName: () => "chatbot-widget-v2.js",
    },
    rollupOptions: {
      // Don't externalize anything - bundle everything
      external: [],
      output: {
        // Inline all dynamic imports into single file
        inlineDynamicImports: true,
        // Don't split into chunks
        manualChunks: undefined,
        // Inline CSS into JS
        assetFileNames: (assetInfo) => {
          if (assetInfo.name === 'style.css') {
            return 'styles.css';
          }
          return assetInfo.name || 'asset';
        },
      },
    },
    // Optimize for production
    minify: "terser",
    terserOptions: {
      compress: {
        drop_console: true,
      },
    },
    // Increase chunk size warning limit
    chunkSizeWarningLimit: 1000,
  },
  // Inline CSS into the bundle
  css: {
    postcss: {
      plugins: [],
    },
  },
  define: {
    // Ensure environment variables are available
    'process.env.NODE_ENV': JSON.stringify('production'),
  },
});
