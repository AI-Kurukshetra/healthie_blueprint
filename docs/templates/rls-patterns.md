# RLS Policy Patterns

## Pattern 1 — User Owns Their Data
Use when each row belongs to exactly one user. Most common pattern.

```sql
CREATE POLICY "Users can view own data" ON public.{table}
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own data" ON public.{table}
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own data" ON public.{table}
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own data" ON public.{table}
  FOR DELETE USING (auth.uid() = user_id);
```

**Used for**: profiles (update), patient_details (update), provider_details (update)

## Pattern 2 — Public Read, Owner Write
Use when data should be readable by all authenticated users but only editable by the owner.

```sql
CREATE POLICY "Authenticated can view" ON public.{table}
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Owner can modify" ON public.{table}
  FOR ALL USING (auth.uid() = user_id);
```

**Used for**: profiles (select), provider_details (select), availability

## Pattern 3 — Workspace/Team
Use when rows belong to a workspace and team members share access.

```sql
CREATE POLICY "Team members can view" ON public.{table}
  FOR SELECT USING (
    auth.uid() IN (
      SELECT user_id FROM public.workspace_members
      WHERE workspace_id = {table}.workspace_id
    )
  );
```

**Not used in CareSync** (no multi-tenancy), but available if needed.

## Pattern 4 — Role-Based Access (CareSync primary pattern)
Use when different roles have different access levels to the same data.

```sql
-- Admins see everything
CREATE POLICY "Admin full access" ON public.{table}
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Providers see data related to their patients
CREATE POLICY "Provider sees assigned data" ON public.{table}
  FOR SELECT USING (
    auth.uid() = provider_id
    OR EXISTS (
      SELECT 1 FROM public.appointments
      WHERE appointments.patient_id = {table}.patient_id
      AND appointments.provider_id = auth.uid()
    )
  );

-- Patients see only their own data
CREATE POLICY "Patient sees own data" ON public.{table}
  FOR SELECT USING (auth.uid() = patient_id);
```

**Used for**: appointments, clinical_notes, medical_records, patient_details

## CareSync Table-to-Pattern Mapping

| Table | SELECT | INSERT | UPDATE | DELETE |
|-------|--------|--------|--------|--------|
| profiles | Pattern 2 (all auth can read) | Trigger (auto) | Pattern 1 (own) + admin | — |
| provider_details | Pattern 2 (all auth can read) | Pattern 1 (own) | Pattern 1 (own) | — |
| patient_details | Pattern 4 (role-based) | Pattern 1 (own) | Pattern 1 (own) | — |
| appointments | Pattern 4 (role-based) | Patient creates | Patient + Provider update | — |
| clinical_notes | Pattern 4 (role-based) | Provider creates | Provider (author only) | — |
| medical_records | Pattern 4 (role-based) | Provider creates | Provider updates | — |
| messages | Sender + Receiver | Sender only | Receiver (mark read) | — |
| availability | Pattern 2 (all auth) | Provider own | Provider own | Provider own |
