-- IPGKPP Parcel Management System - Supabase Schema Setup
-- Run this SQL in your Supabase SQL Editor to create required tables and columns
-- Project: https://app.supabase.com/projects/xlsosjhrqyjroipowwdq

-- ===== Create Users Table =====
-- Stores user accounts for login
CREATE TABLE IF NOT EXISTS public.users (
  id serial PRIMARY KEY,
  username text UNIQUE NOT NULL,
  email text UNIQUE NOT NULL,
  password text NOT NULL,
  name text,
  id_no text,
  phone text,
  role text NOT NULL DEFAULT 'student' CHECK (role IN ('student', 'staff', 'admin')),
  profile_pic text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- ===== Create Parcels Table =====
-- Stores parcel records
CREATE TABLE IF NOT EXISTS public.parcels (
  id bigint PRIMARY KEY,
  trackingNo text,
  sender text,
  recipient text,
  status text,
  dateReceived date,
  location text,
  description text,
  otp text,
  rackLocation text,
  weight text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Run this once if the parcels table already exists with serial/integer id.
ALTER TABLE public.parcels ALTER COLUMN id TYPE bigint;

-- ===== Create Racks Table =====
-- Stores rack configuration (JSON structure with all shelves)
-- ID=1 is used as the singleton config row
CREATE TABLE IF NOT EXISTS public.racks (
  id integer PRIMARY KEY,
  rack_data jsonb NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- ===== Optional: Insert default rack configuration =====
-- Uncomment to seed default racks if table is empty
/*
INSERT INTO public.racks (id, rack_data, updated_at)
VALUES (1, '[{"id":"RACK-A","letter":"A","shelves":[{"id":"A-1","status":"empty","parcelId":null,"weight":0,"maxWeight":10,"ledColor":"green","maintenance":false,"maintenanceReason":"","maintenanceDate":null},{"id":"A-2","status":"empty","parcelId":null,"weight":0,"maxWeight":10,"ledColor":"green","maintenance":false,"maintenanceReason":"","maintenanceDate":null},{"id":"A-3","status":"empty","parcelId":null,"weight":0,"maxWeight":10,"ledColor":"green","maintenance":false,"maintenanceReason":"","maintenanceDate":null},{"id":"A-4","status":"empty","parcelId":null,"weight":0,"maxWeight":10,"ledColor":"green","maintenance":false,"maintenanceReason":"","maintenanceDate":null},{"id":"A-5","status":"empty","parcelId":null,"weight":0,"maxWeight":10,"ledColor":"green","maintenance":false,"maintenanceReason":"","maintenanceDate":null}]},{"id":"RACK-B","letter":"B","shelves":[{"id":"B-1","status":"empty","parcelId":null,"weight":0,"maxWeight":10,"ledColor":"green","maintenance":false,"maintenanceReason":"","maintenanceDate":null},{"id":"B-2","status":"empty","parcelId":null,"weight":0,"maxWeight":10,"ledColor":"green","maintenance":false,"maintenanceReason":"","maintenanceDate":null},{"id":"B-3","status":"empty","parcelId":null,"weight":0,"maxWeight":10,"ledColor":"green","maintenance":false,"maintenanceReason":"","maintenanceDate":null},{"id":"B-4","status":"empty","parcelId":null,"weight":0,"maxWeight":10,"ledColor":"green","maintenance":false,"maintenanceReason":"","maintenanceDate":null},{"id":"B-5","status":"empty","parcelId":null,"weight":0,"maxWeight":10,"ledColor":"green","maintenance":false,"maintenanceReason":"","maintenanceDate":null}]},{"id":"RACK-C","letter":"C","shelves":[{"id":"C-1","status":"empty","parcelId":null,"weight":0,"maxWeight":10,"ledColor":"green","maintenance":false,"maintenanceReason":"","maintenanceDate":null},{"id":"C-2","status":"empty","parcelId":null,"weight":0,"maxWeight":10,"ledColor":"green","maintenance":false,"maintenanceReason":"","maintenanceDate":null},{"id":"C-3","status":"empty","parcelId":null,"weight":0,"maxWeight":10,"ledColor":"green","maintenance":false,"maintenanceReason":"","maintenanceDate":null},{"id":"C-4","status":"empty","parcelId":null,"weight":0,"maxWeight":10,"ledColor":"green","maintenance":false,"maintenanceReason":"","maintenanceDate":null},{"id":"C-5","status":"empty","parcelId":null,"weight":0,"maxWeight":10,"ledColor":"green","maintenance":false,"maintenanceReason":"","maintenanceDate":null}]}]'::jsonb, now())
ON CONFLICT (id) DO UPDATE SET rack_data = EXCLUDED.rack_data, updated_at = now();
*/

-- ===== OPTIONAL: Legacy helper tables (if migrating from older schema) =====
CREATE TABLE IF NOT EXISTS public.profiles (
  username text PRIMARY KEY,
  auth_user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  email text UNIQUE NOT NULL,
  name text NOT NULL,
  id_no text,
  phone text,
  role text NOT NULL DEFAULT 'student' CHECK (role IN ('student', 'staff', 'admin')),
  profile_pic text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.app_state (
  id text PRIMARY KEY,
  value jsonb NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- ===== Row Level Security (Optional) =====
-- If you want to enable RLS, uncomment policies below:
-- ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.parcels ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.racks ENABLE ROW LEVEL SECURITY;

-- Example policies for anon access (remove or modify based on your security needs):
-- CREATE POLICY "public_users_read" ON public.users FOR SELECT USING (true);
-- CREATE POLICY "public_parcels_read" ON public.parcels FOR SELECT USING (true);
-- CREATE POLICY "public_racks_read" ON public.racks FOR SELECT USING (true);
