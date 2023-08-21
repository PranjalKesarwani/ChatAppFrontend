import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()]

})

// server: {
//   proxy: {
//     '/api': 'https://sayhii.onrender.com', // Forward requests from /api to the backend
    
//   },
// }