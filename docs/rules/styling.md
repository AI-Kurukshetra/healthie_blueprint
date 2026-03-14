# Styling Rules

## Tailwind CSS
- Tailwind is the only styling approach — no inline styles, no CSS modules, no styled-components
- Use Tailwind utility classes directly in JSX
- For complex conditional classes, use `cn()` utility from `src/lib/utils.ts` (re-exports `clsx` + `tailwind-merge`)

## shadcn/ui
- Use shadcn/ui components for ALL UI elements before building custom ones
- Components installed in `src/components/ui/` — never modify these directly
- Customize via Tailwind classes on the component, not by editing the source

### Pre-installed Components (Phase 1A)
Button, Input, Label, Card, Form, Separator, Sheet, Avatar, Dropdown Menu, Sonner, Table, Dialog, Badge, Select, Textarea, Switch, Popover, Command, Skeleton, Tabs, Tooltip, Alert

## Professional Theme
- Color scheme: slate/zinc base with blue accent
- Apply theme CSS variables from docs/templates/theme-professional.md in `globals.css`
- All colors use CSS variables via `hsl(var(--primary))` pattern — never hardcode colors

## Responsive Design
- All layouts use Tailwind responsive prefixes: `sm:`, `md:`, `lg:`
- No fixed pixel widths on containers
- Tables become stacked cards below `md` breakpoint, or use horizontal scroll
- Sidebar collapses to sheet (slide-in drawer) on mobile
- Touch targets: minimum `h-10` (40px) for all interactive elements
- Test at 375px width minimum (iPhone SE)
- Use `max-w-7xl mx-auto` for main content containers

## Layout Patterns
- Main dashboard layout: sidebar + header + scrollable content area
- Content area: `p-6` padding on desktop, `p-4` on mobile
- Card-based layouts for dashboard stats and grouped content
- Form layouts: `max-w-2xl` for forms, labels above inputs
- List pages: full-width table/cards with header row

## Dark Mode (Tier 3 only)
- If implemented: use `next-themes` ThemeProvider with `class` strategy
- Add toggle button in header
- shadcn/ui components auto-adapt — no extra work needed
- Only implement if Tiers 1-2 are solid

## Icons
- Use `lucide-react` for all icons (ships with shadcn/ui)
- Healthcare-relevant icons: Stethoscope, Heart, Activity, Calendar, ClipboardList, Users, FileText, MessageSquare, Shield, Settings
