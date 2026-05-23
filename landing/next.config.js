const path = require('path')

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  outputFileTracingRoot: path.join(__dirname),
  async redirects() {
    return [
      { source: '/en', destination: '/', permanent: false },
      { source: '/en/:path*', destination: '/:path*', permanent: false },
      { source: '/it', destination: '/', permanent: false },
      { source: '/it/:path*', destination: '/:path*', permanent: false },
    ]
  },
}

module.exports = nextConfig
