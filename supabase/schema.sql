-- QuickClean Database Schema

-- Enable Realtime for requests table
-- Note: You should enable this in the Supabase Dashboard under Database > Replication

-- 1. Create Garbage Types Enum
CREATE TYPE garbage_type AS ENUM ('Wet', 'Dry', 'Mixed', 'Recyclable', 'E-Waste');

-- 2. Create Request Status Enum
CREATE TYPE request_status AS ENUM ('Pending', 'Accepted', 'In Progress', 'Completed', 'Cancelled');

-- 3. Create Requests Table
CREATE TABLE IF NOT EXISTS public.requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
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
    worker_id UUID, -- References auth.users or a workers table
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Create Notifications Table
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    request_id UUID REFERENCES public.requests(id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    type TEXT, -- 'email', 'sms', 'toast'
    sent_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. Row Level Security (RLS) Policies

-- Enable RLS on requests
ALTER TABLE public.requests ENABLE ROW LEVEL SECURITY;

-- Users can view their own requests
CREATE POLICY "Users can view own requests" ON public.requests
    FOR SELECT USING (auth.uid() = user_id);

-- Users can insert their own requests
CREATE POLICY "Users can insert own requests" ON public.requests
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own requests (e.g. for feedback or cancellation)
CREATE POLICY "Users can update own requests" ON public.requests
    FOR UPDATE USING (auth.uid() = user_id);

-- Enable RLS on notifications
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own notifications" ON public.notifications
    FOR SELECT USING (auth.uid() = user_id);

-- 6. Storage Bucket for Garbage Photos
-- (Manual setup required in Supabase Dashboard: created "garbage-photos" bucket)
-- Also need policies for the storage bucket:
-- CREATE POLICY "Users can upload their own photos" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'garbage-photos');
-- CREATE POLICY "Allow public read access to photos" ON storage.objects FOR SELECT USING (bucket_id = 'garbage-photos');
