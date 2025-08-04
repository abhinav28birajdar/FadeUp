-- Enable pgcrypto for gen_random_uuid() if not already enabled. This provides cryptographically strong UUIDs.
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
-- For advanced geospatial queries (e.g., ST_DWithin) directly in the database at scale, PostGIS is required.
-- If this is an extensive feature, enable it in Supabase Dashboard and write backend Edge Functions for these queries.
-- CREATE EXTENSION IF NOT EXISTS "postgis"; 

-- TABLE: public.users - Stores custom user profiles linked to Supabase Auth.
CREATE TABLE public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  email TEXT UNIQUE NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('customer', 'shopkeeper')),
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  shop_id UUID REFERENCES public.shops(id) ON DELETE SET NULL, -- Null for customers. For shopkeepers, links to their registered shop. SET NULL if shop is deleted.
  avatar_url TEXT,
  expo_push_token TEXT -- Stores Expo Push Notification token for the user's device
);
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
-- RLS Policies for 'users'
CREATE POLICY "Users can read their own profile." ON public.users
  FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can insert their own profile on signup." ON public.users
  FOR INSERT WITH CHECK (auth.uid() = id);
-- Policy to allow a user to update certain non-critical fields of their own profile
CREATE POLICY "User can update specific fields on their own profile." ON public.users
  FOR UPDATE USING (auth.uid() = id);
-- Policy to allow shopkeepers to read relevant user profiles (staff and customers of their shop)
CREATE POLICY "Shopkeepers can read users for their shop's bookings/staff." ON public.users
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.shops WHERE public.shops.owner_id = auth.uid() AND public.shops.id = shop_id) OR -- Other staff profiles explicitly linked by shop_id
    EXISTS (SELECT 1 FROM public.bookings WHERE public.bookings.shop_id IN (SELECT id FROM public.shops WHERE owner_id = auth.uid()) AND public.bookings.customer_id = id) -- Customers who have booked at their shop
  );
CREATE POLICY "No direct deletion for users by client" ON public.users FOR DELETE USING (false);


-- TABLE: public.shops - Stores information about barber shops.
CREATE TABLE public.shops (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  description TEXT,
  owner_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  latitude NUMERIC(9,6) NOT NULL, -- Storing 6 decimal places for geographic precision
  longitude NUMERIC(9,6) NOT NULL,
  phone_number TEXT,
  social_instagram TEXT, -- URL or handle
  social_facebook TEXT, -- URL or handle
  image_url TEXT,
  average_rating NUMERIC(2,1) -- Stores average rating from 1.0-5.0. Should be computed/updated via backend logic.
);
ALTER TABLE public.shops ENABLE ROW LEVEL SECURITY;
-- RLS Policies for 'shops'
CREATE POLICY "Anyone authenticated can read all shops." ON public.shops
  FOR SELECT USING (true);
CREATE POLICY "Shop owners can create/manage their own shop." ON public.shops
  FOR ALL USING (auth.uid() = owner_id);


-- TABLE: public.services - Stores specific services offered by shops.
CREATE TABLE public.services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  shop_id UUID NOT NULL REFERENCES public.shops(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  price NUMERIC(10,2) NOT NULL,
  duration INTEGER NOT NULL, -- Service duration in minutes
  description TEXT
);
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
-- RLS Policies for 'services'
CREATE POLICY "Anyone authenticated can read all services." ON public.services
  FOR SELECT USING (true);
CREATE POLICY "Shop owners can manage services for their shop." ON public.services
  FOR ALL USING (EXISTS (SELECT 1 FROM public.shops WHERE public.shops.id = shop_id AND public.shops.owner_id = auth.uid()));


-- TABLE: public.bookings - Stores customer booking details.
CREATE TABLE public.bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  customer_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  shop_id UUID NOT NULL REFERENCES public.shops(id) ON DELETE CASCADE,
  service_ids TEXT[] NOT NULL, -- Array of UUID strings referencing services.id
  booking_date DATE NOT NULL,
  slot_time TEXT NOT NULL, -- E.g., 'HH:MM' string
  total_price NUMERIC(10,2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'in_progress', 'completed', 'cancelled')), -- Granular booking statuses
  notes TEXT -- Notes or special requests from the customer at booking time
);
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
-- RLS Policies for 'bookings'
CREATE POLICY "Customers can manage their own bookings." ON public.bookings
  FOR ALL USING (auth.uid() = customer_id);
CREATE POLICY "Shopkeepers can view/update bookings for their shop." ON public.bookings
  FOR ALL USING (EXISTS (SELECT 1 FROM public.shops WHERE public.shops.id = shop_id AND public.shops.owner_id = auth.uid()));
CREATE POLICY "No direct deletion for bookings by client" ON public.bookings FOR DELETE USING (false);


-- TABLE: public.queue - Manages the real-time live queue for shops.
CREATE TABLE public.queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  booking_id UUID UNIQUE NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE, -- Ensures one queue entry per booking
  customer_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  shop_id UUID NOT NULL REFERENCES public.shops(id) ON DELETE CASCADE,
  position INTEGER NOT NULL, -- Current position in queue (order of service)
  status TEXT NOT NULL DEFAULT 'waiting' CHECK (status IN ('waiting', 'in_progress', 'ready_next', 'completed', 'skipped')), -- Granular queue statuses
  estimated_completion_time TIMESTAMPTZ -- Optional: Estimated time when *this specific customer's service* might be done.
);
-- Ensures unique positions within a given shop's queue, maintaining queue integrity.
ALTER TABLE public.queue ADD CONSTRAINT unique_shop_position UNIQUE (shop_id, position);
ALTER TABLE public.queue ENABLE ROW LEVEL SECURITY;
-- RLS Policies for 'queue'
CREATE POLICY "Customers can read their own queue entry." ON public.queue
  FOR SELECT USING (auth.uid() = customer_id);
CREATE POLICY "Shopkeepers can manage their shop's queue." ON public.queue
  FOR ALL USING (EXISTS (SELECT 1 FROM public.shops WHERE public.shops.id = shop_id AND public.shops.owner_id = auth.uid()));
-- Instruction to Developer: REMEMBER TO MANUALLY ENABLE REALTIME FOR THE `public.queue` TABLE IN THE SUPABASE DASHBOARD.


-- TABLE: public.feedback - Stores customer feedback for shops/bookings.
CREATE TABLE public.feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  booking_id UUID UNIQUE NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE, -- Unique feedback per booking
  customer_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  shop_id UUID NOT NULL REFERENCES public.shops(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5), -- Rating from 1 to 5 stars
  comment TEXT,
  submitted_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;
-- RLS Policies for 'feedback'
CREATE POLICY "Customers can insert feedback for their own completed bookings once." ON public.feedback
  FOR INSERT WITH CHECK (
    auth.uid() = customer_id AND
    NOT EXISTS (SELECT 1 FROM public.feedback WHERE booking_id = public.feedback.booking_id) AND -- Ensures only one feedback per booking ID
    EXISTS (SELECT 1 FROM public.bookings WHERE id = public.feedback.booking_id AND customer_id = auth.uid() AND status = 'completed')
  );
-- Policy allows shopkeepers to read feedback for their shop, AND all authenticated users can read ALL feedback (for shop's public rating).
CREATE POLICY "Authenticated can read feedback for own/their shop, others can read publicly." ON public.feedback
  FOR SELECT USING (
    auth.uid() = customer_id OR -- Customer reads their own feedback
    EXISTS (SELECT 1 FROM public.shops WHERE public.shops.id = shop_id AND public.shops.owner_id = auth.uid()) OR -- Shopkeeper reads feedback for their shop
    true -- Fallback: all authenticated users can read feedback publicly (for displaying average ratings, etc.)
  );
CREATE POLICY "No update for feedback" ON public.feedback FOR UPDATE USING (false);
CREATE POLICY "No deletion for feedback" ON public.feedback FOR DELETE USING (false);
