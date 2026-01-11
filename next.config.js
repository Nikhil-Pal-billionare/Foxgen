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

              script-src
                'self'
                'unsafe-eval'
                'unsafe-inline'
                https://checkout.razorpay.com;

              style-src
                'self'
                'unsafe-inline';

              img-src
                'self'
                https:
                data:
                blob:;

              font-src
                'self'
                https:
                data:;

              media-src
                'self'
                https:
                blob:;

              connect-src
                'self'
                https:
                wss:;

              frame-src
                'self'
                https://api.razorpay.com;
            `
              .replace(/\s{2,}/g, " ")
              .trim(),
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
