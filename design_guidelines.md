# Solana Token Fee Analyzer - Design Guidelines

## Design Approach
**Reference-Based: Apple Ecosystem (iMessage + App Store)**

Drawing from Apple's design language: extreme minimalism, generous white space, content-first hierarchy, subtle depth through shadows, and refined typography. The interface prioritizes clarity and focus over visual embellishment.

**Core Principles:**
- White space as a design element (not filler)
- Content breathing room with clean gutters
- Subtle depth through elevation, never flat
- Rounded corners throughout (12px-20px range)
- Monochromatic with strategic accent colors
- Zero decorative elements

---

## Typography System

**Primary Font Family:** SF Pro Display (via CDN)

**Hierarchy:**
- Display/Hero: 48px-56px, weight 700, letter-spacing -2%
- H1/Section Headers: 32px-36px, weight 600
- H2/Card Titles: 20px-24px, weight 600
- Body/Primary: 16px, weight 400, line-height 1.5
- Secondary/Meta: 14px, weight 400, opacity 60%
- Captions: 12px, weight 500, uppercase tracking

**Implementation:** Use consistent font sizes across all elements. Never mix fonts.

---

## Layout System

**Spacing Primitives (Tailwind):** 4, 6, 8, 12, 16, 20, 24, 32

**Container Strategy:**
- Max-width: 1280px centered
- Horizontal padding: px-6 (mobile), px-8 (tablet), px-12 (desktop)
- Section vertical spacing: py-16 to py-24
- Card internal padding: p-6 to p-8
- Grid gaps: gap-6 (mobile), gap-8 (desktop)

**Viewport Management:**
- Hero: 60vh minimum for impact with content
- Sections: Natural height based on content
- No forced 100vh constraints

---

## Component Library

### Navigation Bar
Top fixed bar with frosted glass effect (backdrop-blur), 72px height, subtle bottom border (1px, opacity 10%), max-width container. Logo left, primary navigation center, CTA button right. All elements vertically centered with 32px horizontal spacing.

### Hero Section
Clean centered layout with large heading, subtitle (max-width 600px), single primary CTA button below. Background: Large hero image (see Images section) with subtle overlay for text legibility. Button has blurred background (backdrop-blur-md with white/20 opacity background). Vertical padding: py-20 to py-32.

### Token Analysis Cards
White background rounded cards (rounded-2xl, 20px) with subtle shadow (shadow-lg with soft spread). Grid layout: single column mobile, 2 columns tablet, 3 columns desktop (gap-8). Each card: token icon top-left, token name/symbol as header, fee metrics in clean rows with label-value pairs, divider lines between sections (1px, opacity 8%). Internal padding: p-6.

### Data Display Sections
Clean tabular layouts with header row (weight 600, opacity 60%, 12px uppercase) and data rows below. Zebra striping through subtle background (opacity 3% on alternating rows). Rounded container (rounded-xl) with border (1px, opacity 10%). Row padding: py-4, column padding: px-6.

### Fee Comparison Table
Side-by-side comparison with 2-3 columns. Headers as cards at top (rounded corners, shadow-md), metrics listed vertically below. Highlight differences with subtle background variations. Mobile: stack vertically.

### Search & Filter Bar
Horizontal bar with search input (left, 60% width) and filter dropdowns (right). Rounded inputs (rounded-xl), minimal borders (1px, opacity 15%), focus state with shadow-md. Height: 52px. Background: white with shadow-sm.

### Statistics Dashboard
Grid of metric cards: 2x2 on mobile, 4x1 on desktop. Each card: large number (36px, weight 700), label below (14px, opacity 60%), icon top-right (24px). Cards with rounded-xl, p-6, shadow-sm, white background.

### CTA Sections
Centered layout with heading (32px), supporting text (16px, max-width 560px), button below. Generous vertical padding (py-20). Clean white background or subtle background (opacity 3%).

### Footer
Multi-column grid (stack mobile, 4 columns desktop). Logo and tagline left column, navigation links middle columns, newsletter signup right column (input + button inline). Subtle top border (1px, opacity 10%). Padding: py-16.

---

## Interaction Patterns

**Buttons:** Primary buttons have solid background with rounded-xl (12px), py-3 px-8, weight 600. Buttons on images use backdrop-blur-md with semi-transparent white background (white/20). All buttons have inherent hover/active states.

**Cards:** Hover state adds slight elevation (transition shadow from shadow-lg to shadow-xl, 200ms ease).

**Inputs:** Focus state: border color intensifies, shadow-md appears. Transition: 150ms ease.

**No Animations:** Zero decorative animations. Only functional micro-interactions (hover, focus, loading states).

---

## Images

### Hero Image
**Placement:** Full-width hero section background
**Description:** Abstract visualization of blockchain network - clean geometric nodes connected by lines, predominantly white/light gray with subtle depth. Should feel technical but elegant, not busy. Overlay: subtle gradient from white (bottom) to transparent for text legibility.
**Treatment:** Slight blur effect (filter: blur(1px)) to keep focus on content, not image details.

### Token Icons (Throughout Cards)
**Placement:** Top-left of each token analysis card
**Description:** Circular token logos (48px diameter) with subtle shadow (shadow-sm). Use actual Solana token logos where available.

### Dashboard Section Background (Optional Use)
**Placement:** Statistics dashboard section background
**Description:** Extremely subtle geometric pattern or light texture, barely visible (opacity 2-3%), adds subtle depth without distraction.

**Implementation Note:** All images should load progressively with blur-up technique. Never use decorative images that don't serve content purpose.