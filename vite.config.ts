import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, __dirname, '');
  return {
    root: path.resolve(__dirname, "client"),
    publicDir: path.resolve(__dirname, "public"),
    plugins: [react()],
    define: {
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY || ''),
      'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY || ''),
    },
    server: {
      port: 5000,
      strictPort: true,
      host: "0.0.0.0",
      proxy: {
        "/api": {
          target: "http://127.0.0.1:5030",
          changeOrigin: true,
          secure: false,
          router: function (req) {
            try {
              const port = fs.readFileSync(path.resolve(__dirname, '.backend-port'), 'utf-8').trim();
              if (port) {
                return `http://127.0.0.1:${port}`;
              }
            } catch (e) {
              // ignore
            }
            return "http://127.0.0.1:5030";
          }
        },
      },
    },
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./client/src"),
      },
    },
    build: {
      outDir: path.resolve(__dirname, "dist"),
      emptyOutDir: true,
    },
  };
});
