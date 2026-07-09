import type { Metadata } from "next";
import { Be_Vietnam_Pro, Noto_Serif_JP } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages } from "next-intl/server";
import { Analytics } from "@vercel/analytics/react";
import Script from "next/script";

import { BRAND_NAME, SITE_URL } from "@/lib/constants";
import "./globals.css";

const beVietnamPro = Be_Vietnam_Pro({
  subsets: ["latin", "vietnamese"],
  variable: "--font-sans",
  weight: ["400", "500", "600", "700", "800", "900"]
});

const notoSerifJp = Noto_Serif_JP({
  subsets: ["latin"],
  variable: "--font-jp",
  weight: ["500", "700", "900"]
});

export const viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover"
};

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  verification: {
    google: "4F3XIS7dg4bScUIEN9Gjk3jjFFVPitHMb6K26b1lK2A"
  },
  manifest: "/truongphistore/site.webmanifest",
  icons: {
    icon: [
      {
        url: "/truongphistore/favicon-16x16.png",
        sizes: "16x16",
        type: "image/png"
      },
      {
        url: "/truongphistore/favicon-32x32.png",
        sizes: "32x32",
        type: "image/png"
      }
    ],
    shortcut: "/truongphistore/favicon.ico",
    apple: [
      {
        url: "/truongphistore/apple-touch-icon.png",
        sizes: "180x180",
        type: "image/png"
      }
    ]
  },
  title: {
    default: `${BRAND_NAME} | Premium streetwear order`,
    template: `%s | ${BRAND_NAME}`
  },
  description:
    "Premium streetwear order store in Vietnam for Sukajan, bomber jackets, hoodies and seasonal pieces.",
  openGraph: {
    type: "website",
    siteName: BRAND_NAME,
    title: `${BRAND_NAME} | Premium streetwear order`,
    description:
      "Curated streetwear orders with delivery in 7-10 days and international consultation.",
    url: SITE_URL
  },
  twitter: {
    card: "summary_large_image"
  }
};

export default async function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();
  const messages = await getMessages();

  return (
    <html data-scroll-behavior="smooth" lang={locale}>
      <body
        className={`${beVietnamPro.className} ${beVietnamPro.variable} ${notoSerifJp.variable}`}
      >
        <NextIntlClientProvider messages={messages}>
          {children}
        </NextIntlClientProvider>
        <Analytics />
        {/* Google Tag (gtag.js) */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=AW-18283180920"
          strategy="afterInteractive"
        />
        <Script id="google-tag" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'AW-18283180920');
          `}
        </Script>
        {/* Meta Pixel */}
        {process.env.NEXT_PUBLIC_META_PIXEL_ID && (
          <>
            <Script id="meta-pixel" strategy="afterInteractive">
              {`
                !function(f,b,e,v,n,t,s)
                {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
                n.callMethod.apply(n,arguments):n.queue.push(arguments)};
                if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
                n.queue=[];t=b.createElement(e);t.async=!0;
                t.src=v;s=b.getElementsByTagName(e)[0];
                s.parentNode.insertBefore(t,s)}(window, document,'script',
                'https://connect.facebook.net/en_US/fbevents.js');
                fbq('init', '${process.env.NEXT_PUBLIC_META_PIXEL_ID}');
                fbq('track', 'PageView');
              `}
            </Script>
            <noscript>
              <img
                height="1"
                width="1"
                style={{ display: "none" }}
                src={`https://www.facebook.com/tr?id=${process.env.NEXT_PUBLIC_META_PIXEL_ID}&ev=PageView&noscript=1`}
                alt=""
              />
            </noscript>
          </>
        )}
      </body>
    </html>
  );
}
