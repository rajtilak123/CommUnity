-- Migration Phase 8: RLS Policy Fix on invitations table
-- Substitutes direct SELECTs on the auth.users system table with public.profiles lookups.
-- This resolves the "permission denied for table users" logged by Supabase when authenticated users interact with invitations.

-- Drop existing auth.users-based invitation policies
DROP POLICY IF EXISTS "Users can view matching invitations" ON public.invitations;
DROP POLICY IF EXISTS "Users can redeem matching invitations" ON public.invitations;

-- Recreate "Users can view matching invitations" using public.profiles (O(1) indexed primary key lookup)
CREATE POLICY "Users can view matching invitations"
ON public.invitations
FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1
        FROM public.profiles p
        WHERE p.id = auth.uid()
          AND p.email = invitations.email
    )
);

-- Recreate "Users can redeem matching invitations" using public.profiles (O(1) indexed primary key lookup)
CREATE POLICY "Users can redeem matching invitations"
ON public.invitations
FOR UPDATE
TO authenticated
USING (
    EXISTS (
        SELECT 1
        FROM public.profiles p
        WHERE p.id = auth.uid()
          AND p.email = invitations.email
    )
    AND NOT is_redeemed
)
WITH CHECK (
    EXISTS (
        SELECT 1
        FROM public.profiles p
        WHERE p.id = auth.uid()
          AND p.email = invitations.email
    )
    AND is_redeemed = TRUE
    AND redeemed_by = auth.uid()
    AND redeemed_at IS NOT NULL
);
