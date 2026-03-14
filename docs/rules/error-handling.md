# Error Handling Rules

## Next.js Error Boundaries

Every route group needs these files:
```
src/app/
├── error.tsx              # Global fallback
├── not-found.tsx          # Global 404
├── loading.tsx            # Global loading
├── (auth)/
│   ├── error.tsx
│   └── loading.tsx
├── (dashboard)/
│   ├── error.tsx
│   ├── loading.tsx
│   └── [role]/[feature]/
│       ├── error.tsx
│       ├── loading.tsx
│       └── not-found.tsx  # For dynamic [id] routes
```

### error.tsx Template
```tsx
'use client';

import { Button } from '@/components/ui/button';
import { AlertCircle } from 'lucide-react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
      <AlertCircle className="h-12 w-12 text-muted-foreground" />
      <h2 className="text-xl font-semibold">Something went wrong</h2>
      <p className="text-muted-foreground">Please try again or contact support if the issue persists.</p>
      <Button onClick={reset}>Try again</Button>
    </div>
  );
}
```

## Server Action Returns
Recommended (not enforced) pattern:
```ts
type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string };
```
- Wrap every Server Action in try/catch
- Never throw from Server Actions — return the error shape
- The calling component checks `result.success` and shows the error

## Loading States (Non-Negotiable)
- Every `loading.tsx` uses shadcn Skeleton components
- Skeletons must visually match the page layout they're loading for
- List pages: skeleton rows matching table header structure
- Dashboard: skeleton cards matching stat card layout
- Detail pages: skeleton blocks matching content layout

## Empty States (Non-Negotiable)
Every list page handles three states:
1. **Loading** → Skeleton matching the page layout
2. **Empty** → Lucide icon + heading + description + CTA button
3. **Data** → Normal rendered list/table

Medical context: Use neutral language for empty medical data.
- ✅ "No medical records found" / "No appointments scheduled"
- ❌ "No records!" / "Nothing here!" (too casual for healthcare)

## Form Validation Errors (Non-Negotiable)
- Inline error messages below each field using react-hook-form's error state
- Red text, small font size: `text-sm text-destructive`
- Show on blur or on submit, clear on focus/change
- Server-side errors displayed as a general error message above the form or via toast

## Confirmation Dialogs
Required before:
- Cancelling an appointment
- Editing a clinical note
- Deleting any medical record
- Changing a user's role (admin)

Use shadcn AlertDialog with clear action descriptions.
