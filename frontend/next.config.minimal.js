/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    // Disable problematic features that may cause bus errors
    turbo: false,
    serverComponents: true,
  },
  
  // Disable SWC minifier if causing issues
  swcMinify: false,
  
  // Reduce memory usage
  images: {
    unoptimized: true,
  },
  
  // Disable some optimizations that might cause issues
  optimizeFonts: false,
  
  // Environment configuration
  env: {
    NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000',
  },
  
  // Output configuration
  output: 'standalone',
  
  // Disable telemetry
  telemetry: false,
}

module.exports = nextConfig