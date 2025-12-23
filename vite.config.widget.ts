import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import fs from "fs";

// Custom plugin to remove separate CSS file since we import it inline
function inlineCssPlugin() {
  return {
    name: 'inline-css',
    generateBundle(options: any, bundle: any) {
      // CSS is now imported directly via ?inline, so just remove the separate CSS file
      const cssFileName = Object.keys(bundle).find(name => name.endsWith('.css'));
      if (cssFileName) {
        delete bundle[cssFileName];
      }
    }
  };
}

// Build configuration for the standalone widget bundle
export default defineConfig({
  plugins: [react(), inlineCssPlugin()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    // Output to public directory so it can be served
    outDir: "public/widget-dist",
    // IMPORTANT: keep existing files so multiple widget builds can run sequentially
    // (e.g., VBH v2 + Creekside) without wiping each other's outputs.
    emptyOutDir: false,
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
    // Optimize for production with esbuild (built into Vite)
    minify: true,
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
