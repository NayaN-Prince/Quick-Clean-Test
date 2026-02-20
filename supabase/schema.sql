-- QuickClean Database Schema

-- Enable Realtime for requests table
-- Note: You should enable this in the Supabase Dashboard under Database > Replication

-- 1. Create Garbage Types Enum
CREATE TYPE garbage_type AS ENUM ('Wet', 'Dry', 'Mixed', 'Recyclable', 'E-Waste');

-- 2. Create Request Status Enum
CREATE TYPE request_status AS ENUM ('Pending', 'Accepted', 'In Progress', 'Completed', 'Cancelled');

-- 3. Create Profiles Table (to manage roles and user info)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    name TEXT,
    email TEXT,
    role TEXT DEFAULT 'user',
    mobile_contact TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Create Requests Table
CREATE TABLE IF NOT EXISTS public.requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    garbage_type garbage_type NOT NULL,
    weight_kg DECIMAL NOT NULL,
    address TEXT NOT NULL,
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    image_url TEXT,
    preferred_date DATE,
    preferred_time TIME,
    mobile_contact TEXT,
    estimated_price DECIMAL,
    after_image_url TEXT,
    completion_time_minutes INTEGER,
    final_earning DECIMAL,
    status request_status DEFAULT 'Pending',
    worker_id UUID REFERENCES public.profiles(id), 
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. Create Notifications Table
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    request_id UUID REFERENCES public.requests(id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    type TEXT, -- 'email', 'sms', 'toast'
    sent_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. Trigger to sync profiles with auth.users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, name, email, role)
    VALUES (
        new.id,
        new.raw_user_meta_data->>'name',
        new.email,
        COALESCE(new.raw_user_meta_data->>'role', 'user')
    );
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 7. Row Level Security (RLS) Policies

-- ALL TABLES ENABLE RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Profiles Policies
CREATE POLICY "Public profile access" ON public.profiles
    FOR SELECT USING (true); -- Everyone can see basic profile info for joins

CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

-- Requests Policies
CREATE POLICY "Users can view own requests" ON public.requests
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Workers can view pending requests" ON public.requests
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role = 'worker'
        ) AND status = 'Pending'
    );

CREATE POLICY "Workers can view assigned requests" ON public.requests
    FOR SELECT USING (auth.uid() = worker_id);

CREATE POLICY "Admins can view all requests" ON public.requests
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

CREATE POLICY "Users can insert own requests" ON public.requests
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins/Workers can update requests" ON public.requests
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND (role = 'admin' OR role = 'worker')
        )
    );

CREATE POLICY "Users can update own requests" ON public.requests
    FOR UPDATE USING (auth.uid() = user_id);

-- Notifications Policies
CREATE POLICY "Users can view own notifications" ON public.notifications
    FOR SELECT USING (auth.uid() = user_id);

-- 6. Storage Bucket for Garbage Photos
-- (Manual setup required in Supabase Dashboard: created "garbage-photos" bucket)
-- Also need policies for the storage bucket:
-- CREATE POLICY "Users can upload their own photos" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'garbage-photos');
-- CREATE POLICY "Allow public read access to photos" ON storage.objects FOR SELECT USING (bucket_id = 'garbage-photos');
-- 1. FOOLPROOF ROLE FIX: Set your role specifically by your email
-- This ensures the ID is correct even if 'auth.uid()' behaves differently in the editor
UPDATE public.profiles 
SET role = 'admin' 
WHERE email = 'panurgicnetizen@gmail.com';

-- 2. ROBUST UPDATE POLICY:
-- This version checks BOTH the profiles table AND your Auth metadata (JWT).
-- If either says you are an admin, the update is allowed.
DROP POLICY IF EXISTS "Admins/Workers can update requests" ON public.requests;

CREATE POLICY "Admins/Workers can update requests" ON public.requests
    FOR UPDATE 
    USING (
        (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin' 
        OR 
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND (role = 'admin' OR role = 'worker')
        )
    )
    WITH CHECK (
        (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin' 
        OR 
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND (role = 'admin' OR role = 'worker')
        )
    );

-- 3. REMOVE CONFLICTS:
-- Temporarily disable the 'Users can update own requests' to ensure it doesn't interfere
-- (We will rely on the admin policy above which is broader)
DROP POLICY IF EXISTS "Users can update own requests" ON public.requests;