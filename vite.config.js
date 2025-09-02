import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import path from "path";

// https://vite.dev/config/
export default defineConfig(({ command, mode }) => {
  let base = './'; // 預設值

  // 根據不同情況設定 base 路徑
  if (command === 'build') {
    if (mode === 'production') {
      base = '/frontend/'; // 生產環境構建
    } else if (mode === 'development') {
      base = './'; // 開發環境構建（如果需要）
    }
  } else if (command === 'serve') {
    base = './'; // 本地開發服務器
  }

  console.log(`Vite config - Command: ${command}, Mode: ${mode}, Base: ${base}`);

  return {
    base: base,
    plugins: [vue()],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    server: {
      port: 5173
    },
    build: {
      // 可以根據需要調整輸出目錄
      outDir: mode === 'production' ? 'dist' : 'dist-dev'
    }
  };
});
