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
          // Properly escape CSS for JavaScript template literal
          const escapedCss = String(cssContent)
            .replace(/\\/g, '\\\\')    // Escape backslashes first
            .replace(/`/g, '\\`')       // Escape backticks
            .replace(/\$/g, '\\$')      // Escape dollar signs
            .replace(/\r?\n/g, '\\n');  // Convert newlines to \n
          
          let replacedCount = 0;
          
          for (const jsFileName of jsFiles) {
            const chunk: any = bundle[jsFileName];
            if (chunk && typeof chunk.code === 'string') {
              const originalCode = chunk.code;
              
              // Try multiple replacement strategies for minified code
              // Strategy 1: Match with quotes (both single and double)
              chunk.code = chunk.code.replace(
                /["']__INJECT_CSS_HERE__["']/g,
                '`' + escapedCss + '`'
              );
              
              // Strategy 2: Match as a variable assignment
              chunk.code = chunk.code.replace(
                /=["']__INJECT_CSS_HERE__["']/g,
                '=`' + escapedCss + '`'
              );
              
              // Strategy 3: Match in const/let/var declarations
              chunk.code = chunk.code.replace(
                /(const|let|var)\s+\w+\s*=\s*["']__INJECT_CSS_HERE__["']/g,
                (match) => match.replace(/["']__INJECT_CSS_HERE__["']/, '`' + escapedCss + '`')
              );
              
              if (chunk.code !== originalCode) {
                replacedCount++;
                console.log(`✅ CSS injected into ${jsFileName} (${escapedCss.length} chars)`);
              }
            }
          }
          
            // Remove the separate CSS file since it's now inlined (or at least attempted)
            delete bundle[cssFileName];
        }
      } else {
        console.warn('⚠️ No CSS file found in bundle');
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
