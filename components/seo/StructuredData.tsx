'use client';

interface StructuredDataProps {
  data: Record<string, unknown>;
}

export default function StructuredData({ data }: StructuredDataProps) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

export const organizationSchema = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'AWARI',
  url: process.env.NEXT_PUBLIC_BASE_URL || 'https://awari.ng',
  logo: `${process.env.NEXT_PUBLIC_BASE_URL || 'https://awari.ng'}/assets/images/logo.png`,
  description: 'Nigeria\'s trusted property marketplace for rentals, shortlets, hotels, and property sales',
  address: {
    '@type': 'PostalAddress',
    addressCountry: 'NG',
  },
  contactPoint: {
    '@type': 'ContactPoint',
    contactType: 'Customer Service',
    email: 'support@awari.ng',
  },
  sameAs: [
    'https://twitter.com/awari_ng',
    'https://facebook.com/awari',
    'https://instagram.com/awari_ng',
  ],
};

export const websiteSchema = {
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

export function generatePropertySchema(property: {
  title: string;
  description?: string;
  images?: Array<{ url?: string } | string>;
  address?: string;
  city?: string;
  state?: string;
  location?: { lat: number; lng: number };
  price?: number;
  isAvailable?: boolean;
  bedrooms?: number;
  size?: number;
  amenities?: string[];
  bookingType?: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': property.bookingType === 'hotel' ? 'Hotel' : 'RealEstateListing',
    name: property.title,
    description: property.description,
    image: property.images?.map((img) => (typeof img === 'string' ? img : img.url || '')) || [],
    address: {
      '@type': 'PostalAddress',
      streetAddress: property.address,
      addressLocality: property.city,
      addressRegion: property.state,
      addressCountry: 'NG',
    },
    geo: property.location ? {
      '@type': 'GeoCoordinates',
      latitude: property.location.lat,
      longitude: property.location.lng,
    } : undefined,
    offers: {
      '@type': 'Offer',
      price: property.price,
      priceCurrency: 'NGN',
      availability: property.isAvailable ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
    },
    numberOfRooms: property.bedrooms,
    floorSize: {
      '@type': 'QuantitativeValue',
      value: property.size,
      unitCode: 'SQM',
    },
    amenityFeature: property.amenities?.map((amenity: string) => ({
      '@type': 'LocationFeatureSpecification',
      name: amenity,
    })),
  };
}

export function generateBreadcrumbSchema(items: Array<{ name: string; url: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

export function generateReviewSchema(reviews: Array<{
  rating: number;
  user?: { firstName?: string };
  createdAt: string;
  comment: string;
}>) {
  if (!reviews || reviews.length === 0) return null;

  const aggregateRating = {
    '@type': 'AggregateRating',
    ratingValue: reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length,
    reviewCount: reviews.length,
    bestRating: 5,
    worstRating: 1,
  };

  return {
    aggregateRating,
    reviews: reviews.map(review => ({
      '@type': 'Review',
      author: {
        '@type': 'Person',
        name: review.user?.firstName || 'Anonymous',
      },
      datePublished: review.createdAt,
      reviewRating: {
        '@type': 'Rating',
        ratingValue: review.rating,
        bestRating: 5,
        worstRating: 1,
      },
      reviewBody: review.comment,
    })),
  };
}
