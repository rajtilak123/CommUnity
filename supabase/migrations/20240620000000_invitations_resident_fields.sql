-- Migration Phase 9: Add resident detail columns to public.invitations
-- Allows admin-created invitations to store the target resident's name, phone, and unit_label.

ALTER TABLE public.invitations
ADD COLUMN IF NOT EXISTS full_name text,
ADD COLUMN IF NOT EXISTS phone text,
ADD COLUMN IF NOT EXISTS unit_label text;
