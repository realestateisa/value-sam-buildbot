import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import fs from "fs";
import { build as esbuild } from "esbuild";
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
          fileName: () => "chatbot-widget.js",
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
    plugins: (() => {
      const plugins: any[] = [react()];
      if (mode === "development") plugins.push(componentTagger());

      plugins.push({
        // Ensure the production site always ships working embed files at:
        //   /widget-dist/chatbot-widget-v2.js
        //   /widget-dist/chatbot-widget.js
        name: "build-vbh-widget-artifacts",
        apply: "build" as const,
        async closeBundle() {
          const outDir = path.resolve(__dirname, "dist");
          const widgetOutDir = path.join(outDir, "widget-dist");
          fs.mkdirSync(widgetOutDir, { recursive: true });

          const inlineQueryRE = /\?inline$/;

          const result = await esbuild({
            entryPoints: [path.resolve(__dirname, "src/widget-entry.tsx")],
            bundle: true,
            format: "iife",
            globalName: "ValueBuildChatbot",
            target: ["es2019"],
            write: false,
            minify: true,
            loader: {
              ".png": "dataurl",
              ".jpg": "dataurl",
              ".jpeg": "dataurl",
              ".svg": "dataurl",
              ".webp": "dataurl",
              ".css": "text",
            },
            plugins: [
              {
                name: "inline-query-loader",
                setup(build) {
                  build.onResolve({ filter: inlineQueryRE }, (args) => {
                    const cleaned = args.path.replace(inlineQueryRE, "");
                    return {
                      path: path.isAbsolute(cleaned)
                        ? cleaned
                        : path.resolve(args.resolveDir, cleaned),
                      namespace: "inline-file",
                    };
                  });

                  build.onLoad({ filter: /.*/, namespace: "inline-file" }, async (args) => {
                    const contents = await fs.promises.readFile(args.path, "utf8");
                    return { contents, loader: "text" };
                  });
                },
              },
              {
                name: "alias-at",
                setup(build) {
                  build.onResolve({ filter: /^@\// }, (args) => {
                    return {
                      path: path.resolve(__dirname, "src", args.path.slice(2)),
                    };
                  });
                },
              },
            ],
          });

          const code = result.outputFiles?.[0]?.text ?? "";
          if (!code) throw new Error("Widget build produced empty output");

          fs.writeFileSync(path.join(widgetOutDir, "chatbot-widget-v2.js"), code, "utf8");
          fs.writeFileSync(path.join(widgetOutDir, "chatbot-widget.js"), code, "utf8");
        },
      });

      return plugins;
    })(),
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
