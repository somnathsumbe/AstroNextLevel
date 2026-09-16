/** @type {import('next').NextConfig} */
const isStaticExport = process.env.GITHUB_PAGES === 'true';
const basePath = isStaticExport ? '/AstroNextLevel' : '';

const nextConfig = {
  ...(isStaticExport ? { output: 'export' } : {}),
  basePath,
  assetPrefix: isStaticExport ? `${basePath}/` : undefined,
  trailingSlash: false,
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), payment=(), usb=()' },
        ],
      },
    ];
  },
  images: {
    unoptimized: true,
  },
};

module.exports = nextConfig;