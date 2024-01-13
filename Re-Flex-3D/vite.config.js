import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import dotenv from 'dotenv'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    include: ['@react-three/drei']
  },
  define:{
    'process.env.MACHINE_ONE_URL':JSON.stringify(process.env.MACHINE_ONE_URL)
  }
})
