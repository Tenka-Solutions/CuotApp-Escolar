import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // No exponer la versión de Next.js en headers HTTP
  poweredByHeader: false,
  // Habilitar compresión gzip/brotli
  compress: true,
  // Imágenes desde Supabase Storage
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
}

export default nextConfig
