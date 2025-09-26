import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/web3-game/',
  build: {
    outDir: '../docs', // 默认是 dist，可修改为自定义路径（如 'build'、'public' 等）
  }
})
