# WODLab — Design System

Single source of truth for layout, components, and styling. All UI must use these tokens (via Tailwind `ds-*` classes or `src/design-system/tokens.ts` for non-Tailwind contexts).

---

## 1. Color tokens

| Token | Usage | Tailwind |
|-------|--------|----------|
| **Background** | | |
| `ds-bg` | Page background | `bg-ds-bg` |
| `ds-bg-subtle` | Subtle background variant | `bg-ds-bg-subtle` |
| **Surfaces** | | |
| `ds-surface` | Cards, panels, inputs container | `bg-ds-surface` |
| `ds-surface-subtle` | Inputs, subtle elevation | `bg-ds-surface-subtle` |
| `ds-surface-hover` | Hover / active nav, list row | `bg-ds-surface-hover` |
| **Borders** | | |
| `ds-border` | Default border | `border-ds-border` |
| `ds-border-strong` | Focus, hover emphasis | `border-ds-border-strong` |
| **Text — hierarchy** | | |
| `ds-text` | Primary (headings, numbers, key copy) | `text-ds-text` |
| `ds-text-secondary` | Body, descriptions | `text-ds-text-secondary` |
| `ds-text-muted` | Labels, captions, metadata | `text-ds-text-muted` |
| `ds-text-faint` | Placeholders, disabled | `text-ds-text-faint` |
| **Accent** | | |
| `ds-accent` | CTAs, links, key actions | `text-ds-accent`, `bg-ds-accent` |
| `ds-accent-hover` | CTA hover | `hover:bg-ds-accent-hover` |
| **Stat gradients** | Card backgrounds (subtle tint) | `bg-ds-stat-red`, `-orange`, `-blue`, `-pink` |

**Contrast rule:** Primary stats and key actions use `ds-text` (or accent). Secondary info (labels, hints, metadata) use `ds-text-muted` and smaller type.

---

## 2. Spacing scale (8pt base)

| Token | Value | Tailwind |
|-------|--------|----------|
| ds-1 | 8px | `p-ds-1`, `m-ds-1`, `gap-ds-1` |
| ds-2 | 16px | `p-ds-2`, `gap-ds-2` |
| ds-3 | 24px | `p-ds-3`, `gap-ds-3` |
| ds-4 | 32px | `p-ds-4` |
| ds-5 | 40px | `p-ds-5` |
| ds-6 | 48px | `p-ds-6` |
| ds-8 | 64px | `p-ds-8` |
| ds-10 | 80px | `p-ds-10` |

Use for section gaps, card padding, and component spacing. Prefer `space-y-ds-*`, `gap-ds-*`, `p-ds-*` over arbitrary values.

---

## 3. Border radius scale

| Token | Value | Tailwind | Use |
|-------|--------|----------|-----|
| ds-sm | 8px | `rounded-ds-sm` | Chips, small controls |
| ds-md | 12px | `rounded-ds-md` | Inputs, nav items |
| ds-lg | 16px | `rounded-ds-lg` | Buttons, logo |
| ds-xl | 20px | `rounded-ds-xl` | Cards, panels |
| ds-2xl | 24px | `rounded-ds-2xl` | Modals, hero cards |

---

## 4. Shadow system

| Token | Use |
|-------|-----|
| `shadow-ds-sm` | Default cards, inputs |
| `shadow-ds-md` | Hover cards, dropdowns |
| `shadow-ds-lg` | Main content panel, modals |

Shadows are soft and layered (subtle border glow + depth). No harsh drop shadows.

---

## 5. Typography scale

| Token | Size | Line height | Use |
|-------|------|-------------|-----|
| `ds-caption` | 12px | 1.125rem | Labels, overlines, hints |
| `ds-body-sm` | 14px | 1.25rem | Secondary body, table cell |
| `ds-body` | 16px | 1.5rem | Body, buttons |
| `ds-heading` | 18px | 1.5rem | Section titles, card titles |
| `ds-title` | 24px | 2rem | Card headings |
| `ds-display` | 30px | 2.25rem | Page title |
| `ds-stat` | 24px | 1.75rem | Stat card value (bold) |

**Primary vs secondary:** Use `text-ds-text` for headings and key numbers; use `text-ds-text-muted` + `text-ds-caption` or `text-ds-body-sm` for labels and secondary copy.

---

## 6. Component variants

- **Card:** `rounded-ds-xl bg-ds-surface shadow-ds-sm`, hover `shadow-ds-md`. Padding: `p-ds-2` | `p-ds-3` | `p-ds-4` (sm | md | lg).
- **Button primary:** `bg-ds-accent text-stone-950`, hover `bg-ds-accent-hover`, `shadow-ds-sm` → `shadow-ds-md`.
- **Button secondary:** `border border-ds-border-strong bg-ds-surface text-ds-text`, hover `bg-ds-surface-hover`.
- **Button ghost:** `text-ds-text-muted`, hover `bg-ds-surface-hover text-ds-text`.
- **StatCard:** Gradient background (`ds-stat-*`), label `text-ds-caption text-ds-text-muted`, value `text-ds-stat font-bold text-ds-text`.
- **Input:** `rounded-ds-md border border-ds-border bg-ds-surface-subtle`, focus `border-ds-border-strong ring-ds-border-strong`.

---

## 7. Usage

- **In React/Tailwind:** Use only `ds-*` classes. No hardcoded hex, `slate-*`, or one-off spacing.
- **In Recharts or inline styles:** Import `colors` and `chartColors` from `src/design-system/tokens.ts`.
- **Reducing clutter:** Prefer one short subtitle per section; use spacing (ds-2, ds-3) over extra dividers; avoid duplicate labels.
- **Contrast:** Keep primary stats and CTAs high-emphasis (`ds-text`, `ds-accent`); keep labels and metadata low-emphasis (`ds-text-muted`, `ds-caption`).
