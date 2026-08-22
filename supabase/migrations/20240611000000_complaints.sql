-- Phase 3: Complaints module

-- ==========================================
-- PHASE 1: CLEANUP / PRE-FLIGHT DROPS
-- ==========================================

-- Drop RLS policies on storage.objects (not dropped by table cascades)
DROP POLICY IF EXISTS "Authenticated users can upload complaint images" ON storage.objects;
DROP POLICY IF EXISTS "Users can read own complaint images" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own complaint images" ON storage.objects;

-- Drop legacy tables (CASCADE drops constraints, triggers, indexes, and table RLS policies)
DROP TABLE IF EXISTS public.complaint_status_history CASCADE;
DROP TABLE IF EXISTS public.complaint_comments CASCADE;
DROP TABLE IF EXISTS public.complaint_attachments CASCADE;
DROP TABLE IF EXISTS public.complaints CASCADE;

-- Drop legacy functions
DROP FUNCTION IF EXISTS public.is_admin() CASCADE;
DROP FUNCTION IF EXISTS public.get_auth_society_id() CASCADE;
DROP FUNCTION IF EXISTS public.generate_complaint_reference() CASCADE;
DROP FUNCTION IF EXISTS public.log_complaint_status_change() CASCADE;

-- Drop legacy sequences and custom types
DROP SEQUENCE IF EXISTS public.complaint_reference_seq CASCADE;
DROP TYPE IF EXISTS public.complaint_status CASCADE;
DROP TYPE IF EXISTS public.complaint_priority CASCADE;
DROP TYPE IF EXISTS public.complaint_category CASCADE;

-- ==========================================
-- PHASE 2: ENUMS AND SEQUENCE
-- ==========================================

-- Create custom enums
CREATE TYPE public.complaint_status AS ENUM ('open', 'in_progress', 'resolved', 'closed');
CREATE TYPE public.complaint_priority AS ENUM ('low', 'medium', 'high', 'urgent');
CREATE TYPE public.complaint_category AS ENUM (
  'plumbing',
  'electrical',
  'security',
  'housekeeping',
  'parking',
  'maintenance',
  'noise',
  'amenities',
  'other'
);

-- Create reference code sequence
CREATE SEQUENCE public.complaint_reference_seq START 1000;

-- ==========================================
-- PHASE 3: TABLES
-- ==========================================

-- 3.1 Complaints Table
CREATE TABLE public.complaints (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  society_id uuid NOT NULL REFERENCES public.societies (id) ON DELETE CASCADE,
  created_by uuid NOT NULL REFERENCES public.profiles (id) ON DELETE CASCADE,
  assigned_to uuid REFERENCES public.profiles (id) ON DELETE SET NULL,
  title text NOT NULL CHECK (char_length(trim(title)) >= 3),
  description text NOT NULL CHECK (char_length(trim(description)) >= 10),
  category public.complaint_category NOT NULL DEFAULT 'other',
  priority public.complaint_priority NOT NULL DEFAULT 'medium',
  status public.complaint_status NOT NULL DEFAULT 'open',
  reference_code text NOT NULL UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 3.2 Complaint Attachments Table
CREATE TABLE public.complaint_attachments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  complaint_id uuid NOT NULL REFERENCES public.complaints (id) ON DELETE CASCADE,
  file_url text NOT NULL,
  file_name text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 3.3 Complaint Comments Table
CREATE TABLE public.complaint_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  complaint_id uuid NOT NULL REFERENCES public.complaints (id) ON DELETE CASCADE,
  author_id uuid NOT NULL REFERENCES public.profiles (id) ON DELETE CASCADE,
  content text NOT NULL CHECK (char_length(trim(content)) >= 1),
  is_internal boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 3.4 Complaint Status History Table
CREATE TABLE public.complaint_status_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  complaint_id uuid NOT NULL REFERENCES public.complaints (id) ON DELETE CASCADE,
  old_status public.complaint_status,
  new_status public.complaint_status NOT NULL,
  changed_by uuid NOT NULL REFERENCES public.profiles (id) ON DELETE CASCADE,
  note text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- ==========================================
-- PHASE 4: INDEXES
-- ==========================================

CREATE INDEX IF NOT EXISTS complaints_society_id_idx ON public.complaints (society_id);
CREATE INDEX IF NOT EXISTS complaints_created_by_idx ON public.complaints (created_by);
CREATE INDEX IF NOT EXISTS complaints_status_idx ON public.complaints (status);
CREATE INDEX IF NOT EXISTS complaints_priority_idx ON public.complaints (priority);
CREATE INDEX IF NOT EXISTS complaints_created_at_idx ON public.complaints (created_at DESC);

CREATE INDEX IF NOT EXISTS complaint_attachments_complaint_id_idx ON public.complaint_attachments (complaint_id);
CREATE INDEX IF NOT EXISTS complaint_comments_complaint_id_idx ON public.complaint_comments (complaint_id);
CREATE INDEX IF NOT EXISTS complaint_status_history_complaint_id_idx ON public.complaint_status_history (complaint_id);

-- ==========================================
-- PHASE 5: HELPER FUNCTIONS AND TRIGGERS
-- ==========================================

-- 5.1 Helper: Check if auth user is admin
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

-- 5.2 Helper: Get auth user's society ID
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

-- 5.3 Trigger Function: Generate unique reference code
CREATE OR REPLACE FUNCTION public.generate_complaint_reference()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF new.reference_code IS NULL OR new.reference_code = '' THEN
    new.reference_code := 'CMP-' || lpad(nextval('public.complaint_reference_seq')::text, 4, '0');
  END IF;
  RETURN new;
END;
$$;

-- Trigger: Generate Reference
CREATE TRIGGER complaints_generate_reference
  BEFORE INSERT ON public.complaints
  FOR EACH ROW
  EXECUTE FUNCTION public.generate_complaint_reference();

-- 5.4 Trigger Function: Handle updated_at
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  new.updated_at = now();
  RETURN new;
END;
$$;

-- Trigger: Handle updated_at
CREATE TRIGGER complaints_updated_at
  BEFORE UPDATE ON public.complaints
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- 5.5 Trigger Function: Log status history changes (Null Safe Fallback for system operations)
CREATE OR REPLACE FUNCTION public.log_complaint_status_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF tg_op = 'INSERT' THEN
    INSERT INTO public.complaint_status_history (complaint_id, old_status, new_status, changed_by, note)
    VALUES (new.id, null, new.status, new.created_by, 'Complaint created');
  ELSIF tg_op = 'UPDATE' AND old.status IS DISTINCT FROM new.status THEN
    INSERT INTO public.complaint_status_history (complaint_id, old_status, new_status, changed_by, note)
    VALUES (new.id, old.status, new.status, coalesce(auth.uid(), new.created_by), null);
  END IF;
  RETURN new;
END;
$$;

-- Trigger: Log Status Changes
CREATE TRIGGER complaints_status_history
  AFTER INSERT OR UPDATE OF status ON public.complaints
  FOR EACH ROW
  EXECUTE FUNCTION public.log_complaint_status_change();

-- ==========================================
-- PHASE 6: RLS POLICIES
-- ==========================================

-- Enable RLS
ALTER TABLE public.complaints ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.complaint_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.complaint_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.complaint_status_history ENABLE ROW LEVEL SECURITY;

-- 6.1 complaints Policies
CREATE POLICY "Residents can view own complaints"
  ON public.complaints
  FOR SELECT
  TO authenticated
  USING (created_by = auth.uid());

CREATE POLICY "Admins can view society complaints"
  ON public.complaints
  FOR SELECT
  TO authenticated
  USING (
    public.is_admin()
    AND society_id = public.get_auth_society_id()
  );

CREATE POLICY "Residents can create complaints"
  ON public.complaints
  FOR INSERT
  TO authenticated
  WITH CHECK (
    created_by = auth.uid()
    AND society_id = public.get_auth_society_id()
  );

CREATE POLICY "Admins can update society complaints"
  ON public.complaints
  FOR UPDATE
  TO authenticated
  USING (
    public.is_admin()
    AND society_id = public.get_auth_society_id()
  )
  WITH CHECK (
    public.is_admin()
    AND society_id = public.get_auth_society_id()
  );

-- 6.2 complaint_attachments Policies
CREATE POLICY "Users can view attachments on accessible complaints"
  ON public.complaint_attachments
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.complaints c
      WHERE c.id = complaint_id
        AND (
          c.created_by = auth.uid()
          OR (
            public.is_admin()
            AND c.society_id = public.get_auth_society_id()
          )
        )
    )
  );

CREATE POLICY "Residents can add attachments to own complaints"
  ON public.complaint_attachments
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.complaints c
      WHERE c.id = complaint_id
        AND c.created_by = auth.uid()
    )
  );

CREATE POLICY "Admins can add attachments to society complaints"
  ON public.complaint_attachments
  FOR INSERT
  TO authenticated
  WITH CHECK (
    public.is_admin()
    AND EXISTS (
      SELECT 1
      FROM public.complaints c
      WHERE c.id = complaint_id
        AND c.society_id = public.get_auth_society_id()
    )
  );

-- 6.3 complaint_comments Policies
CREATE POLICY "Residents can view non-internal comments on own complaints"
  ON public.complaint_comments
  FOR SELECT
  TO authenticated
  USING (
    is_internal = false
    AND EXISTS (
      SELECT 1
      FROM public.complaints c
      WHERE c.id = complaint_id
        AND c.created_by = auth.uid()
    )
  );

CREATE POLICY "Admins can view all comments on society complaints"
  ON public.complaint_comments
  FOR SELECT
  TO authenticated
  USING (
    public.is_admin()
    AND EXISTS (
      SELECT 1
      FROM public.complaints c
      WHERE c.id = complaint_id
        AND c.society_id = public.get_auth_society_id()
    )
  );

CREATE POLICY "Residents can comment on own complaints"
  ON public.complaint_comments
  FOR INSERT
  TO authenticated
  WITH CHECK (
    author_id = auth.uid()
    AND is_internal = false
    AND EXISTS (
      SELECT 1
      FROM public.complaints c
      WHERE c.id = complaint_id
        AND c.created_by = auth.uid()
    )
  );

CREATE POLICY "Admins can comment on society complaints"
  ON public.complaint_comments
  FOR INSERT
  TO authenticated
  WITH CHECK (
    author_id = auth.uid()
    AND public.is_admin()
    AND EXISTS (
      SELECT 1
      FROM public.complaints c
      WHERE c.id = complaint_id
        AND c.society_id = public.get_auth_society_id()
    )
  );

-- 6.4 complaint_status_history Policies
CREATE POLICY "Residents can view history on own complaints"
  ON public.complaint_status_history
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.complaints c
      WHERE c.id = complaint_id
        AND c.created_by = auth.uid()
    )
  );

CREATE POLICY "Admins can view history on society complaints"
  ON public.complaint_status_history
  FOR SELECT
  TO authenticated
  USING (
    public.is_admin()
    AND EXISTS (
      SELECT 1
      FROM public.complaints c
      WHERE c.id = complaint_id
        AND c.society_id = public.get_auth_society_id()
    )
  );

-- ==========================================
-- PHASE 7: STORAGE BUCKET AND STORAGE POLICIES
-- ==========================================

-- Register Storage Bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'complaint-images',
  'complaint-images',
  false,
  10485760,
  array['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif']
)
ON CONFLICT (id) DO NOTHING;

-- Storage Policies
CREATE POLICY "Authenticated users can upload complaint images"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'complaint-images'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Users can read own complaint images"
  ON storage.objects
  FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'complaint-images'
    AND (
      (storage.foldername(name))[1] = auth.uid()::text
      OR (
        public.is_admin()
        AND EXISTS (
          SELECT 1 FROM public.profiles p
          WHERE p.id::text = (storage.foldername(name))[1]
            AND p.society_id = public.get_auth_society_id()
        )
      )
    )
  );

CREATE POLICY "Users can delete own complaint images"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'complaint-images'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );
