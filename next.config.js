/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "Content-Security-Policy",
            value: `
              default-src 'self';
              img-src 'self' data: blob:;
              script-src 'self' 'unsafe-inline' 'unsafe-eval';
              style-src 'self' 'unsafe-inline';
              connect-src 'self' https:;
            `.replace(/\s{2,}/g, " ").trim(),
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
