import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// Custom plugin to remove separate CSS file since we import it inline
function inlineCssPlugin() {
  return {
    name: 'inline-css',
    generateBundle(_options: any, bundle: any) {
      // CSS is imported via ?inline, so remove the separate CSS file
      const cssFileName = Object.keys(bundle).find(name => name.endsWith('.css'));
      if (cssFileName) {
        delete bundle[cssFileName];
      }
    }
  };
}

// Vite configuration for VBH widget build (Shadow DOM)
// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), inlineCssPlugin()],
  server: {
    cors: {
      origin: '*',
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    },
    headers: {
      'Access-Control-Allow-Origin': '*',
    },
  },
  preview: {
    cors: {
      origin: '*',
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    },
    headers: {
      'Access-Control-Allow-Origin': '*',
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    outDir: "public/widget-dist",
    emptyOutDir: false, // Don't wipe directory - other widget builds write here too
    // Inline ALL assets as base64 (critical for standalone widget on external sites)
    assetsInlineLimit: 1000000, // 1MB - inline everything
    lib: {
      entry: path.resolve(__dirname, "src/widget-entry-vbh.tsx"),
      formats: ["iife"],
      name: "VBHChatbot",
      fileName: () => "chatbot-widget-v2.js",
    },
    rollupOptions: {
      external: [],
      output: {
        inlineDynamicImports: true,
        manualChunks: undefined,
        assetFileNames: (assetInfo) => {
          if (assetInfo.name === 'style.css') {
            return 'styles-vbh.css';
          }
          return assetInfo.name || 'asset';
        },
      },
    },
    minify: true,
    chunkSizeWarningLimit: 1000,
  },
  define: {
    'process.env.NODE_ENV': JSON.stringify('production'),
  },
});
