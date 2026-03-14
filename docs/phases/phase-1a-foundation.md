# Phase 1A — Foundation (~30 min)

## Goal
Scaffold the project, install all dependencies, configure Supabase connection, deploy empty shell to Vercel. Confirm the full pipeline works before writing any features.

## Steps

### 1. Create Next.js Project
```bash
npx create-next-app@latest caresync --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"
cd caresync
```

### 2. Install Dependencies
```bash
# Supabase
npm install @supabase/supabase-js @supabase/ssr

# UI
npx shadcn@latest init
# When prompted: TypeScript: yes, style: Default, base color: Slate, CSS variables: yes, tailwind.config.js location: default, components alias: @/components, utils alias: @/lib/utils

# Install shadcn components (all at once)
npx shadcn@latest add button input label card form separator sheet avatar dropdown-menu sonner table dialog badge select textarea switch popover command skeleton tabs tooltip alert

# Forms & Validation
npm install react-hook-form @hookform/resolvers zod

# Icons (comes with shadcn but ensure it's there)
npm install lucide-react

# Date handling
npm install date-fns
```

### 3. Configure Environment Variables
Create `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### 4. Create Supabase Client Files

**src/lib/supabase/server.ts** — Server client for Server Components, Server Actions, Route Handlers:
```ts
import { createServerClient as createClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function createServerClient() {
  const cookieStore = await cookies();

  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Called from Server Component — ignore
          }
        },
      },
    }
  );
}
```

**src/lib/supabase/client.ts** — Browser client for Client Components:
```ts
import { createBrowserClient } from '@supabase/ssr';

export function createBrowserSupabaseClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
```

**src/middleware.ts** — Auth middleware at project root (not in src/app):
```ts
import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();

  // Redirect unauthenticated users from protected routes
  const protectedPaths = ['/provider', '/patient', '/admin', '/settings', '/onboarding'];
  const isProtected = protectedPaths.some(path => request.nextUrl.pathname.startsWith(path));

  if (!user && isProtected) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }

  // Redirect authenticated users from auth pages
  const authPaths = ['/login', '/signup'];
  const isAuthPage = authPaths.some(path => request.nextUrl.pathname.startsWith(path));

  if (user && isAuthPage) {
    const url = request.nextUrl.clone();
    url.pathname = '/';
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api/auth).*)'],
};
```

### 5. Create Utility Files

**src/lib/utils.ts** (should already exist from shadcn init, verify it has):
```ts
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

### 6. Create Placeholder Pages
- `src/app/page.tsx` — Simple "CareSync — Coming Soon" text (replaced in Phase 1D)
- `src/app/layout.tsx` — Root layout with Sonner toast provider
- `src/app/error.tsx` — Global error boundary
- `src/app/not-found.tsx` — Global 404
- `src/app/loading.tsx` — Global loading skeleton

### 7. Create Project Structure Directories
```bash
mkdir -p src/components/{ui,layout,provider,patient,admin,shared}
mkdir -p src/lib/{supabase,validations}
mkdir -p src/hooks
mkdir -p src/types
mkdir -p src/config
mkdir -p scripts
```

### 8. First Deploy
```bash
git add .
git commit -m "phase-1a: scaffold project with Next.js, Supabase, shadcn/ui"
git push origin main
```
- Go to Vercel → Import repo → Auto-detect Next.js
- Add environment variables: `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Deploy and verify the placeholder page loads at the Vercel URL

### 9. Supabase Setup
- Go to Supabase dashboard → Create new project (region: Mumbai or Singapore)
- Wait for provisioning (~2 min)
- Go to Settings → API → Copy Project URL and anon key → Update `.env.local`
- Go to SQL Editor → Run the schema from docs/templates/schema.sql

## Verification Checklist
- [ ] `npm run dev` starts without errors
- [ ] Vercel deploy succeeds and loads the placeholder page
- [ ] Supabase project is created and schema is applied
- [ ] `.env.local` has all three environment variables
- [ ] All directories exist per the project structure

## Deploy Checkpoint: YES — push to main after this phase
