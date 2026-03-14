# Security Rules

## Row Level Security (RLS)
- **Every table in `public` schema gets RLS enabled. No exceptions.**
- See docs/templates/rls-patterns.md for the 4 reusable policy templates
- Default pattern for most tables: role-based access (Pattern 4)
- Appointments: patients see own, providers see their assigned, admins see all
- Clinical notes: patients can view (not edit), providers can create/edit their own, admins can view all
- Medical records: patients see own, providers see their assigned patients', admins see all

## Auth Middleware
File: `src/middleware.ts`

The middleware must:
1. Create a Supabase server client with cookie handling
2. Refresh the auth token on every request (prevents expiry)
3. Redirect unauthenticated users away from `/provider/*`, `/patient/*`, `/admin/*`
4. Redirect authenticated users away from `/login` and `/signup`
5. Optionally: check role matches route prefix (e.g., patient can't access `/provider/*`)

```ts
// Matcher config — exclude static files and public routes
export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api/auth).*)'],
};
```

## Role Enforcement
- **Client-side**: Sidebar renders different nav based on `profiles.role` — cosmetic only
- **Server-side**: RLS policies enforce data access per role — this is the real security
- **Middleware**: Optionally redirect users who try to access wrong role's routes
- **Server Actions**: Check user role before performing operations where RLS alone isn't sufficient

## Environment Variables
```
# Public (safe for client)
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=

# Server-only (NEVER in client code)
SUPABASE_SERVICE_ROLE_KEY=          # Only used in seed script and admin operations
```

- Only `NEXT_PUBLIC_` prefixed variables are accessible in client components
- Service role key bypasses RLS — only use in seed scripts and trusted server-side admin operations
- Never log environment variables
- `.env.local` is in `.gitignore` — never commit it

## Input Validation
- Zod schemas in `src/lib/validations/` — one file per entity
- Same schema validates client-side (react-hook-form) and server-side (Server Action)
- Always validate in Server Actions even if the form already validates client-side
- Sanitize text inputs — trim whitespace, enforce max lengths
- Date inputs: validate format and ensure dates are reasonable (no appointments in the past)

## Medical Data Sensitivity
- Clinical notes cannot be deleted — only edited (append-only in spirit)
- All modifications to medical data should be logged (created_at, updated_at)
- Patient data is only visible to the patient themselves, their assigned providers, and admins
- No patient data on the public landing page or in any unauthenticated route
