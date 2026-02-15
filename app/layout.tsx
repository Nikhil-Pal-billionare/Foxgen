import "./globals.css";
import type { Metadata } from "next";
import Script from "next/script";

export const metadata: Metadata = {
  title: "FoxGen",
  description: "AI Content Creation Platform",
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
    ],
    apple: "/apple-touch-icon.png",
  },
};

const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Foxgen AI",
  url: "https://foxgen.in",
  logo: "https://foxgen.in/demo/foxgen-logo.png",
  description: "AI Content Creation Platform",
  sameAs: [],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        {/* Organization Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(organizationSchema),
          }}
        />
      </head>

      <body className="min-h-screen bg-[#0D0D0D] text-white">

        {/* Load Google Tag (Single Script for GA + Google Ads) */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-FXHYGC4339"
          strategy="afterInteractive"
        />

        <Script id="gtag-init" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());

            // Google Analytics
            gtag('config', 'G-FXHYGC4339', {
              page_path: window.location.pathname,
            });

            // Google Ads
            gtag('config', 'AW-17828891642');
          `}
        </Script>

        {children}
      </body>
    </html>
  );
}
