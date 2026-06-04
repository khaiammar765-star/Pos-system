import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': 'http://localhost:8080',
      '/login': {
        target: 'http://localhost:8080',
        // A browser visiting/refreshing /login wants the React page, so serve the
        // SPA for those (GET + "text/html"). The actual login form submit is an
        // axios POST (not text/html), so it still gets proxied to the backend.
        bypass: (req) => {
          if (req.method === 'GET' && (req.headers.accept || '').includes('text/html')) {
            return '/index.html'
          }
        },
      },
      '/logout': 'http://localhost:8080',
    }
  }
})
