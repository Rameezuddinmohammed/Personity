# UI Design Guidelines

## Design Philosophy

Personity embodies **quiet luxury** — sophisticated, minimal, and purposeful. Every element serves a function.

## Core Principles

- **Restraint over abundance** - Use space generously, elements sparingly
- **Clarity over cleverness** - Direct communication, no hidden meanings
- **Precision over approximation** - Exact spacing (8px grid), perfect alignment
- **Substance over style** - Function drives form

## Quick Reference

### Colors
- **Neutral Scale**: N50 (lightest) to N950 (darkest) - Use for 90% of UI
- **Primary**: #2563EB (Blue 600) - CTAs, links, focus states only
- **Success**: #059669 (Green 600) - Completed states
- **Error**: #DC2626 (Red 600) - Errors only
- **White**: #FFFFFF - Cards, elevated surfaces

### Typography
- **Font**: Inter (sans-serif), JetBrains Mono (monospace)
- **Headings**: 600 weight, negative letter-spacing
- **Body**: 400 weight, 14px base size
- **Never use**: Bold (700+), Light (300-), or emojis

### Spacing
- **Base unit**: 8px
- **Component padding**: 16px or 24px
- **Section spacing**: 48px or 64px
- **Form field gaps**: 24px

### Components
- **Border-radius**: 8px (default), 12px (cards), 16px (modals)
- **Borders**: 1px solid N200 (default), N300 (hover)
- **Shadows**: Minimal - 0 1px 3px rgba(0,0,0,0.04)
- **Transitions**: 150ms ease (hover), 200ms (default)

### Buttons
```
Primary: #2563EB background, white text, 12px 24px padding
Secondary: White background, N950 text, 1px N300 border
Ghost: Transparent, N700 text, no border
```

### Inputs
```
Background: White
Border: 1px solid N300
Padding: 12px 16px
Focus: Primary border + 2px ring (Primary/20)
```

### Cards
```
Background: White
Border: 1px solid N200
Border-radius: 12px
Padding: 24px
Shadow: None (flat design)
```

## Rules

1. **No emojis** in production UI (documentation only)
2. **No gradients** - Use solid colors only
3. **No heavy shadows** - Max 2px blur
4. **No animations over 300ms** - Keep it snappy
5. **No pure black** - Use N950 instead
6. **Accent colors sparingly** - 2% of interface maximum
7. **Always use 8px grid** - No arbitrary spacing
8. **Focus states required** - 2px ring, 4px offset
9. **Hover states required** - All interactive elements
10. **Mobile-first** - Design for 375px, scale up

## Accessibility

- **Contrast**: Minimum 4.5:1 for text (use N700+ on white)
- **Focus**: Visible ring on all interactive elements
- **Keyboard**: Full navigation support
- **Screen readers**: Semantic HTML + ARIA labels

## Implementation

When building components:
1. Check UI-DESIGN-SYSTEM.md for full specifications
2. Check UI-COMPONENT-SPECS.md for exact measurements
3. Use Tailwind classes from defined palette
4. Test at 375px (mobile), 768px (tablet), 1024px (desktop)
5. Verify accessibility with keyboard navigation

## Anti-Patterns (Never Do This)

❌ Cookie-cutter templates with emojis
❌ Bright, saturated colors everywhere
❌ Heavy drop shadows and gradients
❌ Decorative elements without function
❌ Inconsistent spacing (non-8px grid)
❌ Missing hover/focus states
❌ Poor contrast ratios
❌ Cluttered layouts

## Goal

Every screen should look like it cost $100,000 to design - clean, precise, professional, and timeless.
