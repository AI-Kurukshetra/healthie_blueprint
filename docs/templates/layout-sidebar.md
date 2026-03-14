# Layout — Sidebar Dashboard

## Structure
```
┌─────────────────────────────────────────────┐
│ ┌──────────┐ ┌────────────────────────────┐ │
│ │           │ │ Header (mobile menu, user) │ │
│ │  Sidebar  │ ├────────────────────────────┤ │
│ │           │ │                            │ │
│ │  Logo     │ │   Main Content Area        │ │
│ │  Nav      │ │   (children)               │ │
│ │  Items    │ │                            │ │
│ │           │ │                            │ │
│ │  User     │ │                            │ │
│ │  Info     │ │                            │ │
│ └──────────┘ └────────────────────────────┘ │
└─────────────────────────────────────────────┘
```

## Desktop (md and up)
- Sidebar: fixed left, `w-64`, full height
- Content: `ml-64`, full width minus sidebar

## Mobile (below md)
- Sidebar hidden by default
- Hamburger button in header triggers Sheet (slide-in from left)
- Content: full width

## Sidebar Component Spec

```tsx
// src/components/layout/Sidebar.tsx
'use client';

interface SidebarProps {
  role: 'patient' | 'provider' | 'admin';
  userName: string;
  userEmail: string;
  avatarUrl?: string;
}
```

### Sidebar Contents (top to bottom)
1. **Logo area**: CareSync name + Stethoscope icon, `py-6 px-4`
2. **Navigation**: Items from `navConfig[role]`, each with icon + label
   - Active state: `bg-accent text-accent-foreground` 
   - Hover: `hover:bg-accent/50`
   - Use `usePathname()` to detect active route
3. **Spacer**: `flex-grow` pushes user info to bottom
4. **User info**: Avatar + name + role badge, `py-4 px-4 border-t`
5. **Logout button**: Below user info

### Header Component
```tsx
// src/components/layout/Header.tsx
```
- Mobile: hamburger (Menu icon) + page title
- Desktop: page title + user avatar dropdown (profile, settings, logout)
- Use shadcn DropdownMenu for avatar dropdown

### Dashboard Layout
```tsx
// src/app/(dashboard)/layout.tsx
import { createServerClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';

export default async function DashboardLayout({ children }) {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, full_name, email, avatar_url')
    .eq('id', user.id)
    .single();

  if (!profile?.role) redirect('/onboarding');

  return (
    <div className="flex h-screen">
      <Sidebar
        role={profile.role}
        userName={profile.full_name}
        userEmail={profile.email}
        avatarUrl={profile.avatar_url}
      />
      <div className="flex-1 flex flex-col md:ml-64">
        <Header userName={profile.full_name} />
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
```
