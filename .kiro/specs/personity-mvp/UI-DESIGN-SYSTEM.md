# Personity UI/UX Design System

## Design Philosophy

Personity's interface embodies **quiet luxury** — sophisticated, minimal, and purposeful. Every element serves a function. No decoration for decoration's sake. The design communicates trust, intelligence, and precision.

**Core Principles:**
- **Restraint over abundance** - Use space generously, elements sparingly
- **Clarity over cleverness** - Direct communication, no hidden meanings
- **Precision over approximation** - Exact spacing, perfect alignment
- **Substance over style** - Function drives form

---

## Color System

### Primary Palette
```
Neutral Scale (Foundation):
- N950: #0A0A0B  // Deep black, primary text
- N900: #18181B  // Card backgrounds, elevated surfaces
- N800: #27272A  // Borders, dividers
- N700: #3F3F46  // Subtle borders
- N600: #52525B  // Disabled states
- N500: #71717A  // Secondary text
- N400: #A1A1AA  // Placeholder text
- N300: #D4D4D8  // Subtle backgrounds
- N200: #E4E4E7  // Hover states
- N100: #F4F4F5  // Page background
- N50:  #FAFAFA  // Elevated background
- White: #FFFFFF // Pure white, cards

Accent (Minimal use):
- Primary: #2563EB   // Blue 600 - CTAs, links, focus states
- Primary-hover: #1D4ED8  // Blue 700
- Success: #059669   // Green 600 - Completed states
- Warning: #D97706   // Amber 600 - Warnings
- Error: #DC2626     // Red 600 - Errors
```

### Usage Rules
- **90% Neutral**: Most of the interface uses N50-N950
- **8% White**: Cards, elevated surfaces
- **2% Accent**: Only for primary actions and critical feedback
- Never use gradients, shadows are subtle (max 2px blur)
- Avoid pure black (#000000), use N950 instead

---

## Typography

### Font Stack
```css
--font-sans: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
--font-mono: 'JetBrains Mono', 'Fira Code', monospace;
```

### Type Scale
```
Display (Hero sections):
- 3XL: 48px / 56px (1.167) / -0.02em / 600 weight
- 2XL: 36px / 44px (1.222) / -0.01em / 600 weight
- XL:  30px / 38px (1.267) / -0.01em / 600 weight

Heading (Section titles):
- H1: 24px / 32px (1.333) / -0.01em / 600 weight
- H2: 20px / 28px (1.400) / -0.005em / 600 weight
- H3: 18px / 26px (1.444) / 0em / 600 weight
- H4: 16px / 24px (1.500) / 0em / 600 weight

Body (Content):
- Large: 16px / 24px (1.500) / 0em / 400 weight
- Base:  14px / 20px (1.429) / 0em / 400 weight
- Small: 13px / 18px (1.385) / 0em / 400 weight
- XS:    12px / 16px (1.333) / 0em / 400 weight

Mono (Code, data):
- Base: 14px / 20px (1.429) / 0em / 400 weight
```

### Typography Rules
- Use 600 weight for headings, 400 for body
- Never use bold (700+) or light (300-)
- Letter-spacing is negative for large text, neutral for body
- Line-height increases as font-size decreases (better readability)
- All caps only for labels, 11px, 0.05em tracking, 500 weight

---

## Spacing System

### Scale (8px base unit)
```
0:   0px
1:   4px   (0.5 unit)
2:   8px   (1 unit)
3:   12px  (1.5 units)
4:   16px  (2 units)
5:   20px  (2.5 units)
6:   24px  (3 units)
8:   32px  (4 units)
10:  40px  (5 units)
12:  48px  (6 units)
16:  64px  (8 units)
20:  80px  (10 units)
24:  96px  (12 units)
32:  128px (16 units)
```

### Application
- **Component padding**: 16px (4) or 24px (6)
- **Section spacing**: 48px (12) or 64px (16)
- **Page margins**: 80px (20) desktop, 24px (6) mobile
- **Card spacing**: 24px (6) internal padding
- **Form fields**: 12px (3) vertical, 16px (4) horizontal padding

---

## Component Library

### 1. Buttons

**Primary Button** (Main CTAs)
```
Style:
- Background: Primary (#2563EB)
- Text: White, 14px, 500 weight
- Padding: 12px 24px
- Border-radius: 8px
- Border: none
- Transition: all 150ms ease

States:
- Hover: Background → Primary-hover (#1D4ED8)
- Active: Scale 0.98, Background → #1E40AF
- Disabled: Background → N300, Text → N500, cursor not-allowed
- Focus: 2px ring, Primary/20 opacity, 4px offset

Sizes:
- Small: 10px 16px, 13px text
- Medium: 12px 24px, 14px text (default)
- Large: 14px 32px, 16px text
```

**Secondary Button** (Alternative actions)
```
Style:
- Background: White
- Text: N950, 14px, 500 weight
- Padding: 12px 24px
- Border-radius: 8px
- Border: 1px solid N300
- Transition: all 150ms ease

States:
- Hover: Border → N400, Background → N50
- Active: Scale 0.98, Border → N500
- Disabled: Background → N100, Text → N400, Border → N200
- Focus: 2px ring, N950/10 opacity, 4px offset
```

**Ghost Button** (Tertiary actions)
```
Style:
- Background: transparent
- Text: N700, 14px, 500 weight
- Padding: 12px 24px
- Border-radius: 8px
- Border: none

States:
- Hover: Background → N100
- Active: Background → N200
- Disabled: Text → N400
- Focus: 2px ring, N950/10 opacity, 4px offset
```

### 2. Input Fields

**Text Input**
```
Style:
- Background: White
- Border: 1px solid N300
- Border-radius: 8px
- Padding: 12px 16px
- Text: N950, 14px
- Placeholder: N400, 14px
- Transition: all 150ms ease

States:
- Hover: Border → N400
- Focus: Border → Primary, 2px ring Primary/20, 2px offset
- Error: Border → Error, 2px ring Error/20
- Disabled: Background → N50, Border → N200, Text → N500

Label:
- Text: N700, 13px, 500 weight
- Margin-bottom: 8px
- Optional indicator: N500, 13px, 400 weight

Helper text:
- Text: N500, 12px
- Margin-top: 6px
- Error state: Error color
```

**Textarea**
```
Same as Text Input, but:
- Min-height: 120px
- Resize: vertical only
- Max-height: 400px
```

**Select Dropdown**
```
Same as Text Input, plus:
- Chevron icon: N500, 16px, right-aligned
- Dropdown: White background, 1px N300 border, 8px radius
- Option hover: N100 background
- Option selected: N200 background, Primary text
- Max-height: 320px, scroll if needed
```

### 3. Cards

**Standard Card**
```
Style:
- Background: White
- Border: 1px solid N200
- Border-radius: 12px
- Padding: 24px
- Box-shadow: none (flat design)

States:
- Hover (if interactive): Border → N300, translate-y: -2px
- Active: Border → N400

Variants:
- Elevated: Add subtle shadow (0 1px 3px rgba(0,0,0,0.04))
- Bordered: Thicker border (2px)
- Flat: No border, N100 background
```

**Stat Card** (Dashboard metrics)
```
Style:
- Same as Standard Card
- Label: N500, 13px, 500 weight, uppercase, 0.05em tracking
- Value: N950, 30px, 600 weight, -0.01em tracking
- Change indicator: Success/Error, 13px, 500 weight
- Icon: 40px, N300 background, 8px radius, centered
```

### 4. Navigation

**Top Navigation Bar**
```
Style:
- Background: White
- Border-bottom: 1px solid N200
- Height: 64px
- Padding: 0 80px (desktop), 0 24px (mobile)
- Position: sticky, top: 0, z-index: 50

Logo:
- Height: 24px
- Wordmark: N950, 16px, 600 weight

Nav items:
- Text: N700, 14px, 500 weight
- Padding: 8px 16px
- Border-radius: 6px
- Hover: Background → N100
- Active: Background → N200, Text → N950
```

**Sidebar Navigation** (Dashboard)
```
Style:
- Background: White
- Border-right: 1px solid N200
- Width: 240px
- Padding: 24px 16px
- Position: fixed, height: 100vh

Section label:
- Text: N500, 11px, 500 weight, uppercase, 0.05em tracking
- Margin: 24px 0 8px 12px

Nav item:
- Text: N700, 14px, 500 weight
- Padding: 10px 12px
- Border-radius: 8px
- Icon: 20px, N500
- Hover: Background → N100
- Active: Background → Primary/10, Text → Primary, Icon → Primary
```

### 5. Tables

**Data Table**
```
Style:
- Background: White
- Border: 1px solid N200
- Border-radius: 12px
- Overflow: hidden

Header:
- Background: N50
- Text: N700, 13px, 500 weight, uppercase, 0.05em tracking
- Padding: 12px 16px
- Border-bottom: 1px solid N200

Row:
- Text: N950, 14px
- Padding: 16px
- Border-bottom: 1px solid N100
- Hover: Background → N50

Cell alignment:
- Text: left
- Numbers: right, mono font
- Actions: right

Empty state:
- Center-aligned
- Icon: 48px, N300
- Text: N500, 14px
- Padding: 64px
```

### 6. Modals & Dialogs

**Modal Overlay**
```
Style:
- Background: N950/40 (40% opacity)
- Backdrop-blur: 4px
- Position: fixed, inset: 0
- Z-index: 100
- Animation: fade-in 200ms ease
```

**Modal Content**
```
Style:
- Background: White
- Border-radius: 16px
- Max-width: 600px
- Padding: 32px
- Box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1)
- Animation: scale-in 200ms ease

Header:
- Title: N950, 20px, 600 weight
- Close button: Ghost button, top-right
- Margin-bottom: 24px

Body:
- Text: N700, 14px
- Spacing: 16px between elements

Footer:
- Margin-top: 32px
- Buttons: right-aligned, 12px gap
- Primary action: right-most
```

### 7. Toast Notifications

**Toast Container**
```
Style:
- Position: fixed, bottom: 24px, right: 24px
- Z-index: 200
- Max-width: 400px
```

**Toast**
```
Style:
- Background: White
- Border: 1px solid N200
- Border-radius: 12px
- Padding: 16px
- Box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1)
- Animation: slide-in-right 200ms ease

Variants:
- Success: Left border 3px Success
- Error: Left border 3px Error
- Warning: Left border 3px Warning
- Info: Left border 3px Primary

Content:
- Title: N950, 14px, 500 weight
- Message: N700, 13px
- Icon: 20px, colored by variant
- Close: Ghost button, small
```

### 8. Loading States

**Spinner**
```
Style:
- Size: 20px (small), 32px (medium), 48px (large)
- Border: 2px solid N200
- Border-top: 2px solid Primary
- Border-radius: 50%
- Animation: spin 600ms linear infinite
```

**Skeleton Loader**
```
Style:
- Background: N100
- Border-radius: matches content
- Animation: pulse 1.5s ease-in-out infinite

Variants:
- Text: Height 16px, width varies
- Avatar: Circle, 40px
- Card: Full card dimensions
```

**Progress Bar**
```
Style:
- Background: N200
- Height: 4px
- Border-radius: 2px
- Overflow: hidden

Fill:
- Background: Primary
- Height: 100%
- Animation: smooth transition
- Indeterminate: slide animation
```

---

## Page Layouts

### Landing Page

**Hero Section**
```
Layout:
- Max-width: 1200px, centered
- Padding: 120px 80px (desktop), 80px 24px (mobile)
- Background: White

Headline:
- Text: N950, 48px, 600 weight, -0.02em tracking
- Max-width: 700px
- Line-height: 1.1
- Margin-bottom: 24px

Subheadline:
- Text: N600, 20px, 400 weight
- Max-width: 600px
- Line-height: 1.5
- Margin-bottom: 40px

CTA Group:
- Primary button + Secondary button
- Gap: 16px
- Margin-bottom: 64px

Visual:
- Screenshot or abstract visual
- Border: 1px solid N200
- Border-radius: 16px
- Box-shadow: 0 20px 25px -5px rgba(0,0,0,0.05)
```

**Features Section**
```
Layout:
- Background: N50
- Padding: 96px 80px (desktop), 64px 24px (mobile)
- Grid: 3 columns (desktop), 1 column (mobile)
- Gap: 48px

Feature Card:
- Icon: 48px, N200 background, 12px radius, Primary icon
- Title: N950, 18px, 600 weight
- Description: N600, 14px, line-height 1.6
- Spacing: 16px between elements
```

### Dashboard

**Layout Structure**
```
Grid:
- Sidebar: 240px fixed width
- Main: flex-1, min-width: 0
- Max-width: 1400px content area

Header:
- Height: 80px
- Padding: 0 40px
- Border-bottom: 1px solid N200
- Flex: space-between

Page title:
- Text: N950, 24px, 600 weight

Actions:
- Right-aligned button group
- Gap: 12px

Content area:
- Padding: 40px
- Background: N50
```

**Stats Grid** (Dashboard home)
```
Layout:
- Grid: 4 columns (desktop), 2 (tablet), 1 (mobile)
- Gap: 24px
- Margin-bottom: 40px

Each stat card:
- White background
- 24px padding
- 12px border-radius
- 1px N200 border
```

**Survey List**
```
Layout:
- White background
- 12px border-radius
- 1px N200 border
- Overflow: hidden

List item:
- Padding: 20px 24px
- Border-bottom: 1px N100
- Hover: N50 background
- Cursor: pointer

Content:
- Title: N950, 16px, 500 weight
- Meta: N500, 13px (date, responses)
- Status badge: 8px radius, colored background
```

### Survey Creation Wizard

**Layout**
```
Structure:
- Centered card: 800px max-width
- Padding: 48px
- Background: White
- Border-radius: 16px
- Box-shadow: 0 1px 3px rgba(0,0,0,0.04)

Progress indicator:
- Top of card
- 5 steps, horizontal
- Active: Primary, Completed: Success, Upcoming: N300
- Line connecting steps: 2px, N200

Step content:
- Title: N950, 20px, 600 weight
- Description: N600, 14px
- Margin-bottom: 32px

Form fields:
- Full width
- 24px gap between fields

Navigation:
- Bottom of card
- Flex: space-between
- Back: Secondary button
- Next/Create: Primary button
```

### Conversation Interface (Respondent)

**Layout**
```
Structure:
- Full viewport height
- Max-width: 800px, centered
- Padding: 40px 24px
- Background: N50

Header:
- Logo: 20px height
- Progress: Horizontal bar, 4px height
- Margin-bottom: 40px

Chat container:
- Background: White
- Border-radius: 16px
- Padding: 32px
- Min-height: 500px
- Box-shadow: 0 1px 3px rgba(0,0,0,0.04)

Message:
- AI: Left-aligned, N100 background, 12px radius
- User: Right-aligned, Primary/10 background, 12px radius
- Padding: 12px 16px
- Max-width: 80%
- Margin: 16px 0
- Text: 14px, line-height 1.5

Input area:
- Fixed bottom
- Background: White
- Border-top: 1px N200
- Padding: 24px
- Textarea: Auto-grow, max 120px
- Send button: Primary, icon only, 40px square
```

### Insights Dashboard

**Layout**
```
Structure:
- Two-column: Sidebar (320px) + Main (flex-1)
- Gap: 40px

Sidebar:
- Sticky position
- Executive summary card
- Key metrics cards
- Export buttons

Main area:
- Themes section: Cards grid
- Individual responses: List view
- Pagination: Bottom, centered

Theme card:
- White background
- 24px padding
- 12px radius
- Theme name: N950, 16px, 600 weight
- Frequency: Primary, 24px, 600 weight
- Quotes: N600, 13px, italic
- Margin: 16px between elements
```

---

## Animations & Transitions

### Timing Functions
```css
--ease-in: cubic-bezier(0.4, 0, 1, 1);
--ease-out: cubic-bezier(0, 0, 0.2, 1);
--ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);
--ease-spring: cubic-bezier(0.34, 1.56, 0.64, 1);
```

### Duration Scale
```
- Instant: 0ms (immediate feedback)
- Fast: 150ms (hover, focus)
- Base: 200ms (default transitions)
- Slow: 300ms (complex animations)
- Slower: 500ms (page transitions)
```

### Common Animations
```css
/* Fade in */
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

/* Slide in from bottom */
@keyframes slideInUp {
  from {
    opacity: 0;
    transform: translateY(16px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Scale in */
@keyframes scaleIn {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

/* Spin (loading) */
@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* Pulse (skeleton) */
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}
```

### Interaction Patterns
- **Hover**: 150ms ease-out
- **Click**: Scale 0.98, 100ms ease-in-out
- **Focus**: Ring appears instantly, 0ms
- **Page load**: Stagger children by 50ms
- **Modal**: Overlay 200ms fade, content 200ms scale
- **Toast**: 200ms slide-in, 3s display, 200ms fade-out

---

## Responsive Breakpoints

```css
--mobile: 640px
--tablet: 768px
--desktop: 1024px
--wide: 1280px
--ultra: 1536px
```

### Responsive Rules
- **Mobile-first**: Design for 375px, scale up
- **Touch targets**: Minimum 44px × 44px
- **Font scaling**: Base 14px mobile, 14px desktop (no scaling)
- **Spacing**: Reduce by 50% on mobile (24px → 12px)
- **Grid**: 1 column mobile, 2-3 tablet, 3-4 desktop
- **Navigation**: Hamburger menu < 768px
- **Modals**: Full-screen < 640px

---

## Accessibility

### WCAG 2.1 AA Compliance

**Color Contrast**
- Text on white: Minimum 4.5:1 (N700 or darker)
- Large text: Minimum 3:1 (N600 or darker)
- Interactive elements: Minimum 3:1 against background

**Focus States**
- Visible focus ring on all interactive elements
- 2px ring, 4px offset
- Color: Primary/20 opacity
- Never remove outline without replacement

**Keyboard Navigation**
- Tab order follows visual order
- Skip links for main content
- Escape closes modals/dropdowns
- Arrow keys for lists/menus
- Enter/Space activates buttons

**Screen Readers**
- Semantic HTML (nav, main, article, etc.)
- ARIA labels for icon-only buttons
- ARIA live regions for dynamic content
- Alt text for all images
- Form labels properly associated

**Motion**
- Respect prefers-reduced-motion
- Disable animations if requested
- Provide static alternatives

---

## Implementation Notes

### Tailwind Configuration
```js
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        n: {
          50: '#FAFAFA',
          100: '#F4F4F5',
          // ... rest of neutral scale
        },
        primary: {
          DEFAULT: '#2563EB',
          hover: '#1D4ED8',
        },
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      borderRadius: {
        DEFAULT: '8px',
        lg: '12px',
        xl: '16px',
      },
      boxShadow: {
        sm: '0 1px 3px rgba(0,0,0,0.04)',
        DEFAULT: '0 1px 3px rgba(0,0,0,0.04)',
        md: '0 4px 6px -1px rgba(0,0,0,0.06)',
        lg: '0 10px 15px -3px rgba(0,0,0,0.1)',
        xl: '0 20px 25px -5px rgba(0,0,0,0.1)',
      },
    },
  },
};
```

### Component Organization
```
components/
├── ui/              # Base components (Button, Input, Card)
├── layout/          # Layout components (Nav, Sidebar, Container)
├── features/        # Feature-specific (SurveyWizard, ChatInterface)
└── shared/          # Shared utilities (LoadingSpinner, EmptyState)
```

### Performance
- Lazy load images with blur placeholder
- Code-split routes
- Preload critical fonts
- Minimize layout shifts (reserve space)
- Use CSS transforms for animations (GPU-accelerated)

---

## Design Checklist

Before shipping any screen:

- [ ] All text meets contrast requirements (4.5:1 minimum)
- [ ] Focus states visible on all interactive elements
- [ ] Keyboard navigation works completely
- [ ] Spacing follows 8px grid system
- [ ] Typography uses defined scale
- [ ] Colors from defined palette only
- [ ] Animations respect prefers-reduced-motion
- [ ] Mobile layout tested at 375px width
- [ ] Loading states defined for all async actions
- [ ] Empty states designed for all lists/tables
- [ ] Error states designed for all forms
- [ ] Success feedback for all actions

---

This design system creates a premium, professional interface that feels expensive and trustworthy. Every detail is intentional, every interaction is smooth, and the overall aesthetic is timeless and sophisticated.
