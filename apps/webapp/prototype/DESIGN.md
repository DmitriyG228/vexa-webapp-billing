# Vexa LP — Design Guidelines

Reference implementation: `v2.html`
Style direction: **minimal & clean** (Stripe / Linear aesthetic)

---

## 1. Color Palette

| Token | Value | Usage |
|---|---|---|
| Background | `#f8f8f7` | Page background (warm off-white, NOT pure #fff) |
| Surface | `#ffffff` | Cards, nav, tag pills, buttons |
| Border | `#e5e7eb` | All borders (gray-200) |
| Text primary | `#030712` | Headlines (gray-950) |
| Text secondary | `#6b7280` | Subheadings, body (gray-500) |
| Text muted | `#9ca3af` | Labels, timestamps, meta (gray-400) |
| Text ghost | `#d1d5db` | Separators, ghost-text in terminal (gray-300) |
| Accent green | `#34d399` | Live indicator dot only |
| Accent amber | `#fbbf24` | Star icon in social proof only |
| Terminal bg | `#111111` | Terminal content area |
| Terminal chrome | `#1a1a1a` | Terminal header bar |
| Announcement bg | `#030712` | Top announcement bar (gray-950) |

**Rules:**
- Never use pure `#000000` or pure `#ffffff` as backgrounds
- No accent colors beyond green (live) and amber (star)
- No gradients on text (breaks minimal style)
- No colored backgrounds on sections — whitespace does the work

---

## 2. Typography

**Font:** Inter (Google Fonts) — always load weights 300, 400, 500, 600, 700

### Scale

| Element | Size | Weight | Tracking | Color |
|---|---|---|---|---|
| Headline line 1–2 | `64px` (lg), `60px` (sm), `52px` (base) | `600` semibold | `-0.03em` | gray-950 |
| Headline accent word | same size | `300` light, `not-italic` | `-0.02em` | gray-400 |
| Subheading | `15.5px` | `400` normal | default | gray-500 |
| Nav links | `14px` | `400` | default | gray-500 |
| Badge text | `11.5px` | `500` medium | default | gray-500 |
| Tag text | `11.5px` | `500` medium | default | gray-600 |
| Button text | `14px` | `500` medium | default | — |
| Terminal body | `12px` | `400` | default | gray-300 |
| Terminal speaker | `11.5px` | `600` semibold | default | per-speaker color |
| Terminal meta | `9.5px` | `400` | default | gray-600 |
| Status bar / labels | `10px` | `400–600` | `widest` | gray-600 |

### Headline treatment (locked)
```
Meeting          ← semibold, gray-950
Transcription    ← semibold, gray-950
API              ← light (300), gray-400, not-italic em tag
```
The last word in the headline stack is always the "accent" word — lighter weight, gray-400. Never use color or gradient for this.

### Line heights
- Headlines: `1.03–1.06`
- Subheading: `1.7`
- Terminal entries: `relaxed` (1.625)

---

## 3. Spacing System

Always use Tailwind's 4px base unit. Key values in use:

| Context | Value |
|---|---|
| Page max-width | `max-w-6xl` (72rem) |
| Page horizontal padding | `px-6` |
| Hero vertical padding | `py-16 lg:py-24` |
| Two-column gap | `gap-14 lg:gap-20` |
| Left column gap between elements | `gap-6` |
| Nav height | `h-14` (56px) |
| Nav item padding | `px-3 py-1.5` |
| Button height | `h-[44px]`, `px-6` |
| Badge padding | `px-3 py-[5px]` |
| Tag padding | `px-2.5 py-1` |
| Terminal padding | `p-5` |
| Terminal height | `h-[400px]` |

**Rules:**
- Never mix gap-6 and gap-7 in the same column — pick one and keep it
- Section padding is always `py-16 lg:py-24` — don't shrink it
- Terminal height is fixed at 400px — don't change it per iteration

---

## 4. Layout

### Grid
- **Mobile:** single column, stacked (copy on top, terminal below)
- **Desktop (lg+):** `grid-cols-2`, left = copy, right = terminal
- Left column: `~55%` of visual weight (wider text column)
- Right column: terminal card, full width of its cell

### Nav
- Sticky, `bg-white/80 backdrop-blur-md`
- Left: logo icon (26×26, rounded-[7px]) + "vexa" wordmark
- Center: Docs / Pricing / GitHub (hover: bg-gray-100 rounded-md)
- Right: "Sign in" text link + "Get started" pill CTA
- Always include the logo image — never text-only wordmark

### Announcement bar
- Full-width, `bg-gray-950`, `py-2`
- Single line of text, centered, `text-[11.5px]`
- Inline text link, right of the message

### Background
- Dot grid: `radial-gradient(circle, #d1d5db 1px, transparent 1px)`, `22px 22px`
- Radial vignette mask so dot grid fades at edges
- Subtle white-to-transparent gradient at top (`height: 280px`, `from-white/50`)
- No glow orbs, no blobs, no noise textures

---

## 5. Components

### Badge
```
rounded-full, border border-gray-200, bg-white, shadow-sm
● (emerald-400 dot, 7px) + text
```
- Always has the green dot on the left
- One badge only, top of copy column

### Tag pills
```
rounded-md, border border-gray-200, bg-white
icon (11px, stroke) + text
```
- Wrap in `flex flex-wrap gap-2`
- Max 4 tags per row
- Use inline SVG icons (stroke, 11–12px) — not emoji, not colored icons
- Exception: platform logos (Teams, Meet) use actual `<img>` at 14×14px

### Buttons
| Type | Style |
|---|---|
| Primary | `rounded-full bg-gray-950 text-white hover:bg-gray-800` |
| Secondary | `rounded-full border border-gray-200 bg-white text-gray-800 hover:border-gray-400` |

- Both `h-[44px] px-6 text-[14px] font-medium`
- Primary always has trailing arrow icon (14px)
- Secondary (GitHub) always has GitHub SVG icon (15px) on the left
- Buttons sit in a `flex flex-row gap-3` — never stacked vertically on desktop

### Terminal card
```
rounded-[16px], border border-gray-200/80
shadow-[0_24px_64px_-12px_rgba(0,0,0,0.13)]
```
**Chrome bar** (1a1a1a):
- Traffic lights: `#ff5f57` / `#febc2e` / `#28c840`, 11px, gap-[6px]
- Centered title: absolute positioned, `text-[11px] text-gray-500 font-mono`
- LIVE badge: emerald pulsing dot + "LIVE" text, right-aligned

**Content area** (111111):
- `p-5`, `font-mono text-[12px]`, `h-[400px]`, `overflow-y-auto`
- Speaker name: semibold, per-speaker color (blue/purple/green/red)
- Transcript text: gray-300
- Ghost/unspoken words: gray-700
- Cursor: `▌` with `animate-blink`

**Status bar** (161616):
- `● Connected · Google Meet` left, live clock right
- `text-[10px] text-gray-600 font-mono`

**Never add:**
- Tab bars (Transcript / Intelligence tabs)
- Secondary panes or split panels inside the terminal
- Color accents (indigo, purple) inside the terminal UI chrome

### Social proof
- 5 avatars, `h-6 w-6`, `ring-[2px] ring-white`, overlap `-7px margin`
- `|` divider (`h-4 w-px bg-gray-200`)
- Amber star + "Starred by **1.3k+** developers"

### Workflow diagram (n8n-inspired, v5+)
Full-width card below the two-column hero. Shows data pipeline as a node graph.

**Section heading:** `text-[15px] text-gray-400 font-medium`, centered above card with `mb-6`
- Accent word in `<em>`: `not-italic font-light text-gray-300`
- Text: "Built for your *stack*"

**Card:** `rounded-2xl border border-gray-200 bg-white px-8 py-8`
- Shadow: `0 1px 3px rgba(0,0,0,0.04), 0 8px 32px -8px rgba(0,0,0,0.06)` (multi-layer premium)
- No transparency — solid white (not bg-white/70)

**Node (standard):** `64×64px`, `rounded-xl`, `border border-gray-200 bg-white shadow-sm`, icon 28px centered
**Node (small):** `52×52px`, `rounded-[10px]`, icon 24px — used for AI stack column
**Node (primary):** `72×72px`, stronger shadow + `border-color: #d1d5db`, icon 32px — used for vexa center node

**Labels:** `text-[11px] font-medium text-gray-500`, centered below node, `margin-top: 6px`
**Section labels:** `text-[11px] font-medium text-gray-400 tracking-[0.08em] uppercase`

**Layout:** CSS Grid — 3 columns (Meetings | Pipeline | AI Stack) with `minmax(64px,120px)` spacers. Max width `max-w-3xl` centered.
- Left: 2 standard nodes stacked (Teams, Meet)
- Center: 1 primary node (vexa API)
- Right: 4 small nodes stacked (OpenAI, Claude, OpenClaw, n8n)

**SVG connections:** Cubic bezier paths, `stroke: #d1d5db`, `stroke-width: 1.5px`, `opacity: 0.7`
- Single forward arrowheads only (no bidirectional — marketing pages use one-way flow)
- Port dots at connection endpoints: `r=3, fill: #e5e7eb, stroke: #d1d5db`
- JS draws paths after load to match actual node positions; redraws on resize

**Icons:** All nodes use inline SVG or PNG logos — no emoji. OpenClaw uses a custom SVG crab icon (`stroke: #ef4444`).

**Mobile:** Vertical stack with down-arrows (↓) between sections. 4 AI nodes in a `grid-cols-4` row.

---

## 6. Animation

- **Fade-up only:** `opacity: 0 → 1` + `translateY(20px → 0)`
- Duration: `0.6s`, easing: `cubic-bezier(0.16, 1, 0.3, 1)` (spring-like)
- Stagger delays: `0.04s, 0.12s, 0.20s, 0.28s, 0.36s, 0.44s` (8ms increments)
- Terminal column: `0.10s` delay (appears slightly after copy starts)
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

| ❌ Don't | ✅ Do instead |
|---|---|
| Gradient text (`bg-clip-text`) | Plain `text-gray-950` + light accent word |
| Glow orbs / blobs in background | Dot grid + vignette mask only |
| Colored section backgrounds | White surface cards on off-white bg |
| Tab bars inside the terminal | Single scrolling transcript pane |
| Split terminal (transcript + insights pane) | One pane, one job |
| More than 4 tag pills | Keep to the essentials |
| Stacking buttons vertically on desktop | `flex-row gap-3` always |
| Text-only logo in nav | Always `logodark.svg` + "vexa" wordmark |
| Pure white (`#fff`) page background | `#f8f8f7` warm off-white |
| Changing the headline type treatment mid-iteration | Lock: semibold / light-gray accent pattern |
| Adding new accent colors | Only green (live) and amber (star) |
| Animation beyond fade-up + blink + pulse | Those three only |

---

## 9. Version Log

| File | Status | Notes |
|---|---|---|
| `v1.html` | Frozen | Centered layout, "Meeting Transcription API" |
| `v2.html` | Frozen ← current reference | Two-column, original messaging, 4 tags, single terminal |
| `v3.html` | Frozen | Two-column, "Build Meeting Intelligence", ecosystem strip, dual-pane terminal |
| `v4.html` | Frozen | Two-column, "Meeting Transcription API", 4 tags, single terminal |
| `v5.html` | Frozen | "Meeting Intelligence API", n8n-style workflow diagram, forward-only arrows, premium card |
| `v6.html` | Frozen | Full LP: hero + workflow + features + components + bots + pricing |
| `index.html` | Working file = v6 | Fork from the version you want to iterate on |
