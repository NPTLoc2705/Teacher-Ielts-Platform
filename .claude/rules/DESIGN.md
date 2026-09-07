---
name: Wispace
description: Complete IELTS writing practice ecosystem — AI evaluation, teacher feedback, and progress tracking
colors:
  primary: "#183A68"
  navy-light: "#EAF2FD"
  teal: "#1FB2AA"
  teal-light: "#E3FAF7"
  amber: "#F5A623"
  amber-dark: "#D4891A"
  neutral-bg: "#F1F3FC"
  ink: "#0F172A"
  surface: "#FFFFFF"
  border: "#E2E8F0"
  muted: "#64748B"
typography:
  display:
    fontFamily: "Berlin Sans FB Demi Bold, system-ui, sans-serif"
    fontSize: "clamp(1.5rem, 3vw, 2.5rem)"
    fontWeight: 700
    lineHeight: 1.15
    letterSpacing: "-0.02em"
  body:
    fontFamily: "system-ui, -apple-system, sans-serif"
    fontSize: "0.9rem"
    fontWeight: 400
    lineHeight: 1.6
    letterSpacing: "normal"
  label:
    fontFamily: "system-ui, -apple-system, sans-serif"
    fontSize: "0.85rem"
    fontWeight: 500
    lineHeight: 1.4
    letterSpacing: "0.02em"
rounded:
  sm: "4px"
  md: "8px"
  lg: "12px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "16px"
  lg: "24px"
  xl: "32px"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "#FFFFFF"
    rounded: "{rounded.md}"
    padding: "8px 16px"
  button-secondary:
    backgroundColor: "transparent"
    textColor: "{colors.primary}"
    rounded: "{rounded.md}"
    padding: "8px 16px"
  card:
    backgroundColor: "{colors.surface}"
    rounded: "{rounded.md}"
    padding: "{spacing.md}"
  input:
    backgroundColor: "{colors.surface}"
    rounded: "{rounded.md}"
    padding: "4px 8px"
---

# Design System: Wispace

## 1. Overview

**Creative North Star: "The Exam Study"**

A quiet, organized space where serious preparation happens. Like a study desk set up in a calm, well-lit exam hall — everything you need is within reach, nothing distracts, and the focus is on performance. The room is familiar and personal (the study desk), yet the atmosphere is purposeful and concentrated (the exam room). Every surface is clean, every tool is in its place, and the environment says: *this is where you improve.*

Visually, Wispace is a flat, border-based system. Surfaces are separated by thin borders rather than shadows or elevation. The palette is restrained: deep navy anchors the UI as the primary interactive color, teal provides a calm accent for positive feedback (correct answers, success states), and amber signals secondary actions (retake, highlight). The background is a cool, light blue-gray — like a clean sheet of exam paper — and text is dark navy for readability.

**What this system rejects:** The generic edtech playbook — no cartoonish illustrations, no childish colors, no gamified badges or streaks, no Duolingo-style playfulness. Also rejects the "old corporate edtech" aesthetic: no heavy borders, no beige, no dense, outdated UI patterns. The design is professional, trustworthy, and supportive — quiet confidence, not loud decoration.

**Key Characteristics:**
- Flat, border-based separation (no shadows, no elevation)
- Restrained motion (state changes only — hover, focus, active)
- Low visual density with generous whitespace around content
- Typography as the primary hierarchy tool
- Single sans-serif family throughout
- Navy as the dominant UI color; teal and amber as restrained accents

## 2. Colors

The palette is restrained and professional. Navy is the primary voice — it carries the brand and the UI. Teal adds a calm, positive accent for feedback and success states. Amber signals secondary actions and highlights. The background is a cool, light blue-gray that reads as clean and paper-like.

### Primary
- **Deep Navy** (`#183A68`): Primary interactive color. Used for buttons, primary text, selected states, active navigation, and the brand's dominant voice. Maps to shadcn `--primary`.
- **Navy Light** (`#EAF2FD`): Tinted surface for hover states, light backgrounds, and secondary surfaces. Maps to `--secondary` / `--accent` in shadcn.

### Accent
- **Exam Teal** (`#1FB2AA`): Positive feedback, correct answers, success indicators, and the supportive accent. Never used for destructive or warning states. Also used for the brand's secondary voice in loading states and progress indicators.
- **Teal Light** (`#E3FAF7`): Background tint for teal-highlighted areas. Used as the skeleton shimmer base gradient.

### Secondary
- **Highlight Amber** (`#F5A623`): Secondary CTAs (retake, try again), warning signals, and annotation highlights. The amber-dark variant (`#D4891A`) is used for hover states.
- **Orange Note** (`#F57C00`): Exclusively used for the note/annotation system. Not a general UI color.

### Neutral
- **Study Sheet** (`#F1F3FC`): Page background. A cool, light blue-gray that reads as clean paper. Maps to shadcn `--background`.
- **Surface White** (`#FFFFFF`): Card backgrounds, modals, popovers, elevated surfaces. Maps to `--card` / `--popover`.
- **Border Light** (`#E2E8F0`): All structural dividers, card borders, input borders. Consistent 1px solid.
- **Muted** (`#64748B`): Secondary text, placeholder text, disabled states, metadata. Maps to `--muted-foreground`.
- **Ink** (`#0F172A`): Primary body text, headings. High contrast against the background. Maps to `--foreground`.

### Named Rules
**The Flat Surface Rule.** No shadows. Depth is conveyed through border separation, background tint shifts, and spacing. A card sits on the surface with a 1px border, not a drop shadow. An active element changes background tint, not elevation.

## 3. Typography

**Display Font:** Berlin Sans FB Demi Bold (with system-ui fallback)
**Body Font:** System-ui stack (`system-ui, -apple-system, sans-serif`)

**Character:** A single sans-serif family throughout. The system-ui stack keeps the UI fast, accessible, and native-feeling on every platform. Berlin Sans FB Demi Bold provides a heavier, more confident voice for display headings and brand moments. The pair is utilitarian yet distinctive — the body is invisible (it just works), the display has presence without being decorative.

### Hierarchy
- **Display** (700, `clamp(1.5rem, 3vw, 2.5rem)`, 1.15, -0.02em): Page titles, hero headings, section headers. The biggest moment on any screen. Berlin Sans FB Demi Bold.
- **Headline** (600, `1.15rem`, 1.2, -0.01em): Card titles, modal headers, subsection titles. System-ui.
- **Title** (600, `1rem`, 1.3, normal): Navigation items, button labels, list item titles. System-ui.
- **Body** (400, `0.9rem`, 1.6, normal): Paragraphs, descriptions, content text. Max line length 65ch. System-ui.
- **Label** (500, `0.85rem`, 1.4, 0.02em): Form labels, metadata, badges, small caps. System-ui.
- **Mono** (400, `0.85rem`, 1.4, normal): For tabular figures, code, scores, and data displays. System-ui monospace fallback.

### Named Rules
**The One Family Rule.** All text uses the system-ui sans-serif family. Berlin Sans FB Demi Bold is reserved for display headings only. No mixing of serif, script, or decorative fonts.

## 4. Elevation

The system is flat. Depth is not conveyed through shadows. Instead, the UI uses three techniques for visual hierarchy:

1. **Border separation.** A 1px solid `#E2E8F0` border separates surfaces. Cards, modals, and containers sit on the page background with a visible border.
2. **Background tint shifts.** An active card, selected item, or hovered element shifts its background to a lighter or darker tint of the brand palette (e.g., `#EAF2FD` for hover on navy, `#E3FAF7` for hover on teal).
3. **Spacing.** The most important elements get more breathing room. Generous padding around primary content signals its importance without relying on shadows or elevation.

**Named Rules: The Flat-By-Default Rule.** Surfaces are flat at rest. No shadow appears at any state. Hover and active states are communicated through background tint changes and border color shifts only.

## 5. Components

### Buttons
- **Shape:** Gently curved corners (8px / `rounded-md`).
- **Primary:** Deep navy (`#183A68`) background, white text, 8px 16px padding. Hover: darker navy (`#0F2A4A`). Active: `scale(0.98)` for tactile feedback.
- **Secondary / Ghost:** Transparent background, navy text. Hover: light navy tint (`#EAF2FD`). Border: 1px solid `#E2E8F0` added on hover for ghost variants.
- **Focus:** Visible ring (`2px solid #183A68`, `ring-offset-2`).
- **Transition:** 0.2s ease-out on background-color and transform.

### Cards / Containers
- **Corner Style:** 8px (`rounded-md`).
- **Background:** White (`#FFFFFF`).
- **Border:** 1px solid `#E2E8F0`.
- **Shadow Strategy:** None — see Elevation section.
- **Internal Padding:** 12px-16px (`p-3` to `p-4`).
- **Hover:** Background tint shift to `#EAF2FD` when interactive.

### Inputs / Fields
- **Style:** Flat border (`1px solid #E2E8F0`), white background, 8px radius.
- **Focus:** Navy ring (`2px solid #183A68`, `ring-offset-2`), navy border.
- **Placeholder:** Muted text (`#64748B`), must meet WCAG AA 4.5:1 contrast.
- **Error:** Red border and text (`#EF4444`), error message below the field.
- **Disabled:** Muted background (`#F1F3FC`), muted text (`#94A3B8`).

### Navigation
- **Style:** Flat, border-based. Top navigation bar with a bottom border (`1px solid #E2E8F0`).
- **Items:** System-ui, 500 weight, 0.9rem. Active item uses navy text + bottom border indicator. Hover: light navy tint background.
- **Mobile:** Hamburger menu at breakpoints below `768px`. Side drawer with border-based item separation.

### Badges / Chips
- **Style:** Small, compact. 4px radius, 6px 8px padding.
- **Variants:** Navy (default), Teal (success), Amber (warning), Light gray (neutral).
- **Text:** 0.75rem, 600 weight, matching the background contrast.

### Feedback / Score Display
- **Style:** Large, typography-forward score cards. Navy text for the score number, muted label beneath. No circular progress rings or decorative charts — just clear, bold numbers with descriptive labels.
- **Band Score:** Display size (`clamp(2rem, 4vw, 3rem)`), 700 weight, navy.

## 6. Do's and Don'ts

### Do:
- **Do** use navy (`#183A68`) as the dominant UI color for buttons, links, and active states.
- **Do** use border (`1px solid #E2E8F0`) to separate surfaces — no shadows needed.
- **Do** keep text at WCAG AA contrast (4.5:1 minimum). Body text uses `#0F172A` on the `#F1F3FC` background.
- **Do** use the flat elevation model: background tint shifts for hover, not shadows.
- **Do** keep motion restrained to state transitions only (hover, focus, active) — no scroll animations, no entrance effects.
- **Do** use the system-ui font stack for a fast, native, accessible feel.
- **Do** keep the UI clean and spacious — generous padding, plenty of whitespace, low density.

### Don't:
- **Don't** use shadows, drop shadows, or elevation on any surface. The system is flat.
- **Don't** use cartoonish illustrations, childish colors, gamified badges, streaks, or Duolingo-style playful elements. Exam prep is serious work.
- **Don't** use outdated corporate edtech patterns: heavy borders, beige backgrounds, dense data-dump layouts.
- **Don't** use more than one accent color on a single screen. Pick navy (primary action), teal (positive feedback), or amber (secondary action) — one per context.
- **Don't** introduce decorative fonts, serif typefaces, or script fonts. The system uses a single sans-serif family.
- **Don't** use gradient text, glassmorphism, or neon/glowing effects.
- **Don't** use border-left or border-right as colored accent stripes on cards or list items — use full borders or background tints.
- **Don't** use the "AI purple/blue gradient" aesthetic.
- **Don't** use pure black (`#000000`) for text — use `#0F172A` (ink) instead.
- **Don't** use placeholder-as-label on form inputs. Labels sit above the field.