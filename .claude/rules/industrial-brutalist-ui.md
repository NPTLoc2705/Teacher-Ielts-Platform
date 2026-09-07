# SKILL: Industrial Brutalism & Tactical Telemetry UI

## 1. Skill Meta
**Name:** Industrial Brutalism & Tactical Telemetry Interface Engineering
**Description:** Advanced proficiency in architecting web interfaces that synthesize mid-century Swiss Typographic design, industrial manufacturing manuals, and retro-futuristic aerospace/military terminal interfaces. This discipline requires absolute mastery over rigid modular grids, extreme typographic scale contrast, purely utilitarian color palettes, and the programmatic simulation of analog degradation (halftones, CRT scanlines, bitmap dithering). The objective is to construct digital environments that project raw functionality, mechanical precision, and high data density, deliberately discarding conventional consumer UI patterns.

## 2. Visual Archetypes
The design system operates by merging two distinct but highly compatible visual paradigms. **Pick ONE per project and commit to it. Do not alternate or mix both modes within the same interface.**

### 2.1 Swiss Industrial Print
Derived from 1960s corporate identity systems and heavy machinery blueprints.
*   **Characteristics:** High-contrast light modes (newsprint/off-white substrates). Reliance on monolithic, heavy sans-serif typography. Unforgiving structural grids outlined by visible dividing lines. Aggressive, asymmetric use of negative space punctuated by oversized, viewport-bleeding numerals or letterforms. Heavy use of primary red as an alert/accent color.

### 2.2 Tactical Telemetry & CRT Terminal
Derived from classified military databases, legacy mainframes, and aerospace Heads-Up Displays (HUDs).
*   **Characteristics:** Dark mode exclusivity. High-density tabular data presentation. Absolute dominance of monospaced typography. Integration of technical framing devices (ASCII brackets, crosshairs). Application of simulated hardware limitations (phosphor glow, scanlines, low bit-depth rendering).

## 3. Typographic Architecture
Typography is the primary structural and decorative infrastructure. Imagery is secondary. The system demands extreme variance in scale, weight, and spacing.

### 3.1 Macro-Typography (Structural Headers)
*   **Classification:** Neo-Grotesque / Heavy Sans-Serif.
*   **Optimal Web Fonts:** Neue Haas Grotesk (Black), Inter (Extra Bold/Black), Archivo Black, Roboto Flex (Heavy), Monument Extended.
*   **Implementation Parameters:**
    *   **Scale:** Deployed at massive scales using fluid typography (e.g., `clamp(4rem, 10vw, 15rem)`).
    *   **Tracking (Letter-spacing):** Extremely tight, often negative (`-0.03em` to `-0.06em`), forcing glyphs to form solid architectural blocks.
    *   **Leading (Line-height):** Highly compressed (`0.85` to `0.95`).
    *   **Casing:** Exclusively uppercase for structural impact.

### 3.2 Micro-Typography (Data & Telemetry)
*   **Classification:** Monospace / Technical Sans.
*   **Optimal Web Fonts:** JetBrains Mono, IBM Plex Mono, Space Mono, VT323, Courier Prime.
*   **Implementation Parameters:**
    *   **Scale:** Fixed and small (`10px` to `14px` / `0.7rem` to `0.875rem`).
    *   **Tracking:** Generous (`0.05em` to `0.1em`) to simulate mechanical typewriter spacing or terminal matrices.
    *   **Leading:** Standard to tight (`1.2` to `1.4`).
    *   **Casing:** Exclusively uppercase. Used for all metadata, navigation, unit IDs, and coordinates.

### 3.3 Textural Contrast (Artistic Disruption)
*   **Classification:** High-Contrast Serif.
*   **Optimal Web Fonts:** Playfair Display, EB Garamond, Times New Roman.
*   **Implementation Parameters:** Used exclusively for short stylistic quotes or accent titles to disrupt the rigid industrial layout structure.
