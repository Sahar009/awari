import { Metadata } from 'next';

interface SEOProps {
  title: string;
  description: string;
  keywords?: string[];
  image?: string;
  url?: string;
  type?: 'website' | 'article' | 'product';
  noIndex?: boolean;
}

export function generateMetadata({
  title,
  description,
  keywords = [],
  image = '/assets/images/og-image.png',
  url,
  type = 'website',
  noIndex = false,
}: SEOProps): Metadata {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://awari.ng';
  const fullUrl = url ? `${baseUrl}${url}` : baseUrl;
  const fullImageUrl = image.startsWith('http') ? image : `${baseUrl}${image}`;

  return {
    title,
    description,
    keywords: keywords.length > 0 ? keywords : undefined,
    openGraph: {
      type: type === 'product' ? 'website' : type,
      url: fullUrl,
      title,
      description,
      images: [
        {
          url: fullImageUrl,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
      siteName: 'AWARI',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [fullImageUrl],
      creator: '@awari_ng',
    },
    robots: noIndex
      ? {
          index: false,
          follow: false,
        }
      : {
          index: true,
          follow: true,
        },
    alternates: {
      canonical: fullUrl,
    },
  };
}

interface PropertyData {
  id: string;
  title: string;
  description?: string;
  city: string;
  state: string;
  bookingType: string;
  bedrooms?: number;
  bathrooms?: number;
  price?: number;
  propertyType?: string;
  amenities?: string[];
  images?: Array<{ url?: string } | string>;
}

export function generatePropertyMetadata(property: PropertyData): Metadata {
  const title = `${property.title} - ${property.city}, ${property.state}`;
  const description = property.description?.substring(0, 160) || 
    `${property.bookingType} in ${property.city}. ${property.bedrooms} bedrooms, ${property.bathrooms} bathrooms. ₦${property.price?.toLocaleString()}`;
  
  const keywords = [
    property.bookingType,
    property.city,
    property.state,
    'Nigeria property',
    `${property.bedrooms} bedroom`,
    property.propertyType,
    ...(property.amenities || []),
  ].filter((k): k is string => k !== undefined && k !== null);

  const firstImage = property.images?.[0];
  const image = typeof firstImage === 'string' ? firstImage : (firstImage?.url || '/assets/images/og-image.png');

  return generateMetadata({
    title,
    description,
    keywords,
    image,
    url: `/product-details/${property.id}`,
    type: 'product',
  });
}

interface BlogPost {
  title: string;
  slug: string;
  excerpt?: string;
  content?: string;
  tags?: string[];
  featuredImage?: string;
}

export function generateBlogMetadata(post: BlogPost): Metadata {
  return generateMetadata({
    title: post.title,
    description: post.excerpt || post.content?.substring(0, 160) || '',
    keywords: post.tags || [],
    image: post.featuredImage || '/assets/images/og-image.png',
    url: `/blog/${post.slug}`,
    type: 'article',
  });
}

export const defaultKeywords = [
  'property rental Nigeria',
  'shortlet Nigeria',
  'hotels Nigeria',
  'property for sale Nigeria',
  'Lagos apartments',
  'Abuja rentals',
  'property booking',
  'real estate Nigeria',
  'vacation rentals',
  'furnished apartments',
  'student accommodation',
  'luxury apartments Nigeria',
];
