'use client';

import { usePathname } from 'next/navigation';
import { useEffect } from 'react';

export default function SEOHead() {
  const pathname = usePathname();

  useEffect(() => {
    // Track page views for analytics
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('config', process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || '', {
        page_path: pathname,
      });
    }
  }, [pathname]);

  return null;
}

// Utility to add canonical URL
export function addCanonicalURL(url: string) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://awari.ng';
  return `${baseUrl}${url}`;
}

// Utility to generate breadcrumb JSON-LD
export function generateBreadcrumbLD(items: Array<{ name: string; url: string }>) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://awari.ng';
  
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: `${baseUrl}${item.url}`,
    })),
  };
}
