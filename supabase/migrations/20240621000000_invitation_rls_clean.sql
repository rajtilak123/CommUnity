-- Migration Phase 10: Clean RLS and SECURITY DEFINER RPC functions for public.invitations
-- Eliminates all auth.users references and provides strict RPC-only access for unauthenticated resident validation & redemption.

BEGIN;

-- 1. Clean up all legacy and temporary policies on invitations
DROP POLICY IF EXISTS "Admins can manage invitations in their society" ON public.invitations;
DROP POLICY IF EXISTS "Users can view matching invitations" ON public.invitations;
DROP POLICY IF EXISTS "Users can redeem matching invitations" ON public.invitations;
DROP POLICY IF EXISTS "Allow admins to manage invitations" ON public.invitations;
DROP POLICY IF EXISTS "Allow invitation code lookup" ON public.invitations;

-- 2. Strictly scope table-level RLS to authenticated admins only
CREATE POLICY "Allow admins to manage invitations"
  ON public.invitations
  FOR ALL
  TO authenticated
  USING (
    public.is_admin()
    AND society_id = public.get_auth_society_id()
  )
  WITH CHECK (
    public.is_admin()
    AND society_id = public.get_auth_society_id()
  );

-- 3. Security Definer RPC for invitation code validation (used on /join Step 1)
-- Public invitations table is NOT directly readable by anon; this function returns only validation status.
CREATE OR REPLACE FUNCTION public.validate_invitation_code(p_token_hash text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_invitation record;
BEGIN
  SELECT id, society_id, type, is_redeemed, expires_at
  INTO v_invitation
  FROM public.invitations
  WHERE token_hash = p_token_hash
    AND type = 'resident_onboard'
  LIMIT 1;

  IF v_invitation.id IS NULL THEN
    RETURN jsonb_build_object('valid', false, 'error', 'Invalid invitation code');
  END IF;

  IF v_invitation.is_redeemed THEN
    RETURN jsonb_build_object('valid', false, 'error', 'This invitation code has already been used');
  END IF;

  IF v_invitation.expires_at < now() THEN
    RETURN jsonb_build_object('valid', false, 'error', 'This invitation code has expired');
  END IF;

  RETURN jsonb_build_object(
    'valid', true,
    'invitation_id', v_invitation.id,
    'society_id', v_invitation.society_id
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.validate_invitation_code(text) TO anon, authenticated;

-- 4. Security Definer RPC for atomic invitation redemption (used on /join Step 2)
CREATE OR REPLACE FUNCTION public.redeem_invitation_code(p_token_hash text, p_user_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_invitation record;
BEGIN
  UPDATE public.invitations
  SET is_redeemed = true,
      redeemed_by = p_user_id,
      redeemed_at = now()
  WHERE token_hash = p_token_hash
    AND type = 'resident_onboard'
    AND is_redeemed = false
    AND expires_at > now()
  RETURNING id, society_id INTO v_invitation;

  IF v_invitation.id IS NULL THEN
    SELECT is_redeemed, expires_at INTO v_invitation
    FROM public.invitations
    WHERE token_hash = p_token_hash
      AND type = 'resident_onboard'
    LIMIT 1;

    IF v_invitation IS NULL THEN
      RETURN jsonb_build_object('success', false, 'error', 'Invalid invitation code');
    ELSIF v_invitation.is_redeemed THEN
      RETURN jsonb_build_object('success', false, 'error', 'This invitation code has already been used');
    ELSE
      RETURN jsonb_build_object('success', false, 'error', 'This invitation code has expired');
    END IF;
  END IF;

  RETURN jsonb_build_object(
    'success', true,
    'invitation_id', v_invitation.id,
    'society_id', v_invitation.society_id
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.redeem_invitation_code(text, uuid) TO anon, authenticated;

-- 5. Security Definer RPC for atomic profile creation and invitation redemption
CREATE OR REPLACE FUNCTION public.complete_invitation_signup(
  p_token_hash text,
  p_user_id uuid,
  p_full_name text,
  p_email text,
  p_phone text,
  p_unit_label text
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_invitation record;
BEGIN
  -- 1. Atomically redeem the invitation
  UPDATE public.invitations
  SET is_redeemed = true,
      redeemed_by = p_user_id,
      redeemed_at = now()
  WHERE token_hash = p_token_hash
    AND type = 'resident_onboard'
    AND is_redeemed = false
    AND expires_at > now()
  RETURNING id, society_id INTO v_invitation;

  IF v_invitation.id IS NULL THEN
    SELECT is_redeemed, expires_at INTO v_invitation
    FROM public.invitations
    WHERE token_hash = p_token_hash
      AND type = 'resident_onboard'
    LIMIT 1;

    IF v_invitation IS NULL THEN
      RETURN jsonb_build_object('success', false, 'error', 'Invalid invitation code');
    ELSIF v_invitation.is_redeemed THEN
      RETURN jsonb_build_object('success', false, 'error', 'This invitation code has already been used');
    ELSE
      RETURN jsonb_build_object('success', false, 'error', 'This invitation code has expired');
    END IF;
  END IF;

  -- 2. Upsert profile record with approved resident role and society link
  INSERT INTO public.profiles (
    id,
    email,
    full_name,
    phone,
    unit_label,
    role,
    status,
    is_active,
    society_id,
    updated_at
  )
  VALUES (
    p_user_id,
    lower(p_email),
    p_full_name,
    p_phone,
    p_unit_label,
    'resident'::public.user_role,
    'approved'::public.profile_status,
    true,
    v_invitation.society_id,
    now()
  )
  ON CONFLICT (id) DO UPDATE
  SET email = EXCLUDED.email,
      full_name = EXCLUDED.full_name,
      phone = EXCLUDED.phone,
      unit_label = EXCLUDED.unit_label,
      role = 'resident'::public.user_role,
      status = 'approved'::public.profile_status,
      is_active = true,
      society_id = EXCLUDED.society_id,
      updated_at = now();

  RETURN jsonb_build_object(
    'success', true,
    'invitation_id', v_invitation.id,
    'society_id', v_invitation.society_id
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.complete_invitation_signup(text, uuid, text, text, text, text) TO anon, authenticated;

COMMIT;
