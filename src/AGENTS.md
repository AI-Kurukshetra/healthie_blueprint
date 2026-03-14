# CareSync — Source Code Conventions

This file is auto-loaded when working in src/. For detailed rules, see docs/rules/.

## Key Rules Summary

### TypeScript
- Strict mode. No `any` types — use `unknown` and narrow, or define interfaces.
- All component props get explicit interfaces.
- Database types from `src/types/database.ts` (generated from Supabase).

### Components
- Server Components by default. Only add `'use client'` when interactivity is needed.
- Data fetching in Server Components or Server Actions — never `useEffect` + `fetch` for initial loads.
- Client components should be as small as possible.
- All forms use `react-hook-form` + `zodResolver`.

### File Naming
- Components: `PascalCase.tsx` (e.g., `AppointmentCard.tsx`)
- Utilities/hooks: `camelCase.ts` (e.g., `useAppointments.ts`)
- Route files: Next.js conventions (`page.tsx`, `layout.tsx`, `loading.tsx`, `error.tsx`)
- Validation schemas: `camelCase.ts` in `src/lib/validations/`

### Styling
- Tailwind CSS only — no inline styles, no CSS modules.
- Use shadcn/ui components for all UI elements.
- Responsive: use `sm:`, `md:`, `lg:` prefixes. All layouts must work at 375px.
- Touch targets minimum `h-10` (40px).

### Security
- Never import `SUPABASE_SERVICE_ROLE_KEY` in client code.
- Only `NEXT_PUBLIC_` prefixed env vars in client components.
- Validate all inputs with Zod on both client and server.
- RLS enabled on every public table — no exceptions.

### Error Handling
- Every route group gets `error.tsx` + `loading.tsx`.
- Dynamic routes get `not-found.tsx`.
- Empty states on every list page with icon + message + CTA.
- Skeleton loaders in every `loading.tsx` matching the page layout.
- Inline form validation errors below each field.

### Imports Order
1. React / Next.js
2. Third-party libraries
3. Internal components (@/components/...)
4. Internal utilities (@/lib/...)
5. Types (@/types/...)
