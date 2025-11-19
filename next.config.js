/** @type {import('next').NextConfig} */
const nextConfig = {
  // Production sourcemaps configuration
  productionBrowserSourceMaps: false, // Disable sourcemaps in production for security
  
  // Development sourcemaps configuration
  webpack: (config, { dev, isServer }) => {
    // Suppress sourcemap warnings for VS Code internal files
    config.ignoreWarnings = [
      ...(config.ignoreWarnings || []),
      {
        module: /vs\/platform\/browserView/,
        message: /Failed to load source map/,
      },
      {
        module: /electron-main/,
        message: /Failed to load source map/,
      },
    ];

    // Configure sourcemaps for development
    if (dev && !isServer) {
      config.devtool = 'eval-source-map'; // Fast rebuilds with sourcemaps
    }

    return config;
  },

  // Suppress console warnings about sourcemaps
  onDemandEntries: {
    maxInactiveAge: 25 * 1000,
    pagesBufferLength: 2,
  },

  // Experimental features
  experimental: {
    // Suppress warnings
    suppressHydrationWarning: true,
  },
};

module.exports = nextConfig;
