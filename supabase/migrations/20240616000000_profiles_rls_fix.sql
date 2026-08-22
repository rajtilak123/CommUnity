-- Migration Phase 6 Patch: Fix public.profiles RLS Policy Infinite Recursion
-- This patch drops all recursive policies and replaces them with secure, non-recursive ones using SECURITY DEFINER helpers.

BEGIN;

-- ==========================================
-- 1. CLEANUP RECURSIVE POLICIES
-- ==========================================
DROP POLICY IF EXISTS "Admins can view profiles in their society" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update profiles in their society" ON public.profiles;
DROP POLICY IF EXISTS "Allow authenticated users to view profiles in same society" ON public.profiles;

-- ==========================================
-- 2. CREATE NEW NON-RECURSIVE SELECT POLICY
-- ==========================================
-- Allows any authenticated user (both resident and admin) to view profiles belonging to their same society.
-- Uses public.get_auth_society_id() which is SECURITY DEFINER, preventing infinite RLS recursion.
CREATE POLICY "Allow authenticated users to view profiles in same society"
  ON public.profiles FOR SELECT TO authenticated
  USING (
    society_id = public.get_auth_society_id()
  );

-- ==========================================
-- 3. CREATE NEW NON-RECURSIVE UPDATE POLICY FOR ADMINS
-- ==========================================
-- Allows admins to update profile records within their own society (approvals, role adjustments, suspension).
-- Uses public.is_admin() and public.get_auth_society_id() which are SECURITY DEFINER, preventing RLS recursion.
CREATE POLICY "Admins can update profiles in their society"
  ON public.profiles FOR UPDATE TO authenticated
  USING (
    public.is_admin()
    AND society_id = public.get_auth_society_id()
  )
  WITH CHECK (
    public.is_admin()
    AND society_id = public.get_auth_society_id()
  );

COMMIT;
