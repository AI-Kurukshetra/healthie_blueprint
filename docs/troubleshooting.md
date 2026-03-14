# Troubleshooting — Hackathon Day Issues

## Codex CLI Generated Broken Code
1. Paste the exact error message back to Codex: "Fix this error: [full error]"
2. If Codex loops on the same error 3 times, stop. Read the code yourself.
3. Identify the root cause and give Codex a more specific instruction.
4. Check if it's a package version mismatch — pin versions if needed.

## Build Works Locally but Fails on Vercel
1. **90% of the time**: Missing environment variable in Vercel dashboard
   - Check: Settings → Environment Variables → verify all 3 are set
2. **9% of the time**: Node version or dependency resolution difference
   - Check: Build logs for the exact error
3. **1% of the time**: Genuine code issue in production build
   - Run `npm run build` locally to reproduce
   - Common cause: `window` or `document` access in Server Component

## Auth Not Working After Deploy
1. Supabase Dashboard → Authentication → URL Configuration
2. **Site URL** must match your Vercel URL (e.g., `https://caresync.vercel.app`)
3. **Redirect URLs** must include both:
   - `http://localhost:3000` (for local dev)
   - `https://your-app.vercel.app` (for production)
4. Common gotcha: trailing slash mismatch

## Middleware Redirect Loop
- **Cause**: Middleware runs on routes it shouldn't (like API routes or static files)
- **Fix**: Check the `matcher` config in `src/middleware.ts` excludes `_next/static`, `_next/image`, `favicon.ico`
- **Cause**: Auth page redirects to auth page
- **Fix**: Ensure middleware excludes the `(auth)` route group from the "redirect to login" check

## Seed Script Fails
1. **"User already exists"**: The script handles this — it looks up existing users
2. **"Invalid API key"**: Make sure `SUPABASE_SERVICE_ROLE_KEY` (not anon key) is in `.env.local`
3. **"Table not found"**: Run `docs/templates/schema.sql` in Supabase SQL Editor first
4. **"Permission denied"**: Service role key bypasses RLS — verify you're using the right key
5. **Last resort**: Copy the INSERT statements and run them directly in Supabase SQL Editor
6. **Need full rollback of dummy data**: follow `docs/runbook-dummy-data.md` and run `scripts/seed-cleanup.ts`

## RLS Blocking Data
- **Symptom**: Pages load but show empty (no data), even though data exists in Supabase Table Editor
- **Cause**: RLS policies are blocking the current user
- **Debug**: In Supabase SQL Editor, run `SELECT auth.uid()` to see the current user
- **Quick fix**: Temporarily check policies with `SELECT * FROM profiles WHERE id = 'user-uuid'`
- **Common mistake**: Forgot to set `role` in profiles — the role-based policies need it

## Supabase Client Not Working in Server Components
- **Symptom**: `cookies() can only be called in a Server Component` error
- **Cause**: Importing the server client in a Client Component
- **Fix**: Use `createBrowserSupabaseClient()` from `src/lib/supabase/client.ts` in Client Components

## "Module not found" Errors
- **Cause**: Missing `@/` path alias or wrong import path
- **Fix**: Check `tsconfig.json` has `"@/*": ["./src/*"]` in paths
- **Cause**: Component not installed
- **Fix**: `npx shadcn@latest add [component-name]`

## Running Out of Time
- At **3 hours** behind: Cut to Tier 1 only. Make sure auth + CRUD + seed data + landing page work.
- At **4 hours** behind: Ensure whatever is built is deployed and working. Record video with what you have.
- **Never sacrifice**: auth, seed data, a working deploy, or the demo video for one more feature.

## Git Merge Conflict
- Since you're the only developer, conflicts are rare
- If they happen: `git checkout --theirs .` to accept branch changes (your latest work)
- Or manually resolve by keeping the newer code

## Vercel Deploy Stuck
- Check Vercel dashboard for build logs
- If stuck for >5 min, cancel and redeploy
- If repeated failures: check that `npm run build` passes locally first
