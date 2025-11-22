/**
 * Personity Design Tokens
 * 
 * Centralized design system constants for TypeScript usage.
 * For CSS classes, use Tailwind utilities directly.
 */

export const colors = {
  // Neutral scale (use for 90% of UI)
  neutral: {
    50: 'hsl(0 0% 98%)',
    100: 'hsl(0 0% 96%)',
    200: 'hsl(0 0% 90%)',
    300: 'hsl(0 0% 83%)',
    400: 'hsl(0 0% 64%)',
    500: 'hsl(0 0% 45%)',
    600: 'hsl(0 0% 38%)',
    700: 'hsl(0 0% 26%)',
    800: 'hsl(0 0% 15%)',
    950: 'hsl(0 0% 4%)',
  },
  
  // Primary (monochrome - black for CTAs)
  primary: 'hsl(0 0% 4%)',        // Neutral 950
  primaryHover: 'hsl(0 0% 15%)',  // Neutral 800
  primaryLight: 'hsl(0 0% 96%)',  // Neutral 100
  
  // Semantic colors
  success: 'hsl(160 84% 39%)',
  error: 'hsl(0 72% 51%)',
  warning: 'hsl(38 92% 50%)',
  
  // Base colors
  white: 'hsl(0 0% 100%)',
  black: 'hsl(0 0% 0%)',
} as const;

export const spacing = {
  0: '0',
  1: '0.125rem',   // 2px
  2: '0.25rem',    // 4px
  3: '0.5rem',     // 8px
  4: '0.75rem',    // 12px
  5: '1rem',       // 16px
  6: '1.5rem',     // 24px
  8: '2rem',       // 32px
  10: '2.5rem',    // 40px
  12: '3rem',      // 48px
  16: '4rem',      // 64px
  20: '5rem',      // 80px
  24: '6rem',      // 96px
} as const;

export const borderRadius = {
  sm: '0.25rem',   // 4px
  default: '0.375rem',   // 6px
  md: '0.5rem',    // 8px
  lg: '0.75rem',   // 12px
  xl: '1rem',      // 16px
  full: '9999px',
} as const;

export const fontSize = {
  xs: '0.75rem',     // 12px
  sm: '0.875rem',    // 14px (base)
  base: '0.875rem',  // 14px
  lg: '1rem',        // 16px
  xl: '1.125rem',    // 18px
  '2xl': '1.5rem',   // 24px
  '3xl': '1.875rem', // 30px
  '4xl': '2.25rem',  // 36px
} as const;

export const fontWeight = {
  normal: 400,
  medium: 500,
  semibold: 600,
} as const;

export const transitions = {
  fast: '150ms ease',
  base: '200ms ease',
  slow: '300ms ease',
} as const;

export const shadows = {
  xs: '0 1px 2px 0 rgb(0 0 0 / 0.04)',
  sm: '0 1px 3px 0 rgb(0 0 0 / 0.04)',
  default: '0 2px 4px 0 rgb(0 0 0 / 0.04)',
  md: '0 4px 6px 0 rgb(0 0 0 / 0.04)',
  lg: '0 8px 12px 0 rgb(0 0 0 / 0.04)',
  xl: '0 12px 24px 0 rgb(0 0 0 / 0.06)',
} as const;

export const zIndex = {
  dropdown: 1000,
  sticky: 1020,
  fixed: 1030,
  modalBackdrop: 1040,
  modal: 1050,
  popover: 1060,
  tooltip: 1070,
} as const;

/**
 * Common component class combinations
 * Use these for consistency across the app
 */
export const componentClasses = {
  // Cards
  card: 'bg-white border border-neutral-200 rounded-md p-6',
  cardHover: 'hover:border-primary hover:shadow-md transition-base',
  
  // Buttons
  buttonPrimary: 'bg-neutral-950 text-white px-6 py-3 rounded hover:bg-neutral-800 transition-fast font-medium',
  buttonSecondary: 'bg-white text-neutral-950 border border-neutral-300 px-6 py-3 rounded hover:border-neutral-400 transition-fast font-medium',
  buttonGhost: 'text-neutral-700 px-6 py-3 rounded hover:bg-neutral-100 transition-fast font-medium',
  
  // Inputs
  input: 'w-full px-4 py-3 border border-neutral-300 rounded focus:border-neutral-950 focus:ring-2 focus:ring-neutral-950/20 focus:outline-none transition-fast',
  
  // Text
  heading: 'font-semibold tracking-tight text-neutral-950',
  body: 'text-sm text-neutral-700',
  secondary: 'text-xs text-neutral-600',
  muted: 'text-xs text-neutral-500',
  
  // Focus states
  focusRing: 'focus:outline-none focus:ring-2 focus:ring-neutral-950/20 focus:ring-offset-2',
} as const;

/**
 * Breakpoints (for JS usage)
 */
export const breakpoints = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
} as const;
