import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { saveSearchEndpoint } from './src/api/save-search'

export default defineConfig({
  plugins: [
    react(),
    {
      name: 'api-routes',
      configureServer(server) {
        server.middlewares.use('/api/save-search', async (req, res) => {
          if (req.method === 'POST') {
            const response = await saveSearchEndpoint(req as any)
            res.statusCode = response.status
            res.setHeader('Content-Type', 'application/json')
            res.end(await response.text())
          } else {
            res.statusCode = 405
            res.end(JSON.stringify({ message: 'Method not allowed' }))
          }
        })
      },
    },
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})