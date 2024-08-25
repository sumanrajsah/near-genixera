// import { createRequire } from 'odule';
// const require = createRequire(import.meta.url);

import bundleAnalyzer from '@next/bundle-analyzer';
import crypto from 'crypto';

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
});

/** @type {import('next').NextConfig} */

const nextConfig = {
  //...
  webpack(config, { isServer }) {
    if (!isServer) {
      // Optimizing bundle size
      config.optimization.splitChunks = {
        chunks: 'all',
        cacheGroups: {
          //...
          lib: {
            test(module) {
              return (
                module.size() > 160000 &&
                /node_modules[/\\]/.test(module.identifier())
              );
            },
            name(module) {
              const hash = crypto
              .createHash('sha1')
              .update(module.identifier())
              .digest('hex')
              .substring(0, 8);
              return `lib-${hash}`;
            },
            priority: 30,
            minChunks: 1,
            reuseExistingChunk: true,
          },
        },
      };
    }
    return config;
  },
};

export default withBundleAnalyzer(nextConfig);