import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import dotenv from 'dotenv'

dotenv.config();
// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    include: ['@react-three/drei']
  },
  define:{
    'process.env.RENDER_BASE_URL': JSON.stringify(process.env.RENDER_BASE_URL)
  }
})
