import { Metadata } from 'next';

const baseUrl = 'https://www.happybirthdaymate.com';

export const defaultMetadata: Metadata = {
  metadataBase: new URL(baseUrl),
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
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: baseUrl,
    siteName: 'Happy Birthday Mate',
    title: 'Happy Birthday Mate - Celebrate Together',
    description: 'A global celebration platform where no one celebrates alone. Connect with birthday mates, celebrate in tribe rooms, create birthday walls, and send digital gifts.',
    images: [
      {
        url: `${baseUrl}/og-image.jpg`,
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
    images: [`${baseUrl}/og-image.jpg`],
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
  alternates: {
    canonical: baseUrl,
  },
};

export function getPageMetadata(
  title: string,
  description: string,
  path: string,
  image?: string
): Metadata {
  const url = `${baseUrl}${path}`;
  
  return {
    title,
    description,
    openGraph: {
      ...defaultMetadata.openGraph,
      title,
      description,
      url,
      images: image ? [{ url: image, width: 1200, height: 630, alt: title }] : defaultMetadata.openGraph?.images,
    },
    twitter: {
      ...defaultMetadata.twitter,
      title,
      description,
      images: image ? [image] : defaultMetadata.twitter?.images,
    },
    alternates: {
      canonical: url,
    },
  };
}

