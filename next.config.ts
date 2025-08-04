import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['@supabase/supabase-js'],
  },
  // App Router doesn't use api.bodyParser
  // Size limit handled in route handler itself
};

export default nextConfig;