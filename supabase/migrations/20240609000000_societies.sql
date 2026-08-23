-- Migration Phase 0: Societies table schema & RLS policies

CREATE TABLE IF NOT EXISTS public.societies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL CHECK (char_length(trim(name)) >= 1),
  address text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.societies ENABLE ROW LEVEL SECURITY;

-- Ensure get_auth_society_id() helper exists
CREATE OR REPLACE FUNCTION public.get_auth_society_id()
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT society_id
  FROM public.profiles
  WHERE id = auth.uid();
$$;

-- Ensure is_admin() helper exists
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE id = auth.uid()
      AND role = 'admin'
  );
$$;

-- RLS Policies
DROP POLICY IF EXISTS "Authenticated users can view own society" ON public.societies;
CREATE POLICY "Authenticated users can view own society"
  ON public.societies FOR SELECT TO authenticated
  USING (id = public.get_auth_society_id());

DROP POLICY IF EXISTS "Admins can update own society" ON public.societies;
CREATE POLICY "Admins can update own society"
  ON public.societies FOR UPDATE TO authenticated
  USING (
    public.is_admin()
    AND id = public.get_auth_society_id()
  )
  WITH CHECK (
    public.is_admin()
    AND id = public.get_auth_society_id()
  );
