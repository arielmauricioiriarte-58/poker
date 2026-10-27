---
name: Royal Felt
colors:
  surface: '#10131a'
  surface-dim: '#10131a'
  surface-bright: '#363940'
  surface-container-lowest: '#0b0e14'
  surface-container-low: '#191c22'
  surface-container: '#1d2026'
  surface-container-high: '#272a31'
  surface-container-highest: '#32353c'
  on-surface: '#e1e2eb'
  on-surface-variant: '#bbcabf'
  inverse-surface: '#e1e2eb'
  inverse-on-surface: '#2e3037'
  outline: '#86948a'
  outline-variant: '#3c4a42'
  surface-tint: '#4edea3'
  primary: '#4edea3'
  on-primary: '#003824'
  primary-container: '#10b981'
  on-primary-container: '#00422b'
  inverse-primary: '#006c49'
  secondary: '#ffb95f'
  on-secondary: '#472a00'
  secondary-container: '#ee9800'
  on-secondary-container: '#5b3800'
  tertiary: '#00e475'
  on-tertiary: '#003918'
  tertiary-container: '#00bb5f'
  on-tertiary-container: '#00431e'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#6ffbbe'
  primary-fixed-dim: '#4edea3'
  on-primary-fixed: '#002113'
  on-primary-fixed-variant: '#005236'
  secondary-fixed: '#ffddb8'
  secondary-fixed-dim: '#ffb95f'
  on-secondary-fixed: '#2a1700'
  on-secondary-fixed-variant: '#653e00'
  tertiary-fixed: '#62ff96'
  tertiary-fixed-dim: '#00e475'
  on-tertiary-fixed: '#00210b'
  on-tertiary-fixed-variant: '#005226'
  background: '#10131a'
  on-background: '#e1e2eb'
  surface-variant: '#32353c'
typography:
  display-lg:
    fontFamily: Space Grotesk
    fontSize: 40px
    fontWeight: '700'
    lineHeight: 48px
    letterSpacing: -0.02em
  display-lg-mobile:
    fontFamily: Space Grotesk
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Space Grotesk
    fontSize: 28px
    fontWeight: '600'
    lineHeight: 36px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Space Grotesk
    fontSize: 22px
    fontWeight: '600'
    lineHeight: 28px
    letterSpacing: 0em
  headline-sm:
    fontFamily: Space Grotesk
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 24px
    letterSpacing: 0.01em
  body-lg:
    fontFamily: Manrope
    fontSize: 16px
    fontWeight: '500'
    lineHeight: 24px
    letterSpacing: 0em
  body-md:
    fontFamily: Manrope
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
    letterSpacing: 0.01em
  body-sm:
    fontFamily: Manrope
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 16px
    letterSpacing: 0.01em
  metric-lg:
    fontFamily: JetBrains Mono
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 30px
    letterSpacing: -0.03em
  metric-md:
    fontFamily: JetBrains Mono
    fontSize: 16px
    fontWeight: '600'
    lineHeight: 22px
    letterSpacing: -0.02em
  metric-sm:
    fontFamily: JetBrains Mono
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0em
  label-caps:
    fontFamily: JetBrains Mono
    fontSize: 10px
    fontWeight: '600'
    lineHeight: 14px
    letterSpacing: 0.08em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  gutter: 1rem
  margin: 1rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 0.75rem
  space-lg: 1.25rem
  space-xl: 2rem
---

## Brand & Style

The brand evokes the rarefied atmosphere of high-stakes private gaming salons: disciplined, opulent, and intensely focused. Tailored for dedicated poker players, high rollers, and mobile competitors, the experience removes the garish sensory overload typical of casual social casinos in favor of refined VIP tactile elegance.

The design language fuses **Glassmorphism** with **Tactile / Skeuomorphic** lighting cues. Frosted obsidian substrates sit above velvety deep-felt backdrops, rimmed with hairline metallic gold trims, subtle inner bevels, and radiant specular glows. Physical casino metaphors—such as physical chip weights, card bevels, and felt textures—are abstracted into clean, contemporary digital artifacts that convey precision, credibility, and high financial stakes.

## Colors

The palette establishes a midnight casino atmosphere structured through velvety depth and focused luminescence:

- **Canvas & Surface Tier:** Rooted in deep obsidian `#0B0E14` (table perimeter and base canvas), transitioning into an elevated layered surface tier at `#121722` (interactive panels, bet bars, and sheets). Deep table felt is rendered using localized radial gradients fading from `#064E3B` down to `#0B0E14`.
- **Emerald Greens (Primary & Success):** `#10B981` acts as the primary interactive and status tint, reinforced by `#059669` for pressed/surface fills and high-intensity `#00E676` exclusively reserved for winning pot calls, active turn indicators, and all-in alerts.
- **Imperial Golds (Secondary & Currency):** Metallic brass `#F59E0B` and amber `#FBBF24` highlight chip denominations, VIP statuses, pot totals, and active tab indicators. Deep brass `#D97706` grounds hairline borders and drop-shadow underglows.
- **Functional & Critical:** `#EF4444` signals fold actions and critical bet expirations. Whitespace typography uses `#F8FAFC` down to `#64748B` for tertiary annotations to protect dark-adapted player vision.

## Typography

The typographical hierarchy divides tasks between brand elegance, conversational interface, and high-frequency analytical calculation:

- **Space Grotesk (Display & Headers):** Selected for its geometric structural quirks and assertive technical feel. It leads tournament titles, winner fanfare, and high-level card headers.
- **Manrope (Body & UI Interface):** Neutral, warm, and highly legible across rapid table states. Handles game variant descriptions, chat messages, settings, and rule sets.
- **JetBrains Mono (Metrics, Chip Stacks, Odds):** A monospaced powerhouse employed for chip balances, blind levels, pot calculations, and win-rate percentages. Fixed glyph widths guarantee numerical stability without layout jitter when stacks increment or timers tick down.
- **Numerical Formatting Rule:** All chip metrics above 1,000 use standardized precision suffixes (e.g., `12.4K`, `1.25M`) set in `metric-md` with `label-caps` for currency indicators.

## Layout & Spacing

The layout operates primarily as an ergonomic mobile-first engine tuned for rapid thumb reachability during single-handed play and dense table landscapes:

- **Vertical Grid Architecture:** A 4-column fluid system on mobile devices (`<600px`) expanding to 8 columns on foldables and small tablets (`600px - 1023px`). Margins are capped tightly at `1rem` (`16px`) to maximize playable felt surface.
- **Poker Table Staging:** The primary game screen bypasses standard scrolling documents in favor of an anchor-bound stage. The circular/oval felt viewport remains fixed in the upper-center quadrant, while the bottom 38% of the viewport is reserved for the tactile action console (Bet Slider, Fold, Check/Call, Raise buttons).
- **Thumb-Zone Clustering:** Critical decision triggers sit within the bottom `48px` to `120px` vertical window above the device home indicator, preventing finger strain and accidental bet misclicks.

## Elevation & Depth

Visual hierarchy is constructed via translucent glassmorphism, physical card bevels, and selective back-lit illumination:

- **Base Felt (`Level 0`):** `#0B0E14` with a radial green drop-light (`#064E3B` at 45% intensity). Zero blur, non-reactive.
- **Frosted Glass Panels (`Level 1`):** Modal sheets, player badge bases, and action consoles use `#121722` at 80% opacity paired with `backdrop-filter: blur(16px)`. Edges are framed with a 1px border gradient ranging from `rgba(245, 158, 11, 0.25)` at the top edge to `rgba(255, 255, 255, 0.05)` at the bottom edge.
- **Player Seat Nodes (`Level 2`):** Elevated player plates cast a soft ambient shadow (`0 8px 24px rgba(0, 0, 0, 0.6)`). Active turn players gain an exterior green rim-glow (`0 0 16px rgba(0, 230, 118, 0.45)`).
- **Physical Playing Cards (`Level 3`):** Hole cards and community cards feature crisp drop shadows (`0 4px 12px rgba(0, 0, 0, 0.8)`), an ultra-fine 0.5px white specular inner hairline (`inset 0 1px 0 rgba(255, 255, 255, 0.6)`), and an extruded tactile depth layer.
- **Hero & Pot Overlays (`Level 4`):** Winning hand reveals and all-in modals drop deep diffused shadows (`0 16px 40px rgba(0, 0, 0, 0.9)`) combined with dynamic gold radiance (`0 0 32px rgba(245, 158, 11, 0.35)`).

## Shapes

The system relies on a consistent structural geometry based on **Rounded (`2`)** token standards, delivering comfortable contours that mimic smooth molded casino chips and polished card edges:

- **Standard Elements (`0.5rem` / `8px`):** Used for micro-badges, folded cards, numerical stat boxes, and small bet counters.
- **Interactive Containers (`1rem` / `16px`):** Applied to player avatar cards, bet slider thumbs, glass sheets, and contextual menus.
- **Structural Dialogs (`1.5rem` / `24px`):** Used for bottom sheets, modal dialogs, and table lobby preview cards.
- **Full Pills (`9999px`):** Reserved strictly for primary action buttons (Fold, Call, Raise), chip denominations, dealer buttons, and table state toggles.

## Components

### Buttons & Betting Actions
- **Primary Raise Button:** Full pill shape with a metallic linear gradient (`#F59E0B` to `#D97706`). Features high-contrast dark typography (`#0B0E14`), a 1px inner specular highlight (`inset 0 1px 0 rgba(255, 255, 255, 0.4)`), and an amber ambient glow on press.
- **Call / Check Button:** Emerald green gradient (`#10B981` to `#059669`) with white bold typography. Pulsates subtly when hero player action is required.
- **Fold Button:** Frosted obsidian glass (`rgba(18, 23, 34, 0.85)`) with a subdued red boundary (`#EF4444` at 40% opacity) and low-contrast white label, minimizing accidental trigger visual weight.

### Chips & Pot Trackers
- Circular tokens rendered with contrasting inner rim serration. Stack counters feature a unified `JetBrains Mono` label anchored over an obsidian frosted badge with a 1px gold border.
- Total Pot module floats centrally above the community cards inside a glass capsule (`backdrop-filter: blur(12px)`) featuring an amber `#FBBF24` pot value and animated chip trajectory anchors.

### Glassmorphism Cards & Hole Cards
- **Community Cards:** Crisp bone-white cardstock (`#F8FAFC`) with deep suit iconography (obsidian `#0F172A` and ruby red `#DC2626`). Beveled edges with low specular gloss.
- **Hole Cards (Player):** Tilted angled presentation. Winning cards receive a synchronized animated `#00E676` border outline with gold corner ribbons indicating made hand ranks (e.g., "Full House").

### Mobile Navigation Bar
- Grounded glass dock (`backdrop-filter: blur(20px)`, background `rgba(11, 14, 20, 0.88)`).
- Active item indicators use a suspended 3px horizontal gold bar (`#F59E0B`) accompanied by an upward emerald ambient back-glow. Iconography shifts from muted slate (`#64748B`) to glowing pearl white on selection.

### Custom Betting Slider
- Ergonomic vertical or curved radial thumb track with haptic detents at 25%, 50%, 75%, Pot, and All-In increments. The active fill track shines with an intense gradient from emerald `#10B981` into gold `#F59E0B`.