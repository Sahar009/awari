import { MetadataRoute } from 'next';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://awari.ng';
  
  // Static routes
  const staticRoutes = [
    '',
    '/home',
    '/about',
    '/contact',
    '/faq',
    '/privacy',
    '/terms',
    '/blog',
    '/shortlets',
    '/rentals',
    '/sales',
    '/hotels',
    '/browse-listing',
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: route === '' ? 1 : 0.8,
  }));

  // TODO: Add dynamic routes for properties
  // You can fetch properties from your API and add them here
  // Example:
  // const properties = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/properties`).then(r => r.json());
  // const propertyRoutes = properties.map((property: any) => ({
  //   url: `${baseUrl}/product-details/${property.id}`,
  //   lastModified: new Date(property.updatedAt),
  //   changeFrequency: 'weekly' as const,
  //   priority: 0.7,
  // }));

  return [
    ...staticRoutes,
    // ...propertyRoutes,
  ];
}
