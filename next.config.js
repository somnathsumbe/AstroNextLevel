/** @type {import('next').NextConfig} */
const isStaticExport = process.env.GITHUB_PAGES === 'true';
const basePath = isStaticExport ? '/AstroNextLevel' : '';

const nextConfig = {
  ...(isStaticExport ? { output: 'export' } : {}),
  basePath,
  assetPrefix: isStaticExport ? `${basePath}/` : undefined,
  trailingSlash: isStaticExport,
  images: {
    unoptimized: true,
  },
};

module.exports = nextConfig;