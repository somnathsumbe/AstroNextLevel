/** @type {import('next').NextConfig} */
const isProduction = process.env.NODE_ENV === 'production';
const basePath = isProduction ? '/AstroNextLevel' : '';

const nextConfig = {
  output: 'export',
  basePath,
  assetPrefix: isProduction ? `${basePath}/` : undefined,
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
};

module.exports = nextConfig;