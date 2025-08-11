import { NextConfig } from "next";

const nextConfig: NextConfig = {
  webpack: (config) => {
    config.externals.push('pino-pretty', 'encoding');

    // Ignore dynamic import warnings for the Supabase realtime package
    config.ignoreWarnings = [
      (warning: { module?: { resource?: string } }) =>
        warning.module?.resource?.includes('@supabase/realtime-js')
    ];

    return config;
  },
};

export default nextConfig;
