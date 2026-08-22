-- Rollback Plan for Migration Phase 6 Patch: Restores recursive public.profiles policies
-- ONLY execute this if you explicitly want to restore the previous recursive policy state.

BEGIN;

-- Drop new non-recursive policies
DROP POLICY IF EXISTS "Allow authenticated users to view profiles in same society" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update profiles in their society" ON public.profiles;

-- Re-create Admins can view profiles in their society (recursive SELECT)
CREATE POLICY "Admins can view profiles in their society"
  ON public.profiles FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles admin_profile
      WHERE admin_profile.id = auth.uid()
        AND admin_profile.role = 'admin'
        AND admin_profile.society_id = public.profiles.society_id
    )
  );

-- Re-create Admins can update profiles in their society (recursive UPDATE)
CREATE POLICY "Admins can update profiles in their society"
  ON public.profiles FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles admin_profile
      WHERE admin_profile.id = auth.uid()
        AND admin_profile.role = 'admin'
        AND admin_profile.society_id = public.profiles.society_id
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles admin_profile
      WHERE admin_profile.id = auth.uid()
        AND admin_profile.role = 'admin'
        AND admin_profile.society_id = public.profiles.society_id
    )
  );

COMMIT;
