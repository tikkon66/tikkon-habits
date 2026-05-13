import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      // Это создаст алиас '@', который указывает на вашу папку 'src'
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  // Не забудьте вернуть base, если деплоите на GitHub Pages
  base: '/tikkon-habits/' 
})
