# ZeroSEO redesign audit

## Scope and current product

ZeroSEO is a static lead-generation website for a hybrid offer: custom software development, SEO/content marketing, guest posting, and link insertion. The primary conversion is the contact form; secondary conversions are service-page exploration and blog readership. The blog is client-rendered from `assets/js/blog-data.js` and individual articles use a query-string URL.

The current site has six user-facing routes: home, services, guest posting, contact, blog index, and blog article. It is a plain HTML/CSS/JavaScript project using Bootstrap 5, Font Awesome, Google Fonts, and a client-side EmailJS form integration. All page links resolve locally.

## Architecture audit

| Area | Current implementation | Assessment |
| --- | --- | --- |
| Pages | Six independently authored HTML documents | Easy to deploy, but global navigation/footer and metadata are duplicated. |
| Styling | `styles.css` source (33 KB) and `styles.min.css` runtime file (18 KB); every page loads the minified file | There is no visible build pipeline or source-of-truth guard, so edits can drift from production CSS. |
| Behaviour | One global script for navigation, blog rendering, animations, lazy loading, counters, scroll-to-top, form validation, and EmailJS | Functional but tightly coupled, global, and difficult to test or evolve. |
| Content | Blog entries include raw HTML strings in JavaScript | Fast to start, but unsuitable for editorial workflow, validation, and scalable SEO URLs. |
| Delivery | External Bootstrap, Font Awesome, Google Fonts, and on-demand EmailJS CDN | Multiple render-critical/network dependencies; no integrity/version-locking strategy. |

## Findings and priorities

### P0 — resolve before launch

1. **Clarify the commercial position.** The hero leads with enterprise software, while prominent cards and CTAs promote guest posting and link insertion. These serve different buyers and trust expectations. Pick a primary category for the main site, then position the other offer as a focused service line or separate acquisition path.
2. **Remove unsupported trust claims.** The home page states 200+ projects, 65+ active clients, 5+ years, “over a decade,” 24/7 support, and testimonial outcomes. Publish only evidence that can be substantiated; otherwise replace with process, capabilities, and anonymized proof.
3. **Fix legal and contact readiness.** Privacy and Terms links are placeholders, and the contact form has no disclosed privacy handling. EmailJS recipient, service and template identifiers live in the client. Its public key is intended to be public, but access must be restricted in EmailJS and form abuse protection/rate limiting is needed.

### P1 — high impact redesign work

1. Replace duplicated static chrome with a reusable layout/component system.
2. Establish a single conversion path: discovery CTA → qualification/brief → consultation confirmation.
3. Use a proof-first homepage: offer, outcomes, selected capabilities, delivery process, case studies/logos, FAQs, and final CTA.
4. Replace generic testimonials with attributable client proof or remove them.
5. Add service-detail pages or structured service sections with scope, deliverables, timeline, engagement model, and FAQ.
6. Add canonical URLs, Organization/ProfessionalService JSON-LD, Service/Article schema, unique social images, and real policy pages.

### P2 — quality and maintainability

1. Move blog content to Markdown/MDX or CMS-backed structured content with slug URLs.
2. Replace Font Awesome CDN with a curated local SVG icon set.
3. Introduce an image pipeline and responsive `srcset`/`sizes` for content images.
4. Add automated link, accessibility, visual-regression, and form-flow checks.

## UI/UX and information architecture

### Current journey

`Home → service/guest-posting page → contact form` is the intended sales journey. `Blog list → query-string article → service/contact` is the organic journey. It is workable, but the site asks visitors to understand a broad set of unrelated services before it explains the specific outcome, audience, process, or proof.

### Recommended architecture

1. Home — one clear value proposition, high-confidence proof, featured service lines, process, insight, final CTA.
2. Services hub — cards that route to individual offer pages.
3. Service detail — target customer, problem, deliverables, process, relevant proof, FAQ, inquiry CTA.
4. Case studies — before/after outcomes, approach, measurable evidence (only when real).
5. Insights — indexed article archive and clean slug-based articles.
6. About — company story, operating principles, team/partners if available.
7. Contact — short qualifying form, response-time expectation, consent and alternate contact options.
8. Privacy, Terms, and 404.

### Wireframe direction

**Homepage:** compact header → dark editorial hero with one primary CTA and one proof signal → client/logo strip → service cards → outcome-led case-study module → delivery process → insight cards → FAQ → CTA/footer.

**Service detail:** service-specific hero → problem/outcome → deliverables grid → approach/timeline → selected proof → FAQ → inquiry panel.

This follows the reference's high-level IT-service composition—technology-forward visual hierarchy, dark surfaces, deliberate whitespace, modular cards, and strategic CTAs—while remaining original to ZeroSEO.

## Design system specification

Use an original, restrained "technical confidence" system:

- **Typography:** `Manrope` (UI/body) and `DM Sans` or `Sora` (display); locally self-hosted WOFF2 with system fallback.
- **Color:** ink `#0A1020`, surface `#101A31`, paper `#F6F8FC`, muted `#667085`, electric blue `#4F7CFF`, signal mint `#46D5B0`. Use blue/mint sparingly for actions and data, not as decoration everywhere.
- **Spacing:** 4 px base scale; 16/24/32/48/72/96 section rhythm; `max-width: 1200px` content container.
- **Type scale:** 14, 16, 18, 24, 32, 48, 64 px with fluid `clamp()` display sizes.
- **Components:** header, primary/secondary/text buttons, eyebrow, section header, service card, proof metric, case-study card, FAQ accordion, article card, form field, status notice, and footer.
- **Motion:** 160–240 ms hover/focus transitions and restrained entrance motion; honor `prefers-reduced-motion`. No decorative animation that blocks reading or delays interaction.

## Accessibility and responsive audit

- All six pages have one `h1`, but none use a semantic `main` landmark; add `main`, a skip link, and meaningful `aria-current` navigation state.
- The mobile menu toggle lacks an accessible name and explicit `aria-controls`/`aria-expanded` contract.
- Footer social/legal placeholder links (`#`) create dead keyboard stops. Replace or remove them.
- Forms need persistent visible labels, announced success/error status (`aria-live`), field-level error text, and a privacy-consent link.
- Several imagery elements lack explicit dimensions and most do not use responsive image candidates. This risks layout shift and overserving mobile users.
- Existing breakpoints are desktop-first Bootstrap adaptations. Rebuild mobile-first: one-column content and 44×44 px targets by default; two columns at ~768 px; broaden layouts only at ~1024 px and ~1280 px.
- Current CSS has focus styles in some components but does not declare reduced-motion behavior.

## Performance and SEO audit

- The home hero uses a CSS background image, which cannot use responsive image selection or native priority hints. Replace with a semantic responsive `<picture>` or optimized decorative layer.
- Bootstrap and Font Awesome are loaded from CDNs; the latter is costly for a small icon set. Modernize to custom CSS/layout and local SVGs.
- Bootstrap and Font Awesome are deferred with `media=print`, creating potential visual instability and dependence on JavaScript to apply styles.
- `styles.css` and `styles.min.css` are separate hand-managed artifacts; add a deterministic build process.
- The declared homepage Open Graph URL is `zeroseo.com`, while the sitemap uses `zeroseo.tech`; standardize hostname and canonical tags. The declared OG image is absent from the repository.
- No canonical tags, robots.txt, structured data, article-level metadata, or clean article URLs are present. Query-string articles should be migrated without breaking indexed URLs (301 redirects if hosting supports them).
- Blog HTML is injected through `innerHTML`. Current content is local, but the future content path must sanitize and validate generated HTML.

## Asset requirements

Existing WebP assets are lightweight and usable as temporary placeholders, but they are generic and do not provide credible product or client proof. Preserve the logo only after confirming brand guidance; replace the remaining imagery as follows:

| Asset | Purpose | Specification | Suggested source |
| --- | --- | --- | --- |
| Hero visual | Establish technical credibility | 2400×1600 WebP/AVIF plus 1200 px variant; dark, abstract product/workflow composition; no generic stock handshake | Custom 3D/SVG composition or licensed stock |
| Service visuals | Differentiate 2–3 core offers | 1200×900 SVG or WebP; coherent abstract systems/graphs style | Custom SVG/Storyset; licensed illustration library |
| Case-study imagery | Prove delivery | Real dashboard/product screenshots, redacted where needed; 1600 px wide WebP | Client-approved captures |
| Logo strip | Social proof | Monochrome SVG logos with permission | Client-supplied/approved assets |
| Portraits | Testimonials/team | Real, consented 800×800 WebP portraits; no AI stock people presented as clients | Client/team supplied |
| Social image | Share previews | 1200×630 WebP/PNG per page/article | Figma/Canva export from design system |

## Technology recommendation

Do **not** migrate merely for visual polish. The site can be fully redesigned as static HTML/CSS/JS. For the recommended multi-page, SEO-led architecture and maintainable blog, migrate to **Astro + TypeScript + component-scoped CSS**:

- Static output preserves low hosting cost and excellent performance.
- Content collections make blogs structured and validated.
- Shared layouts remove duplicated HTML.
- Progressive enhancement keeps JavaScript small.

Use React only for a genuinely interactive lead calculator, portal, or CMS-powered UI. Tailwind is optional; CSS custom properties and component styles are sufficient and keep the stack lean. Avoid Three.js; it adds complexity without a defined product need.

Estimated effort: 5–8 focused working days for design system, all pages, content migration, QA, and deployment setup; add 2–5 days if real case studies, brand photography, or a CMS are needed. Main risk: unverified claims and missing proof assets, not the frontend migration.

## Phased implementation roadmap

1. **Strategy (1 day):** confirm primary audience, offers, claims, CTA, and evidence.
2. **IA + copy (1 day):** page inventory, final navigation, content outline, and redirect map.
3. **Design (1–2 days):** tokens, responsive wireframes, and high-fidelity page compositions.
4. **Build (2–3 days):** component system, pages, optimized assets, blog migration, and form integration.
5. **Optimization + QA (1 day):** keyboard/mobile testing, accessibility checks, metadata/schema, performance pass, link/form verification.

## Acceptance criteria

- One primary market position and conversion objective per page.
- No placeholder legal/social links or unverified proof claims.
- Keyboard-complete navigation/form flow and reduced-motion support.
- Responsive images, no missing share images, and no layout shift from imagery.
- Page-specific metadata, canonicals, schema, sitemap, robots, and clean content URLs.
- Verified contact submission with spam protection and clear user feedback.
