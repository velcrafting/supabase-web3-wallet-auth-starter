// next.config.ts
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true, // CI runs eslint separately
  },
  webpack: (config) => {
    config.externals.push('pino-pretty', 'encoding');

    // Ignore dynamic import warnings for the Supabase realtime package
    config.ignoreWarnings = [
      (warning: { module?: { resource?: string } }) =>
        Boolean(warning.module?.resource?.includes('@supabase/realtime-js')),
    ];

    return config;
  },
};

export default nextConfig;
