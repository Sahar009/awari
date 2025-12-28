# SEO Implementation Guide for AWARI

This document explains the SEO enhancements implemented in the AWARI frontend application.

## 📋 What's Been Implemented

### 1. **Enhanced Root Metadata** (`app/layout.tsx`)
- Comprehensive meta tags with title templates
- Open Graph tags for social media sharing
- Twitter Card integration
- Robots meta tags for search engine crawling
- Google Site Verification support
- Rich keywords targeting Nigerian property market

### 2. **Structured Data (JSON-LD)**
Location: `components/seo/StructuredData.tsx`

Schemas available:
- **Organization Schema**: Company information
- **Website Schema**: Site-wide search functionality
- **Property Schema**: Individual property listings
- **Breadcrumb Schema**: Navigation hierarchy
- **Review Schema**: Aggregate ratings and reviews

### 3. **SEO Utilities** (`lib/seo.ts`)
Helper functions for generating dynamic metadata:
- `generateMetadata()`: Create page-specific SEO tags
- `generatePropertyMetadata()`: Property listing SEO
- `generateBlogMetadata()`: Blog post SEO
- Default keywords array

### 4. **Robots.txt** (`app/robots.ts`)
- Allows search engine crawling of public pages
- Blocks private pages (dashboard, settings, etc.)
- Sitemap reference

### 5. **Sitemap** (`app/sitemap.ts`)
- Dynamic XML sitemap generation
- Static routes included
- Ready for dynamic property routes

### 6. **PWA Manifest** (`app/manifest.ts`)
- Progressive Web App support
- App icons configuration
- Theme colors and display settings

## 🚀 How to Use

### For Static Pages

Add metadata to any page:

```typescript
import { Metadata } from 'next';
import { generateMetadata } from '@/lib/seo';

export const metadata: Metadata = generateMetadata({
  title: 'About Us - AWARI',
  description: 'Learn about AWARI, Nigeria\'s trusted property marketplace',
  keywords: ['about awari', 'property marketplace Nigeria'],
  url: '/about',
});
```

### For Dynamic Property Pages

```typescript
import { generatePropertyMetadata } from '@/lib/seo';
import StructuredData, { generatePropertySchema } from '@/components/seo/StructuredData';

export async function generateMetadata({ params }): Promise<Metadata> {
  const property = await fetchProperty(params.id);
  return generatePropertyMetadata(property);
}

export default function PropertyPage({ property }) {
  const propertySchema = generatePropertySchema(property);
  
  return (
    <>
      <StructuredData data={propertySchema} />
      {/* Your page content */}
    </>
  );
}
```

### Adding Breadcrumbs

```typescript
import { generateBreadcrumbSchema } from '@/components/seo/StructuredData';
import StructuredData from '@/components/seo/StructuredData';

const breadcrumbs = [
  { name: 'Home', url: '/' },
  { name: 'Shortlets', url: '/shortlets' },
  { name: 'Lagos', url: '/shortlets/lagos' },
];

const breadcrumbSchema = generateBreadcrumbSchema(breadcrumbs);

<StructuredData data={breadcrumbSchema} />
```

## 🔧 Environment Variables Required

Add these to your `.env.local`:

```env
NEXT_PUBLIC_BASE_URL=https://awari.ng
NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION=your_verification_code
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
```

## 📊 SEO Features Included

✅ **Meta Tags**
- Title with template support
- Description (160 characters optimized)
- Keywords targeting Nigerian market
- Canonical URLs
- Language tags

✅ **Open Graph**
- Facebook/LinkedIn sharing optimization
- Custom images (1200x630px)
- Type specification (website/article/product)
- Locale set to en_NG

✅ **Twitter Cards**
- Large image cards
- Custom descriptions
- Creator attribution

✅ **Structured Data**
- Organization markup
- Website search functionality
- Property/Real estate listings
- Breadcrumb navigation
- Review aggregation

✅ **Technical SEO**
- Robots.txt configuration
- XML sitemap generation
- PWA manifest
- Mobile-first responsive
- Fast loading optimization

## 🎯 Keywords Strategy

Primary keywords targeted:
- property rental Nigeria
- shortlet Nigeria
- hotels Nigeria
- property for sale Nigeria
- Lagos apartments
- Abuja rentals
- real estate Nigeria
- vacation rentals Nigeria

Location-specific:
- [City] apartments
- [City] shortlets
- [City] hotels
- [State] property rentals

## 📈 Next Steps for Full SEO

1. **Add Dynamic Sitemap**
   - Fetch all properties from API
   - Include in sitemap with proper priorities
   - Update weekly

2. **Create Blog Content**
   - Property guides
   - Location reviews
   - Booking tips
   - Market insights

3. **Optimize Images**
   - Add alt text to all images
   - Implement lazy loading
   - Use Next.js Image component
   - Create OG image for each property

4. **Performance**
   - Implement caching strategies
   - Optimize Core Web Vitals
   - Reduce JavaScript bundle size
   - Enable compression

5. **Analytics**
   - Set up Google Analytics 4
   - Configure Search Console
   - Track conversions
   - Monitor rankings

6. **Local SEO**
   - Add location pages for major cities
   - Create local business schema
   - Get listed on Google My Business
   - Build local citations

## 🔍 Testing Your SEO

1. **Google Rich Results Test**
   https://search.google.com/test/rich-results

2. **Facebook Sharing Debugger**
   https://developers.facebook.com/tools/debug/

3. **Twitter Card Validator**
   https://cards-dev.twitter.com/validator

4. **Lighthouse SEO Audit**
   Run in Chrome DevTools

## 📝 Best Practices

- Keep titles under 60 characters
- Keep descriptions under 160 characters
- Use unique meta tags for each page
- Include target keywords naturally
- Update sitemap regularly
- Monitor search console for errors
- Create quality content regularly
- Build quality backlinks

## 🎨 Required Assets

Create these images for optimal SEO:
- `/assets/images/og-image.png` (1200x630px)
- `/assets/images/icon-192.png` (192x192px)
- `/assets/images/icon-512.png` (512x512px)
- Property-specific OG images

---

**Note**: SEO is an ongoing process. Monitor your rankings, adjust strategies, and keep content fresh for best results.
