# Personity Design System

**Philosophy**: Quiet Luxury • Minimal • Professional

This design system enforces consistency across the entire application. All values are defined in `src/app/globals.css` as CSS custom properties.

---

## 🎨 Colors

### Neutral Scale (Use for 90% of UI)

```css
neutral-50   /* #FAFAFA - Lightest backgrounds */
neutral-100  /* #F5F5F5 - Subtle backgrounds */
neutral-200  /* #E5E5E5 - Borders, dividers */
neutral-300  /* #D4D4D4 - Hover borders */
neutral-400  /* #A3A3A3 - Disabled text, icons */
neutral-500  /* #737373 - Placeholder text */
neutral-600  /* #525252 - Secondary text */
neutral-700  /* #404040 - Body text */
neutral-800  /* #262626 - Headings */
neutral-950  /* #0A0A0A - Primary text */
```

### Primary (Blue - Use Sparingly)

```css
primary       /* #2563EB - CTAs, links, focus states */
primary-hover /* Hover state */
primary-light /* Light backgrounds */
```

**Usage**: CTAs, links, focus states only. Maximum 2% of interface.

### Semantic Colors

```css
success  /* #059669 - Completed states */
error    /* #DC2626 - Errors only */
warning  /* #F59E0B - Warnings */
```

---

## 📏 Spacing (8px Grid)

All spacing follows an 8px grid system:

```css
spacing-3  /* 8px  - Tight spacing */
spacing-5  /* 16px - Component padding */
spacing-6  /* 24px - Form field gaps */
spacing-12 /* 48px - Section spacing */
spacing-16 /* 64px - Large sections */
```

**Examples**:
- Button padding: `px-6 py-3` (24px × 12px)
- Card padding: `p-6` (24px)
- Section gaps: `gap-12` (48px)

---

## 🔤 Typography

### Font Family

```css
font-sans  /* Inter - UI text */
font-mono  /* JetBrains Mono - Code */
```

### Font Sizes (14px base)

```css
text-xs   /* 12px */
text-sm   /* 14px - Base size */
text-base /* 14px */
text-lg   /* 16px */
text-xl   /* 18px */
text-2xl  /* 24px */
text-3xl  /* 30px */
text-4xl  /* 36px */
```

### Font Weights

```css
font-normal   /* 400 - Body text */
font-medium   /* 500 - Emphasis */
font-semibold /* 600 - Headings */
```

**Rules**:
- Never use bold (700+) or light (300-)
- Headings: 600 weight + negative letter-spacing
- Body: 400 weight

### Examples

```tsx
{/* Heading */}
<h1 className="text-3xl font-semibold tracking-tight text-neutral-950">

{/* Body */}
<p className="text-sm text-neutral-700">

{/* Secondary text */}
<span className="text-xs text-neutral-600">
```

---

## 🔲 Border Radius

```css
rounded-sm  /* 6px  - Small elements */
rounded     /* 8px  - Default */
rounded-md  /* 12px - Cards */
rounded-lg  /* 16px - Modals */
rounded-xl  /* 24px - Large containers */
rounded-full /* Fully rounded */
```

**Examples**:
- Buttons: `rounded` (8px)
- Cards: `rounded-md` (12px)
- Modals: `rounded-lg` (16px)

---

## 🌑 Shadows (Minimal)

```css
shadow-xs  /* Subtle hover */
shadow-sm  /* Default */
shadow     /* Cards */
shadow-md  /* Elevated */
shadow-lg  /* Modals */
```

**Rules**:
- Use sparingly - flat design preferred
- Maximum 2px blur for most elements
- No heavy drop shadows

---

## 🎯 Component Patterns

### Buttons

```tsx
{/* Primary CTA */}
<button className="bg-primary text-white px-6 py-3 rounded hover:bg-primary-hover transition-fast">

{/* Secondary */}
<button className="bg-white text-neutral-950 border border-neutral-300 px-6 py-3 rounded hover:border-neutral-400 transition-fast">

{/* Ghost */}
<button className="text-neutral-700 px-6 py-3 rounded hover:bg-neutral-100 transition-fast">
```

### Cards

```tsx
<div className="bg-white border border-neutral-200 rounded-md p-6 hover:border-primary hover:shadow-md transition-base">
```

### Inputs

```tsx
<input className="w-full px-4 py-3 border border-neutral-300 rounded focus:border-primary focus:ring-2 focus:ring-primary-ring transition-fast" />
```

### Focus States

```tsx
{/* Always include focus ring */}
focus:outline-none focus:ring-2 focus:ring-primary-ring focus:ring-offset-2
```

---

## ⚡ Transitions

```css
transition-fast  /* 150ms - Hover states */
transition-base  /* 200ms - Default */
transition-slow  /* 300ms - Complex animations */
```

**Rules**:
- All interactive elements need transitions
- Keep under 300ms
- Use `ease` timing function

---

## 📱 Responsive Breakpoints

```css
sm:  /* 640px  - Mobile landscape */
md:  /* 768px  - Tablet */
lg:  /* 1024px - Desktop */
xl:  /* 1280px - Large desktop */
2xl: /* 1536px - Extra large */
```

**Mobile-first approach**: Design for 375px, scale up.

---

## ✅ Usage Examples

### Dashboard Card

```tsx
<div className="bg-white border border-neutral-200 rounded-md p-6">
  <div className="flex items-center justify-between mb-2">
    <p className="text-sm font-medium text-neutral-600">Total Surveys</p>
    <MessageSquare className="w-5 h-5 text-neutral-400" />
  </div>
  <p className="text-3xl font-semibold text-neutral-950">42</p>
  <p className="text-xs text-neutral-500 mt-1">Active surveys</p>
</div>
```

### Form Field

```tsx
<div className="space-y-2">
  <label className="text-sm font-medium text-neutral-700">
    Email Address
  </label>
  <input
    type="email"
    className="w-full px-4 py-3 border border-neutral-300 rounded focus:border-primary focus:ring-2 focus:ring-primary-ring transition-fast"
    placeholder="you@example.com"
  />
  <p className="text-xs text-neutral-500">We'll never share your email</p>
</div>
```

### Status Badge

```tsx
<span className="flex items-center gap-1.5">
  <span className="w-2 h-2 rounded-full bg-success" />
  <span className="text-xs text-neutral-700">Active</span>
</span>
```

---

## 🚫 Anti-Patterns (Never Do This)

❌ Random colors outside the palette
❌ Emojis in production UI
❌ Heavy shadows (>2px blur)
❌ Gradients
❌ Bold text (700+)
❌ Inconsistent spacing (non-8px grid)
❌ Missing hover/focus states
❌ Poor contrast ratios

---

## 🎓 Quick Reference

**Most Common Classes**:

```tsx
/* Text */
text-neutral-950  /* Primary text */
text-neutral-700  /* Body text */
text-neutral-600  /* Secondary text */
text-neutral-500  /* Placeholder */

/* Backgrounds */
bg-white          /* Cards, surfaces */
bg-neutral-50     /* Subtle backgrounds */
bg-primary        /* CTAs only */

/* Borders */
border-neutral-200  /* Default */
border-neutral-300  /* Hover */

/* Spacing */
p-6    /* Card padding (24px) */
gap-6  /* Form field gaps (24px) */
mb-12  /* Section spacing (48px) */

/* Interactive */
hover:border-primary
focus:ring-2 focus:ring-primary-ring
transition-fast
```

---

## 📚 Resources

- **Tailwind v4 Docs**: https://tailwindcss.com/docs
- **Lucide Icons**: https://lucide.dev
- **shadcn/ui**: https://ui.shadcn.com

---

**Last Updated**: November 22, 2025
