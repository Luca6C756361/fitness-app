
Conversazione con Gemini
Quali son le differenze tra questi 2 MD?:1(---

version: alpha

name: Premium-Cyberpunk-design-analysis

description: "A deep midnight product-focused marketing canvas built around #12071A (Deep Midnight Black), premium pearl text (#F8F2FC), and the signature Cyberpunk Core Purple (#951DD1) used as the central chromatic accent. The system reads as futuristic software-craft documentation: neon-infused, technical, and strikingly bold. Cards live as Gloom Violet panels (#2F104F) with glowing hairline borders. The accent purple and Cyber Cyan LED (#00E5FF) appear on the brand mark, focus rings, and intentional CTAs. Page rhythm leans on product UI screenshots framed in dark panels accented with neon glows."



colors:

  primary: "#951DD1"

  on-primary: "#F8F2FC"

  primary-hover: "#BF3EFF"

  primary-focus: "#00E5FF"

  ink: "#F8F2FC"

  ink-muted: "#d8cdeb"

  ink-subtle: "#9c81b5"

  ink-tertiary: "#5a3a78"

  canvas: "#12071A"

  surface-1: "#1d0c29"

  surface-2: "#261036"

  surface-3: "#2F104F"

  surface-4: "#3c1566"

  hairline: "#2F104F"

  hairline-strong: "#951DD1"

  hairline-tertiary: "#BF3EFF"

  inverse-canvas: "#F8F2FC"

  inverse-surface-1: "#ebe1f2"

  inverse-surface-2: "#dfd2e8"

  inverse-ink: "#12071A"

  brand-secure: "#00E5FF"

  semantic-success: "#00E5FF"

  semantic-overlay: "#050208"



typography:

  display-xl:

    fontFamily: Linear Display

    fontSize: 80px

    fontWeight: 600

    lineHeight: 1.05

    letterSpacing: -3.0px

  display-lg:

    fontFamily: Linear Display

    fontSize: 56px

    fontWeight: 600

    lineHeight: 1.10

    letterSpacing: -1.8px

  display-md:

    fontFamily: Linear Display

    fontSize: 40px

    fontWeight: 600

    lineHeight: 1.15

    letterSpacing: -1.0px

  headline:

    fontFamily: Linear Display

    fontSize: 28px

    fontWeight: 600

    lineHeight: 1.20

    letterSpacing: -0.6px

  card-title:

    fontFamily: Linear Display

    fontSize: 22px

    fontWeight: 500

    lineHeight: 1.25

    letterSpacing: -0.4px

  subhead:

    fontFamily: Linear Display

    fontSize: 20px

    fontWeight: 400

    lineHeight: 1.40

    letterSpacing: -0.2px

  body-lg:

    fontFamily: Linear Text

    fontSize: 18px

    fontWeight: 400

    lineHeight: 1.50

    letterSpacing: -0.1px

  body:

    fontFamily: Linear Text

    fontSize: 16px

    fontWeight: 400

    lineHeight: 1.50

    letterSpacing: -0.05px

  body-sm:

    fontFamily: Linear Text

    fontSize: 14px

    fontWeight: 400

    lineHeight: 1.50

    letterSpacing: 0

  caption:

    fontFamily: Linear Text

    fontSize: 12px

    fontWeight: 400

    lineHeight: 1.40

    letterSpacing: 0

  button:

    fontFamily: Linear Text

    fontSize: 14px

    fontWeight: 500

    lineHeight: 1.20

    letterSpacing: 0

  eyebrow:

    fontFamily: Linear Text

    fontSize: 13px

    fontWeight: 500

    lineHeight: 1.30

    letterSpacing: 0.4px

  mono:

    fontFamily: Linear Mono

    fontSize: 13px

    fontWeight: 400

    lineHeight: 1.50

    letterSpacing: 0



rounded:

  xs: 4px

  sm: 6px

  md: 8px

  lg: 12px

  xl: 16px

  xxl: 24px

  pill: 9999px

  full: 9999px



spacing:

  xxs: 4px

  xs: 8px

  sm: 12px

  md: 16px

  lg: 24px

  xl: 32px

  xxl: 48px

  section: 96px



components:

  button-primary:

    backgroundColor: "{colors.primary}"

    textColor: "{colors.on-primary}"

    typography: "{typography.button}"

    rounded: "{rounded.md}"

    padding: 8px 14px

  button-primary-pressed:

    backgroundColor: "{colors.primary-focus}"

    textColor: "{colors.canvas}"

    typography: "{typography.button}"

    rounded: "{rounded.md}"

  button-primary-hover:

    backgroundColor: "{colors.primary-hover}"

    textColor: "{colors.on-primary}"

    typography: "{typography.button}"

    rounded: "{rounded.md}"

  button-secondary:

    backgroundColor: "{colors.surface-1}"

    textColor: "{colors.ink}"

    typography: "{typography.button}"

    rounded: "{rounded.md}"

    padding: 8px 14px

  button-tertiary:

    backgroundColor: "{colors.canvas}"

    textColor: "{colors.ink}"

    typography: "{typography.button}"

    rounded: "{rounded.md}"

    padding: 8px 14px

  button-inverse:

    backgroundColor: "{colors.inverse-canvas}"

    textColor: "{colors.inverse-ink}"

    typography: "{typography.button}"

    rounded: "{rounded.md}"

    padding: 8px 14px

  pricing-card:

    backgroundColor: "{colors.surface-1}"

    textColor: "{colors.ink}"

    typography: "{typography.body}"

    rounded: "{rounded.lg}"

    padding: 24px

  pricing-card-featured:

    backgroundColor: "{colors.surface-2}"

    textColor: "{colors.ink}"

    typography: "{typography.body}"

    rounded: "{rounded.lg}"

    padding: 24px

  feature-card:

    backgroundColor: "{colors.surface-1}"

    textColor: "{colors.ink}"

    typography: "{typography.body}"

    rounded: "{rounded.lg}"

    padding: 24px

  product-screenshot-card:

    backgroundColor: "{colors.surface-1}"

    textColor: "{colors.ink}"

    typography: "{typography.body}"

    rounded: "{rounded.xl}"

    padding: 24px

  testimonial-card:

    backgroundColor: "{colors.surface-1}"

    textColor: "{colors.ink}"

    typography: "{typography.body-lg}"

    rounded: "{rounded.lg}"

    padding: 32px

  customer-logo-tile:

    backgroundColor: "{colors.canvas}"

    textColor: "{colors.ink-subtle}"

    typography: "{typography.caption}"

    rounded: "{rounded.xs}"

    padding: 16px

  text-input:

    backgroundColor: "{colors.surface-1}"

    textColor: "{colors.ink}"

    typography: "{typography.body}"

    rounded: "{rounded.md}"

    padding: 8px 12px

  text-input-focused:

    backgroundColor: "{colors.surface-1}"

    textColor: "{colors.ink}"

    typography: "{typography.body}"

    rounded: "{rounded.md}"

    padding: 8px 12px

  pricing-tab-default:

    backgroundColor: "{colors.canvas}"

    textColor: "{colors.ink-subtle}"

    typography: "{typography.button}"

    rounded: "{rounded.pill}"

    padding: 6px 14px

  pricing-tab-selected:

    backgroundColor: "{colors.surface-2}"

    textColor: "{colors.ink}"

    typography: "{typography.button}"

    rounded: "{rounded.pill}"

    padding: 6px 14px

  cta-banner:

    backgroundColor: "{colors.surface-1}"

    textColor: "{colors.ink}"

    typography: "{typography.headline}"

    rounded: "{rounded.lg}"

    padding: 48px

  changelog-row:

    backgroundColor: "{colors.canvas}"

    textColor: "{colors.ink}"

    typography: "{typography.body}"

    rounded: "{rounded.xs}"

    padding: 24px 0

  status-badge:

    backgroundColor: "{colors.surface-2}"

    textColor: "{colors.ink-muted}"

    typography: "{typography.caption}"

    rounded: "{rounded.pill}"

    padding: 2px 8px

  top-nav:

    backgroundColor: "{colors.canvas}"

    textColor: "{colors.ink}"

    typography: "{typography.body-sm}"

    rounded: "{rounded.xs}"

    height: 56px

  footer:

    backgroundColor: "{colors.canvas}"

    textColor: "{colors.ink-subtle}"

    typography: "{typography.caption}"

    rounded: "{rounded.xs}"

    padding: 64px 32px

---



## Overview



This marketing canvas is the deepest dark surface in this collection — `{colors.canvas}` is #12071A, a Deep Midnight Black with a rich dark-purple undertone. On top sits a four-step surface ladder (`{colors.surface-1}` through `{colors.surface-4}`) for cards, panels, and lifted tiles, reaching up to Gloom Violet (#2F104F). Borders utilize bright glowing neons running from `{colors.hairline}` up through `{colors.hairline-strong}` (#951DD1). Premium Pearl text (`{colors.ink}` #F8F2FC) carries the body and headlines, providing stark, crisp contrast.



The core chromatic accents are **Cyberpunk Core Purple** `{colors.primary}` (#951DD1) and **Cyber Cyan LED** `{colors.primary-focus}` (#00E5FF). The purple is used on the brand mark and the primary CTA button. A brighter neon hover state (`{colors.primary-hover}` #BF3EFF) and a cyan focus-tinted variant extend the futuristic aesthetic. 



Display type runs a custom sans (with `SF Pro Display` fallback) at weight 500–700 with negative letter-spacing scaling from -3.0px at 80px down to 0 at body. A Mono font is reserved for code snippets in product screenshots.



The page rhythm is **dense product screenshots** — marketing leads with high-fidelity captures of the product UI framed in `{colors.surface-1}` panels with `{rounded.xl}` 16px corners, highlighted by subtle neon-LED glows.



**Key Characteristics:**

- **Deep Midnight canvas system** — `{colors.canvas}` (#12071A) is the darkest surface.

- **Cyberpunk Core Purple brand accent** (`{colors.primary}` #951DD1) — used on the brand mark and the primary CTA.

- **Cyber Cyan & Neon Violet highlights** — used for hover states and focus rings to simulate glowing LED interfaces.

- Four-step surface ladder (canvas → surface-1 → surface-2 → Gloom Violet surface-3).

- Cards use `{rounded.lg}` 12px corners with glowing neon hairline borders.

- **Product UI screenshots** dominate the page. The marketing chrome is a dark, neon-framed container for the app.



## Colors



### Brand & Accent

- **Cyberpunk Core Purple** ({colors.primary}): #951DD1 — Primary CTA, brand mark, link emphasis.

- **Neon Violet LED** ({colors.primary-hover}): #BF3EFF — Hovered state of the primary CTA, offering an intense glow.

- **Cyber Cyan LED** ({colors.primary-focus}): #00E5FF — Focus-ring tint for inputs, active states, and cybernetic secondary accents.

- **Brand Secure** ({colors.brand-secure}): Cyber Cyan used in security surfaces to signify active scanning/safety.



### Surface

- **Deep Midnight Black** ({colors.canvas}): #12071A — Default page background.

- **Surface 1** ({colors.surface-1}): #1d0c29 — One step above canvas. Feature cards, pricing cards.

- **Surface 2** ({colors.surface-2}): #261036 — Two steps above. Featured pricing card, hovered cards.

- **Gloom Violet** ({colors.surface-3}): #2F104F — Three steps above. Line-tertiary backgrounds, sub-nav.

- **Surface 4** ({colors.surface-4}): #3c1566 — Deepest lifted surface.

- **Hairline** ({colors.hairline}): #2F104F — 1px borders on cards.

- **Hairline Strong** ({colors.hairline-strong}): #951DD1 — Glowing neon borders for input focus rings.

- **Hairline Tertiary** ({colors.hairline-tertiary}): #BF3EFF — Intense borders for nested active surfaces.

- **Premium Pearl Inverse** ({colors.inverse-canvas}): #F8F2FC — Pure white/pearl surface of the inverse pill CTA.



### Text

- **Premium Pearl** ({colors.ink}): #F8F2FC — All headlines and emphasized body type.

- **Ink Muted** ({colors.ink-muted}): #d8cdeb — Secondary type on hero panels.

- **Ink Subtle** ({colors.ink-subtle}): #9c81b5 — Tertiary type, deselected pricing tabs.

- **Ink Tertiary** ({colors.ink-tertiary}): #5a3a78 — Disabled, footnotes.



### Semantic

- **Cyber Cyan Success** ({colors.semantic-success}): #00E5FF — Status pills, success indicators.

- **Overlay** ({colors.semantic-overlay}): #050208 — Ultra-dark purple/black overlay scrim for modals.



## Typography



*(The typography scales, components structure, grid and border radius scales remain unchanged as they govern the structural layout which successfully hosts this new Cyberpunk skin)*



### Elevation & Depth



| Level | Treatment | Use |

|---|---|---|

| 0 (flat) | No shadow, no border | Default for body type, hero text, footer |

| 1 (gloom lift) | `{colors.surface-1}` background on canvas, 1px `{colors.hairline}` | Default cards, product panels |

| 2 (surface-2 lift) | `{colors.surface-2}` background, 1px `{colors.hairline-strong}` neon glow | Featured pricing card, hovered cards |

| 3 (surface-3 lift) | `{colors.surface-3}` Gloom Violet background | Sub-nav, dropdown menus |

| 4 (focus ring) | 2px `{colors.primary-focus}` Cyber Cyan outline | Focused input, focused button |



### Decorative Depth



- **Neon glows replace drop shadows.** The brand resists traditional drop shadows on dark canvases, opting instead for glowing 1px borders (`#951DD1` and `#00E5FF`).

- **Subtle bright edge highlight** on the top edge of lifted panels — gives the dark surface a faint "LED screen" feel.



## Do's and Don'ts



### Do

- Reserve `{colors.canvas}` (#12071A) as the system's anchor surface — the deep midnight tone is intentional.

- Use `{colors.primary}` Cyberpunk Purple for: brand mark, primary CTA, link emphasis.

- Use `{colors.primary-focus}` Cyber Cyan LED strictly for active focus states and glowing highlights.

- Use the Gloom Violet surface ladder for hierarchy. 

- Apply negative letter-spacing aggressively on display to maintain a sleek, tech-heavy feel.



### Don't

- Don't ship a light-mode marketing page by default (unless using the Premium Pearl as a massive inverse block).

- Don't use neon purple or cyan as a massive section background; they are light-emitting accents, not canvas fills.

- Don't use `#000000` true black as the canvas; always use Deep Midnight Black (#12071A) for depth.

- Don't combine multiple bright accents (like yellow or red) unless they fit the Cyberpunk neon LED constraint.) 2(---

version: alpha

name: Linear-design-analysis

description: "A near-black product-focused marketing canvas built around #010102 (the deepest dark surface of any tool in this collection), light gray text (#f7f8f8), and the signature Linear lavender-blue (#5e6ad2) used as the single chromatic accent. The system reads as software-craft documentation: dense, technical, and quietly luxurious. Display type is set in the Linear custom sans (SF Pro Display fallback) at 500–700 with measured negative tracking. Cards live as charcoal panels (#0f1011) with hairline borders. The accent lavender appears on the brand mark, focus rings, and a few intentional CTAs — never decoratively. Page rhythm leans on product UI screenshots framed in dark panels rather than atmospheric color."



colors:

primary: "#5e6ad2"

on-primary: "#ffffff"

primary-hover: "#828fff"

primary-focus: "#5e69d1"

ink: "#f7f8f8"

ink-muted: "#d0d6e0"

ink-subtle: "#8a8f98"

ink-tertiary: "#62666d"

canvas: "#010102"

surface-1: "#0f1011"

surface-2: "#141516"

surface-3: "#18191a"

surface-4: "#191a1b"

hairline: "#23252a"

hairline-strong: "#34343a"

hairline-tertiary: "#3e3e44"

inverse-canvas: "#ffffff"

inverse-surface-1: "#f5f6f6"

inverse-surface-2: "#f6f7f7"

inverse-ink: "#000000"

brand-secure: "#7a7fad"

semantic-success: "#27a644"

semantic-overlay: "#000000"



typography:

display-xl:

fontFamily: Linear Display

fontSize: 80px

fontWeight: 600

lineHeight: 1.05

letterSpacing: -3.0px

display-lg:

fontFamily: Linear Display

fontSize: 56px

fontWeight: 600

lineHeight: 1.10

letterSpacing: -1.8px

display-md:

fontFamily: Linear Display

fontSize: 40px

fontWeight: 600

lineHeight: 1.15

letterSpacing: -1.0px

headline:

fontFamily: Linear Display

fontSize: 28px

fontWeight: 600

lineHeight: 1.20

letterSpacing: -0.6px

card-title:

fontFamily: Linear Display

fontSize: 22px

fontWeight: 500

lineHeight: 1.25

letterSpacing: -0.4px

subhead:

fontFamily: Linear Display

fontSize: 20px

fontWeight: 400

lineHeight: 1.40

letterSpacing: -0.2px

body-lg:

fontFamily: Linear Text

fontSize: 18px

fontWeight: 400

lineHeight: 1.50

letterSpacing: -0.1px

body:

fontFamily: Linear Text

fontSize: 16px

fontWeight: 400

lineHeight: 1.50

letterSpacing: -0.05px

body-sm:

fontFamily: Linear Text

fontSize: 14px

fontWeight: 400

lineHeight: 1.50

letterSpacing: 0

caption:

fontFamily: Linear Text

fontSize: 12px

fontWeight: 400

lineHeight: 1.40

letterSpacing: 0

button:

fontFamily: Linear Text

fontSize: 14px

fontWeight: 500

lineHeight: 1.20

letterSpacing: 0

eyebrow:

fontFamily: Linear Text

fontSize: 13px

fontWeight: 500

lineHeight: 1.30

letterSpacing: 0.4px

mono:

fontFamily: Linear Mono

fontSize: 13px

fontWeight: 400

lineHeight: 1.50

letterSpacing: 0



rounded:

xs: 4px

sm: 6px

md: 8px

lg: 12px

xl: 16px

xxl: 24px

pill: 9999px

full: 9999px



spacing:

xxs: 4px

xs: 8px

sm: 12px

md: 16px

lg: 24px

xl: 32px

xxl: 48px

section: 96px



components:

button-primary:

backgroundColor: "{colors.primary}"

textColor: "{colors.on-primary}"

typography: "{typography.button}"

rounded: "{rounded.md}"

padding: 8px 14px

button-primary-pressed:

backgroundColor: "{colors.primary-focus}"

textColor: "{colors.on-primary}"

typography: "{typography.button}"

rounded: "{rounded.md}"

button-primary-hover:

backgroundColor: "{colors.primary-hover}"

textColor: "{colors.on-primary}"

typography: "{typography.button}"

rounded: "{rounded.md}"

button-secondary:

backgroundColor: "{colors.surface-1}"

textColor: "{colors.ink}"

typography: "{typography.button}"

rounded: "{rounded.md}"

padding: 8px 14px

button-tertiary:

backgroundColor: "{colors.canvas}"

textColor: "{colors.ink}"

typography: "{typography.button}"

rounded: "{rounded.md}"

padding: 8px 14px

button-inverse:

backgroundColor: "{colors.inverse-canvas}"

textColor: "{colors.inverse-ink}"

typography: "{typography.button}"

rounded: "{rounded.md}"

padding: 8px 14px

pricing-card:

backgroundColor: "{colors.surface-1}"

textColor: "{colors.ink}"

typography: "{typography.body}"

rounded: "{rounded.lg}"

padding: 24px

pricing-card-featured:

backgroundColor: "{colors.surface-2}"

textColor: "{colors.ink}"

typography: "{typography.body}"

rounded: "{rounded.lg}"

padding: 24px

feature-card:

backgroundColor: "{colors.surface-1}"

textColor: "{colors.ink}"

typography: "{typography.body}"

rounded: "{rounded.lg}"

padding: 24px

product-screenshot-card:

backgroundColor: "{colors.surface-1}"

textColor: "{colors.ink}"

typography: "{typography.body}"

rounded: "{rounded.xl}"

padding: 24px

testimonial-card:

backgroundColor: "{colors.surface-1}"

textColor: "{colors.ink}"

typography: "{typography.body-lg}"

rounded: "{rounded.lg}"

padding: 32px

customer-logo-tile:

backgroundColor: "{colors.canvas}"

textColor: "{colors.ink-subtle}"

typography: "{typography.caption}"

rounded: "{rounded.xs}"

padding: 16px

text-input:

backgroundColor: "{colors.surface-1}"

textColor: "{colors.ink}"

typography: "{typography.body}"

rounded: "{rounded.md}"

padding: 8px 12px

text-input-focused:

backgroundColor: "{colors.surface-1}"

textColor: "{colors.ink}"

typography: "{typography.body}"

rounded: "{rounded.md}"

padding: 8px 12px

pricing-tab-default:

backgroundColor: "{colors.canvas}"

textColor: "{colors.ink-subtle}"

typography: "{typography.button}"

rounded: "{rounded.pill}"

padding: 6px 14px

pricing-tab-selected:

backgroundColor: "{colors.surface-2}"

textColor: "{colors.ink}"

typography: "{typography.button}"

rounded: "{rounded.pill}"

padding: 6px 14px

cta-banner:

backgroundColor: "{colors.surface-1}"

textColor: "{colors.ink}"

typography: "{typography.headline}"

rounded: "{rounded.lg}"

padding: 48px

changelog-row:

backgroundColor: "{colors.canvas}"

textColor: "{colors.ink}"

typography: "{typography.body}"

rounded: "{rounded.xs}"

padding: 24px 0

status-badge:

backgroundColor: "{colors.surface-2}"

textColor: "{colors.ink-muted}"

typography: "{typography.caption}"

rounded: "{rounded.pill}"

padding: 2px 8px

top-nav:

backgroundColor: "{colors.canvas}"

textColor: "{colors.ink}"

typography: "{typography.body-sm}"

rounded: "{rounded.xs}"

height: 56px

footer:

backgroundColor: "{colors.canvas}"

textColor: "{colors.ink-subtle}"

typography: "{typography.caption}"

rounded: "{rounded.xs}"

padding: 64px 32px

---



## Overview



Linear's marketing canvas is the deepest dark surface in this collection — `{colors.canvas}` is #010102, essentially pure black with a faint blue tint. On top sits a four-step surface ladder (`{colors.surface-1}` through `{colors.surface-4}`) for cards, panels, and lifted tiles, with hairline borders running from `{colors.hairline}` (#23252a) up through `{colors.hairline-strong}` and `{colors.hairline-tertiary}`. Light gray text (`{colors.ink}` #f7f8f8) carries the body and headlines.



The single chromatic accent is **Linear lavender-blue** `{colors.primary}` (#5e6ad2) — used on the brand mark, focus rings, and the primary CTA button. A lighter hover state (`{colors.primary-hover}` #828fff) and a focus-tinted variant (`{colors.primary-focus}` #5e69d1) extend the same hue. Linear avoids saturated greens, oranges, reds, etc. on the marketing canvas — the only semantic color is `{colors.semantic-success}` (#27a644) for status pills and the rare success indicator.



Display type runs Linear's custom sans (with `SF Pro Display` fallback) at weight 500–700 with negative letter-spacing scaling from -3.0px at 80px down to 0 at body. The body family is Linear's text cut, and a Linear Mono is reserved for code snippets in product screenshots.



The page rhythm is **dense product screenshots** — Linear's marketing leads with high-fidelity captures of the product UI (issue list, project view, dashboard) framed in `{colors.surface-1}` panels with `{rounded.xl}` 16px corners. The chrome is intentionally minimal so the app screenshots can do the heavy lifting.



**Key Characteristics:**

- **Dark-canvas marketing system** — `{colors.canvas}` (#010102) is the deepest dark in this collection.

- **Lavender-blue brand accent** (`{colors.primary}` #5e6ad2) — used scarcely on brand mark, focus, and the primary CTA.

- Four-step surface ladder (canvas → surface-1 → surface-2 → surface-3 → surface-4) carries hierarchy without shadow.

- Display tracking pulls aggressively negative (-3.0px at 80px); body holds at -0.05px.

- Cards use `{rounded.lg}` 12px corners with 1px hairline borders — never pill, rarely 16px.

- **Product UI screenshots** dominate the page. The marketing chrome is a dark frame for the app.

- No second chromatic color. No atmospheric gradients. No spotlight cards.



## Colors



> Source pages: linear.app (home), /intake, /pricing, /contact/sales, /build.



### Brand & Accent

- **Lavender-Blue** ({colors.primary}): The signature Linear accent — primary CTA, brand mark, link emphasis.

- **Lavender Hover** ({colors.primary-hover}): Lighter lavender (#828fff) — hovered state of the primary CTA.

- **Lavender Focus** ({colors.primary-focus}): Focus-ring tint (#5e69d1) — focused inputs, focused buttons.

- **Brand Secure** ({colors.brand-secure}): Muted lavender-gray (#7a7fad) — used in "Linear Security" surfaces.



### Surface

- **Canvas** ({colors.canvas}): Default page background — #010102, near-pure black with a faint blue tint.

- **Surface 1** ({colors.surface-1}): One step above canvas — feature cards, pricing cards, product screenshot panels.

- **Surface 2** ({colors.surface-2}): Two steps above — featured pricing card, hovered cards.

- **Surface 3** ({colors.surface-3}): Three steps above — line-tertiary backgrounds, sub-nav.

- **Surface 4** ({colors.surface-4}): Four steps above — bg-level-3, deepest lifted surface.

- **Hairline** ({colors.hairline}): 1px borders on cards and dividers.

- **Hairline Strong** ({colors.hairline-strong}): Stronger 1px borders — input focus rings.

- **Hairline Tertiary** ({colors.hairline-tertiary}): Tertiary borders for nested surfaces.

- **Inverse Canvas** ({colors.inverse-canvas}): Pure white — surface of the inverse pill CTA on a small set of section openers.

- **Inverse Surface 1** ({colors.inverse-surface-1}): One step above inverse canvas.

- **Inverse Surface 2** ({colors.inverse-surface-2}): Two steps above inverse canvas.



### Text

- **Ink** ({colors.ink}): All headlines and emphasized body type — light gray #f7f8f8.

- **Ink Muted** ({colors.ink-muted}): Secondary type at #d0d6e0 — meta info on hero panels.

- **Ink Subtle** ({colors.ink-subtle}): Tertiary type at #8a8f98 — deselected pricing tabs, footer columns.

- **Ink Tertiary** ({colors.ink-tertiary}): Quaternary at #62666d — disabled, footnotes.



### Semantic

- **Success Green** ({colors.semantic-success}): Status pills, success indicators. The only semantic color on marketing.

- **Overlay** ({colors.semantic-overlay}): Pure black overlay scrim for modals.



## Typography



### Font Family



- **Linear Display** — Linear's custom display sans; fallback `SF Pro Display, -apple-system, system-ui, Segoe UI, Roboto`. Carries display-xl through subhead.

- **Linear Text** — Linear's custom text sans (a slightly different cut tuned for body sizes); same fallback stack. Carries body sizes, button labels, captions.

- **Linear Mono** — Linear's custom mono; fallback `ui-monospace, SF Mono, Menlo`. Used for code snippets in product screenshots and for status / ID tokens.



The marketing surface treats Display and Text as one continuous voice; the family change is silent.



### Hierarchy



| Token | Size | Weight | Line Height | Letter Spacing | Use |

|---|---|---|---|---|---|

| `{typography.display-xl}` | 80px | 600 | 1.05 | -3.0px | Largest hero headline |

| `{typography.display-lg}` | 56px | 600 | 1.10 | -1.8px | Section opener headlines |

| `{typography.display-md}` | 40px | 600 | 1.15 | -1.0px | Sub-section headlines |

| `{typography.headline}` | 28px | 600 | 1.20 | -0.6px | Pricing tier titles, CTA banner heading |

| `{typography.card-title}` | 22px | 500 | 1.25 | -0.4px | Feature card title |

| `{typography.subhead}` | 20px | 400 | 1.40 | -0.2px | Lead body, intro paragraphs |

| `{typography.body-lg}` | 18px | 400 | 1.50 | -0.1px | Hero subhead, lead paragraphs |

| `{typography.body}` | 16px | 400 | 1.50 | -0.05px | Default body |

| `{typography.body-sm}` | 14px | 400 | 1.50 | 0 | Card body, footer columns |

| `{typography.caption}` | 12px | 400 | 1.40 | 0 | Captions, meta, status |

| `{typography.button}` | 14px | 500 | 1.20 | 0 | All button labels |

| `{typography.eyebrow}` | 13px | 500 | 1.30 | 0.4px | Section eyebrow (slight positive tracking) |

| `{typography.mono}` | 13px | 400 | 1.50 | 0 | Linear Mono for code in product screenshots |



### Principles



- **Aggressive negative tracking on display** (-3.0px at 80px ≈ 4% of size).

- **Single voice from display to body.** Display-xl at 600 → body at 400 — same family, narrower weights.

- **Eyebrow uses positive tracking** (+0.4px) — contrast against the negative-tracked display marks the eyebrow as taxonomy.

- **Mono only in code contexts.** Linear Mono lives inside product screenshots — not on marketing chrome.



### Note on Font Substitutes



Linear's custom typeface isn't publicly distributed; the documented fallback `SF Pro Display, -apple-system, system-ui` is the recommended substitute on macOS. For cross-platform implementation, **Inter** at weight 500 / 600 / 700 is the closest free substitute. **Geist Sans** is also viable. For mono, **JetBrains Mono** or **Geist Mono** at weight 400 closely approximates Linear Mono.



## Layout



### Spacing System



- **Base unit**: 4px.

- **Tokens (front matter)**: `{spacing.xxs}` 4px · `{spacing.xs}` 8px · `{spacing.sm}` 12px · `{spacing.md}` 16px · `{spacing.lg}` 24px · `{spacing.xl}` 32px · `{spacing.xxl}` 48px · `{spacing.section}` 96px.

- Card interior padding: `{spacing.lg}` 24px on feature/pricing cards; `{spacing.xl}` 32px on testimonial cards; `{spacing.xxl}` 48px on CTA banners.

- Pill button padding: 8px vertical · 14px horizontal — Linear's compact button spec.

- Form input padding: 8px vertical · 12px horizontal.



### Grid & Container



- Max content width sits around 1280px.

- Card grids are 3-up at desktop, 2-up at tablet, 1-up at mobile.

- Pricing tier grid is 3-up; comparison strip below shows checkmarks per tier.

- Product screenshot panels span full content width — they're the protagonist.



### Whitespace Philosophy



The dark canvas IS the whitespace. Sections separate by lift onto surface-1 panels, not by gaps in white. Within a panel, generous `{spacing.lg}` 24px gaps between content blocks; `{spacing.section}` 96px between sections.



## Elevation & Depth



| Level | Treatment | Use |

|---|---|---|

| 0 (flat) | No shadow, no border | Default for body type, hero text, footer |

| 1 (charcoal lift) | `{colors.surface-1}` background on canvas, 1px `{colors.hairline}` | Default cards, product panels |

| 2 (surface-2 lift) | `{colors.surface-2}` background, 1px `{colors.hairline-strong}` | Featured pricing card, hovered cards |

| 3 (surface-3 lift) | `{colors.surface-3}` background | Sub-nav, dropdown menus |

| 4 (focus ring) | 2px `{colors.primary-focus}` outline at 50% opacity | Focused input, focused button |



Linear's depth is carried by surface ladder + hairline borders. The brand resists drop shadows on dark almost entirely.



### Decorative Depth



- **Product UI screenshots** dominate as decorative depth.

- **No atmospheric gradients, no spotlight cards.**

- **Subtle white edge highlight** on the top edge of lifted panels — gives the dark surface a faint "pixel rendered" feel.



## Shapes



### Border Radius Scale



| Token | Value | Use |

|---|---|---|

| `{rounded.xs}` | 4px | Small chips, status badges |

| `{rounded.sm}` | 6px | Inline tags |

| `{rounded.md}` | 8px | All buttons, form inputs |

| `{rounded.lg}` | 12px | Pricing cards, feature cards, testimonial cards |

| `{rounded.xl}` | 16px | Product screenshot panels |

| `{rounded.xxl}` | 24px | Oversized CTA banners (rare) |

| `{rounded.pill}` | 9999px | Pricing tab toggles, status pills |

| `{rounded.full}` | 9999px | Avatar circles |



### Photography & Illustration Geometry



- Product UI screenshots dominate; they sit in `{rounded.xl}` 16px tiles with `{spacing.lg}` 24px outer padding.

- Customer logo tiles render at small sizes (~24px logo height) on `{colors.canvas}` with no border.

- Avatar circles in testimonial cards use `{rounded.full}` at 32–40px sizes.



## Components



### Buttons



**`button-primary`** — Lavender CTA. The default primary CTA across all pages.

- Background `{colors.primary}`, text `{colors.on-primary}`, type `{typography.button}`, padding 8px 14px, rounded `{rounded.md}`.

- Pressed state lives in `button-primary-pressed` (background shifts to `{colors.primary-focus}`).

- Hover state lives in `button-primary-hover` (background shifts to `{colors.primary-hover}` lighter lavender).



**`button-secondary`** — Charcoal button. Used for secondary CTAs ("Sign in", "Read changelog").

- Background `{colors.surface-1}`, text `{colors.ink}`, type `{typography.button}`, padding 8px 14px, rounded `{rounded.md}`. 1px `{colors.hairline}` border.



**`button-tertiary`** — Plain text button.

- Background `{colors.canvas}`, text `{colors.ink}`, type `{typography.button}`, rounded `{rounded.md}`, padding 8px 14px.



**`button-inverse`** — White-on-dark inverse CTA.

- Background `{colors.inverse-canvas}`, text `{colors.inverse-ink}`, type `{typography.button}`, rounded `{rounded.md}`, padding 8px 14px.



### Pricing Tabs



**`pricing-tab-default`** + **`pricing-tab-selected`** — Pill-toggle on `/pricing`.

- Default: `{colors.canvas}` background, `{colors.ink-subtle}` text, rounded `{rounded.pill}`, padding 6px 14px.

- Selected: `{colors.surface-2}` background, `{colors.ink}` text — selected = surface lift.



### Cards & Containers



**`pricing-card`** — Each tier on `/pricing`.

- Background `{colors.surface-1}`, text `{colors.ink}`, type `{typography.body}`, rounded `{rounded.lg}`, padding 24px. 1px `{colors.hairline}` border.



**`pricing-card-featured`** — Recommended tier — surface lift to surface-2.

- Background `{colors.surface-2}`, otherwise identical structure.



**`feature-card`** — Generic feature highlight tile.

- Background `{colors.surface-1}`, text `{colors.ink}`, type `{typography.body}`, rounded `{rounded.lg}`, padding 24px.



**`product-screenshot-card`** — The dominant card type — frames a high-fidelity Linear app UI screenshot.

- Background `{colors.surface-1}`, text `{colors.ink}`, type `{typography.body}`, rounded `{rounded.xl}`, padding 24px.



**`testimonial-card`** — Customer quote with avatar + name + role.

- Background `{colors.surface-1}`, text `{colors.ink}`, type `{typography.body-lg}`, rounded `{rounded.lg}`, padding 32px.



**`customer-logo-tile`** — Small tile in the customer marquee.

- Background `{colors.canvas}`, text `{colors.ink-subtle}`, type `{typography.caption}`, rounded `{rounded.xs}`, padding 16px.



**`cta-banner`** — Closing CTA panel near page bottom.

- Background `{colors.surface-1}`, text `{colors.ink}`, type `{typography.headline}`, rounded `{rounded.lg}`, padding 48px.



### Inputs & Forms



**`text-input`** + **`text-input-focused`** — Form fields on `/contact/sales` and signup overlays.

- Background `{colors.surface-1}`, text `{colors.ink}`, type `{typography.body}`, rounded `{rounded.md}`, padding 8px 12px.

- Focused state retains the same surface; the focus ring is a 2px `{colors.primary-focus}` outline at 50% opacity.



### Status & Build Page



**`changelog-row`** — Each row in `/build` (changelog page) listing version, date, and changes.

- Background `{colors.canvas}`, text `{colors.ink}`, type `{typography.body}`, rounded `{rounded.xs}`, padding 24px 0. 1px `{colors.hairline}` bottom rule.



**`status-badge`** — Small status pill.

- Background `{colors.surface-2}`, text `{colors.ink-muted}`, type `{typography.caption}`, rounded `{rounded.pill}`, padding 2px 8px.



### Navigation



**`top-nav`** — Sticky dark bar with the Linear wordmark left, primary nav links centered, and a `button-secondary` ("Sign in") + `button-primary` ("Get started") pair right.

- Background `{colors.canvas}`, text `{colors.ink}`, type `{typography.body-sm}`, height 56px.



### Footer



**`footer`** — Dense link grid on `{colors.canvas}` with the Linear wordmark left.

- Background `{colors.canvas}`, text `{colors.ink-subtle}`, type `{typography.caption}`, padding 64px 32px.



## Do's and Don'ts



### Do



- Reserve `{colors.canvas}` (#010102) as the system's anchor surface — the faint blue tint is intentional.

- Use `{colors.primary}` lavender ONLY for: brand mark, primary CTA, focus ring, link emphasis.

- Use the four-step surface ladder for hierarchy. Avoid skipping levels.

- Pair display weight 600 with body weight 400 — Linear resists 700+ display weights.

- Apply negative letter-spacing aggressively on display.

- Use product UI screenshots as the protagonist of every section.

- Compose CTAs as `{rounded.md}` 8px corners.



### Don't



- Don't ship a light-mode marketing page.

- Don't use lavender as a section background or card fill.

- Don't introduce a second chromatic accent (orange, pink, green for marketing).

- Don't add atmospheric gradients or spotlight cards.

- Don't pill-round CTAs.

- Don't use `#000000` true black as the canvas.

- Don't combine multiple bright accents in product screenshot mockups.



## Responsive Behavior



### Breakpoints



| Name | Width | Key Changes |

|---|---|---|

| Desktop-XL | 1440px | Default desktop layout |

| Desktop | 1280px | Card grid 3-up maintained |

| Tablet | 1024px | Card grid 3-up → 2-up |

| Mobile-Lg | 768px | Pricing comparison becomes accordion; nav hamburger |

| Mobile | 480px | Single-column; display-xl scales 80px → ~36px |



### Touch Targets



- CTAs hold ≥40px tap height across viewports.

- Pricing tab pills hold ≥36px tap height; touch viewports grow to ≥44px.

- Form inputs hold ≥44px tap target on touch.



### Collapsing Strategy



- **Top nav**: links collapse to hamburger below 768px.

- **Card grids**: 3-up → 2-up at 1024px → 1-up below 768px.

- **Pricing comparison**: per-tier accordion below 768px.

- **Display type**: `{typography.display-xl}` 80px scales toward `{typography.display-md}` 40px on mobile.



### Image Behavior



- Product UI screenshots maintain aspect ratio and never crop.

- Customer logos in the marquee may collapse from 6-up to 3-up below 768px.



## Iteration Guide



1. Focus on ONE component at a time and reference it by its `components:` token name.

2. When introducing a section, decide first which surface lift it lives on.

3. Default body to `{typography.body}` at weight 400.

4. Run `npx @google/design.md lint DESIGN.md` after edits.

5. Add new variants as separate component entries.

6. Treat lavender as scarce: brand mark, primary CTA, focus, link emphasis.

7. Lead every section with a product UI screenshot.



## Known Gaps



- The four-step surface ladder values are extracted directly from Linear's `--color-bg-level-3`, `--color-line-tint`, etc. CSS variables; they are Linear's canonical surface spec.

- Form-field error and validation styling is not visible on the inspected pages.

- Light mode is not documented because the marketing site does not ship a light theme.

- Linear's actual product UI uses a richer color-tag palette (red, orange, yellow, green, blue, purple) for issue priorities and project labels — those colors live in the in-product surfaces shown in mockups.

- The custom display, text, and mono families are proprietary; an open-source substitute is acceptable.)

I due documenti descrivono design system basati sulla medesima architettura strutturale (spaziature, tipografia e griglie), ma declinati in estetiche visive radicalmente opposte.

Caratteristica	MD 1: Premium-Cyberpunk	MD 2: Linear
Stile e Vibe	Futuristico, neon, audace.	Minimalista, tecnico, "quiet luxury".
Sfondo (Canvas)	Deep Midnight Black (#12071A) con forti sottotoni viola.	Near-Black (#010102) quasi nero puro con leggero tono blu.
Accenti Cromatici	Due accenti: Viola Cyberpunk (#951DD1) e Ciano LED (#00E5FF).	Un solo accento sobrio: Blu-Lavanda (#5e6ad2).
Profondità e Bordi	Bordi luminosi al neon (hairline-strong) che simulano schermi LED.	Bordi piatti e sottili da 1px ("hairline"). Nessun bagliore.
Colore Testo	Premium Pearl (#F8F2FC), freddo e ad altissimo contrasto.	Grigio chiaro standard (#f7f8f8).
Hover e Focus	Transizioni intense, bagliori violacei e anelli di focus Ciano brillante.	Schiarimenti lievi dello stesso blu-lavanda.
Principali divergenze applicative:

Gestione della profondità: Il sistema Cyberpunk utilizza bordi luminosi (es. #951DD1 o #00E5FF) per sollevare le card dallo sfondo, creando un effetto "schermo retroilluminato". Linear utilizza un rigoroso sistema a strati di grigi piatti opachi, rifiutando totalmente ombre o bagliori.

Rigore cromatico: Linear vieta severamente gradienti atmosferici, effetti "spotlight" o colori secondari decorativi (accetta solo il verde puro per i messaggi di successo). Il sistema Cyberpunk, al contrario, si fonda proprio sulle contaminazioni luminose cromatiche per definire la sua identità visiva.

Elementi in comune (l'ossatura):
Nonostante il divario estetico, entrambi i file condividono la logica di base: usano esattamente la stessa tipografia (famiglia Linear, con spaziature negative identiche per i display type), le stesse classi di arrotondamento (xs a full), le stesse metriche di padding, e impongono che gli screenshot ad alta fedeltà dell'interfaccia utente (UI) dominino la scena visiva senza distrazioni. Entrambi vietano esplicitamente le modalità chiare (light mode).

Per un app fitness quali son qualità migliori dei 2 ?

Per un'app fitness, la soluzione ideale nasce dalla fusione tra l'energia visiva del Cyberpunk e il rigore analitico del sistema Linear. Un'app dedicata all'allenamento deve infatti motivare l'utente durante lo sforzo fisico (dove serve dinamismo) e, al contempo, mostrare dati complessi a riposo (dove serve chiarezza).

Qualità da prendere dal Premium-Cyberpunk (Energia e Gamification)

Accenti Neon (Ciano e Viola): Perfetti per gli indicatori di progresso, gli anelli delle calorie bruciate, i grafici del battito cardiaco e i pulsanti principali come "Inizia Allenamento". Il bagliore trasmette immediato dinamismo e adrenalina.

Contrasto Estremo: Il testo "Premium Pearl" su fondo scuro rende i numeri critici (es. timer in corsa, chilometri percorsi) visibili all'istante anche in condizioni di forte luce esterna o durante il movimento.

Feedback Visivo Intenso: I bagliori sui bordi per gli stati attivi (focus ring) sono ottimi per restituire un feedback immediato al completamento di una serie o al raggiungimento di un traguardo, favorendo la gamification dell'app.

Qualità da prendere dal Linear (Fruibilità e Analisi)

Sfondo "Quiet Luxury" (Near-Black): Sostituire il viola profondo con il nero opaco puro di Linear per le sezioni dedicate all'analisi dei dati. Garantisce un aspetto professionale e premium, in linea con dispositivi di fascia alta (come Whoop o Oura).

Gerarchia senza Distrazioni: L'uso di strati di grigio per le card, senza ombre o bagliori, è ideale per organizzare calendari, storici delle sessioni e schede nutrizionali. Mantiene l'interfaccia pulita quando l'utente deve concentrarsi sui numeri.

Layout Denso e Organizzato: Le spaziature calcolate al millimetro e l'uso rigoroso dei bordi "hairline" aiutano a strutturare i log degli esercizi (ripetizioni, pesi, recuperi) senza creare confusione.

L'Architettura Ibrida Consigliata

Contesto dell'App	Sistema Dominante	Applicazione Pratica
Durante l'allenamento	Cyberpunk	Timer a tutto schermo, pulsanti d'azione giganti, anelli di progresso illuminati al neon.
Dashboard e Statistiche	Linear	Grafici puliti su card grigio scuro, storici mensili austeri, liste degli esercizi ordinate.
Profilo e Obiettivi	Linear (con tocchi Cyberpunk)	Interfaccia pulita con badge degli obiettivi raggiunti che si illuminano per premiare l'utente.
Qual è il focus principale della tua app: il tracciamento analitico delle prestazioni (stile sollevamento pesi/statistiche) o l'allenamento guidato in tempo reale (stile corsa/HIIT)?

entrambi

Gestire sia l'allenamento in tempo reale che l'analisi approfondita richiede un'interfaccia capace di adattarsi al contesto cognitivo dell'utente, mutando dinamicamente tra energia reattiva e calma analitica.

Modalità Live: L'Approccio Cyberpunk (Azione)
Durante lo sforzo fisico, l'attenzione visiva cala, il dispositivo è instabile e il sudore rende imprecisi i tocchi. L'interfaccia deve comunicare istantaneamente.

Metriche dominanti: Utilizza il font Linear Display a dimensioni massime (display-xl a 80px) con il colore Premium Pearl. Questo contrasto estremo sul fondo Deep Midnight Black garantisce leggibilità sotto la luce diretta del sole o durante una corsa.

Zone di frequenza al neon: Usa il bagliore dell'accento Ciano (#00E5FF) e Viola (#951DD1) per mappare visivamente l'intensità (es. blu per riscaldamento, ciano per cardio, viola per soglia anaerobica). Un'interfaccia che cambia colore ai bordi comunica lo stato fisiologico senza costringere l'utente a decifrare i numeri.

Target tattili espansi: I pulsanti d'azione ("Pausa", "Lap", "Termina") devono essere grandi blocchi netti con stati attivi illuminati, permettendo un'interazione rapida e "cieca".

Modalità Log & Tracking: L'Approccio Linear (Riflessione)
A riposo, l'utente passa dalla modalità esecutiva a quella manageriale. Vuole analizzare tonnellaggio, recuperi, VO2 Max e micro-cicli. Qui il design deve abbassare il volume.

Layout denso e gerarchico: Usa il sistema di card Surface 1 e Surface 2 di Linear per strutturare i log degli esercizi. Fondi antracite piatti da 1px (hairline), zero ombre e zero distrazioni luminose mantengono visivamente organizzate decine di righe di dati (serie, ripetizioni, RPE).

Grafici chirurgici: Le curve di progressione nel tempo devono adottare un'estetica puramente tecnica. Nessun riempimento sfumato pacchiano; solo linee sottili ad alto contrasto.

Focus tipografico: Sfrutta il Linear Text e il Linear Mono per inserire densamente dati di cronometraggio, percentuali di carico e note testuali senza creare un "muro di testo" illeggibile.

Il Ponte Visivo: Il Resoconto Post-Workout
Il momento di massima sintesi tra le due anime dell'app avviene appena si preme "Termina".

Elemento	Trattamento Visivo	Obiettivo
Punteggio Principale	Tipografia massiccia e anelli di progresso Ciano illuminati	Rilasciare dopamina e celebrare lo sforzo completato.
Breakdown Statistico	Griglia compatta in card Surface-1 grigio scuro	Fornire immediatamente passo medio, calorie e tempi di recupero.
CTA Secondarie	Pulsanti piatti rigorosi (stile Linear)	Permettere di aggiungere note, tag o condividere il workout.
Gestire bene l'input dei dati è fondamentale quando si uniscono questi due mondi. Prevedi che gli utenti debbano costruire le proprie schede di allenamento complesse direttamente nell'app, o seguiranno principalmente piani generati automaticamente?

Ok riesci a farmi un file Md come quelli che ti ho dato con le cose dette fino ad ora?

Il tuo file Markdown (MD) è pronto!

Icona MD
Hybrid_Fitness_Design_System
 MD 
Apri
Ho creato il documento Hybrid_Fitness_Design_System.md strutturandolo esattamente come i due esempi che mi avevi fornito (inclusa la formattazione dei token, le palette dei colori, e le metriche di tipografia e arrotondamento).

All'interno troverai:

Un frontmatter strutturato (YAML) che definisce i colori ibridi (sfondo puro nero di Linear + accenti neon di Cyberpunk), le spaziature e i nuovi componenti specifici per il fitness (es. live-metric-card e analytics-log-row).

L'Overview del sistema, che ne spiega la filosofia.

Le specifiche del "Dual-State Architecture", ovvero le regole per il passaggio dinamico tra la modalità Azione (durante l'allenamento) e la modalità Riflessione (analisi dati a riposo).

Le regole base di Do's e Don'ts per mantenere il design coerente.




Gemini è un'AI e può fare errori, anche in merito a persone. La tua privacy e GeminiSi apre in una nuova finestra

Implementing the Code
---
version: alpha
name: Kinetic-Hybrid-Fitness-Design-System
description: "Un sistema di design a doppio stato (Dual-State) progettato per un'app fitness ad alte prestazioni. Unisce il rigore analitico e la 'quiet luxury' del sistema Linear per la visualizzazione dei dati, con l'energia visiva e l'alto contrasto del sistema Premium-Cyberpunk per il tracciamento in tempo reale degli allenamenti. Il risultato è un'interfaccia capace di adattarsi al contesto cognitivo dell'utente: calma e densa a riposo, esplosiva e ultra-leggibile sotto sforzo."

colors:
  primary: "#00E5FF" # Cyber Cyan - Per stati attivi e in allenamento
  primary-hover: "#5CEBFF"
  primary-focus: "#00E5FF"
  secondary: "#951DD1" # Cyberpunk Purple - Per traguardi e gamification
  ink: "#F8F2FC" # Premium Pearl - Altissimo contrasto per metriche live
  ink-muted: "#d0d6e0"
  ink-subtle: "#8a8f98"
  ink-tertiary: "#62666d"
  canvas: "#010102" # Near-Black puro (Linear) per focus assoluto
  surface-1: "#0f1011" # Flat grigio scuro per tabelle dati
  surface-2: "#141516"
  surface-3: "#1d0c29" # Leggero accento viola per zone di transizione
  hairline: "#23252a" # Bordo rigoroso per log (Linear)
  hairline-strong: "#00E5FF" # Bordo neon per card allenamento live
  semantic-success: "#00E5FF" # Ciano usato anche come successo/target raggiunto
  semantic-overlay: "#010102"

typography:
  display-xl:
    fontFamily: Linear Display
    fontSize: 100px # Aumentato per visibilità live workout
    fontWeight: 700
    lineHeight: 1.0
    letterSpacing: -4.0px
  display-lg:
    fontFamily: Linear Display
    fontSize: 56px
    fontWeight: 600
    lineHeight: 1.10
    letterSpacing: -1.8px
  display-md:
    fontFamily: Linear Display
    fontSize: 40px
    fontWeight: 600
    lineHeight: 1.15
    letterSpacing: -1.0px
  headline:
    fontFamily: Linear Display
    fontSize: 28px
    fontWeight: 600
    lineHeight: 1.20
    letterSpacing: -0.6px
  card-title:
    fontFamily: Linear Display
    fontSize: 22px
    fontWeight: 500
    lineHeight: 1.25
    letterSpacing: -0.4px
  body:
    fontFamily: Linear Text
    fontSize: 16px
    fontWeight: 400
    lineHeight: 1.50
    letterSpacing: -0.05px
  caption:
    fontFamily: Linear Text
    fontSize: 12px
    fontWeight: 400
    lineHeight: 1.40
    letterSpacing: 0
  mono:
    fontFamily: Linear Mono
    fontSize: 13px
    fontWeight: 400
    lineHeight: 1.50
    letterSpacing: 0

rounded:
  xs: 4px
  sm: 6px
  md: 8px
  lg: 12px
  xl: 16px
  pill: 9999px
  full: 9999px

spacing:
  xs: 8px
  sm: 12px
  md: 16px
  lg: 24px
  xl: 32px
  xxl: 48px
  section: 96px

components:
  live-metric-card:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.ink}"
    typography: "{typography.display-xl}"
    rounded: "{rounded.xl}"
    border: "1px solid {colors.hairline-strong}" # Bagliore neon
    padding: 32px
  analytics-log-row:
    backgroundColor: "{colors.surface-1}"
    textColor: "{colors.ink-muted}"
    typography: "{typography.mono}"
    rounded: "{rounded.xs}"
    borderBottom: "1px solid {colors.hairline}" # Bordo piatto tecnico
    padding: 12px 16px
  button-action-live:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.canvas}"
    typography: "{typography.headline}"
    rounded: "{rounded.pill}"
    padding: 24px 48px # Target tattile enorme per l'allenamento
  button-secondary-log:
    backgroundColor: "{colors.surface-2}"
    textColor: "{colors.ink-muted}"
    typography: "{typography.button}"
    rounded: "{rounded.md}"
    padding: 8px 14px
  workout-summary-card:
    backgroundColor: "{colors.surface-1}"
    textColor: "{colors.ink}"
    typography: "{typography.body}"
    rounded: "{rounded.lg}"
    borderTop: "2px solid {colors.secondary}" # Accento celebrativo
    padding: 24px
---

## Overview

Il sistema "Kinetic Hybrid" è progettato per un'app fitness ad altissime prestazioni che serve due contesti psicofisici opposti: l'**Azione** (Live Workout) e la **Riflessione** (Analytics & Planning). 
Fonde il canvas ultra-scuro e l'austerità tipografica del design *Linear* con i bagliori cromatici e il contrasto estremo dell'estetica *Premium-Cyberpunk*.

Il risultato è un'interfaccia che non è mai monotona: scompare quando devi studiare i tuoi dati storici, ma esplode di feedback visivi quando il tuo cuore è a 170 bpm.

**Caratteristiche Chiave:**
- **Dual-State Design:** Due linguaggi visivi per due contesti. Superfici piatte (Linear) per i log, bordi luminosi (Cyberpunk) per le modalità live.
- **Canvas Nero Puro:** Il colore di base `{colors.canvas}` è #010102. Assorbe la luce e fa risaltare sia i grigi tecnici che i neon.
- **Tipografia Massimalista in Live:** I numeri durante l'allenamento usano la scala `display-xl` a 100px per la massima leggibilità in movimento.
- **Dati Monospaziati in Analisi:** L'uso del font `Linear Mono` struttura le tabelle dei pesi e delle ripetizioni come codice software, massimizzando la densità informativa.

## L'Architettura a Doppio Stato (Dual-State)

### 1. Modalità Azione (Live Workout)
- **Vibe:** Adrenalina, visibilità immediata, gamification.
- **Colori:** `{colors.primary}` (Cyber Cyan) e `{colors.secondary}` (Cyberpunk Purple) dominano la UI.
- **Interazione:** I pulsanti (`button-action-live`) sono enormi e arrotondati (`pill`) per facilitare i tap "alla cieca" con mani sudate o in movimento.
- **Feedback:** Gli anelli di progresso e i timer hanno bordi luminosi (`{colors.hairline-strong}`) che simulano l'illuminazione LED. Cambiano colore in base all'intensità (es. Zona HR).

### 2. Modalità Riflessione (Log & Analytics)
- **Vibe:** Calma, concentrazione tecnica, rigore "Quiet Luxury".
- **Colori:** Dominano le scale di grigio `{colors.surface-1}`, `{colors.surface-2}` e `{colors.ink-muted}`. I colori neon sono banditi o usati solo in piccolissimi indicatori di status.
- **Interazione:** Pulsanti compatti (`button-secondary-log`) e interfacce dense d'informazioni.
- **Layout:** Le tabelle di sollevamento pesi o storici cardio (`analytics-log-row`) usano bordi inferiori da 1px (`{colors.hairline}`) e assenza totale di ombre.

### 3. Il Ponte Visivo (Workout Summary)
- Il momento di transizione. Quando si preme "Termina Allenamento", l'app usa grandi numeri brillanti (Cyberpunk) per premiare l'utente, inseriti in schede grigio antracite piatte e precise (Linear) per elencare le metriche esatte (Passo, Tonnellaggio, VO2 Max).

## Do's and Don'ts

### Do
- **Usa il Ciano (`#00E5FF`) per il Live Workout:** Assicurati che lo sguardo venga catturato istantaneamente dalla metrica più importante (es. Timer o Battito).
- **Tratta i log come codice sorgente:** Usa tabelle fitte, `Linear Mono` e grigi opachi per gli storici di allenamento. L'utente vuole leggere i dati, non essere distratto dalla grafica.
- **Contrasto Estremo:** Usa sempre il Pearl (`#F8F2FC`) per i dati numerici principali sul nero assoluto.
- **Touch Target Massicci in Live:** Assicurati che il pulsante "Pausa/Riprendi" sia gigantesco durante la corsa/sforzo.

### Don't
- **Mai usare neon nell'analisi complessa:** Non inserire bagliori viola o cyan dietro i grafici storici mensili; mantienili chirurgici e piatti.
- **Nessuna distrazione testuale in Live:** Durante l'allenamento nascondi etichette inutili, mostra solo numeri giganti.
- **Evita gradienti pacchiani:** Se un elemento deve illuminarsi, usa un bordo glow solido, non un gradiente di riempimento sfumato che toglie la percezione "premium" dell'app.
Hybrid_Fitness_Design_System.md
Visualizzazione di Hybrid_Fitness_Design_System.md.