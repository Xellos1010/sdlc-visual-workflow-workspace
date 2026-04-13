# Recommended Reusable Stack

## Recommendation
Adopt a reusable **composable client website stack** built around a single modern frontend shell, a lightweight admin/content layer, cloud media storage, and pluggable integrations.

## Stack shape
### Frontend
- Next.js + TypeScript
- Tailwind CSS + Radix / component primitives
- mobile-first responsive layout system with scalar spacing and typography tokens
- MDX / rich content support for educational pages and blog content

### Content / admin
- custom admin dashboard in the same codebase for page sections, nav, footer, menus, SEO surfaces, and transition preferences
- structured content model for pages, blog posts, CTAs, storefront entries, affiliate links, and SEO metadata
- media hosted in AWS S3 with CDN distribution

### Commerce
- Stripe Checkout or Stripe Elements for digital product sales
- Express wallet support posture via Stripe for Apple Pay / Google Pay on web
- digital fulfillment workflow for PDF / ePub delivery

### Marketing / analytics
- Google Tag Manager as tag layer
- Google Analytics 4 event tracking
- Mailchimp for list growth, campaigns, and basic lifecycle marketing

### SEO / AI discovery
- sitemap.xml
- robots.txt
- llms.txt (preferred current proposal filename)
- structured data / metadata controls in admin

### Future operations
- AI-assisted content drafting queue
- confidence score + human approval gate
- scheduled publishing
- affiliate catalog and later in-house catalog modules

## Why this stack fits your reuse goal
It preserves a repeatable shell that can be rebranded for future clients while swapping content models, storefront modules, integrations, and admin permissions.
