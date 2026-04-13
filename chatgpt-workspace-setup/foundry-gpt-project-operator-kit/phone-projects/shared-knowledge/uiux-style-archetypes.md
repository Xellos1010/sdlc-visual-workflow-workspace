# UI/UX Style Archetypes

Each initiative selects a style archetype that governs visual language, motion intensity, component selection, and emotional tone. The archetype is chosen during the intent analysis stage and applied consistently through design system tokens.

## Archetype Selection Criteria

| Factor | Question |
|--------|----------|
| Audience | Technical operators, general consumers, creative professionals, enterprise buyers? |
| Brand position | Challenger, established leader, luxury niche, community-driven? |
| Content density | Data-heavy dashboards, editorial content, transactional flows, creative canvases? |
| Trust requirement | Financial/medical (high), consumer product (medium), internal tool (baseline)? |
| Emotional target | Confidence, delight, urgency, calm, inspiration, authority? |

## The Six Archetypes

### 1. Cutting Edge
**Emotional target**: excitement, innovation, technical mastery
**When to use**: developer tools, AI products, crypto/fintech startups, bleeding-edge SaaS

| Dimension | Specification |
|-----------|--------------|
| Color | Dark backgrounds (#0a0a0f to #1a1a2e), neon accents (cyan #00f0ff, magenta #ff00ff, electric blue #4d7cff) |
| Typography | Monospace for data/code (JetBrains Mono, Fira Code), geometric sans for UI (Inter, Geist) |
| Layout | Asymmetric grids, floating panels, dashboard density |
| Motion | Micro-animations on every interaction, particle effects on success, smooth 300ms transitions |
| Components | Glassmorphism cards, gradient borders, glow effects on hover, command palette as primary nav |
| Imagery | Abstract generative art, data visualizations, wireframe aesthetics |
| Reduced motion | Disable particles and glow; keep layout transitions and state changes |

### 2. Artsy
**Emotional target**: inspiration, individuality, creative confidence
**When to use**: design tools, creative agencies, portfolio platforms, editorial products

| Dimension | Specification |
|-----------|--------------|
| Color | Muted earth tones or monochromatic base + one bold accent, seasonal palette rotation |
| Typography | Editorial serif for headings (Playfair Display, Freight), clean sans for body (Suisse, Aktiv Grotesk) |
| Layout | Magazine-style grids, asymmetric image placement, generous white space, storytelling scrolls |
| Motion | Smooth parallax, reveal-on-scroll, image zoom on hover, page transitions as editorial page turns |
| Components | Large hero imagery, pull quotes, full-bleed sections, hand-drawn accents |
| Imagery | Photography-first, curated illustration, texture overlays, analog feel |
| Reduced motion | Replace parallax with static layering; keep reveal transitions as instant-show |

### 3. Professional
**Emotional target**: confidence, reliability, efficiency
**When to use**: enterprise SaaS, B2B dashboards, financial platforms, healthcare systems

| Dimension | Specification |
|-----------|--------------|
| Color | Navy/charcoal base (#1e293b, #334155), single corporate accent (blue #3b82f6 or teal #14b8a6), high contrast for data |
| Typography | System sans-serif stack or corporate sans (Inter, SF Pro, Segoe UI), strict 4-level hierarchy |
| Layout | 12-column grid, consistent gutters, data-dense tables, collapsible sidebars |
| Motion | Minimal: 150ms state transitions only, no decorative animation, skeleton loaders |
| Components | Data tables, metric cards, form builders, status badges, breadcrumbs |
| Imagery | Icons over photos, functional illustrations, chart-first visual language |
| Reduced motion | Nearly identical to standard — motion is already minimal |

### 4. Luxury
**Emotional target**: exclusivity, aspiration, premium quality
**When to use**: high-end e-commerce, premium subscriptions, fashion/lifestyle brands

| Dimension | Specification |
|-----------|--------------|
| Color | Black (#000) / off-white (#fafaf9) / gold (#c5a55a), monochrome with metallic accents |
| Typography | Display serif for headings (Didot, Bodoni, Cormorant Garamond), thin sans for body |
| Layout | Extreme white space (60%+ of viewport), centered single-column, large type, cinematic sections |
| Motion | Slow, deliberate transitions (500-800ms), elegant easing, fade-in reveals, no bounce |
| Components | Full-screen hero images, floating CTAs, minimal chrome, hidden navigation |
| Imagery | High-end photography, lifestyle shots, texture and material close-ups |
| Reduced motion | Replace fades with instant-show; keep elegant easing on essential transitions |

### 5. Playful
**Emotional target**: delight, approachability, fun
**When to use**: consumer apps, gamified experiences, children/education, social platforms

| Dimension | Specification |
|-----------|--------------|
| Color | Saturated primaries (#ef4444, #3b82f6, #eab308), gradient washes, multi-color palettes |
| Typography | Rounded sans-serif (Nunito, Quicksand, Poppins), large friendly sizes |
| Layout | Card-based, rounded corners (12-16px radius), generous padding, illustrated empty states |
| Motion | Bouncy spring animations, confetti on success, wobble on error, playful loading states |
| Components | Illustrated icons, progress badges, streak counters, emoji reactions, achievement cards |
| Imagery | Custom illustrations, mascots, pattern backgrounds, sticker aesthetics |
| Reduced motion | Replace bounce/wobble with simple fade; keep progress animations as step counters |

### 6. Minimal
**Emotional target**: clarity, focus, sophistication
**When to use**: productivity tools, writing apps, content platforms, developer docs

| Dimension | Specification |
|-----------|--------------|
| Color | Near-white (#fafafa) or near-black (#111), single muted accent (#6366f1 or #64748b) |
| Typography | System font stack or single geometric sans (Inter, Helvetica Neue), content is the design |
| Layout | Single-column or simple 2-column, maximum content width 720px, extreme padding |
| Motion | None by default. State changes are instant. Optional: 100ms opacity transitions |
| Components | Text-first, minimal borders, no shadows, monochrome icons, inline actions |
| Imagery | Avoided. Content is visual. If needed: monochrome line art only |
| Reduced motion | Identical to standard — motion is already absent |

## Archetype-to-Token Mapping

Each archetype produces a design token set that feeds the design system:

```
tokens/
├── colors.json         — palette, semantic colors, surface/text/accent
├── typography.json     — font families, scale, weights, line-heights
├── spacing.json        — padding, margins, gap scale
├── radius.json         — border-radius scale
├── motion.json         — duration, easing, reduced-motion overrides
├── shadows.json        — elevation scale (or none for minimal)
└── breakpoints.json    — responsive density triggers
```

## Mixing Archetypes

Most real products blend 2 archetypes:
- **Professional + Cutting Edge** = enterprise AI dashboards
- **Minimal + Luxury** = premium productivity tools
- **Artsy + Playful** = creative community platforms
- **Professional + Minimal** = developer tools with dense data

When blending, choose a **primary** (70% of decisions) and **secondary** (30% of decisions, applied to specific surfaces like marketing pages, onboarding, or celebration moments).
