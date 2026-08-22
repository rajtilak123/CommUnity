-- Migration Phase 6: Secure Onboarding & Residents Management (Zero-Trust)

-- 1.1 Support Resident Approval and Activation (Enum Status)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'profile_status') THEN
    CREATE TYPE public.profile_status AS ENUM ('pending', 'approved', 'rejected');
  END IF;
END$$;

-- Safely add column with default of 'approved' to auto-approve existing users
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS status public.profile_status NOT NULL DEFAULT 'approved'::public.profile_status;

-- Change default to 'pending' for future signups
ALTER TABLE public.profiles ALTER COLUMN status SET DEFAULT 'pending'::public.profile_status;

ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_active boolean NOT NULL DEFAULT true;

-- 1.2 Zero-Trust Onboarding Trigger Adjustment
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Always register new profiles as resident, pending, and unassociated (no society_id)
  INSERT INTO public.profiles (id, email, full_name, role, status, is_active, society_id)
  VALUES (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'full_name', split_part(new.email, '@', 1)),
    'resident'::public.user_role,
    'pending'::public.profile_status,
    true,
    null
  );
  RETURN new;
END;
$$;

-- Idempotently attach the trigger function to auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- 1.3 Create Invitations Schema
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'invitation_type') THEN
    CREATE TYPE public.invitation_type AS ENUM ('admin_bootstrap', 'resident_onboard');
  END IF;
END$$;

CREATE TABLE IF NOT EXISTS public.invitations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  society_id uuid NOT NULL REFERENCES public.societies(id) ON DELETE CASCADE,
  email text NOT NULL,
  type public.invitation_type NOT NULL,
  token_hash text NOT NULL UNIQUE,
  is_redeemed boolean NOT NULL DEFAULT false,
  redeemed_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  redeemed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz NOT NULL,
  created_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS invitations_token_hash_idx ON public.invitations (token_hash);

-- 1.4 RLS Policies for Profiles
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT TO authenticated
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Admins can view profiles in their society" ON public.profiles;
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

DROP POLICY IF EXISTS "Admins can update profiles in their society" ON public.profiles;
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

-- 1.5 RLS Policies for Invitations
ALTER TABLE public.invitations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can manage invitations in their society" ON public.invitations;
CREATE POLICY "Admins can manage invitations in their society"
  ON public.invitations FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles admin_profile
      WHERE admin_profile.id = auth.uid()
        AND admin_profile.role = 'admin'
        AND admin_profile.society_id = public.invitations.society_id
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles admin_profile
      WHERE admin_profile.id = auth.uid()
        AND admin_profile.role = 'admin'
        AND admin_profile.society_id = public.invitations.society_id
    )
  );

DROP POLICY IF EXISTS "Users can view matching invitations" ON public.invitations;
CREATE POLICY "Users can view matching invitations"
  ON public.invitations FOR SELECT TO authenticated
  USING (
    email = (SELECT email FROM auth.users WHERE id = auth.uid())
  );

DROP POLICY IF EXISTS "Users can redeem matching invitations" ON public.invitations;
CREATE POLICY "Users can redeem matching invitations"
  ON public.invitations FOR UPDATE TO authenticated
  USING (
    email = (SELECT email FROM auth.users WHERE id = auth.uid())
    AND NOT is_redeemed
  )
  WITH CHECK (
    email = (SELECT email FROM auth.users WHERE id = auth.uid())
    AND is_redeemed = true
    AND redeemed_by = auth.uid()
    AND redeemed_at IS NOT NULL
  );
