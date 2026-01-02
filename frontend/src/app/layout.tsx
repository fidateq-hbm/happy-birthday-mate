import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/components/auth/AuthProvider";
import { PWAInstallPrompt } from "@/components/PWAInstallPrompt";
import ToasterProvider from "@/components/ToasterProvider";
import { StructuredData } from "@/components/StructuredData";

export const metadata: Metadata = {
  metadataBase: new URL('https://www.happybirthdaymate.com'),
  title: {
    default: "Happy Birthday Mate - Celebrate Together",
    template: "%s | Happy Birthday Mate",
  },
  description: "A global celebration platform where no one celebrates alone. Connect with birthday mates, celebrate in tribe rooms, create birthday walls, and send digital gifts.",
  keywords: [
    'birthday',
    'birthday celebration',
    'birthday platform',
    'birthday tribe',
    'birthday mates',
    'celebrate birthday',
    'digital birthday',
    'birthday wall',
    'birthday gifts',
    'birthday community',
    'global birthday',
    'birthday connection',
  ],
  authors: [{ name: 'Happy Birthday Mate' }],
  creator: 'Happy Birthday Mate',
  publisher: 'Happy Birthday Mate',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  manifest: '/manifest.json',
  themeColor: '#667eea',
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/favicon.ico', type: 'image/x-icon' },
    ],
    apple: '/favicon.svg',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Happy Birthday Mate',
  },
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
    viewportFit: 'cover',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://www.happybirthdaymate.com',
    siteName: 'Happy Birthday Mate',
    title: 'Happy Birthday Mate - Celebrate Together',
    description: 'A global celebration platform where no one celebrates alone. Connect with birthday mates, celebrate in tribe rooms, create birthday walls, and send digital gifts.',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Happy Birthday Mate - Celebrate Together',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Happy Birthday Mate - Celebrate Together',
    description: 'A global celebration platform where no one celebrates alone. Connect with birthday mates and celebrate together!',
    images: ['/og-image.jpg'],
    creator: '@happybirthdaymate',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    // Add your verification codes here when available
    // google: 'your-google-verification-code',
    // yandex: 'your-yandex-verification-code',
    // bing: 'your-bing-verification-code',
  },
  alternates: {
    canonical: 'https://www.happybirthdaymate.com',
  },
  category: 'social',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {/* PWA meta tags */}
        <meta name="application-name" content="Happy Birthday Mate" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="HBM" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="theme-color" content="#667eea" />
        
        {/* Apple Touch Icons */}
        <link rel="apple-touch-icon" href="/icons/icon-152x152.png" />
        <link rel="apple-touch-icon" sizes="152x152" href="/icons/icon-152x152.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/icons/icon-192x192.png" />
        <link rel="apple-touch-icon" sizes="167x167" href="/icons/icon-192x192.png" />
        
        {/* Splash screens for iOS */}
        <link rel="apple-touch-startup-image" href="/splash/splash-640x1136.png" media="(device-width: 320px) and (device-height: 568px) and (-webkit-device-pixel-ratio: 2)" />
        <link rel="apple-touch-startup-image" href="/splash/splash-750x1334.png" media="(device-width: 375px) and (device-height: 667px) and (-webkit-device-pixel-ratio: 2)" />
        <link rel="apple-touch-startup-image" href="/splash/splash-1242x2208.png" media="(device-width: 414px) and (device-height: 736px) and (-webkit-device-pixel-ratio: 3)" />
        
        <link rel="manifest" href="/manifest.json" />
        <link rel="icon" href="/favicon.ico" type="image/x-icon" />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/favicon.svg" />
      </head>
      <body>
        <StructuredData
          data={{
            '@context': 'https://schema.org',
            '@type': 'Organization',
            name: 'Happy Birthday Mate',
            url: 'https://www.happybirthdaymate.com',
            logo: 'https://www.happybirthdaymate.com/favicon.svg',
            description: 'A global celebration platform where no one celebrates alone',
            sameAs: [
              // Add social media links when available
            ],
            contactPoint: {
              '@type': 'ContactPoint',
              email: 'support@happybirthdaymate.com',
              contactType: 'Customer Service',
            },
          }}
        />
        <StructuredData
          data={{
            '@context': 'https://schema.org',
            '@type': 'WebSite',
            name: 'Happy Birthday Mate',
            url: 'https://www.happybirthdaymate.com',
            description: 'A global celebration platform where no one celebrates alone',
            potentialAction: {
              '@type': 'SearchAction',
              target: {
                '@type': 'EntryPoint',
                urlTemplate: 'https://www.happybirthdaymate.com/help?search={search_term_string}',
              },
              'query-input': 'required name=search_term_string',
            },
          }}
        />
        <PWAInstallPrompt />
        <AuthProvider>
          {children}
        </AuthProvider>
        <ToasterProvider />
      </body>
    </html>
  );
}

