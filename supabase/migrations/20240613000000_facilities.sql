-- Phase 5: Facilities Booking module

-- ==========================================
-- PHASE 1: CLEANUP / PRE-FLIGHT DROPS
-- ==========================================

-- Drop RLS policies on storage.objects for facility-images
DROP POLICY IF EXISTS "Admins can upload facility images" ON storage.objects;
DROP POLICY IF EXISTS "Users can read facility images" ON storage.objects;
DROP POLICY IF EXISTS "Admins can delete facility images" ON storage.objects;

-- Drop RLS policies on public.notifications
DROP POLICY IF EXISTS "Users can view own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can update own notification read status" ON public.notifications;
DROP POLICY IF EXISTS "Admins can insert any notification" ON public.notifications;
DROP POLICY IF EXISTS "Users can insert own notifications" ON public.notifications;


-- Drop legacy triggers & views (CASCADE drops views/triggers on dependent tables)
DROP FUNCTION IF EXISTS public.check_booking_against_blocked_dates() CASCADE;
DROP VIEW IF EXISTS public.facility_availability CASCADE;

-- Drop tables (Notice: NOT dropping public.notifications, public.facilities, public.facility_blocked_dates, public.facility_bookings, or public.facility_images to prevent data loss)

-- ==========================================
-- PHASE 2: PREREQUISITES & EXTENSIONS
-- ==========================================
CREATE EXTENSION IF NOT EXISTS btree_gist;

-- Create custom enums conditionally
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'booking_status') THEN
    CREATE TYPE public.booking_status AS ENUM ('pending', 'approved', 'rejected', 'cancelled', 'completed');
  END IF;
END$$;

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

-- 3.1 Facilities Table
CREATE TABLE IF NOT EXISTS public.facilities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  society_id uuid NOT NULL REFERENCES public.societies (id) ON DELETE CASCADE,
  name text NOT NULL CHECK (char_length(trim(name)) >= 3),
  description text NOT NULL,
  rules text,
  capacity integer NOT NULL DEFAULT 1 CHECK (capacity >= 1),
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Schema-drift protection for existing facilities table
ALTER TABLE public.facilities ADD COLUMN IF NOT EXISTS rules text;
ALTER TABLE public.facilities ADD COLUMN IF NOT EXISTS capacity integer NOT NULL DEFAULT 1 CHECK (capacity >= 1);
ALTER TABLE public.facilities ADD COLUMN IF NOT EXISTS is_active boolean NOT NULL DEFAULT true;
ALTER TABLE public.facilities ADD COLUMN IF NOT EXISTS created_at timestamptz NOT NULL DEFAULT now();
ALTER TABLE public.facilities ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();

-- 3.2 Facility Images Table
CREATE TABLE IF NOT EXISTS public.facility_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  facility_id uuid NOT NULL REFERENCES public.facilities (id) ON DELETE CASCADE,
  file_url text NOT NULL,
  file_name text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 3.3 Facility Bookings Table
CREATE TABLE IF NOT EXISTS public.facility_bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  facility_id uuid NOT NULL REFERENCES public.facilities (id) ON DELETE CASCADE,
  profile_id uuid NOT NULL REFERENCES public.profiles (id) ON DELETE CASCADE,
  society_id uuid NOT NULL REFERENCES public.societies (id) ON DELETE CASCADE,
  start_time timestamptz NOT NULL,
  end_time timestamptz NOT NULL,
  status public.booking_status NOT NULL DEFAULT 'pending',
  notes text,
  admin_notes text,
  approved_by uuid REFERENCES public.profiles (id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT bookings_time_check CHECK (end_time > start_time)
);

-- Overlap Exclusion Constraint
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.tables
    WHERE table_schema='public'
      AND table_name='facility_bookings'
  ) THEN
    ALTER TABLE public.facility_bookings
    DROP CONSTRAINT IF EXISTS no_overlapping_bookings;
  END IF;
END $$;

ALTER TABLE public.facility_bookings
ADD CONSTRAINT no_overlapping_bookings
EXCLUDE USING gist (
  facility_id WITH =,
  tstzrange(start_time, end_time, '[)') WITH &&
)
WHERE (status IN ('approved', 'pending'));

-- 3.4 Facility Blocked Dates Table
CREATE TABLE IF NOT EXISTS public.facility_blocked_dates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  facility_id uuid NOT NULL REFERENCES public.facilities (id) ON DELETE CASCADE,
  start_time timestamptz NOT NULL,
  end_time timestamptz NOT NULL,
  reason text NOT NULL,
  created_by uuid NOT NULL REFERENCES public.profiles (id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT blocked_time_check CHECK (end_time > start_time)
);

-- Overlap Exclusion for blocked dates (Admins cannot overlap blocking slots on same facility)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.tables
    WHERE table_schema='public'
      AND table_name='facility_blocked_dates'
  ) THEN
    ALTER TABLE public.facility_blocked_dates
    DROP CONSTRAINT IF EXISTS no_overlapping_blocked_dates;
  END IF;
END $$;

ALTER TABLE public.facility_blocked_dates
ADD CONSTRAINT no_overlapping_blocked_dates
EXCLUDE USING gist (
  facility_id WITH =,
  tstzrange(start_time, end_time, '[)') WITH &&
);

-- 3.5 Shared Notifications Table (Idempotent Platform Creation / Column Addition)
CREATE TABLE IF NOT EXISTS public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles (id) ON DELETE CASCADE,
  title text NOT NULL,
  message text NOT NULL,
  type text NOT NULL, -- 'booking', 'complaint', 'notice'
  is_read boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Safely add link_url for booking redirection paths
ALTER TABLE public.notifications ADD COLUMN IF NOT EXISTS link_url text;

-- ==========================================
-- PHASE 4: VIEWS, TRIGGERS & INDEXES
-- ==========================================

-- 4.1 Secure public availability view (hides personal details)
CREATE OR REPLACE VIEW public.facility_availability AS
SELECT 
  id,
  facility_id,
  start_time,
  end_time,
  status
FROM public.facility_bookings
WHERE status IN ('approved', 'pending');

-- 4.2 Booking blocked date overlap trigger
CREATE OR REPLACE FUNCTION public.check_booking_against_blocked_dates()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM public.facility_blocked_dates
    WHERE facility_id = new.facility_id
      AND tstzrange(start_time, end_time, '[)') && tstzrange(new.start_time, new.end_time, '[)')
  ) THEN
    RAISE EXCEPTION 'Booking time slot overlaps with an admin blocked date range.';
  END IF;
  RETURN new;
END;
$$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 
    FROM information_schema.tables 
    WHERE table_schema='public' 
      AND table_name='facility_bookings'
  ) THEN
    DROP TRIGGER IF EXISTS check_booking_blocked_overlap ON public.facility_bookings;
  END IF;
END $$;
CREATE TRIGGER check_booking_blocked_overlap
  BEFORE INSERT OR UPDATE ON public.facility_bookings
  FOR EACH ROW
  EXECUTE FUNCTION public.check_booking_against_blocked_dates();

-- 4.3 Facility update trigger
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 
    FROM information_schema.tables 
    WHERE table_schema='public' 
      AND table_name='facilities'
  ) THEN
    DROP TRIGGER IF EXISTS facilities_updated_at ON public.facilities;
  END IF;
END $$;
CREATE TRIGGER facilities_updated_at
  BEFORE UPDATE ON public.facilities
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- 4.4 Booking update trigger
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 
    FROM information_schema.tables 
    WHERE table_schema='public' 
      AND table_name='facility_bookings'
  ) THEN
    DROP TRIGGER IF EXISTS facility_bookings_updated_at ON public.facility_bookings;
  END IF;
END $$;
CREATE TRIGGER facility_bookings_updated_at
  BEFORE UPDATE ON public.facility_bookings
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Indexes
CREATE INDEX IF NOT EXISTS facilities_society_id_idx ON public.facilities (society_id);
CREATE INDEX IF NOT EXISTS facility_images_facility_id_idx ON public.facility_images (facility_id);
CREATE INDEX IF NOT EXISTS facility_bookings_facility_id_idx ON public.facility_bookings (facility_id);
CREATE INDEX IF NOT EXISTS facility_bookings_profile_id_idx ON public.facility_bookings (profile_id);
CREATE INDEX IF NOT EXISTS facility_bookings_society_id_idx ON public.facility_bookings (society_id);
CREATE INDEX IF NOT EXISTS facility_blocked_dates_facility_id_idx ON public.facility_blocked_dates (facility_id);
CREATE INDEX IF NOT EXISTS notifications_user_id_idx ON public.notifications (user_id);

-- ==========================================
-- PHASE 5: ROW LEVEL SECURITY POLICIES
-- ==========================================

-- 5.1 Enable RLS
ALTER TABLE public.facilities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.facility_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.facility_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.facility_blocked_dates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- 5.2 public.facilities Policies
DROP POLICY IF EXISTS "Residents can view active facilities in their society" ON public.facilities;
CREATE POLICY "Residents can view active facilities in their society"
  ON public.facilities
  FOR SELECT
  TO authenticated
  USING (
    society_id = public.get_auth_society_id()
    AND is_active = true
  );

DROP POLICY IF EXISTS "Admins can manage facilities in their society" ON public.facilities;
CREATE POLICY "Admins can manage facilities in their society"
  ON public.facilities
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

-- 5.3 public.facility_images Policies
DROP POLICY IF EXISTS "Residents can view facility images in their society" ON public.facility_images;
CREATE POLICY "Residents can view facility images in their society"
  ON public.facility_images
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.facilities f
      WHERE f.id = facility_id
        AND f.society_id = public.get_auth_society_id()
    )
  );

DROP POLICY IF EXISTS "Admins can manage facility images in their society" ON public.facility_images;
CREATE POLICY "Admins can manage facility images in their society"
  ON public.facility_images
  FOR ALL
  TO authenticated
  USING (
    public.is_admin()
    AND EXISTS (
      SELECT 1 FROM public.facilities f
      WHERE f.id = facility_id
        AND f.society_id = public.get_auth_society_id()
    )
  )
  WITH CHECK (
    public.is_admin()
    AND EXISTS (
      SELECT 1 FROM public.facilities f
      WHERE f.id = facility_id
        AND f.society_id = public.get_auth_society_id()
    )
  );

-- 5.4 public.facility_bookings Policies
DROP POLICY IF EXISTS "Users can view own bookings" ON public.facility_bookings;
CREATE POLICY "Users can view own bookings"
  ON public.facility_bookings
  FOR SELECT
  TO authenticated
  USING (
    profile_id = auth.uid()
  );

DROP POLICY IF EXISTS "Users can create own bookings" ON public.facility_bookings;
CREATE POLICY "Users can create own bookings"
  ON public.facility_bookings
  FOR INSERT
  TO authenticated
  WITH CHECK (
    profile_id = auth.uid()
    AND society_id = public.get_auth_society_id()
    AND EXISTS (
      SELECT 1 FROM public.facilities f
      WHERE f.id = facility_id
        AND f.society_id = public.get_auth_society_id()
        AND f.is_active = true
    )
  );

DROP POLICY IF EXISTS "Users can cancel own pending bookings" ON public.facility_bookings;
CREATE POLICY "Users can cancel own pending bookings"
  ON public.facility_bookings
  FOR UPDATE
  TO authenticated
  USING (
    profile_id = auth.uid()
    AND status = 'pending'
  )
  WITH CHECK (
    profile_id = auth.uid()
    AND status = 'cancelled'
  );

DROP POLICY IF EXISTS "Admins can manage bookings in their society" ON public.facility_bookings;
CREATE POLICY "Admins can manage bookings in their society"
  ON public.facility_bookings
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

-- 5.5 public.facility_blocked_dates Policies
DROP POLICY IF EXISTS "Residents can view blocked dates in their society" ON public.facility_blocked_dates;
CREATE POLICY "Residents can view blocked dates in their society"
  ON public.facility_blocked_dates
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.facilities f
      WHERE f.id = facility_id
        AND f.society_id = public.get_auth_society_id()
    )
  );

DROP POLICY IF EXISTS "Admins can manage blocked dates in their society" ON public.facility_blocked_dates;
CREATE POLICY "Admins can manage blocked dates in their society"
  ON public.facility_blocked_dates
  FOR ALL
  TO authenticated
  USING (
    public.is_admin()
    AND EXISTS (
      SELECT 1 FROM public.facilities f
      WHERE f.id = facility_id
        AND f.society_id = public.get_auth_society_id()
    )
  )
  WITH CHECK (
    public.is_admin()
    AND EXISTS (
      SELECT 1 FROM public.facilities f
      WHERE f.id = facility_id
        AND f.society_id = public.get_auth_society_id()
    )
  );

-- 5.6 public.notifications Policies
DROP POLICY IF EXISTS "Users can view own notifications" ON public.notifications;
CREATE POLICY "Users can view own notifications"
  ON public.notifications
  FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid()
  );

DROP POLICY IF EXISTS "Users can update own notification read status" ON public.notifications;
CREATE POLICY "Users can update own notification read status"
  ON public.notifications
  FOR UPDATE
  TO authenticated
  USING (
    user_id = auth.uid()
  )
  WITH CHECK (
    user_id = auth.uid()
  );

DROP POLICY IF EXISTS "Admins can insert any notification" ON public.notifications;
CREATE POLICY "Admins can insert any notification"
  ON public.notifications
  FOR INSERT
  TO authenticated
  WITH CHECK (
    public.is_admin() AND
    EXISTS (
      SELECT 1
      FROM public.profiles admin_p
      JOIN public.profiles target_p ON admin_p.society_id = target_p.society_id
      WHERE admin_p.id = auth.uid()
        AND target_p.id = public.notifications.user_id
    )
  );

DROP POLICY IF EXISTS "Users can insert own notifications" ON public.notifications;
CREATE POLICY "Users can insert own notifications"
  ON public.notifications
  FOR INSERT
  TO authenticated
  WITH CHECK (
    user_id = auth.uid()
  );

-- ==========================================
-- PHASE 6: STORAGE BUCKET & STORAGE POLICIES
-- ==========================================

-- Register Storage Bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'facility-images',
  'facility-images',
  false,
  10485760,
  array['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif']
)
ON CONFLICT (id) DO NOTHING;

-- Storage Policies
DROP POLICY IF EXISTS "Admins can upload facility images" ON storage.objects;
CREATE POLICY "Admins can upload facility images"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'facility-images'
    AND public.is_admin()
    AND EXISTS (
      SELECT 1 FROM public.facilities f
      WHERE f.id::text = (storage.foldername(name))[1]
        AND f.society_id = public.get_auth_society_id()
    )
  );

DROP POLICY IF EXISTS "Users can read facility images" ON storage.objects;
CREATE POLICY "Users can read facility images"
  ON storage.objects
  FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'facility-images'
    AND EXISTS (
      SELECT 1 FROM public.facilities f
      WHERE f.id::text = (storage.foldername(name))[1]
        AND f.society_id = public.get_auth_society_id()
    )
  );

DROP POLICY IF EXISTS "Admins can delete facility images" ON storage.objects;
CREATE POLICY "Admins can delete facility images"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'facility-images'
    AND public.is_admin()
    AND EXISTS (
      SELECT 1 FROM public.facilities f
      WHERE f.id::text = (storage.foldername(name))[1]
        AND f.society_id = public.get_auth_society_id()
    )
  );
