# UI/UX Design Psychology Reference

Applied cognitive science, persuasion theory, and emotional design for operator interfaces, marketing surfaces, and product experiences.

## 1. Cognitive Foundations

### Cognitive Load Theory
- **Working memory holds 4±1 chunks** (Cowan, 2001). Every additional element competes for attention.
- **Intrinsic load**: complexity inherent to the task. Reduce by progressive disclosure.
- **Extraneous load**: complexity from poor design. Eliminate through clear hierarchy and consistent patterns.
- **Germane load**: effort spent building mental models. Support with visual metaphors and spatial consistency.
- **Design rule**: if the user must hold more than 4 things in mind simultaneously, the interface has failed.

### Gestalt Principles
- **Proximity**: elements near each other are perceived as related. Group controls by function.
- **Similarity**: elements that look alike are perceived as belonging together. Use consistent styling for same-type actions.
- **Closure**: the brain completes incomplete shapes. Use implied boundaries instead of heavy borders.
- **Continuity**: elements aligned along a path are perceived as related. Use alignment grids.
- **Figure-ground**: the brain separates foreground from background. Use depth, shadow, and contrast to establish layers.
- **Common region**: elements within a boundary are grouped. Use cards, panels, and containers intentionally.

### Decision Science
- **Hick's Law**: decision time increases logarithmically with the number of choices. Fewer options = faster action. Surface the top 3-5 quick actions, not 20.
- **Fitts's Law**: time to reach a target is a function of distance and size. Make frequent actions large and close to the cursor/thumb.
- **Jakob's Law**: users spend most of their time on other sites. They expect your interface to work like the ones they already know.
- **Miller's Law**: chunk information into groups of 5-9 for scanning and recall.
- **Paradox of Choice**: too many options causes decision paralysis. Curate, don't dump.

### Memory and Attention
- **Serial position effect**: users remember the first (primacy) and last (recency) items best. Place critical actions at list edges.
- **Von Restorff effect**: the distinctive item in a group is remembered. Use visual differentiation for the primary action.
- **Zeigarnik effect**: incomplete tasks are remembered better than complete ones. Progress bars and incomplete states drive engagement.
- **Change blindness**: users miss changes outside their focus area. Animate state transitions to draw attention.
- **Inattentional blindness**: users miss unexpected elements. Do not rely on banners or badges alone for critical alerts.

## 2. Persuasion & Marketing Psychology

### Cialdini's Principles of Influence
- **Social proof**: show what others are doing (user counts, activity feeds, testimonials). People follow the crowd.
- **Scarcity**: limited availability increases perceived value. Use for time-sensitive actions, not manipulation.
- **Authority**: expert endorsement, certifications, trust badges build confidence.
- **Reciprocity**: give value before asking for commitment. Free trials, useful content, helpful onboarding.
- **Commitment & consistency**: start with small asks (micro-commitments). Users who take one step are more likely to take the next. Progress indicators reinforce this.
- **Liking**: people are persuaded by those they like. Personality, warmth, and visual appeal in copy and design.

### Behavioral Economics in UI
- **Anchoring**: the first number/option shown shapes all subsequent judgments. Lead with the value you want users to anchor on.
- **Loss aversion**: people feel losses 2x more than equivalent gains. Frame around what users will lose by not acting, not just what they'll gain.
- **Endowment effect**: people overvalue what they already own. Let users customize, save, and personalize to create ownership.
- **Default effect**: most users accept defaults. Make the safest, most beneficial option the default.
- **Decoy effect**: a slightly inferior third option makes the target option look better.
- **Peak-end rule**: people judge experiences by their peak moment and the ending. Nail the first impression and the completion moment.

### Trust Architecture
- **Competence signals**: fast load times, zero errors, polished transitions.
- **Benevolence signals**: transparent data use, helpful error messages, undo support.
- **Integrity signals**: consistent behavior, no dark patterns, honest copy.
- **Progressive trust**: earn trust incrementally. Don't ask for credit card on first visit. Start with value.
- **Trust recovery**: when errors occur, acknowledge immediately, explain what happened, show the fix. Silence destroys trust faster than the error itself.

## 3. Emotional Design (Don Norman's Three Levels)

### Visceral Level — First Impression
- Immediate emotional reaction to visual appearance.
- Beautiful interfaces are perceived as easier to use (aesthetic-usability effect).
- Color, typography, imagery, and polish create the visceral response.
- **Design rule**: the first 50ms determine whether the user trusts this interface.

### Behavioral Level — Usability
- Pleasure from effective, predictable interaction.
- Clear affordances, responsive feedback, efficient workflows.
- **Design rule**: every interaction should feel like the interface anticipated what the user wanted.

### Reflective Level — Identity
- How the product makes the user feel about themselves.
- Status, craftsmanship, alignment with personal values.
- **Design rule**: the interface should make operators feel capable, informed, and in control.

## 4. Color Psychology

| Color | Association | Best Use |
|-------|------------|----------|
| Blue | Trust, stability, professionalism | Financial, enterprise, healthcare |
| Green | Growth, success, nature | Confirmation states, sustainability, health |
| Red | Urgency, danger, passion | Errors, critical alerts, sale CTAs |
| Orange | Energy, warmth, enthusiasm | CTAs, notifications, playful brands |
| Purple | Luxury, creativity, wisdom | Premium products, creative tools |
| Black | Sophistication, power, luxury | Dark mode, luxury brands, professional tools |
| White | Clarity, simplicity, space | Minimal interfaces, content-first design |
| Yellow | Optimism, attention, caution | Warnings, highlights, playful accents |
| Gold | Premium, achievement, value | Luxury tier, badges, rewards |

### Color in Context
- **Cutting Edge**: high-contrast dark backgrounds + neon accents (cyan, magenta, electric blue)
- **Artsy**: muted earth tones + one bold accent, or monochromatic with texture
- **Professional**: navy/charcoal base + single corporate accent, high contrast for data
- **Luxury**: black/white/gold palette, generous negative space
- **Playful**: saturated primary colors, gradient washes, illustrated elements
- **Minimal**: near-monochrome, single muted accent, content carries the color

## 5. Typography Psychology

- **Serif fonts**: tradition, authority, editorial quality (luxury, professional, artsy)
- **Sans-serif fonts**: modern, clean, approachable (cutting edge, minimal, professional)
- **Monospace fonts**: technical, precise, code-adjacent (cutting edge, developer tools)
- **Display/decorative fonts**: personality, uniqueness (artsy, playful — headings only)
- **Variable fonts (2026 paradigm)**: single font file, continuous weight/width axis, responsive typography as design system primitive.

### Hierarchy Rules
- Establish 4-5 levels maximum (display, heading, subheading, body, caption).
- Reading rhythm: line-height 1.4-1.6 for body, 1.1-1.2 for headings.
- Measure (line length): 50-75 characters for readability.
- Scale ratio: 1.25 (minor third) for dense UI, 1.333 (perfect fourth) for editorial, 1.5+ for luxury/impact.

## 6. Layout & Spatial Psychology

### Scanning Patterns
- **F-pattern**: text-heavy pages. Users scan top, then left side. Place key content top-left.
- **Z-pattern**: landing pages and marketing. Eye follows Z from top-left to bottom-right. Place CTA at terminal point.
- **Gutenberg diagram**: evenly distributed content. Strong primary area (top-left), strong terminal area (bottom-right), weak fallow areas.

### White Space
- White space is not empty — it is a luxury signal and cognitive relief.
- Generous padding says "we value your attention."
- Cramped layouts say "everything is equally important" which means nothing is.
- **Micro white space**: between elements in a group (4-8px). Affects readability.
- **Macro white space**: between sections and panels (24-64px). Affects comprehension.

### Visual Hierarchy Tools
1. **Size**: larger = more important
2. **Color/contrast**: high contrast = attention
3. **Position**: top-left = first seen (in LTR cultures)
4. **Proximity**: grouped = related
5. **Repetition**: consistent treatment = same category
6. **Isolation**: surrounded by space = important

## 7. Interaction Psychology

### Feedback & Response Time
- **0-100ms**: instantaneous. Direct manipulation feels native.
- **100-300ms**: noticeable delay. Show state change.
- **300ms-1s**: perceptible wait. Show loading indicator.
- **1-10s**: attention drift. Show progress bar with estimate.
- **10s+**: context loss. Allow background processing, show completion notification.

### Microinteraction Persuasion
- **Trigger**: clear affordance that invites action (button, link, gesture area)
- **Rules**: what happens in response (animation, state change, data update)
- **Feedback**: confirmation that the action worked (visual, haptic, audio)
- **Loops & modes**: how the interaction evolves over time (progressive disclosure, learned shortcuts)

### Error Psychology
- Errors cause emotional stress. Design for recovery, not blame.
- Show what went wrong, why, and exactly what to do next.
- Preserve user input — never clear a form on error.
- Offer undo for destructive actions (minimum 5-second window).
- Make the recovery path the most visible element on the error screen.

## 8. Mobile Psychology

### Thumb Zone
- Bottom 1/3 of screen: easiest reach, place primary actions here.
- Top corners: hardest reach, use for less frequent actions.
- Center: natural resting position for browsing content.

### Mobile Attention
- Sessions are shorter and more interrupted than desktop.
- Context switching is constant. Support resume-ability.
- Glanceability matters more than information density.
- Touch targets: minimum 44x44pt (Apple HIG) / 48x48dp (Material).

### Mobile vs Desktop Mental Model
- Desktop users expect comprehensive tools and deep navigation.
- Mobile users expect quick answers, approvals, and monitoring.
- False parity (shrinking desktop to mobile) fails both audiences.
- Design mobile for the top 3-5 jobs: check status, approve/reject, see alerts, search, quick read.
