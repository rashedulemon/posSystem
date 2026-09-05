import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/posSystem/', // Base URL matching subpath hosting (https://rashedul.pro.bd/posSystem/)
})
