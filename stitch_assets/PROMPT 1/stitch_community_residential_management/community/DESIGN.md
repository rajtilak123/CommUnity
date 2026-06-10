---
name: CommUnity
colors:
  surface: '#f8f9ff'
  surface-dim: '#cbdbf5'
  surface-bright: '#f8f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#eff4ff'
  surface-container: '#e5eeff'
  surface-container-high: '#dce9ff'
  surface-container-highest: '#d3e4fe'
  on-surface: '#0b1c30'
  on-surface-variant: '#464555'
  inverse-surface: '#213145'
  inverse-on-surface: '#eaf1ff'
  outline: '#777587'
  outline-variant: '#c7c4d8'
  surface-tint: '#4d44e3'
  primary: '#3525cd'
  on-primary: '#ffffff'
  primary-container: '#4f46e5'
  on-primary-container: '#dad7ff'
  inverse-primary: '#c3c0ff'
  secondary: '#006591'
  on-secondary: '#ffffff'
  secondary-container: '#39b8fd'
  on-secondary-container: '#004666'
  tertiary: '#7e3000'
  on-tertiary: '#ffffff'
  tertiary-container: '#a44100'
  on-tertiary-container: '#ffd2be'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#e2dfff'
  primary-fixed-dim: '#c3c0ff'
  on-primary-fixed: '#0f0069'
  on-primary-fixed-variant: '#3323cc'
  secondary-fixed: '#c9e6ff'
  secondary-fixed-dim: '#89ceff'
  on-secondary-fixed: '#001e2f'
  on-secondary-fixed-variant: '#004c6e'
  tertiary-fixed: '#ffdbcc'
  tertiary-fixed-dim: '#ffb695'
  on-tertiary-fixed: '#351000'
  on-tertiary-fixed-variant: '#7b2f00'
  background: '#f8f9ff'
  on-background: '#0b1c30'
  surface-variant: '#d3e4fe'
typography:
  display-lg:
    fontFamily: Inter
    fontSize: 48px
    fontWeight: '700'
    lineHeight: '1.1'
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '600'
    lineHeight: '1.2'
    letterSpacing: -0.01em
  headline-lg-mobile:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: '1.2'
  headline-md:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: '1.3'
  headline-sm:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '600'
    lineHeight: '1.4'
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.6'
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: '1.5'
  label-md:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '500'
    lineHeight: '1'
    letterSpacing: 0.01em
  label-sm:
    fontFamily: Inter
    fontSize: 11px
    fontWeight: '600'
    lineHeight: '1'
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 4px
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 32px
  2xl: 48px
  3xl: 64px
  container-max: 1440px
  gutter: 24px
  margin-mobile: 16px
---

## Brand & Style
The brand personality is professional, efficient, and community-centric. It aims to bridge the gap between administrative rigor and neighborly warmth. The target audience includes both property managers (Admin) and residents (End-users).

The design style is **Corporate / Modern** with a strong influence of **Minimalism**. It draws inspiration from industry leaders by prioritizing information density for admins while maintaining a breathable, high-end feel for residents. The visual language relies on precision, rhythmic spacing, and a "content-first" hierarchy. The interface should feel like a sophisticated tool—unobtrusive yet powerful—evoking trust and clarity through structural alignment and refined details.

## Colors
The color system centers around **Primary Indigo (#4F46E5)**, used strategically for primary actions and brand recognition. The palette is supported by an extensive range of Slate grays to establish hierarchy in text and UI surfaces.

The design system natively supports both Light and Dark modes.
- **Light Mode:** Uses high-value backgrounds (#FFFFFF) with subtle surface shifts (#F8FAFC) to create soft containment.
- **Dark Mode:** Utilizes a deep obsidian foundation (#0B0E14) rather than pure black, ensuring better readability and reduced eye strain during long admin sessions.

Functional colors are mapped to specific semantic meanings:
- **Priority:** Low (Slate), Medium (Blue), High (Orange), Urgent (Red).
- **Status:** Open (Emerald), In Progress (Amber), Resolved (Indigo), Closed (Slate).

## Typography
The system uses **Inter** exclusively to ensure a systematic, utilitarian, and clean aesthetic across all platforms. The typographic scale is optimized for high legibility in data-dense admin dashboards and effortless reading on mobile resident apps.

- **Headlines:** Use tighter letter spacing and heavier weights to create a strong visual anchor.
- **Body Text:** Uses a 1.5x to 1.6x line height for maximum comfort during long-form reading of community bylaws or incident reports.
- **Mobile Adjustments:** Large headlines scale down on mobile to prevent awkward line breaks while maintaining hierarchy.
- **Labels:** Utilize medium weights and occasional uppercase styling for metadata and status badges to differentiate them from body content.

## Layout & Spacing
This design system utilizes a **8px grid system** for consistent spatial rhythm. 

- **Admin Strategy (Desktop-first):** Employs a 12-column fluid grid. Sidebars are fixed at 240px-280px, while the main content area expands to a `container-max` of 1440px. Gutters are set to 24px to handle dense data tables and card layouts.
- **Resident Strategy (Mobile-first):** Utilizes a single-column fluid layout with 16px side margins. Vertical spacing is increased to 24px-32px between sections to create a premium, unhurried experience.
- **Reflow Rules:** Elements on desktop (like 4-column feature grids) collapse into 2-columns on tablet and a single-column stack on mobile.

## Elevation & Depth
Hierarchy is conveyed through **Tonal Layers** and **Low-contrast outlines**. 

- **Surfaces:** Use a two-tier background system. Level 0 is the main canvas; Level 1 is for cards and navigation sidebars.
- **Outlines:** Instead of heavy shadows, components use a 1px border (#E2E8F0 in light, #30363D in dark). This creates the "Stripe-like" precision.
- **Shadows:** Reserved strictly for floating elements like dropdowns, modals, and popovers. These shadows are "Ambient"—extremely diffused with a large blur radius (24px+) and low opacity (5-10%) to suggest a subtle lift rather than a physical distance.

## Shapes
The shape language is **Rounded**, using a 0.5rem (8px) base radius. This strikes a balance between the technical sharpness of a SaaS tool and the friendliness required for a community platform.

- **Base (8px):** Buttons, Input fields, and small Chips.
- **Large (16px):** Standard Cards, Modals, and Image containers.
- **Extra Large (24px):** Hero sections or prominent featured banners in the resident feed.

## Components
- **Buttons:** Primary buttons use a solid Indigo background with white text. Secondary buttons use a ghost style with a subtle border. Padding is generous (10px 20px) to ensure a high-quality "premium" feel.
- **Chips/Badges:** Used for priority and status. They feature a soft-tint background (10% opacity of the functional color) and high-contrast text.
- **Input Fields:** Minimalist design with a 1px border. On focus, the border transitions to Primary Indigo with a subtle 2px outer glow (ring).
- **Cards:** White or dark-gray background with a 1px border and no shadow. For interactive cards, a subtle "hover" state increases the border contrast or adds a very slight elevation.
- **Lists:** Data-dense rows with horizontal dividers only. In the Admin dashboard, these include hover-actions (edit/delete) that appear on the right side of the row.
- **Resident Feed:** A specific component for mobile, featuring a vertical stack of high-quality cards with large typography and integrated media support.