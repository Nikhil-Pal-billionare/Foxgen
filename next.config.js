/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "vusewiyltopamrfduifq.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },

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
                https://checkout.razorpay.com
                https://www.googletagmanager.com
                https://www.google-analytics.com
                https://static.cloudflareinsights.com;

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
                wss:
                https://www.google-analytics.com
                https://region1.google-analytics.com
                https://static.cloudflareinsights.com;

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
