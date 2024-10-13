/** @type {import('next').NextConfig} */
const nextConfig = {
    pageExtensions: ['mdx', 'md', 'jsx', 'js', 'tsx', 'ts'],
    images: {
        remotePatterns: [
          {
            protocol: 'https',
            hostname: 'ipfs.io',
            port: '',
          },
          {
            protocol: 'http',
            hostname: 'localhost',
            port: '8080',
          },
          {
            protocol: 'https',
            hostname: 'ipfs.filebase.io',
            port: '',
          },
          {
            protocol: 'http',
            hostname: 'localhost',
            port: '3000',
          },
          {
            protocol: 'https',
            hostname: 'localhost',
            port: '8080',
          },
          {
            protocol: 'http',
            hostname: 'localhost',
            port: '5001',
          },
          {
            protocol: 'https',
            hostname: 'assets.otherside.xyz',
            port: '',
          },
          {
            protocol: 'https',
            hostname: 'vftn7pdc-8080.inc1.devtunnels.ms',
            port: '',
          },
          {
            protocol: 'http',
            hostname: 'vftn7pdc-8080.inc1.devtunnels.ms',
            port: '',
          },
        ],
      },
    
};

export default nextConfig;