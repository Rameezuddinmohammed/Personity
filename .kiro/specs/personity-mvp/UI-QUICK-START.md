# Personity UI - Quick Start Guide

## 🎨 Design at a Glance

**Philosophy**: Quiet luxury - sophisticated, minimal, purposeful. No emojis, no gradients, no heavy shadows. Every pixel serves a purpose.

---

## Color Palette (Copy-Paste Ready)

```css
/* Neutral Scale (90% of UI) */
--n-50: #FAFAFA;
--n-100: #F4F4F5;
--n-200: #E4E4E7;
--n-300: #D4D4D8;
--n-400: #A1A1AA;
--n-500: #71717A;
--n-600: #52525B;
--n-700: #3F3F46;
--n-800: #27272A;
--n-900: #18181B;
--n-950: #0A0A0B;

/* Accent (2% of UI) */
--primary: #2563EB;
--primary-hover: #1D4ED8;
--success: #059669;
--error: #DC2626;
--warning: #D97706;

/* Base */
--white: #FFFFFF;
```

---

## Typography (Copy-Paste Ready)

```css
/* Font Family */
--font-sans: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
--font-mono: 'JetBrains Mono', 'Fira Code', monospace;

/* Headings */
--text-h1: 24px / 32px, 600 weight, -0.01em;
--text-h2: 20px / 28px, 600 weight, -0.005em;
--text-h3: 18px / 26px, 600 weight;
--text-h4: 16px / 24px, 600 weight;

/* Body */
--text-base: 14px / 20px, 400 weight;
--text-small: 13px / 18px, 400 weight;
--text-xs: 12px / 16px, 400 weight;
```

---

## Spacing Scale (8px Grid)

```
4px   8px   12px   16px   20px   24px   32px   40px   48px   64px   80px
 1     2      3      4      5      6      8     10     12     16     20
```

**Common Uses:**
- Component padding: 16px or 24px
- Form field gaps: 24px
- Section spacing: 48px or 64px
- Page margins: 80px (desktop), 24px (mobile)

---

## Component Cheat Sheet

### Button (Primary)
```css
background: #2563EB
color: white
padding: 12px 24px
border-radius: 8px
font-size: 14px
font-weight: 500
transition: all 150ms ease

hover: background → #1D4ED8
active: scale(0.98)
```

### Button (Secondary)
```css
background: white
color: #0A0A0B
border: 1px solid #D4D4D8
padding: 12px 24px
border-radius: 8px
font-size: 14px
font-weight: 500

hover: border → #A1A1AA, background → #FAFAFA
```

### Input Field
```css
background: white
border: 1px solid #D4D4D8
padding: 12px 16px
border-radius: 8px
font-size: 14px

hover: border → #A1A1AA
focus: border → #2563EB, ring 2px #2563EB/20
```

### Card
```css
background: white
border: 1px solid #E4E4E7
border-radius: 12px
padding: 24px
box-shadow: none (flat design)

hover (if interactive): border → #D4D4D8, translateY(-2px)
```

---

## Page Layouts

### Landing Page
```
Hero: 120px padding top/bottom, centered, max-width 1200px
Headline: 48px, 600 weight, -0.02em tracking
Subheadline: 20px, N600 color
CTA: Primary + Secondary buttons, 16px gap
```

### Dashboard
```
Sidebar: 240px fixed width, white background
Top Nav: 64px height, sticky
Content: 40px padding, N50 background
Cards: 24px gap grid
```

### Wizard
```
Container: 800px max-width, centered
Progress: 5 steps, horizontal, 40px circles
Form: 24px gap between fields
Navigation: Bottom, space-between
```

### Conversation
```
Container: 800px max-width, centered
Messages: 16px gap, 80% max-width bubbles
AI: N100 background, left-aligned
User: Primary/10 background, right-aligned
Input: Sticky bottom, auto-grow textarea
```

---

## Tailwind Config Snippet

```js
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        n: {
          50: '#FAFAFA',
          100: '#F4F4F5',
          200: '#E4E4E7',
          300: '#D4D4D8',
          400: '#A1A1AA',
          500: '#71717A',
          600: '#52525B',
          700: '#3F3F46',
          800: '#27272A',
          900: '#18181B',
          950: '#0A0A0B',
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
    },
  },
};
```

---

## Example Component (Button)

```tsx
// components/ui/Button.tsx
interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'small' | 'medium' | 'large';
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
}

export function Button({
  variant = 'primary',
  size = 'medium',
  children,
  onClick,
  disabled,
}: ButtonProps) {
  const baseStyles = 'font-medium rounded-lg transition-all duration-150 ease-out';
  
  const variants = {
    primary: 'bg-primary text-white hover:bg-primary-hover active:scale-[0.98] disabled:bg-n-300 disabled:text-n-500',
    secondary: 'bg-white text-n-950 border border-n-300 hover:border-n-400 hover:bg-n-50 active:scale-[0.98]',
    ghost: 'bg-transparent text-n-700 hover:bg-n-100 active:bg-n-200',
  };
  
  const sizes = {
    small: 'px-4 py-2.5 text-[13px]',
    medium: 'px-6 py-3 text-[14px]',
    large: 'px-8 py-3.5 text-[16px]',
  };
  
  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]}`}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
}
```

---

## Example Component (Input)

```tsx
// components/ui/Input.tsx
interface InputProps {
  label?: string;
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  disabled?: boolean;
}

export function Input({
  label,
  placeholder,
  value,
  onChange,
  error,
  disabled,
}: InputProps) {
  return (
    <div className="flex flex-col">
      {label && (
        <label className="text-[13px] font-medium text-n-700 mb-2">
          {label}
        </label>
      )}
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        className={`
          px-4 py-3 text-[14px] text-n-950 bg-white border rounded-lg
          transition-all duration-150 ease-out
          placeholder:text-n-400
          hover:border-n-400
          focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20
          disabled:bg-n-50 disabled:border-n-200 disabled:text-n-500
          ${error ? 'border-error ring-2 ring-error/20' : 'border-n-300'}
        `}
      />
      {error && (
        <span className="text-[12px] text-error mt-1.5">
          {error}
        </span>
      )}
    </div>
  );
}
```

---

## Accessibility Checklist

Before shipping any component:

- [ ] Color contrast ≥ 4.5:1 (text on white)
- [ ] Focus ring visible (2px, 4px offset)
- [ ] Keyboard navigation works
- [ ] Screen reader labels present
- [ ] Touch targets ≥ 44px × 44px
- [ ] Animations respect prefers-reduced-motion

---

## Resources

- **Full Design System**: `.kiro/specs/personity-mvp/UI-DESIGN-SYSTEM.md`
- **Component Specs**: `.kiro/specs/personity-mvp/UI-COMPONENT-SPECS.md`
- **Steering Rules**: `.kiro/steering/ui-design.md`

---

## Remember

**Goal**: Every screen should look like it cost $100,000 to design.

**How**: Restraint, precision, clarity, substance. No decoration for decoration's sake.

**Test**: If you can remove an element without losing function, remove it.
