/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // Optimize font loading to prevent preload warnings
  optimizeFonts: true,
  experimental: {
    optimizeCss: true,
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-eval' 'unsafe-inline' https: http://localhost:* chrome-extension://* blob:",
              "script-src-elem 'self' 'unsafe-inline' https: http://localhost:* chrome-extension://* blob:",
              "style-src 'self' 'unsafe-inline' https: http://localhost:* blob:",
              "img-src 'self' data: https: http://localhost:* blob:",
              "font-src 'self' data: https: http://localhost:* blob:",
              "connect-src 'self' http://localhost:* https://saving-app-backend-six.vercel.app https://*.vercel.app https://www.google-analytics.com https://analytics.google.com wss: ws:",
              "frame-src 'self' https: http://localhost:* chrome-extension://*",
              "worker-src 'self' blob:",
              "manifest-src 'self'",
            ].join('; ')
          },
        ],
      },
      {
        source: '/sw.js',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-cache, no-store, must-revalidate',
          },
          {
            key: 'Service-Worker-Allowed',
            value: '/',
          },
        ],
      },
    ]
  },
}

export default nextConfig