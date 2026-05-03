# Block-First Gutenberg Page Creation SOP Bible

Version: 2.0 local guide alignment
Scope: building modern, maintainable, Gutenberg-native WordPress pages and theme-directory editing surfaces that remain stable for MCP-driven site operations
Primary source basis: local WordPress developer documentation snapshot in `Wordpress-Development-Copilot-Chatgpt/Agent-Files/guide`, local SDLC packet docs in `Wordpress-Development-Copilot-Chatgpt/Agent-Files/sdlc`, and the cloud-agent skill registry packet under `inspection-workspace/cloud-agent-sdlc-bible-packet/skills`
Authority note: this SOP is aligned to the attached local file hierarchy and is intended to govern how the cloud agent routes, scopes, implements, validates, and hands off Gutenberg/theme work inside this repository

---

## 0. Non-negotiable doctrine

A Gutenberg page is not an HTML page pasted into WordPress. A Gutenberg page is a structured block document composed of core blocks, block patterns, style variations, synced patterns where appropriate, and dynamic custom blocks only where the content truly requires runtime rendering.

The final state must satisfy five conditions:

1. The page is editable in the block editor without authors breaking the design.
2. The page content is serialized as valid WordPress block markup.
3. Design decisions are governed by `theme.json`, block supports, style variations, and scoped CSS rather than page-only CSS hacks.
4. Repeated sections are patterns or template parts, not duplicated raw HTML.
5. Runtime or database-backed output is a dynamic block, not a shortcode or uneditable HTML blob.

The old habit of converting a whole page into one Custom HTML block is prohibited except as a temporary quarantine step during migration triage.

For this initiative, the theme directory is the primary stabilization surface for `theme.json`, patterns, templates, template parts, page composition rules, and editor curation. Custom blocks may live in a companion plugin when portability, runtime rendering, or durable reuse across themes requires it. The cloud agent must optimize for predictable editor behavior so MCP controllers can create or update content and get the expected result after save, reload, and publish.

---

## 1. Source-backed Gutenberg principles

### 1.1 Blocks are the unit of page composition

Gutenberg treats blocks as units of markup that combine to form content and layout. This replaces the old mix of shortcodes, raw HTML, embeds, and manual markup with a consistent editor API and user experience.

Operational standard: every meaningful page component must be represented as one of the following:

- core block composition
- block pattern
- synced pattern
- block style variation
- block variation
- dynamic custom block
- template part
- temporary Custom HTML fallback with an explicit removal ticket

### 1.2 Block markup must remain valid after parse, edit, and serialize

WordPress stores blocks using HTML comments as block delimiters. Static blocks save HTML content in the database. Dynamic blocks may save only a block delimiter with attributes and render output server-side.

A block is valid only when the editor can parse the stored content and regenerate matching markup from the block definition. Any mismatch between stored markup and current `save()` output can produce invalid block errors.

Operational standard: no manually written block markup may ship unless it has been opened in the editor and passed parse/serialize validation.

### 1.3 `theme.json` is the design-system contract

`theme.json` is the canonical configuration point for editor settings, presets, global styles, layout widths, typography, spacing, colors, borders, shadows, and per-block style behavior. Modern block-first work starts by defining tokens and constraints there.

Operational standard: spacing, palette, typography, layout widths, border radii, shadows, and reusable section treatments must be tokenized before page implementation begins.

### 1.4 Block supports reduce custom code

Block Supports lets blocks declare editor features. It can add attributes, editor UI controls, and generated wrapper properties. Static blocks use `useBlockProps.save()`. Dynamic server-rendered blocks must output `get_block_wrapper_attributes()` on the wrapping element.

Operational standard: prefer block supports over custom controls whenever the desired behavior is one of the built-in support families: spacing, color, typography, border, dimensions, layout, anchor, align, interactivity, or reusable editor UI.

### 1.5 Register custom blocks through metadata

Custom blocks should be registered with `block.json` metadata and, for modern performance, registered server-side as well as client-side. Server registration is required for server-side functionality such as dynamic rendering, block supports, block hooks, style variations, and theme.json-aware styling.

Operational standard: every custom block must include `block.json`, `apiVersion: 3`, valid namespace/name, support declarations, asset declarations, and server registration.

### 1.6 Development must follow the current WordPress block pipeline

The expected modern pipeline is: establish Node.js tooling, use `@wordpress/create-block` when scaffolding new blocks, run builds through `@wordpress/scripts`, and use `wp-env` or an equivalent local WordPress environment for editor testing. This applies even when the final change lands in a theme because the editor contract must still be exercised in a real block-editor environment.

Operational standard:

- use `@wordpress/create-block` for new custom-block scaffolding unless the repo already has an approved equivalent
- use `@wordpress/scripts` for build, lint, and test workflows where block JS is involved
- use `wp-env` or an equivalent mounted WordPress environment for save/reload/editor validation
- treat Docker, Node.js, npm, and WordPress runtime bootstrapping as required preconditions, not optional setup detail

### 1.7 Update-propagation behavior must be explicit before implementation

Patterns, synced patterns, templates, template parts, static blocks, and dynamic blocks do not update in the same way. A correct implementation path depends on whether future updates should propagate, whether users may customize the inserted content, and whether existing stored markup must remain valid.

Operational standard:

- normal patterns are detached after insertion and must be treated as starter content
- synced patterns propagate content, structure, and style together and must be used only when central control is intended
- template and template-part updates must account for user-customized copies stored in the database
- static block markup changes require deprecations when saved content could become invalid
- any request that changes update propagation behavior must be called out in planning and validation artifacts

---

## 2. Governance model

### 2.1 Roles

Owner: accountable for page objective, final approval, and rollback decision.

Designer: owns visual system, spacing scale, typography, responsive states, and component intent.

Gutenberg implementer: maps sections into blocks, patterns, variations, or dynamic blocks.

Engineer: builds custom dynamic blocks, block variations, transforms, validation scripts, and CI gates.

QA reviewer: validates editor usability, block validity, responsive behavior, accessibility, performance, and rollback.

### 2.2 Required artifacts per page

Every page build must have:

- page brief
- source inventory
- affected-surface classification
- block mapping table
- design-token delta
- pattern/custom-block backlog
- propagation-impact note
- editor authoring rules
- environment and validation plan
- preview URL or draft link
- QA checklist results
- rollback plan

### 2.3 Definition of done

A page is done only when:

- no unexpected invalid block warnings appear in the editor
- all top-level sections are named and navigable in List View
- Custom HTML blocks are absent or documented as temporary fallbacks
- desktop, tablet, and mobile views are approved
- Lighthouse/Core Web Vitals risks are addressed or documented
- heading hierarchy is valid
- images have alt text or decorative treatment
- authors can safely edit content without touching raw HTML
- propagation behavior is documented for patterns, synced patterns, template parts, templates, and custom blocks
- the required lint/build/test/editor checks have run or an explicit blocker has been recorded
- rollback path has been verified

---

## 3. Block-first architecture decision tree

Use this order for every component decision.

Before choosing the component type, choose the owning surface:

- editor content when the change is page-specific and author-managed
- theme when the change belongs to `theme.json`, patterns, templates, template parts, or editor curation
- plugin when the change introduces portable custom blocks, server rendering, integrations, or reusable runtime logic

Do not hide a plugin concern inside a theme purely for convenience. Do not force a theme concern into a custom block when the editor already provides the correct surface.

### Step 1: Can core blocks express it?

Use core blocks first. Typical mappings:

| Need | Preferred Gutenberg structure |
|---|---|
| Section wrapper | `core/group` |
| Full-width section | `core/group` with `align: full` |
| Constrained content | `core/group` with constrained layout |
| Hero | `core/group`, `core/cover`, headings, paragraph, buttons, media |
| Split layout | `core/columns` or Group with grid/flex layout |
| Heading | `core/heading` |
| Body copy | `core/paragraph` |
| CTA row | `core/buttons` and `core/button` |
| Card grid | Group/Grid pattern using nested groups |
| Checklist | `core/list` with style variation |
| Quote | `core/quote` or `core/pullquote` |
| Media figure | `core/image`, `core/gallery`, `core/media-text`, or `core/cover` |
| Anchor navigation | Navigation block, List block pattern, or custom dynamic anchor block |

### Step 2: Is it repeated but static?

Use a block pattern. Patterns are starter layouts. Once inserted, normal patterns detach from the original source, so future updates will not automatically propagate to existing inserted content.

Use patterns for:

- hero layouts
- feature bands
- service cards
- testimonial rows
- pricing sections with editable text
- FAQ layout shells
- CTA bands
- landing-page section templates

### Step 3: Is it repeated and centrally managed?

Use a synced pattern or template part when central updates should affect every use.

Use synced patterns for:

- global alert bars
- reusable call-to-action panels
- partner disclaimers
- recurring donation prompts
- campaign-wide notices

Use template parts for:

- headers
- footers
- site-wide structural regions
- reusable template-level areas

Do not use synced patterns where each page should independently customize content.

### Step 4: Is it a visual variant of an existing block?

Use block styles or section style variations.

Use block styles when the block behavior is identical and only the visual treatment changes.

Examples:

- button: primary, secondary, ghost
- quote: editorial, boxed, highlighted
- group: card, glass, feature-panel, warning-panel
- list: checkmark, icon-list, pill-list

### Step 5: Is it a configured version of an existing block?

Use a block variation when initial attributes or inner blocks need to be prefilled.

Examples:

- Media & Text with media on the right by default
- Query Loop configured for events
- Group prefilled with a card shell
- Cover configured as homepage hero

### Step 6: Does it render runtime data or external data?

Use a dynamic custom block.

Use dynamic blocks for:

- latest posts/events/resources
- CRM/database-backed content
- forms with server logic
- calculators
- search/filter interfaces
- ecommerce/product data
- shortcodes that currently render server-side output
- content that must update globally without editing every post

### Step 7: Is the HTML malformed, unknown, or unsupported?

Use a temporary `core/html` quarantine block only during migration. Create a ticket to replace it. Do not treat Custom HTML as the final architecture.

---

## 4. Page intake SOP

### 4.1 Intake checklist

Before touching Gutenberg, capture:

- page URL or source HTML
- business objective
- target audience
- conversion goal
- SEO title/meta intent
- required tracking/events
- forms or integrations
- embedded media
- reusable sections
- dynamic content sources
- accessibility-sensitive features
- content owner
- approval owner
- rollback owner

### 4.2 Source inventory

For each page, produce this inventory:

| Section | Purpose | Current source | Content type | Reuse potential | Gutenberg target | Risk |
|---|---|---|---|---|---|---|
| Hero | First impression/CTA | HTML/design | Static authored | High | Pattern | Medium |
| Feature grid | Explain value | HTML | Static authored | High | Pattern | Low |
| Events list | Current events | Shortcode/API | Dynamic | High | Dynamic block | High |

### 4.3 Risk classification

Low risk:

- headings, paragraphs, images, buttons
- simple group/columns layout
- static repeated sections

Medium risk:

- complex responsive grids
- animated sections
- nested cards
- embedded third-party media
- custom CSS dependencies

High risk:

- shortcode output
- forms
- ecommerce/database output
- custom JS interactions
- conditional personalization
- existing malformed HTML
- server-rendered widgets

---

## 5. Design-token SOP

### 5.1 Tokenize before building pages

Do not start page assembly until design tokens are declared or confirmed.

Minimum required token families:

- color palette
- gradients if allowed
- font families
- font sizes
- fluid typography settings
- line heights
- spacing scale
- layout `contentSize` and `wideSize`
- border radius presets
- shadows
- button styles
- section backgrounds

### 5.2 `theme.json` responsibilities

Use `theme.json` for:

- editor control availability
- color palette
- gradient palette
- font families
- font sizes
- spacing scale and spacing sizes
- layout widths
- global body styles
- heading/link/button element styles
- per-block default styles
- global custom properties
- pattern directory registrations if used

### 5.3 Block CSS responsibilities

Use block or theme CSS only for:

- visual treatments not expressible in `theme.json`
- complex responsive behavior
- pseudo-elements
- animations
- hover/focus states requiring custom selectors
- structural CSS for custom blocks
- temporary migration bridge styles

Rules:

- Scope CSS to stable block wrapper classes.
- Prefer `.wp-block-*`, `.is-style-*`, and project-prefixed classes.
- Never target generated `wp-container-*` classes because they are not stable design hooks.
- Avoid page ID CSS unless implementing a temporary patch with a removal issue.

### 5.4 Modern style posture

Modern Gutenberg styling should be:

- token-driven
- responsive by default
- fluid where appropriate
- minimal in specificity
- editable without requiring raw CSS knowledge
- accessible in color contrast and focus treatment
- consistent between editor and front end

---

## 6. Block and pattern library SOP

### 6.1 Pattern categories

Maintain pattern categories that match editorial tasks:

- Hero
- Feature
- Cards
- CTAs
- Testimonials
- FAQ
- Forms
- Donation/Fundraising
- Events
- Impact/Stats
- Team
- Legal/Disclosure

### 6.2 Pattern file rules

Every pattern must include:

- title
- slug
- categories
- viewport width when helpful
- block types/post types/template types where relevant
- valid block markup
- translatable strings in PHP-based patterns
- one clear outer wrapper block
- no unscoped inline styles unless generated by block supports

### 6.3 Starter page patterns

For pages, create post-content starter patterns that can be offered when a new page is created. Use `core/post-content` as the block type target and restrict by post type where needed.

Recommended starter page patterns:

- Standard landing page
- Service page
- Campaign page
- Event page
- Donation page
- About page
- Contact page
- Resource hub

### 6.4 Pattern lock rules

Use block locking sparingly.

Lock when:

- required legal/disclosure text must remain
- heading structure is critical
- CTA placement must not be removed
- layout shell must remain stable

Do not over-lock body content authors are expected to edit.

### 6.5 Synced pattern rules

Use synced patterns only when content, structure, and style should stay synced across the site.

Do not use synced patterns for starter layouts that need independent page editing.

---

## 7. Custom block SOP

### 7.1 Build custom blocks only when justified

A custom block is justified when at least one is true:

- core blocks cannot represent the required data model
- content is runtime-rendered
- authors need structured controls unavailable through core blocks
- external API/database output is required
- the component must enforce strict child block relationships
- the layout requires controlled InnerBlocks behavior

A custom block is not justified only because a section is visually unique. Use a pattern or variation first.

Default location rule: if the block represents reusable functionality that should survive theme switching, place it in a plugin. Only place a custom block in the theme when it is intentionally theme-bound and the portability tradeoff is accepted.

### 7.2 Required `block.json` standard

Every custom block must include:

```json
{
  "$schema": "https://schemas.wp.org/trunk/block.json",
  "apiVersion": 3,
  "name": "namespace/block-name",
  "title": "Readable Block Name",
  "category": "design",
  "description": "Short useful description.",
  "textdomain": "project-textdomain",
  "attributes": {},
  "supports": {},
  "editorScript": "file:./index.js",
  "style": "file:./style-index.css"
}
```

Dynamic blocks also include either:

```json
"render": "file:./render.php"
```

or server registration with a `render_callback`.

### 7.3 Server registration standard

Register blocks server-side. For multiple custom blocks on WordPress 6.8+, use a metadata collection and generated `blocks-manifest.php` when available. For older support ranges, register each built block with `register_block_type()`.

### 7.4 Dynamic block rendering standard

Dynamic blocks must:

- use `get_block_wrapper_attributes()` on the outer wrapper
- sanitize attributes
- escape all output
- avoid declaring functions inside `render.php` that can be redeclared per block instance
- keep data-fetching efficient
- cache expensive external data
- render meaningful fallback markup
- expose only safe editor controls

### 7.5 InnerBlocks standard

Use InnerBlocks when authors should edit child content while the parent block controls layout.

Rules:

- one block may contain only one InnerBlocks area
- use `allowedBlocks` to constrain children
- use `parent`, `ancestor`, or `allowedBlocks` relationships for nested blocks
- use templates for sensible defaults
- use `templateLock` only when necessary
- call `useBlockProps()` before `useInnerBlocksProps()`

### 7.6 Deprecation standard

When changing static block markup or attributes, add block deprecations before release. Keep fixtures for old serialized versions. Put deprecations in reverse chronological order. Snapshot helper functions used by deprecations so later helper changes do not silently break old migrations.

---

## 8. Page build SOP

### Phase 1: Freeze source and define target

1. Export or capture the current page content.
2. Screenshot desktop, tablet, and mobile states.
3. Save current HTML, CSS references, assets, and shortcodes.
4. Define the page objective and required sections.
5. Open an implementation ticket with rollback owner.

Exit gate: source inventory complete.

### Phase 2: Normalize HTML and content

1. Remove duplicate wrappers.
2. Fix malformed tags.
3. Separate content from presentation.
4. Identify dynamic fragments.
5. Extract headings, paragraphs, buttons, lists, media, forms, embeds, and scripts.
6. Mark unsupported fragments as temporary fallback candidates.

Exit gate: clean content map complete.

### Phase 3: Extract design tokens

1. Identify colors and map to palette slugs.
2. Identify font sizes and map to preset names.
3. Identify spacing values and map to spacing scale.
4. Identify section backgrounds, radii, shadows, and button treatments.
5. Update `theme.json` or style variation backlog.

Exit gate: all recurring visual choices have token or style strategy.

### Phase 4: Map sections to blocks

Use the block mapping table:

| Source fragment/component | Gutenberg target | Implementation type | Styling strategy | Risk |
|---|---|---|---|---|
| Hero | Group/Cover + Heading + Paragraph + Buttons | Pattern | theme.json spacing + hero style | Medium |
| Feature cards | Group/Grid + nested Groups | Pattern | card style variation | Medium |
| CTA | Group + Buttons | Synced pattern if global | section style | Low |
| Dynamic list | Custom block | Dynamic block | block.json + render.php | High |
| Unknown script | HTML fallback | Temporary fallback | isolated | High |

Exit gate: no section is unmapped.

### Phase 5: Build design system support

1. Update `theme.json` tokens.
2. Register block styles and variations.
3. Add pattern categories.
4. Add patterns.
5. Scaffold or extend custom blocks only where necessary.
6. Add editor/front-end CSS.

Exit gate: patterns and blocks available in editor.

### Phase 6: Assemble draft page

1. Create page draft or duplicate existing page.
2. Insert starter page pattern if applicable.
3. Replace section placeholders with real content.
4. Use List View to verify hierarchy and naming.
5. Avoid manual HTML editing unless validating serialized output after.
6. Save draft.

Exit gate: page saves without editor validation warnings.

### Phase 7: Validate format

Run the validation gates in Section 9.

Minimum expected validation path when code or theme assets changed:

1. Run the relevant `wp-scripts` build/lint/test commands.
2. Verify the editor save/reload cycle in a WordPress environment such as `wp-env`.
3. Run targeted end-to-end or manual editor interaction checks for author-critical flows.
4. Record backward-compatibility or deprecation handling for saved markup changes.

Exit gate: page passes parse, editor, visual, accessibility, and responsive checks.

### Phase 8: Review and publish

1. Share preview URL.
2. Record approvals.
3. Reconfirm rollback path.
4. Publish during safe deployment window.
5. Re-test front end after cache/CDN purge.
6. Archive screenshots and QA results.

Exit gate: production page confirmed and rollback still available.

---

## 9. Page format validation SOP

### 9.1 Serialization requirements

A valid block-first page must use WordPress block delimiter syntax:

```html
<!-- wp:group {"layout":{"type":"constrained"}} -->
<div class="wp-block-group">
  <!-- wp:heading -->
  <h2 class="wp-block-heading">Section heading</h2>
  <!-- /wp:heading -->
</div>
<!-- /wp:group -->
```

Rules:

- Core block delimiters omit the `core/` namespace.
- Custom block delimiters use `namespace/block-name`.
- Attributes must be valid JSON.
- Static block HTML must match the block's save output.
- Dynamic blocks may save only comment delimiters and attributes.
- Do not hand-edit serialized markup unless you revalidate.

### 9.2 Editor validation gate

Open the page in the block editor and verify:

- no block says "unexpected or invalid content"
- all blocks are selectable in List View
- all patterns are editable as intended
- locked sections behave as intended
- no raw HTML block is present unless documented
- saving and reloading the editor does not change the content unexpectedly

### 9.3 Parse/serialize validation gate

For custom tooling, use `@wordpress/blocks` concepts:

- `parse(content)` to parse post content into blocks
- `validateBlock(block)` to detect block validity issues
- `serialize(blocks)` to regenerate post content

Minimum acceptance:

- parsed block count is expected
- invalid block count is zero, excluding documented fallback blocks
- serialized output is stable after round trip

### 9.4 Manual anti-regression checks

Check for:

- orphan closing block comments
- malformed JSON attributes
- missing closing delimiters
- invalid nested block relationships
- unknown unregistered block names
- changed static markup after a block update
- stripped embeds or scripts
- editor-only styles missing on front end
- front-end-only styles missing in editor

### 9.5 Custom HTML exception gate

A Custom HTML block may remain only if all are true:

- component cannot be mapped safely in current sprint
- fallback is isolated to one small fragment
- owner accepts limitation
- replacement ticket exists
- fallback has been tested for security/accessibility
- it does not contain mission-critical author-editable content

---

## 10. Accessibility SOP

Every page must pass these checks:

- one visible or programmatically clear H1 per page template context
- heading levels do not skip for layout reasons
- buttons and links have discernible text
- links that look like buttons are still links when navigating, buttons only trigger actions
- images include meaningful alt text or empty alt when decorative
- color contrast passes WCAG AA for text and UI states
- focus states are visible
- keyboard navigation works for menus, accordions, tabs, forms, and modals
- reduced-motion preference is respected for animations
- form labels and errors are accessible
- landmarks are not duplicated incorrectly
- ARIA is not used where semantic HTML is sufficient

---

## 11. Responsive SOP

Validate at minimum:

- 320px mobile
- 390px mobile
- 768px tablet
- 1024px tablet/desktop boundary
- 1280px desktop
- 1440px+ wide desktop

Rules:

- Prefer block layout controls before custom media queries.
- Use Grid/Flex layouts where supported.
- Avoid fixed pixel widths on content blocks.
- Avoid spacer blocks for critical responsive spacing when theme spacing tokens can solve it.
- Ensure columns stack gracefully.
- Ensure buttons wrap without overlap.
- Ensure hero media crops intentionally.
- Ensure long headings and real content do not break card layouts.

---

## 12. Performance SOP

### 12.1 Asset rules

- Register block assets in `block.json`.
- Use `style` for shared editor/front-end styles.
- Use `editorStyle` only for editor-only CSS.
- Use `viewStyle` for front-end-only CSS when needed.
- Use `viewScript` or `viewScriptModule` only when front-end interactivity is required.
- Avoid loading page-wide JS for static sections.
- Lazy-load media where appropriate.

### 12.2 Page performance checks

Check:

- no unused page-builder CSS payloads
- no duplicate icon libraries
- optimized image sizes
- responsive image attributes are present
- no layout shift from unsized media
- no render-blocking custom CSS beyond required theme styles
- no custom JS for behavior core blocks can provide
- server-rendered blocks cache expensive queries

---

## 13. SEO/content SOP

Check:

- page has clear H1
- title and meta description are assigned by SEO system
- primary CTA appears early
- internal links are meaningful
- anchor links resolve
- image filenames/alt text are sensible
- schema is added only when accurate
- no hidden keyword stuffing
- no duplicate content from repeated synced patterns unless intended

---

## 14. Rollback SOP

Before publishing:

1. Save revision ID of current production page.
2. Export current post content.
3. Save screenshots of current page.
4. Confirm whether template parts or synced patterns are affected.
5. Confirm cache/CDN rollback process.
6. Confirm who can revert.

Rollback options:

- restore previous post revision
- restore previous template part revision
- disable new custom block plugin/release if isolated
- revert theme commit
- restore exported post content
- purge caches

Never publish a Gutenberg migration without a rollback owner.

---

## 15. PR checklist

Use this checklist for any code/pattern/theme PR that affects Gutenberg page creation.

### Block architecture

- [ ] Core block solution considered before custom block.
- [ ] Pattern solution considered before custom block.
- [ ] Dynamic block justified if used.
- [ ] `block.json` present for every custom block.
- [ ] `apiVersion: 3` used unless compatibility requires otherwise.
- [ ] Server registration present.
- [ ] `get_block_wrapper_attributes()` used in dynamic render wrapper.
- [ ] `useBlockProps()` and `useBlockProps.save()` used correctly.
- [ ] InnerBlocks relationships constrained when needed.

### Design system

- [ ] Colors use palette tokens.
- [ ] Font sizes use presets/fluid scale.
- [ ] Spacing uses spacing tokens.
- [ ] Layout uses content/wide sizes.
- [ ] Block styles/variations used instead of ad hoc page CSS.
- [ ] CSS is scoped to stable classes.
- [ ] No dependence on generated `wp-container-*` selectors.

### Validation

- [ ] Editor opens without invalid block warnings.
- [ ] Save/reload round trip verified.
- [ ] Static block markup changes include deprecations.
- [ ] Old fixture content covered where relevant.
- [ ] Custom HTML fallbacks documented.

### Accessibility and performance

- [ ] Heading hierarchy verified.
- [ ] Keyboard behavior verified.
- [ ] Contrast verified.
- [ ] Alt text verified.
- [ ] Front-end assets load only where needed.
- [ ] Responsive states tested.

---

## 16. Standard page blueprint

Use this as the default modern page structure:

1. Hero section
   - Group/Cover
   - Eyebrow optional
   - H1
   - Lede paragraph
   - Button group
   - Optional media

2. Trust/impact strip
   - Group
   - Stats/cards/logos
   - Pattern or synced pattern depending update needs

3. Primary content sections
   - Alternating Group/Columns/Grid patterns
   - H2 per major section
   - Paragraph/list/cards

4. Dynamic proof or resources
   - Query Loop for WordPress-native posts
   - Dynamic custom block for external data

5. FAQ/details
   - Pattern if static
   - Custom disclosure block if structured accessible interaction is needed

6. Final CTA
   - Synced pattern if global
   - Pattern if page-specific

7. Supplemental/legal
   - Paragraph/list/details blocks
   - lock only if required

---

## 17. Migration rules for existing custom HTML pages

### 17.1 What to remove

Remove:

- anonymous wrapper divs that only exist for CSS targeting
- duplicate container classes
- inline styles that map to tokens
- empty spans
- layout tables
- hardcoded image dimensions that break responsiveness
- scripts embedded in content when a block/plugin should own them
- shortcode wrappers that can become dynamic blocks

### 17.2 What to preserve

Preserve:

- content order
- heading hierarchy, unless fixing accessibility errors
- semantic lists, quotes, figures, buttons, links
- accessible names
- CTA intent
- anchor IDs that have inbound links
- analytics requirements
- structured data only if valid

### 17.3 Migration mapping table

| Old pattern | New target | Notes |
|---|---|---|
| `<section class="hero">` | Group/Cover pattern | Use section style and tokens |
| `<div class="container">` | Group constrained layout | Avoid redundant wrapper |
| `<div class="row"><div class="col">` | Columns or Grid Group | Use layout support |
| `<a class="btn">` | Button block | Use button style variation |
| HTML cards | Group pattern or block variation | Use nested Groups |
| FAQ accordion JS | Pattern or custom block | Must preserve disclosure semantics |
| shortcode widget | Dynamic block | Keep shortcode only as temporary bridge |
| global alert include | Synced pattern or template part | Depends on edit model |

---

## 18. Anti-patterns

Do not ship:

- full-page Custom HTML blocks
- page-specific CSS replacing theme tokens
- unregistered custom block markup
- static block markup changes without deprecations
- manually edited serialized block JSON without validation
- shortcodes as final architecture for structured editor content
- layout built with spacer blocks only
- hardcoded colors not in palette
- unscoped CSS targeting generic `h2`, `.button`, `.container`, `.card`
- custom JS interactions where accessible core/native blocks suffice
- synced patterns for content that should diverge by page
- normal patterns for content that must update globally

---

## 19. Minimum tooling expectations

Local development:

- Node.js and npm
- Docker Desktop when using `wp-env`
- `@wordpress/env` / `wp-env` or equivalent local WordPress environment
- `@wordpress/scripts` build tooling for block work
- `@wordpress/create-block` for new custom-block scaffolding
- WordPress local environment or staging site
- access to theme/plugin source
- linting for JS/CSS/PHP
- editor preview access
- screenshots before/after

Suggested validation commands and practices:

```bash
wp post get <ID> --field=post_content > before.html
wp post get <ID> --field=post_content > after.html
```

Use a custom validation script around `@wordpress/blocks` for parse/validate/serialize checks when building automated migrations.

For Gutenberg repo-style development, expect Node 20+ era tooling and CI checks for linting, unit tests, e2e tests, PHP tests, backward-compatibility handling, and docs generation where applicable.

---

## 20. Acceptance scorecard

Score each category 0-2.

| Category | 0 | 1 | 2 |
|---|---|---|---|
| Block purity | HTML-heavy | mixed | core/pattern/block-native |
| Tokenization | ad hoc | partial | theme.json governed |
| Editor usability | fragile | usable | safe and intuitive |
| Validation | warnings | manual pass | automated + manual pass |
| Responsiveness | breaks | acceptable | polished across breakpoints |
| Accessibility | unknown | basic | verified WCAG-focused checks |
| Performance | heavy | acceptable | assets scoped and optimized |
| Maintainability | unclear | documented | governed with patterns/backlog |

Minimum publish score: 14/16 for standard pages, 15/16 for high-traffic pages.

---

## 21. Source index reviewed

Reviewed local source areas in this repository:

- `Wordpress-Development-Copilot-Chatgpt/Agent-Files/guide/getting_started/block_development_environment/get-started-with-create-block.md` - custom-block scaffolding expectations
- `Wordpress-Development-Copilot-Chatgpt/Agent-Files/guide/getting_started/block_development_environment/get-started-with-wp-env.md` - local WordPress environment expectations
- `Wordpress-Development-Copilot-Chatgpt/Agent-Files/guide/getting_started/fundamentals_of_block_development/block-json.md` - metadata-driven block registration
- `Wordpress-Development-Copilot-Chatgpt/Agent-Files/guide/getting_started/fundamentals_of_block_development/file-structure-of-a-block.md` - block placement, manifest registration, and propagation caveats
- `Wordpress-Development-Copilot-Chatgpt/Agent-Files/guide/getting_started/fundamentals_of_block_development/registration-of-a-block.md` - server/client registration patterns
- `Wordpress-Development-Copilot-Chatgpt/Agent-Files/guide/getting_started/fundamentals_of_block_development/static-dynamic-rendering.md` - rendering model choices
- `Wordpress-Development-Copilot-Chatgpt/Agent-Files/guide/getting_started/fundamentals_of_block_development/markup-representation-block.md` - delimiter syntax and stored markup behavior
- `Wordpress-Development-Copilot-Chatgpt/Agent-Files/guide/how-to_guides/curating_the_editor_experience/patterns.md` - pattern selection, starter content, and locking
- `Wordpress-Development-Copilot-Chatgpt/Agent-Files/guide/how-to_guides/curating_the_editor_experience/theme-json.md` - editor curation through `theme.json`
- `Wordpress-Development-Copilot-Chatgpt/Agent-Files/guide/how-to_guides/themes/global-settings-and-styles.md` - global styles and theme tokens
- `Wordpress-Development-Copilot-Chatgpt/Agent-Files/guide/how-to_guides/overview/propagating-updates.md` - update propagation rules
- `Wordpress-Development-Copilot-Chatgpt/Agent-Files/guide/how-to_guides/overview/accessibility.md` - accessibility expectations relevant to editor and theme work
- `Wordpress-Development-Copilot-Chatgpt/Agent-Files/guide/contributor_guide/code_contributions/testing-overview.md` - JS/PHP lint and test expectations
- `Wordpress-Development-Copilot-Chatgpt/Agent-Files/guide/contributor_guide/code_contributions_testing_overview/e2e.md` - Playwright end-to-end guidance
- `Wordpress-Development-Copilot-Chatgpt/Agent-Files/guide/contributor_guide/code_contributions/backward-compatibility.md` - saved-content compatibility and deprecation policy
- `Wordpress-Development-Copilot-Chatgpt/Agent-Files/sdlc/docs/cloud-agent-sdlc-bible.md` - cloud-agent lifecycle doctrine
- `Wordpress-Development-Copilot-Chatgpt/Agent-Files/sdlc/docs/cloud-agent-sdlc-lifecycle-management.md` - lifecycle state and handoff rules
- `Wordpress-Development-Copilot-Chatgpt/Agent-Files/sdlc/docs/onboarding-new-agentic-developers.md` - bounded-agent operating rules
- `inspection-workspace/cloud-agent-sdlc-bible-packet/skills/granular-codegen-skill-registry-v2.yml` - granular codegen skill pipeline
- `inspection-workspace/cloud-agent-sdlc-bible-packet/skills/skill-registry-v1.yml` - baseline SDLC skill registry

---

## 22. Final operating rule

When in doubt, choose the implementation that makes the page easier to edit, easier to validate, easier to update, and harder to break. Gutenberg-native architecture is not measured by whether the front end looks right once. It is measured by whether the editor, front end, design system, and future maintenance path all stay coherent after the next edit, next release, and next redesign.
