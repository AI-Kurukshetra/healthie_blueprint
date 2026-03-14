---
name: ui-components
description: |
  Use when building UI components, pages, forms, or styling with shadcn/ui and
  Tailwind CSS. Covers component structure, the professional theme, responsive
  design, empty states, skeletons, and form patterns. Do NOT use for database
  operations or Server Actions.
---

# UI Components — CareSync Conventions

## shadcn/ui (Always Prefer)

Use shadcn/ui components for ALL UI elements before building custom ones. Installed in `web/src/components/ui/`. Never modify these files directly — customize via Tailwind classes.

### Pre-installed Components
Button, Input, Label, Card, Form, Separator, Sheet, Avatar, Dropdown Menu, Sonner, Table, Dialog, Badge, Select, Textarea, Switch, Popover, Command, Skeleton, Tabs, Tooltip, Alert

## Professional Theme

Color scheme: **slate/zinc base with blue accent**. All colors use CSS variables:

```css
/* In globals.css */
--primary: 221.2 83.2% 53.3%;      /* Blue */
--primary-foreground: 210 40% 98%;
--background: 0 0% 100%;
--foreground: 222.2 84% 4.9%;
--muted: 210 40% 96.1%;
--muted-foreground: 215.4 16.3% 46.9%;
--destructive: 0 84.2% 60.2%;
--border: 214.3 31.8% 91.4%;
```

Use via `hsl(var(--primary))` — never hardcode colors.

## Component Structure

```tsx
// 1. Imports
import { Button } from '@/components/ui/button';
import type { Appointment } from '@/types/database';

// 2. Types
interface AppointmentCardProps {
  appointment: Appointment;
  onCancel?: (id: string) => void;
}

// 3. Component
export function AppointmentCard({ appointment, onCancel }: AppointmentCardProps) {
  return (/* JSX */);
}
```

## Component Organization

```
web/src/components/
├── ui/           # shadcn auto-generated (don't modify)
├── layout/       # Sidebar, header, nav
├── provider/     # Provider-specific components
├── patient/      # Patient-specific components
├── admin/        # Admin-specific components
└── shared/       # EmptyState, Skeleton, StatCard
```

Don't build one component with role switching — create role-specific variants.

## Form Pattern

```tsx
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { appointmentSchema, type AppointmentInput } from '@/lib/validations/appointment';

export function AppointmentForm() {
  const form = useForm<AppointmentInput>({
    resolver: zodResolver(appointmentSchema),
  });

  return (
    <Form {...form}>
      {/* FormField with FormItem, FormLabel, FormControl, FormMessage */}
      <Button type="submit" disabled={form.formState.isSubmitting}>
        Save
      </Button>
    </Form>
  );
}
```

- Zod schemas in `web/src/lib/validations/[entity].ts`
- Inline errors below each field: `text-sm text-destructive`
- Disable submit while `isSubmitting`

## Empty State Pattern (Required on Every List Page)

```tsx
import { CalendarX } from 'lucide-react';
import { Button } from '@/components/ui/button';

<div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
  <CalendarX className="h-12 w-12 text-muted-foreground" />
  <h2 className="text-xl font-semibold">No appointments yet</h2>
  <p className="text-muted-foreground">Schedule your first appointment to get started.</p>
  <Button>Book Appointment</Button>
</div>
```

Use neutral medical language — never casual ("Nothing here!").

## Skeleton Loader Pattern (Required in Every loading.tsx)

Skeletons MUST visually match the page layout they're loading for.

## Responsive Design Rules

- All layouts use `sm:`, `md:`, `lg:` prefixes
- No fixed pixel widths on containers
- Tables → stacked cards below `md`, or horizontal scroll
- Sidebar → sheet drawer on mobile
- Touch targets: minimum `h-10` (40px)
- Test at 375px minimum
- Content containers: `max-w-7xl mx-auto`
- Content padding: `p-6` desktop, `p-4` mobile

## Icons

Use `lucide-react` for all icons. Healthcare icons: Stethoscope, Heart, Activity, Calendar, ClipboardList, Users, FileText, MessageSquare, Shield, Settings

## Styling Rules

- Tailwind only — no inline styles, no CSS modules
- Use `cn()` from `web/src/lib/utils.ts` for conditional classes
- Forms: `max-w-2xl`, labels above inputs
