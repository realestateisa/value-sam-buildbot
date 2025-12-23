import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

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

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const isWidget = process.env.BUILD_TARGET === 'widget';
  
  if (isWidget) {
    // Widget build configuration
    return {
      plugins: [react(), inlineCssPlugin()],
      resolve: {
        alias: {
          "@": path.resolve(__dirname, "./src"),
        },
      },
      build: {
        outDir: "public/widget-dist",
        lib: {
          entry: path.resolve(__dirname, "src/widget-entry.tsx"),
          formats: ["iife"],
          name: "ValueBuildChatbot",
          fileName: () => "chatbot-widget-v2.js",
        },
        rollupOptions: {
          external: [],
          output: {
            inlineDynamicImports: true,
            manualChunks: undefined,
            assetFileNames: (assetInfo) => {
              if (assetInfo.name === 'style.css') {
                return 'styles.css';
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
    };
  }
  
  // Main app build configuration
  return {
    server: {
      host: "::",
      port: 8080,
      cors: {
        origin: '*',
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization'],
      },
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    },
    plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    preview: {
      cors: {
        origin: '*',
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      },
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    },
  };
});
