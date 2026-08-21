
-- Asset categories enum
DO $$ BEGIN
  CREATE TYPE public.asset_category AS ENUM ('laptop','phone','tablet','monitor','peripheral','vehicle','access_card','sim','uniform','tool','other');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.asset_status AS ENUM ('available','assigned','returned','lost','damaged','retired');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.offboarding_status AS ENUM ('initiated','in_progress','clearance_pending','completed','cancelled');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.offboarding_reason AS ENUM ('resignation','termination','redundancy','retirement','end_of_contract','mutual_separation','death','other');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Add event categories for the unified timeline
ALTER TYPE public.event_category ADD VALUE IF NOT EXISTS 'asset';
ALTER TYPE public.event_category ADD VALUE IF NOT EXISTS 'offboarding';
