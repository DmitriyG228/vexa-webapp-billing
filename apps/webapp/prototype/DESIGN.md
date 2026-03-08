# Vexa LP — Design Guidelines

Reference implementation: `index.html` (v14)
Style direction: **minimal & clean** (Vercel / Stripe aesthetic)

---

## 1. Color Palette

| Token | Value | Usage |
|---|---|---|
| Background | `#f8f8f7` | Page background (warm off-white, NOT pure #fff) |
| Surface | `#ffffff` | Cards, nav, tag pills, buttons |
| Border | `#e5e7eb` | All borders (gray-200) |
| Border subtle | `#f3f4f6` | Intra-card dividers (gray-100) |
| Text primary | `#030712` | Headlines (gray-950) |
| Text secondary | `#6b7280` | Subheadings, body (gray-500) |
| Text muted | `#9ca3af` | Labels, timestamps, meta (gray-400) |
| Text ghost | `#d1d5db` | Separators, ghost-text in terminal (gray-300) |
| Accent green | `#34d399` | Live indicator dot only |
| Accent amber | `#fbbf24` | Star icon in social proof only |
| Terminal bg | `#111111` | Terminal content area |
| Terminal chrome | `#1a1a1a` | Terminal header bar |
| Terminal status | `#161616` | Terminal status bar |
| Announcement bg | `#030712` | Top announcement bar (gray-950) |

**Rules:**
- Never use pure `#000000` or pure `#ffffff` as backgrounds
- No accent colors beyond green (live) and amber (star)
- No gradients on text (breaks minimal style)
- No colored backgrounds on sections — whitespace does the work
- Section dividers use `border-t border-gray-200` sparingly

---

## 2. Typography

**Font:** Inter (Google Fonts) — always load weights 300, 400, 500, 600, 700

### Scale

| Element | Size | Weight | Tracking | Color |
|---|---|---|---|---|
| H1 (hero) | `56px` (lg), `52px` (sm), `46px` (base) | `600` semibold | `-0.03em` | gray-950 |
| H2 (sections) | `40px` (sm+), `34px` (base) | `600` semibold | `-0.03em` | gray-950 |
| H2 accent word | same size | `300` light, `not-italic` | `-0.02em` | gray-400 |
| H3 (cards) | `18px` | `600` semibold | `-0.01em` | gray-950 |
| Subheading | `15.5px` | `400` normal | default | gray-500 |
| Body copy | `14–16px` | `400` normal | default | gray-500/400 |
| Nav links | `14px` | `400` | default | gray-500 |
| Badge text | `11.5px` | `500` medium | default | gray-500 |
| Tag text | `11.5px` | `500` medium | default | gray-600 |
| Button text | `13–14px` | `500` medium | default | — |
| Terminal body | `12px` | `400` | default | gray-300 |
| Terminal speaker | `11.5px` | `600` semibold | default | per-speaker color |
| Terminal meta | `9.5px` | `400` | default | gray-600 |
| Status bar | `10px` | `400–600` | `widest` | gray-600 |

### Section heading pattern (locked)
All section headings use the same treatment:
```
text-[34px] sm:text-[40px] font-semibold leading-[1.08] tracking-[-0.03em]
```
The last word(s) are the "accent" — wrapped in `<em>` with:
```
not-italic font-light text-gray-400
```
Examples:
- "From open source to **enterprise scale**"
- "Intelligence for every **meeting**"
- "Three API calls to **meeting intelligence**"

### Line heights
- H1 headline: `1.05`
- H2 section headings: `1.08`
- Subheading/body: `1.7`
- Terminal entries: `relaxed` (1.625)
- Card descriptions: `1.6`

---

## 3. Spacing System

Always use Tailwind's 4px base unit. Key values in use:

| Context | Value |
|---|---|
| Page max-width | `max-w-6xl` (72rem / 1152px) |
| Page horizontal padding | `px-6` |
| Hero vertical padding | `pt-12 lg:pt-16 pb-6 lg:pb-8` |
| Section vertical padding | `py-16 lg:py-20` |
| Two-column gap | `gap-10 lg:gap-14` (hero), `gap-10 lg:gap-16` (workflow) |
| Left column gap between elements | `gap-6` |
| Nav height | `h-14` (56px) |
| Nav item padding | `px-3 py-1.5` |
| Button height (hero) | `h-[44px]`, `px-6` |
| Button height (cards) | `h-[40px]`, `px-4` |
| Badge padding | `px-3 py-[5px]` |
| Card padding | `p-6` (bento, pricing) |
| Terminal padding | `p-5` |
| Terminal height | `h-[320px]` |
| Bento grid gap | `gap-4` |
| Section header margin-bottom | `mb-10` |

---

## 4. Layout

### Page structure (top to bottom)
1. Announcement bar (dark, full-width)
2. Marketing header (sticky, glassmorphic)
3. Hero section (2-col + workflow diagram card)
4. Bento grid (7 feature cards)
5. Agentic section (skills + integrations)
6. Meeting bots section (2-col)
7. Use cases tabs (7 tabs)
8. Code showcase (3-lang tabs)
9. Pricing section (4-tier grid)
10. Footer (minimal)

### Nav
- Sticky, `bg-white/80 backdrop-blur-md`, `border-b border-gray-200/70`
- Left: logo icon (26×26, rounded-[7px]) + "vexa" wordmark (15px semibold)
- Center: Docs / Pricing / GitHub (`hidden md:flex`)
- Right: "Sign in" text link (`hidden sm:block`) + "Get started" pill CTA
- Mobile: hamburger → Sheet drawer with all links

### Announcement bar
- Full-width, `bg-gray-950`, `py-2`
- Single line of text, centered, `text-[11.5px]`
- Version in white, description in gray-400, link in white/70

### Background
- Dot grid: `radial-gradient(circle, #d1d5db 1px, transparent 1px)`, `22px 22px`
- Radial vignette mask: `ellipse 90% 90% at 50% 50%`
- Subtle white-to-transparent gradient at top (`height: 200px`, `from-white/50`)
- Used in hero section only — other sections use plain `border-t` separators

### Footer
- `border-t border-gray-200`, `py-10`
- Left: logo + wordmark
- Right: Docs, GitHub, Pricing, Contact links
- `text-[13px] text-gray-400`

---

## 5. Components

### Badge
```
rounded-full, border border-gray-200, bg-white, shadow-sm
● (emerald-400 dot, 7px) + text
```
- Used at top of hero and as section labels (without dot)
- Section labels: just text in pill, no dot

### Buttons
| Type | Style |
|---|---|
| Primary | `rounded-full bg-gray-950 text-white hover:bg-gray-800` |
| Secondary | `rounded-full border border-gray-200 bg-white text-gray-800 hover:border-gray-400` |

- Hero: `h-[44px] px-6 text-[14px]`
- Cards: `h-[40px] px-4 text-[13px]`
- Primary always has trailing arrow icon
- GitHub button has GitHub SVG on the left

### Terminal card
```
rounded-[16px], border border-gray-200/80
shadow-[0_24px_64px_-12px_rgba(0,0,0,0.13)]
```
**Chrome bar** (1a1a1a):
- Traffic lights: `#ff5f57` / `#febc2e` / `#28c840`, 11px, gap-[6px]
- Centered title: `text-[11px] text-gray-500 font-mono`
- LIVE badge: emerald pulsing dot + "LIVE" text

**Content area** (111111):
- `p-5`, `font-mono text-[12px]`, `h-[320px]`, `overflow-y-auto`
- Speaker name: semibold, per-speaker color
- Transcript text: gray-300
- Ghost/unspoken words: gray-700
- Cursor: `▌` (U+258C) with `animate-blink`
- Animation: word-by-word typing, 55–150ms random delay

**Status bar** (161616):
- `● Connected · Google Meet` left, live clock right
- `text-[10px] text-gray-600/700 font-mono`

### Bento grid cards
```
rounded-2xl, border border-gray-200, bg-white, p-6
shadow: 0 1px 3px rgba(0,0,0,0.04), 0 8px 32px -8px rgba(0,0,0,0.06)
```
- H3: `text-[18px] font-semibold text-gray-950`
- Description: `text-[14px] text-gray-500 leading-[1.6]`
- Arrow link: circle button `w-8 h-8 rounded-full border border-gray-200`
- Each card has a mini visual mockup at the bottom

**Grid layout (3 rows):**
- Row 1: heading (span-1) + Real-time Transcription (span-1) + Interactive Bot (span-1)
- Row 2: Recording + Screenshare + Storage (3 equal columns)
- Row 3: MCP Server (span-1) + Multi-tenant Platform (span-1)

**Mini mockup styles:**
- Transcription: dark terminal `bg-[#111] rounded-xl p-4` with colored speaker names
- Interactive Bot: pill badges (TTS Speak, Listen, Respond, Screenshare)
- Recording: waveform bars `bg-gray-300/400` with red REC dot + timer
- Screenshare: browser chrome mockup with gray address bar + placeholder image
- Storage: mini table `font-mono text-[11px]` with header row + 3 data rows
- MCP: capability pills (REST API, WebSocket, MCP, Webhooks, SDKs, Self-hosted)
- Multi-tenant: 3 tenant rows with letter avatars + colored progress bars

### Workflow diagram
Full-width card below the 2-col hero. Shows data pipeline as a node graph.

**Card:** `rounded-2xl border border-gray-200 bg-white px-8 py-10 lg:px-12 lg:py-12`
- Shadow: `0 1px 3px rgba(0,0,0,0.04), 0 8px 32px -8px rgba(0,0,0,0.06)`
- 2-column grid: diagram (left), text content (right)

**Nodes:**
- Meeting pill: 3 stacked items (Teams, Meet, Zoom) in `rounded-2xl` container, each `56×56px`
- Center hub: `76×76px`, `rounded-2xl`, stronger shadow (`0 2px 12px rgba(0,0,0,0.08)`)
- Output nodes: `48×48px`, `rounded-xl`, 4 stacked (OpenAI, Claude, n8n, OpenClaw)

**SVG connections:**
- Gray bezier curve: meetings → vexa (`stroke: #d1d5db`, `stroke-width: 2`)
- Colored curves vexa → outputs: blue (#3b82f6), red (#ef4444), amber (#f59e0b), teal (#14b8a6)
- All curves: `opacity: 0.75`, `stroke-width: 2`, `stroke-linecap: round`
- Port dots at target endpoints: `r=3`, filled with curve color, `opacity: 0.6`
- Redraws on window resize

**Right text:**
- Icon + "Meeting-Defined Infrastructure" label (`text-[13px] text-gray-400`)
- H2: `text-[28px] sm:text-[32px]` (smaller than section headings)
- Body: `text-[16px] text-gray-400 leading-[1.7]`

**Mobile:** Simplified vertical flow with down-arrow SVGs between sections

### Agentic section
- `py-16 lg:py-20`, no border-top
- 3-column bento: heading (span-1) + Skills card + Integrations card
- Skills card: 3 items (OpenClaw 🦀, Claude Code, Codex) with logos
- Integrations card: 4 items (n8n with logo, Webhooks, Zapier, Custom) as pills

### Meeting bots section
- `py-16 lg:py-20 border-t border-gray-200`
- 2-column grid: copy (left) + visual (right)
- Copy: badge pill + H2 + description + 3 checkmark items
- Visual: platform logos (Teams, Meet, Zoom) with dividers + placeholder text
- Checkmark items: green check SVG + bold label + description

### Use case tabs
- 7 tabs: Sales, HR & Recruiting, Engineering, Video Production, Medical, Education, Legal
- Tab style: `rounded-full px-4 py-1.5 text-[13px]`
- Active tab: `bg-gray-950 text-white`
- Inactive tab: `text-gray-400 hover:text-gray-600 hover:bg-gray-100`
- Each panel: 2-column grid (copy left + mockup card right)
- Mockup cards have detailed domain-specific visualizations

### Code showcase
- 3 language tabs: Python, cURL, TypeScript
- Tab style: `rounded-t-lg px-4 py-2 text-[13px]`
- Active: `bg-[#111] text-white`
- Inactive: `text-gray-400 bg-transparent`
- Code block: `bg-[#111] rounded-b-2xl rounded-tr-2xl` with macOS chrome
- Filename badge: `text-[11px] text-gray-500`
- Syntax colors: blue (`#7dd3fc`) for strings, green (`#6ee7b7`) for URLs, gray-600 for comments, white for code

### Pricing section (4-tier)
- `py-16 lg:py-20 border-t border-gray-200`
- 4-column grid: Open Source, Individual (highlighted), Startup, Enterprise
- All cards equal height (`flex flex-col`, features pushed to bottom with `mt-auto`)

**Card styles:**
| Tier | Border | Badge |
|---|---|---|
| Open Source | `border border-gray-200` | — |
| Individual | `border-2 border-gray-950` | "START HERE" pill above |
| Startup | `border border-gray-200` | — |
| Enterprise | `border border-gray-200` | — |

**Individual "START HERE" badge:** `absolute -top-3 left-1/2 -translate-x-1/2`, `bg-gray-950 text-white text-[11px] rounded-full`

**Pricing display:**
- Open Source: "Free" (30px semibold)
- Individual: "$12" (30px) + "/mo" (14px gray-400)
- Startup: "from" (14px gray-400) + "$150" (30px) + "/mo"
- Enterprise: "Custom" (30px semibold)

**Features:** checkmarks with `text-[13px]`, Individual uses `stroke="#111"`, others use `stroke="#9ca3af"`

### Social proof
- 5 avatars, `h-6 w-6`, `ring-[2px] ring-white`, overlap `-7px margin`
- `|` divider (`h-4 w-px bg-gray-200`)
- Amber star + "Starred by **1.3k+** developers"

---

## 6. Animation

- **Fade-up only:** `opacity: 0 → 1` + `translateY(20px → 0)`
- Duration: `0.6s`, easing: `cubic-bezier(0.16, 1, 0.3, 1)` (spring-like)
- Stagger delays: `d1=0.04s, d2=0.12s, d3=0.20s, d4=0.28s, d5=0.36s, d6=0.44s, d7=0.10s, d8=0.52s`
- Terminal column: `d7 = 0.10s` delay (appears slightly after copy starts)
- Workflow diagram: `d8 = 0.52s` (last to appear in hero)
- Terminal cursor: `animate-blink` (1s step-end)
- Live dot: `animate-pulse`
- **Nothing else animates** — no hover scale, no slide-in, no glow pulse

---

## 7. Speaker Colors (terminal)

Always use these four, in this order:

| Speaker | Color |
|---|---|
| Alice Chen | `#7dd3fc` (blue-300) |
| Bob Rodriguez | `#c4b5fd` (violet-300) |
| Carol Kim | `#6ee7b7` (emerald-300) |
| David Wilson | `#fca5a5` (red-300) |

Pastel tones only — never saturated colors on a dark bg.

---

## 8. What NOT to Do

| Don't | Do instead |
|---|---|
| Gradient text (`bg-clip-text`) | Plain `text-gray-950` + light accent word |
| Glow orbs / blobs in background | Dot grid + vignette mask only |
| Colored section backgrounds | White surface cards on off-white bg |
| Tab bars inside the terminal | Single scrolling transcript pane |
| Split terminal (transcript + insights) | One pane, one job |
| Stacking buttons vertically on desktop | `flex-row gap-3` always |
| Text-only logo in nav | Always `logodark.svg` + "vexa" wordmark |
| Pure white page background | `#f8f8f7` warm off-white |
| Changing the headline type treatment | Lock: semibold / light-gray accent pattern |
| Adding new accent colors | Only green (live) and amber (star) |
| Animation beyond fade-up + blink + pulse | Those three only |
---

## 10. Dark Mode

Follows the Vercel pattern: **pure black backgrounds, neutral (no blue tint) grays, subtle borders.**

### Color Palette (Dark)

| Token | Value | Usage |
|---|---|---|
| Background | `#000000` | Page background (pure black, via `--background` CSS var) |
| Surface | `#0a0a0a` | Cards, elevated elements (`neutral-950`) |
| Surface hover | `#171717` | Hover states, tab backgrounds (`neutral-900`) |
| Border | `#262626` | All borders (`neutral-800`) |
| Border subtle | `#1f1f1f` | Intra-card dividers |
| Text primary | `#ededed` | Headlines (93% white, not pure `#fff`) |
| Text secondary | `#a1a1a1` | Body copy (`gray-400`) |
| Text muted | `#737373` | Labels, timestamps (`gray-500`) |
| Text ghost | `#404040` | Separators, ghost-text (`neutral-700`) |

### Rules

- **Never use blue-tinted grays** for dark backgrounds/borders. Use `neutral-*` scale, not `gray-*`, for `dark:bg-*` and `dark:border-*` classes
- Page background is **pure black** (`#000`), not dark gray
- Cards use `dark:bg-neutral-900` (or `dark:bg-neutral-950` for minimal elevation)
- Borders use `dark:border-neutral-800` — borders carry all visual weight (no card shadows in dark)
- Text uses `dark:text-gray-*` (the blue tint in text is imperceptible)
- Terminal/code areas are already dark-themed — no `dark:` overrides needed
- The `from-white/50` hero gradient becomes `dark:from-black/50`
- Dot grid dots: `#262626` in dark mode (neutral-800)
- Card `boxShadow` is invisible on black bg — borders do the separation work
- Nav uses `dark:bg-neutral-950/80 backdrop-blur-md`

### Tailwind Pattern

```
{/* Light + dark card */}
<div className="bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800">

{/* Light + dark text */}
<h3 className="text-gray-950 dark:text-gray-50">
<p className="text-gray-500 dark:text-gray-400">

{/* Primary button */}
<button className="bg-gray-950 text-white dark:bg-white dark:text-gray-950">

{/* Nav */}
<header className="bg-white/80 dark:bg-neutral-950/80 backdrop-blur-md border-b border-gray-200/70 dark:border-neutral-800/70">
```

### CSS Variables (`.dark` in globals)

```css
.dark {
  --background: 0 0% 0%;        /* #000 */
  --foreground: 0 0% 93%;       /* #ededed */
  --card: 0 0% 0%;              /* same as bg */
  --border: 0 0% 12%;           /* #1f1f1f */
}
```

---

## 9. Version Log

| File | Status | Notes |
|---|---|---|
| `v1.html` | Frozen | Centered layout, "Meeting Transcription API" |
| `v2.html` | Frozen | Two-column, original messaging, 4 tags, single terminal |
| `v3.html` | Frozen | Two-column, "Build Meeting Intelligence", ecosystem strip |
| `v4.html` | Frozen | Two-column, "Meeting Transcription API", 4 tags |
| `v5.html` | Frozen | "Meeting Intelligence API", n8n-style workflow diagram |
| `v6.html` | Frozen | Full LP: hero + workflow + features + components + bots + pricing |
| `v7.html` | Frozen | Vercel bento grid, compact sections, agentic section |
| `v8.html` | Frozen | Use case tabs (7 panels), code showcase (3 langs) |
| `v9.html` | Frozen | Recording waveform, screenshare browser mockup |
| `v10.html` | Frozen | Multi-tenant tenant bars, MCP capability pills |
| `v11.html` | Frozen | Refined workflow diagram with colorful bezier curves |
| `v12.html` | Frozen | 4-tier pricing (Open Source / Individual / Startup / Enterprise) |
| `v13.html` | Frozen | Flat $12/mo Individual, removed slider |
| `v14.html` / `index.html` | **Current** | Unlimited transcription, Zoom in Startup, equal-height cards |
