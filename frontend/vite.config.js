import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const backendProxy = env.VITE_BACKEND_PROXY || "http://localhost:5000";

  return {
    plugins: [react()],
    server: {
      proxy: {
        "/api": {
          target: backendProxy,
          changeOrigin: true,
        },
        "/socket.io": {
          target: backendProxy,
          ws: true,
          changeOrigin: true,
        },
      },
    },
  };
});
