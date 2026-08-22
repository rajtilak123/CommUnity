-- Phase 4: Notices module

-- ==========================================
-- PHASE 1: CLEANUP / PRE-FLIGHT DROPS
-- ==========================================

-- Drop RLS policies on storage.objects (not dropped by table cascades)
DROP POLICY IF EXISTS "Admins can upload notice files" ON storage.objects;
DROP POLICY IF EXISTS "Users can read notice files" ON storage.objects;
DROP POLICY IF EXISTS "Admins can delete notice files" ON storage.objects;

-- Drop legacy tables (CASCADE drops constraints, triggers, indexes, and table RLS policies)
DROP TABLE IF EXISTS public.notice_reads CASCADE;
DROP TABLE IF EXISTS public.notice_attachments CASCADE;
DROP TABLE IF EXISTS public.notices CASCADE;

-- Drop legacy custom types
DROP TYPE IF EXISTS public.notice_category CASCADE;
DROP TYPE IF EXISTS public.notice_priority CASCADE;
DROP TYPE IF EXISTS public.notice_status CASCADE;

-- ==========================================
-- PHASE 2: ENUMS & HELPER FUNCTIONS
-- ==========================================

-- Create custom enums
CREATE TYPE public.notice_category AS ENUM ('general', 'maintenance', 'event', 'billing', 'security', 'other');
CREATE TYPE public.notice_priority AS ENUM ('low', 'medium', 'high', 'urgent');
CREATE TYPE public.notice_status AS ENUM ('draft', 'published', 'archived');

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

-- Ensure handle_updated_at() trigger function exists
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  new.updated_at = now();
  RETURN new;
END;
$$;

-- ==========================================
-- PHASE 3: TABLES
-- ==========================================

-- 3.1 Notices Table
CREATE TABLE public.notices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  society_id uuid NOT NULL REFERENCES public.societies (id) ON DELETE CASCADE,
  created_by uuid NOT NULL REFERENCES public.profiles (id) ON DELETE CASCADE,
  title text NOT NULL CHECK (char_length(trim(title)) >= 3),
  content text NOT NULL CHECK (char_length(trim(content)) >= 10),
  category public.notice_category NOT NULL DEFAULT 'general',
  priority public.notice_priority NOT NULL DEFAULT 'medium',
  status public.notice_status NOT NULL DEFAULT 'draft',
  is_pinned boolean NOT NULL DEFAULT false,
  published_at timestamptz,
  expires_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT notices_expiry_check CHECK (expires_at IS NULL OR published_at IS NULL OR expires_at > published_at)
);

-- 3.2 Notice Attachments Table
CREATE TABLE public.notice_attachments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  notice_id uuid NOT NULL REFERENCES public.notices (id) ON DELETE CASCADE,
  file_url text NOT NULL,
  file_name text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 3.3 Notice Reads Table
CREATE TABLE public.notice_reads (
  notice_id uuid NOT NULL REFERENCES public.notices (id) ON DELETE CASCADE,
  profile_id uuid NOT NULL REFERENCES public.profiles (id) ON DELETE CASCADE,
  read_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (notice_id, profile_id)
);

-- ==========================================
-- PHASE 4: INDEXES
-- ==========================================

CREATE INDEX IF NOT EXISTS notices_society_id_idx ON public.notices (society_id);
CREATE INDEX IF NOT EXISTS notices_published_at_idx ON public.notices (published_at DESC);
CREATE INDEX IF NOT EXISTS notices_is_pinned_idx ON public.notices (is_pinned);
CREATE INDEX IF NOT EXISTS notice_attachments_notice_id_idx ON public.notice_attachments (notice_id);
CREATE INDEX IF NOT EXISTS notice_reads_profile_id_idx ON public.notice_reads (profile_id);

-- ==========================================
-- PHASE 5: TRIGGERS
-- ==========================================

-- Trigger: Handle updated_at
CREATE TRIGGER notices_updated_at
  BEFORE UPDATE ON public.notices
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- ==========================================
-- PHASE 6: RLS POLICIES
-- ==========================================

-- Enable RLS
ALTER TABLE public.notices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notice_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notice_reads ENABLE ROW LEVEL SECURITY;

-- 6.1 notices Policies
CREATE POLICY "Residents can view published notices"
  ON public.notices
  FOR SELECT
  TO authenticated
  USING (
    society_id = public.get_auth_society_id()
    AND status = 'published'
    AND published_at <= now()
    AND (expires_at IS NULL OR expires_at > now())
  );

CREATE POLICY "Admins can manage notices"
  ON public.notices
  FOR ALL
  TO authenticated
  USING (
    society_id = public.get_auth_society_id()
    AND public.is_admin()
  )
  WITH CHECK (
    society_id = public.get_auth_society_id()
    AND public.is_admin()
  );

-- 6.2 notice_attachments Policies
CREATE POLICY "Residents can view visible notice attachments"
  ON public.notice_attachments
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.notices n
      WHERE n.id = notice_id
        AND n.society_id = public.get_auth_society_id()
        AND n.status = 'published'
        AND n.published_at <= now()
        AND (n.expires_at IS NULL OR n.expires_at > now())
    )
  );

CREATE POLICY "Admins can manage notice attachments"
  ON public.notice_attachments
  FOR ALL
  TO authenticated
  USING (
    public.is_admin()
    AND EXISTS (
      SELECT 1 FROM public.notices n
      WHERE n.id = notice_id
        AND n.society_id = public.get_auth_society_id()
    )
  )
  WITH CHECK (
    public.is_admin()
    AND EXISTS (
      SELECT 1 FROM public.notices n
      WHERE n.id = notice_id
        AND n.society_id = public.get_auth_society_id()
    )
  );

-- 6.3 notice_reads Policies
CREATE POLICY "Users can manage own reads"
  ON public.notice_reads
  FOR ALL
  TO authenticated
  USING (profile_id = auth.uid())
  WITH CHECK (profile_id = auth.uid());

CREATE POLICY "Admins can view notice reads"
  ON public.notice_reads
  FOR SELECT
  TO authenticated
  USING (
    public.is_admin()
    AND EXISTS (
      SELECT 1 FROM public.notices n
      WHERE n.id = notice_id
        AND n.society_id = public.get_auth_society_id()
    )
  );

-- ==========================================
-- PHASE 7: STORAGE BUCKET AND STORAGE POLICIES
-- ==========================================

-- Register Storage Bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'notice-files',
  'notice-files',
  false,
  10485760,
  array['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
)
ON CONFLICT (id) DO NOTHING;

-- Storage Policies
CREATE POLICY "Admins can upload notice files"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'notice-files'
    AND public.is_admin()
    AND EXISTS (
      SELECT 1 FROM public.notices n
      WHERE n.id::text = (storage.foldername(name))[1]
        AND n.society_id = public.get_auth_society_id()
    )
  );

CREATE POLICY "Users can read notice files"
  ON storage.objects
  FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'notice-files'
    AND EXISTS (
      SELECT 1 FROM public.notices n
      WHERE n.id::text = (storage.foldername(name))[1]
        AND n.society_id = public.get_auth_society_id()
        AND (
          public.is_admin()
          OR (
            n.status = 'published'
            AND n.published_at <= now()
            AND (n.expires_at IS NULL OR n.expires_at > now())
          )
        )
    )
  );

CREATE POLICY "Admins can delete notice files"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'notice-files'
    AND public.is_admin()
    AND EXISTS (
      SELECT 1 FROM public.notices n
      WHERE n.id::text = (storage.foldername(name))[1]
        AND n.society_id = public.get_auth_society_id()
    )
  );
