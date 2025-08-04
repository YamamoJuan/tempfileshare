import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  api: {
    bodyParser: {
      sizeLimit: '50mb',
    },
    responseLimit: '50mb',
  },
  // Untuk App Router, gunakan experimental
  experimental: {
    serverComponentsExternalPackages: ['@supabase/supabase-js'],
  }
};

export default nextConfig;