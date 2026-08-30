import { defineConfig, loadEnv } from "vite";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");

  return {
    base: "./",
    server: {
      port: 5173,
    },
    define: {
      __GA_GAME_KEY__: JSON.stringify(env.GA_GAME_KEY ?? ""),
      __GA_SECRET_KEY__: JSON.stringify(env.GA_SECRET_KEY ?? ""),
    },
    build: {
      outDir: "dist",
      chunkSizeWarningLimit: 1500,
      rollupOptions: {
        output: {
          manualChunks: {
            phaser: ["phaser"],
          },
        },
      },
    },
  };
});
