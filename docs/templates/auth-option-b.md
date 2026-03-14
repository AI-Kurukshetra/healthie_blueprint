# Auth Option B — Direct auth.users (No Profile Trigger)

## Note: CareSync uses Option A. This file is kept as reference only.

## Overview
Skip the profiles table trigger. Read user data directly from `auth.getUser()` and `user_metadata`. Create a profiles row lazily on first dashboard visit if needed.

## When to Use
Only for very simple apps where you never need to:
- List users in a table
- Join user data in queries
- Add custom fields beyond name/email

## CareSync Decision
CareSync needs profiles because:
- Three roles (patient/provider/admin) stored in profiles.role
- Provider and patient detail tables reference profiles
- RLS policies reference profiles.role
- Admin needs to list and manage all users

**→ Use Option A for this project.**
