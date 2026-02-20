/**
 * Design system token values.
 * Use Tailwind classes (e.g. bg-ds-surface) in components; use these values
 * for non-Tailwind contexts (e.g. Recharts, inline styles).
 *
 * 8pt spacing base: 1 = 8px, 2 = 16px, 3 = 24px, 4 = 32px, 5 = 40px, 6 = 48px, 8 = 64px.
 */

export const colors = {
  bg: "#0a0908",
  bgSubtle: "#0f0e0d",
  surface: "#171614",
  surfaceSubtle: "#1c1a18",
  surfaceHover: "#292524",
  border: "#292524",
  borderStrong: "#3f3c39",
  text: "#fafaf9",
  textSecondary: "#d6d3d1",
  textMuted: "#78716c",
  textFaint: "#57534e",
  accent: "#f59e0b",
  accentHover: "#fbbf24",
  statRed: "rgba(248,113,113,0.14)",
  statOrange: "rgba(251,146,60,0.14)",
  statBlue: "rgba(96,165,250,0.14)",
  statPink: "rgba(244,114,182,0.14)",
} as const;

export const chartColors = {
  axis: colors.textMuted,
  text: colors.text,
  tooltipBg: colors.surface,
  tooltipBorder: colors.border,
  bar: "rgba(251,146,60,0.9)",
  line: "rgba(251,146,60,0.9)",
} as const;

export const spacing = {
  1: 8,
  2: 16,
  3: 24,
  4: 32,
  5: 40,
  6: 48,
  8: 64,
  10: 80,
} as const;

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  "2xl": 24,
} as const;

export const shadow = {
  sm: "0 0 0 1px rgba(255,255,255,0.02), 0 2px 4px rgba(0,0,0,0.14)",
  md: "0 0 0 1px rgba(255,255,255,0.03), 0 4px 12px rgba(0,0,0,0.16)",
  lg: "0 0 0 1px rgba(255,255,255,0.04), 0 8px 24px rgba(0,0,0,0.18)",
} as const;

export const fontSize = {
  caption: "0.75rem",
  body: "1rem",
  bodySm: "0.875rem",
  heading: "1.125rem",
  title: "1.5rem",
  display: "1.875rem",
  stat: "1.5rem",
} as const;
