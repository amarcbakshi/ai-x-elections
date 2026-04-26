# AI × Elections — Design System

**Direction G + Palette 2: Stark Monochrome**  
*Government proclamation aesthetic. Legal notice precision. The × is the only color on the page.*

---

## Brand Voice Words

**Institutional. Declarative. Singular.**

Physical object: a county clerk's legal notice — typeset on a government letterhead from 1972, posted on a courthouse bulletin board. Absolute authority. Zero ornamentation.

---

## Color System

All colors are in OKLCH. Never use `#000` or `#fff`. Every neutral is tinted toward the brand warm (hue 70–82).

### Palette

| Token | OKLCH | Use |
|---|---|---|
| `--paper` | `oklch(98% 0.005 82)` | Page background — warm near-white |
| `--pale` | `oklch(94% 0.005 70)` | Alternate surface — hover states, alternating rows |
| `--pale-b` | `oklch(84% 0.007 70)` | Borders, dividers on pale bg |
| `--ink` | `oklch(13% 0.007 70)` | Primary text, structural borders, nav bg |
| `--ink-mid` | `oklch(40% 0.006 70)` | Secondary text, labels, subdued elements |
| `--ink-lt` | `oklch(62% 0.006 70)` | Tertiary text, issue numbers, placeholders |
| `--rule` | `oklch(82% 0.007 70)` | Table row dividers, thin rules |
| `--red` | `oklch(57% 0.22 22)` | Vermillion — THE × CHARACTER ONLY |
| `--ink-surf` | `oklch(18% 0.007 70)` | Dark section backgrounds (vacuum/CTA interior) |

### Color Strategy: Committed (near-Drenched)

- **Ink occupies ~60% of the surface** — structural bars, nav, section backgrounds
- **Vermillion appears exactly once per component** as the × character
- **No other accent colors.** Hover states, borders, and all text use neutrals only
- The × in the wordmark, hero title, stats, footer seal — that is the complete red inventory

### The × Rule

Vermillion (`oklch(57% 0.22 22)`) renders **only as the × character** in:
- Nav wordmark: `AI<span class="x">×</span>Elections`
- Hero title: `AI<span class="x">×</span><br>Elections`
- Vacuum section statement
- Vacuum stats third column number
- CTA heading terminator
- Footer seal wordmark

Do not use vermillion for anything else. Not borders, not buttons, not underlines. Not as a highlight. Only × .

---

## Typography

### Font Stack

| Role | Family | Use |
|---|---|---|
| Display | **Abril Fatface** | Hero title, section headings, key statistics |
| Text | **Spectral** (300, 400, 600, italic) | Body copy, decree text, sub-descriptions |
| Label | **Barlow Condensed** (400, 600, 700) | All uppercase labels, nav links, table headers |
| Body | **Barlow** (400, 500) | Running prose, form elements |

### Google Fonts Import

```html
<link href="https://fonts.googleapis.com/css2?family=Abril+Fatface&family=Barlow+Condensed:wght@400;600;700&family=Barlow:wght@400;500&family=Spectral:ital,wght@0,300;0,400;0,600;1,300;1,400&display=swap" rel="stylesheet">
```

### CSS Variables

```css
--f-display: 'Abril Fatface', Georgia, serif;
--f-text:    'Spectral', Georgia, serif;
--f-label:   'Barlow Condensed', Arial, sans-serif;
--f-body:    'Barlow', Arial, sans-serif;
```

### Scale

| Element | Size | Weight | Notes |
|---|---|---|---|
| Hero title | `clamp(88px, 14vw, 172px)` | Abril Fatface | `line-height: 0.88`, `letter-spacing: -0.02em` |
| Section headings (dark) | `clamp(32px, 5vw, 52px)` | Abril Fatface | `line-height: 1.1` |
| Section headings (light) | `36px` | Abril Fatface | `letter-spacing: -0.01em` |
| CTA heading | `clamp(32px, 4vw, 52px)` | Abril Fatface | `line-height: 1.05` |
| Nav wordmark | `22px` | Abril Fatface | |
| Body copy | `16–18px` | Spectral 300 | `line-height: 1.65`, max `52ch` |
| Table title | `13px` | Barlow Condensed 700 | `letter-spacing: 0.04em` |
| Table sub | `13px` | Spectral 300 italic | |
| Labels / caps | `10–12px` | Barlow Condensed 600–700 | `letter-spacing: 0.10–0.18em`, always uppercase |
| Footer body | `10px` | Barlow Condensed | `letter-spacing: 0.1em`, uppercase |

### Rules

- Abril Fatface at extreme scale is the voice. Don't pull it back. `clamp(88px, 14vw, 172px)` is the floor.
- Spectral body is always weight 300. This creates strong contrast against the Abril Fatface display.
- Barlow Condensed labels are always uppercase, always tracked (0.10em minimum). Never sentence-case.
- Line length on body copy: max 65ch. Hard limit 72ch.
- Light-on-dark sections: body text color is `oklch(78% 0.005 70)`, never pure white.

---

## Layout System

### Grid

The site uses a full-width column structure, not a container. Content extends edge-to-edge within `padding: 0 40px`.

Key two-column patterns use `display: grid; grid-template-columns: 1fr 1fr`.

No container `max-width`. The site breathes at all widths.

### Spacing Rhythm

| Context | Value |
|---|---|
| Section padding | `72px 40px` |
| Hero top padding | `60px 40px 0` |
| Hero column inner | `36px 40px 48px` (top/side/bottom) |
| Hero column inner (schedule side) | `36px 0 48px 40px` |
| Nav height | `56px` |
| Proclamation/registration bar | `8–10px 40px` |
| Subscribe CTA section | `80px 40px` |
| Footer | `48px 40px` |

### Border Language

- **Primary rule**: `1.5px solid var(--ink)` — structural section boundaries, nav borders, section headings
- **Secondary rule**: `1px solid var(--rule)` — table row dividers, internal column dividers
- **Dark section**: `1px solid oklch(35% 0.006 70)` — dividers within ink-surf backgrounds
- No `border-left` or `border-right` accent stripes. No rounded corners. No shadows.

---

## Components

### Proclamation Bar

Dark ink background. Two pieces: long label text (left) and a badge (right). Height is minimal — this is a registration strip, not a banner.

```css
background: var(--ink);
font-family: var(--f-label);
font-size: 11px;
font-weight: 600;
letter-spacing: 0.12em;
text-transform: uppercase;
```

### Navigation

`height: 56px`. Left: wordmark. Center: label links. Right: CTA button.

Nav CTA is a filled ink button — same bg as ink, paper text. No radius. No shadow.

### Hero Title

The central typographic move. Abril Fatface at `clamp(88px, 14vw, 172px)`. The × is red. Nothing else on the page can be this size or this color.

### Label Class

Used throughout for category tags, column headers, registration text:

```css
.label {
  font-family: var(--f-label);
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--ink-mid);
}
```

### Tables

No zebra-striping. Row hover only (`background: var(--pale)` on hover). Column separations by cell padding, not borders. Header row: `1.5px solid var(--ink)` bottom. Rows: `1px solid var(--rule)` bottom.

### Forms

Two-part: `flex` row. Input + button with no gap between them. Input `border-right: none`. Button fills with ink or paper depending on section bg. No radius anywhere.

### Dark Sections (vacuum / CTA)

Background: `var(--ink-surf)` (`oklch(18% 0.007 70)`).
Body text: `oklch(78% 0.005 70)` — never full white.
Dividers: `oklch(35% 0.006 70)`.
Tertiary text: `oklch(55% 0.005 70)`.

---

## Tone and Copy Rules

- The × is typographic punctuation, not a symbol. It appears in the wordmark and only the wordmark pattern.
- Section headings are declarative, not interrogative. "The Vacuum" not "What is the Vacuum?"
- Labels are 2–4 words, all caps, tracked. They categorize — they don't describe.
- No em dashes. Use commas, colons, semicolons.
- Dates are "Jul 1" format, not "July 1st" or "07/01".
- Issue numbers are zero-padded two digits: `01`, `02`, `14`.

---

## Anti-Patterns

These are forbidden — do not reintroduce:

- `border-left` or `border-right` as color accents (side stripes)
- `background-clip: text` gradient text
- Any use of `oklch(57% 0.22 22)` (vermillion) on anything other than the × character
- Rounded corners (`border-radius` > 0)
- Box shadows
- Any font from the reflex-reject list: Playfair Display, Cormorant, Inter, DM Sans, Space Grotesk, Instrument Sans, Fraunces, etc.
- Centered layout (everything is left-aligned or grid-based)
- Cards with icon + heading + text in a grid

---

## File Structure

```
AI x Elections/
├── site/
│   ├── index.html                    ← Main site (Direction G + Palette 2)
│   ├── DESIGN.md                     ← This file
│   ├── brand-directions.html         ← Initial direction explorations (B, C, D)
│   ├── brand-directions-c-variations.html  ← Impeccable hard pushes (E, F, G)
│   └── direction-g-palettes.html     ← Palette explorations for Direction G
├── context/
│   ├── TLDR.md
│   ├── Project Brief.md
│   └── Alignment FAQ.md
└── docs/
    └── Doctrine Evaluation.md
```

---

## Design Reference

**Physical scene:** A county clerk posting a legal notice on a courthouse bulletin board in 1972. The notice is set in Clarendon Bold. The building is sandstone. The fluorescent lights are humming. Nobody questions whether this document is authoritative — it simply is.

**Aesthetic lane:** Institutional government proclamation, not editorial magazine. Not Stripe-minimal. Not Swiss modernist. Specifically: the weight and silence of a legal notice that has force of law.

**Color reference:** Near-black notary seal ink + a single vermillion × stamp. The stamp says: this document has been processed.
