import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import fs from "fs";

// Custom plugin to inline CSS into JS for Shadow DOM
function inlineCssPlugin() {
  return {
    name: 'inline-css',
    generateBundle(options: any, bundle: any) {
      const cssFileName = Object.keys(bundle).find(name => name.endsWith('.css'));
      if (cssFileName) {
        const cssContent = bundle[cssFileName].source;
        const jsFiles = Object.keys(bundle).filter(name => name.endsWith('.js'));
        if (jsFiles.length) {
          const escapedCss = cssContent.replace(/`/g, '\\`').replace(/\$/g, '\\$');
          const placeholderRegex = /(['"])__INJECT_CSS_HERE__\1/g;

          for (const jsFileName of jsFiles) {
            const chunk: any = bundle[jsFileName];
            if (chunk && typeof chunk.code === 'string' && chunk.code.includes('__INJECT_CSS_HERE__')) {
              chunk.code = chunk.code.replace(placeholderRegex, '`' + escapedCss + '`');
            }
          }

          // Remove the separate CSS file since it's now inlined
          delete bundle[cssFileName];
        }
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
