
import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  return {
    // GitHub Pagesのリポジトリ名が 'Extreme-Tabata-Timer' の場合、
    // base: '/Extreme-Tabata-Timer/' と記述するのが最も確実ですが、
    // 相対パスベースの './' でも構成によっては動作します 。
    base: './',
    server: {
      port: 3000,
      host: '0.0.0.0',
    },
    plugins: [react()],
    define: {
      // process.env を介したアクセスを可能にします
      'process.env.API_KEY': JSON.stringify(env.API_KEY || env.GEMINI_API_KEY),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './'),
      }
    },
    build: {
      // ビルド後の出力先を確認
      outDir: 'dist',
      assetsDir: 'assets',
    }
  };
});
