# TypeScript Rules

## Strictness
- `strict: true` in tsconfig.json — no exceptions
- `noUncheckedIndexedAccess: true` for safer array/object access
- No `any` types. Use `unknown` and narrow, or define proper interfaces
- No `@ts-ignore` or `@ts-expect-error` — fix the actual type issue

## Type Definitions
- All component props get explicit interfaces (not inline types)
- Database types generated from Supabase: `src/types/database.ts`
- Zod schemas infer TypeScript types: `type X = z.infer<typeof xSchema>`
- Server Action parameters and returns are explicitly typed
- Prefer `interface` for object shapes, `type` for unions and utilities

## Naming
- Interfaces: `PascalCase` with descriptive names (e.g., `AppointmentCardProps`, `CreateAppointmentInput`)
- Type aliases: `PascalCase` (e.g., `UserRole`, `AppointmentStatus`)
- Enums: Avoid TypeScript enums — use `as const` objects or Zod enums instead
- Generic params: Single uppercase letters for simple cases (`T`, `K`), descriptive for complex (`TData`, `TError`)

## Patterns
- Use discriminated unions for action results:
  ```ts
  type ActionResult<T = void> =
    | { success: true; data: T }
    | { success: false; error: string };
  ```
- Use `satisfies` for type-safe config objects that should also be inferred
- Prefer optional chaining (`?.`) over nested null checks
- Use `Record<string, T>` for string-keyed objects, not `{ [key: string]: T }`

## Database Types
- Generate with: `npx supabase gen types typescript --project-id [id] > src/types/database.ts`
- Import as: `import type { Database } from '@/types/database'`
- Create helper types for common table rows:
  ```ts
  type Profile = Database['public']['Tables']['profiles']['Row'];
  type Appointment = Database['public']['Tables']['appointments']['Row'];
  ```
