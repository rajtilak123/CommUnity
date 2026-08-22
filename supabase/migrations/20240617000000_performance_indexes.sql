-- Migration Phase 7: Database Performance Index Optimization
-- Adds composite indexes to optimize multi-tenant query patterns.

CREATE INDEX IF NOT EXISTS profiles_society_role_status_idx
ON public.profiles (society_id, role, status);

CREATE INDEX IF NOT EXISTS facility_bookings_status_time_idx
ON public.facility_bookings (status, start_time, end_time);

CREATE INDEX IF NOT EXISTS notices_status_idx
ON public.notices (status);

CREATE INDEX IF NOT EXISTS notifications_user_read_idx
ON public.notifications (user_id, is_read);
