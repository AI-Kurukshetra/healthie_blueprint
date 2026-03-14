# Component Rules

## Server vs Client Components
- **Default**: Server Components. Only add `'use client'` when the component needs interactivity (onClick, useState, useEffect, browser APIs).
- **Page components**: Always Server Components. If a page needs interactivity, extract the interactive part into a small client component and keep the page as server.
- **Data fetching**: Always in Server Components. Never `useEffect` + `fetch` for initial data loads.
- **Forms**: Client components (they need `react-hook-form`). But the Server Action they call runs on the server.

## File Naming
- Components: `PascalCase.tsx` (e.g., `AppointmentCard.tsx`, `PatientList.tsx`)
- One component per file (primary export). Small helper components can share a file.
- Colocate role-specific components under their role folder:
  ```
  src/components/provider/AppointmentList.tsx
  src/components/patient/BookingForm.tsx
  src/components/admin/UserManagement.tsx
  src/components/shared/EmptyState.tsx
  ```

## Component Structure
```tsx
// 1. Imports (ordered per import rules)
import { Button } from '@/components/ui/button';
import type { Appointment } from '@/types/database';

// 2. Types/Interfaces
interface AppointmentCardProps {
  appointment: Appointment;
  onCancel?: (id: string) => void;
}

// 3. Component
export function AppointmentCard({ appointment, onCancel }: AppointmentCardProps) {
  return (/* JSX */);
}
```

## Props
- All props get explicit interfaces — never inline `{ prop: type }` in the function signature
- Use `children: React.ReactNode` for wrapper components
- Destructure props in the function signature
- Default values in destructuring, not `defaultProps`

## Forms
- Always use `react-hook-form` + `zodResolver` for form handling
- Zod schema defined in `src/lib/validations/[entity].ts`
- Same schema validates client-side (form) and server-side (Server Action)
- Show inline errors below each field using `form.formState.errors`
- Disable submit button while `form.formState.isSubmitting`

## Role-Specific UI
- The sidebar navigation is role-aware: read role from profile, render matching nav items
- Dashboard content differs by role — use separate page components per role
- Shared components (EmptyState, Skeleton, StatCard) live in `src/components/shared/`
- Don't build a single component with `if (role === 'provider') { ... } else { ... }` — create role-specific variants
