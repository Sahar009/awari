import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";


const montserrat = Montserrat({
  variable: "--font-primary",
  subsets: ["latin"],
  display: "swap",
});



export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || 'https://awari.ng'),
  title: {
    default: "AWARI - Find Your Perfect Property in Nigeria | Rentals, Shortlets & Sales",
    template: "%s | AWARI"
  },
  description: "Discover and book verified properties across Nigeria. Browse shortlets, rentals, hotels, and properties for sale. Secure booking with wallet payments. Your trusted property marketplace.",
  keywords: [
    "property rental Nigeria",
    "shortlet Nigeria",
    "hotels Nigeria",
    "property for sale Nigeria",
    "Lagos apartments",
    "Abuja rentals",
    "property booking",
    "real estate Nigeria",
    "vacation rentals",
    "furnished apartments"
  ],
  authors: [{ name: "AWARI" }],
  creator: "AWARI",
  publisher: "AWARI",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  icons: {
    icon: "/assets/images/favicon.png",
    apple: "/assets/images/favicon.png",
  },
  openGraph: {
    type: "website",
    locale: "en_NG",
    url: process.env.NEXT_PUBLIC_BASE_URL || 'https://awari.ng',
    siteName: "AWARI",
    title: "AWARI - Find Your Perfect Property in Nigeria",
    description: "Discover and book verified properties across Nigeria. Browse shortlets, rentals, hotels, and properties for sale.",
    images: [
      {
        url: "/assets/images/og-image.png",
        width: 1200,
        height: 630,
        alt: "AWARI - Property Marketplace",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "AWARI - Find Your Perfect Property in Nigeria",
    description: "Discover and book verified properties across Nigeria. Browse shortlets, rentals, hotels, and properties for sale.",
    images: ["/assets/images/og-image.png"],
    creator: "@awari_ng",
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
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const organizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'AWARI',
    url: process.env.NEXT_PUBLIC_BASE_URL || 'https://awari.ng',
    logo: `${process.env.NEXT_PUBLIC_BASE_URL || 'https://awari.ng'}/assets/images/logo.png`,
    description: 'Nigeria\'s trusted property marketplace for rentals, shortlets, hotels, and property sales',
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'Customer Service',
      email: 'support@awari.ng',
    },
  };

  const websiteSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'AWARI',
    url: process.env.NEXT_PUBLIC_BASE_URL || 'https://awari.ng',
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${process.env.NEXT_PUBLIC_BASE_URL || 'https://awari.ng'}/browse-listing?search={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };

  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
        />
      </head>
      <body className={`${montserrat.className} ${montserrat.variable} antialiased`}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
