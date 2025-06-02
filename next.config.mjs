/** @type {import('next').NextConfig} */
const nextConfig = {
  // Für Vercel Deployment optimiert
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'resumeparser.app',
      },
      {
        protocol: 'https',
        hostname: 'vercel.app',
      },
    ],
  },
  
  // API-Routen Konfiguration
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: '/api/:path*',
      },
    ]
  },
  
  // Entwicklungshilfen
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },

  // Experimentelle Funktionen für bessere Performance
  experimental: {
    ppr: false
  }
}

export default nextConfig