# Systems Integration Analysis

| Integration | Purpose | Phase | Status | Notes |
|---|---|---:|---|---|
| GTM / GA4 | analytics and attribution | Phase 1 | required | use GTM as tag layer and track commerce + content events |
| Mailchimp | newsletter, campaigns, lead capture | Phase 1 | required | launch with list capture and basic segmentation |
| Stripe | digital book checkout | Phase 1 | required | replace placeholder buy link and wire fulfillment |
| Apple Pay / Google Pay | faster wallet checkout on web | Phase 1 | required | handled through Stripe wallet support posture |
| S3 + CDN | media and downloadable asset hosting | Phase 1-2 | recommended | keep images and fulfillment assets outside repo |
| Admin dashboard / CMS | manual content management | Phase 2 | required | pages, menus, SEO surfaces, blog, and media refs |
| Blog engine | publish editorial content | Phase 2 | required | include taxonomy, author, SEO, scheduled posting |
| AI draft + human approval | content pipeline | Phase 2 | recommended | do not auto-publish without clear rule set |
| External affiliate links | monetize recommendations | Phase 3 | required later | category-based recommendations first |
| In-house product catalog | supplements/apparel | Phase 3 | required later | needs product model, cart, policy, and fulfillment |
| Affiliate management | track partner relationships | Phase 3 | recommended | depends on product/catalog maturity |
| Telephony | phone / SMS / support workflows | not quoted | unknown | keep out of base proposal until explicitly requested |
| Mail server beyond marketing | transactional / support ops | optional | unknown | can start with provider-based transactional email |
