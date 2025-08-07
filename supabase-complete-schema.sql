-- FadeUp Complete Database Schema
-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
-- For robust geospatial queries at scale (enable in Supabase Dashboard > Extensions if needed)
-- CREATE EXTENSION IF NOT EXISTS "postgis";

-- TABLE: public.users - Stores custom user profiles and links to Supabase Auth
CREATE TABLE public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  email TEXT UNIQUE NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('customer', 'shopkeeper')),
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  phone_number TEXT, -- User's primary contact number
  shop_id UUID, -- References public.shops(id), will be added after shops table creation
  avatar_url TEXT, -- URL to user's profile image
  expo_push_token TEXT -- Stores Expo Push Notification token for user's device
);

-- TABLE: public.shops - Stores comprehensive information about barber shops
CREATE TABLE public.shops (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  description TEXT,
  owner_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  latitude NUMERIC(9,6) NOT NULL, -- Latitude of shop location
  longitude NUMERIC(9,6) NOT NULL, -- Longitude of shop location
  phone_number TEXT, -- Shop's direct contact phone number
  social_instagram TEXT, -- URL or handle for Instagram
  social_facebook TEXT, -- URL or handle for Facebook
  website_url TEXT, -- Optional URL for shop's website
  image_url TEXT, -- URL for shop's main banner image
  average_rating NUMERIC(2,1), -- Stores computed average rating (1.0-5.0)
  opening_hours_json JSONB DEFAULT '{}'::jsonb -- Flexible storage for daily opening/closing times
);

-- Add foreign key constraint for shop_id in users table
ALTER TABLE public.users ADD CONSTRAINT users_shop_id_fkey 
  FOREIGN KEY (shop_id) REFERENCES public.shops(id) ON DELETE SET NULL;

-- TABLE: public.services - Stores specific services offered by shops
CREATE TABLE public.services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  shop_id UUID NOT NULL REFERENCES public.shops(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  price NUMERIC(10,2) NOT NULL,
  duration INTEGER NOT NULL, -- Service duration in minutes
  description TEXT
);

-- TABLE: public.bookings - Stores detailed customer booking appointments
CREATE TABLE public.bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  customer_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  shop_id UUID NOT NULL REFERENCES public.shops(id) ON DELETE CASCADE,
  service_ids TEXT[] NOT NULL, -- Array of UUID strings referencing services.id
  booking_date DATE NOT NULL,
  slot_time TEXT NOT NULL, -- E.g., 'HH:MM' string
  total_price NUMERIC(10,2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'in_progress', 'completed', 'cancelled')),
  notes TEXT -- Notes or special requests from the customer at booking time
);

-- TABLE: public.queue - Manages the real-time live queue for shops
CREATE TABLE public.queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  booking_id UUID UNIQUE NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
  customer_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  shop_id UUID NOT NULL REFERENCES public.shops(id) ON DELETE CASCADE,
  position INTEGER NOT NULL, -- Current position in queue
  status TEXT NOT NULL DEFAULT 'waiting' CHECK (status IN ('waiting', 'in_progress', 'ready_next', 'completed', 'skipped')),
  estimated_completion_time TIMESTAMPTZ, -- Estimated time when this customer's service will be completed
  in_progress_start_time TIMESTAMPTZ -- Timestamp for when status changed to 'in_progress'
);

-- Add unique constraint for shop position (for active queue items)
ALTER TABLE public.queue ADD CONSTRAINT unique_shop_position UNIQUE (shop_id, position);

-- TABLE: public.feedback - Stores customer feedback/reviews for shops/bookings
CREATE TABLE public.feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  booking_id UUID UNIQUE NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
  customer_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  shop_id UUID NOT NULL REFERENCES public.shops(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5), -- Rating from 1 to 5 stars
  comment TEXT,
  submitted_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shops ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;

-- RLS POLICIES FOR USERS TABLE
CREATE POLICY "Users can read their own profile" ON public.users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile on signup" ON public.users
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.users
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Shopkeepers can read customer profiles for their bookings" ON public.users
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.bookings 
            WHERE public.bookings.shop_id IN (SELECT id FROM public.shops WHERE owner_id = auth.uid()) 
            AND public.bookings.customer_id = id)
  );

-- RLS POLICIES FOR SHOPS TABLE
CREATE POLICY "Anyone authenticated can read all shops" ON public.shops
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Shop owners can manage their own shop" ON public.shops
  FOR ALL USING (auth.uid() = owner_id);

-- RLS POLICIES FOR SERVICES TABLE
CREATE POLICY "Anyone authenticated can read all services" ON public.services
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Shop owners can manage services for their shop" ON public.services
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.shops 
            WHERE public.shops.id = shop_id 
            AND public.shops.owner_id = auth.uid())
  );

-- RLS POLICIES FOR BOOKINGS TABLE
CREATE POLICY "Customers can manage their own bookings" ON public.bookings
  FOR ALL USING (auth.uid() = customer_id);

CREATE POLICY "Shopkeepers can view/update bookings for their shop" ON public.bookings
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.shops 
            WHERE public.shops.id = shop_id 
            AND public.shops.owner_id = auth.uid())
  );

-- RLS POLICIES FOR QUEUE TABLE
CREATE POLICY "Customers can read their own queue entry" ON public.queue
  FOR SELECT USING (auth.uid() = customer_id);

CREATE POLICY "Customers can insert their own queue entry" ON public.queue
  FOR INSERT WITH CHECK (auth.uid() = customer_id);

CREATE POLICY "Shopkeepers can manage their shop's queue" ON public.queue
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.shops 
            WHERE public.shops.id = shop_id 
            AND public.shops.owner_id = auth.uid())
  );

-- RLS POLICIES FOR FEEDBACK TABLE
CREATE POLICY "Customers can insert feedback for their completed bookings" ON public.feedback
  FOR INSERT WITH CHECK (
    auth.uid() = customer_id AND
    EXISTS (SELECT 1 FROM public.bookings 
            WHERE id = booking_id 
            AND customer_id = auth.uid() 
            AND status = 'completed')
  );

CREATE POLICY "Anyone authenticated can read feedback" ON public.feedback
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Customers can update their own feedback" ON public.feedback
  FOR UPDATE USING (auth.uid() = customer_id);

-- DATABASE FUNCTIONS

-- Function to calculate distance between two points (Haversine formula)
CREATE OR REPLACE FUNCTION calculate_distance(lat1 float, lon1 float, lat2 float, lon2 float)
RETURNS float AS $$
DECLARE
    r float = 6371; -- Earth's radius in kilometers
    dlat float;
    dlon float;
    a float;
    c float;
BEGIN
    dlat = radians(lat2 - lat1);
    dlon = radians(lon2 - lon1);
    a = sin(dlat/2) * sin(dlat/2) + cos(radians(lat1)) * cos(radians(lat2)) * sin(dlon/2) * sin(dlon/2);
    c = 2 * atan2(sqrt(a), sqrt(1-a));
    RETURN r * c;
END;
$$ LANGUAGE plpgsql;

-- Function to update shop average rating
CREATE OR REPLACE FUNCTION update_shop_average_rating()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.shops
    SET average_rating = (
        SELECT AVG(rating)::NUMERIC(2,1)
        FROM public.feedback
        WHERE shop_id = COALESCE(NEW.shop_id, OLD.shop_id)
    )
    WHERE id = COALESCE(NEW.shop_id, OLD.shop_id);
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update shop average rating when feedback is added/updated/deleted
CREATE TRIGGER trigger_update_shop_rating
    AFTER INSERT OR UPDATE OR DELETE ON public.feedback
    FOR EACH ROW
    EXECUTE FUNCTION update_shop_average_rating();

-- Function to get next queue position for a shop
CREATE OR REPLACE FUNCTION get_next_queue_position(shop_uuid UUID)
RETURNS INTEGER AS $$
DECLARE
    next_position INTEGER;
BEGIN
    SELECT COALESCE(MAX(position), 0) + 1
    INTO next_position
    FROM public.queue
    WHERE shop_id = shop_uuid 
    AND status IN ('waiting', 'ready_next', 'in_progress');
    
    RETURN next_position;
END;
$$ LANGUAGE plpgsql;

-- SAMPLE DATA (Optional - for testing)

-- Sample shopkeeper user
INSERT INTO auth.users (id, email, encrypted_password, created_at, updated_at, email_confirmed_at)
VALUES (
  'f47ac10b-58cc-4372-a567-0e02b2c3d479',
  'shopkeeper@fadeup.com',
  crypt('password123', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.users (id, email, role, first_name, last_name, phone_number, created_at)
VALUES (
  'f47ac10b-58cc-4372-a567-0e02b2c3d479',
  'shopkeeper@fadeup.com',
  'shopkeeper',
  'John',
  'Barber',
  '+1234567890',
  NOW()
) ON CONFLICT (id) DO NOTHING;

-- Sample customer user
INSERT INTO auth.users (id, email, encrypted_password, created_at, updated_at, email_confirmed_at)
VALUES (
  'f47ac10b-58cc-4372-a567-0e02b2c3d480',
  'customer@fadeup.com',
  crypt('password123', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.users (id, email, role, first_name, last_name, phone_number, created_at)
VALUES (
  'f47ac10b-58cc-4372-a567-0e02b2c3d480',
  'customer@fadeup.com',
  'customer',
  'Jane',
  'Smith',
  '+1234567891',
  NOW()
) ON CONFLICT (id) DO NOTHING;

-- Sample shop
INSERT INTO public.shops (id, name, address, description, owner_id, latitude, longitude, phone_number, social_instagram, social_facebook, website_url, opening_hours_json, created_at)
VALUES (
  'a47ac10b-58cc-4372-a567-0e02b2c3d481',
  'Premium Cuts Barbershop',
  '123 Main Street, Downtown',
  'Professional barbershop with experienced stylists offering traditional and modern cuts.',
  'f47ac10b-58cc-4372-a567-0e02b2c3d479',
  40.7128,
  -74.0060,
  '+1234567892',
  'premiumcuts_barber',
  'PremiumCutsBarbershop',
  'https://premiumcuts.com',
  '{"Mon": "09:00-18:00", "Tue": "09:00-18:00", "Wed": "09:00-18:00", "Thu": "09:00-18:00", "Fri": "09:00-20:00", "Sat": "08:00-17:00", "Sun": "Closed"}',
  NOW()
) ON CONFLICT (id) DO NOTHING;

-- Update shopkeeper's shop_id
UPDATE public.users 
SET shop_id = 'a47ac10b-58cc-4372-a567-0e02b2c3d481' 
WHERE id = 'f47ac10b-58cc-4372-a567-0e02b2c3d479';

-- Sample services
INSERT INTO public.services (id, shop_id, name, price, duration, description, created_at)
VALUES 
  ('b47ac10b-58cc-4372-a567-0e02b2c3d481', 'a47ac10b-58cc-4372-a567-0e02b2c3d481', 'Classic Haircut', 25.00, 30, 'Traditional scissor cut with styling'),
  ('b47ac10b-58cc-4372-a567-0e02b2c3d482', 'a47ac10b-58cc-4372-a567-0e02b2c3d481', 'Beard Trim', 15.00, 20, 'Professional beard trimming and shaping'),
  ('b47ac10b-58cc-4372-a567-0e02b2c3d483', 'a47ac10b-58cc-4372-a567-0e02b2c3d481', 'Hot Towel Shave', 35.00, 45, 'Luxurious straight razor shave with hot towel treatment'),
  ('b47ac10b-58cc-4372-a567-0e02b2c3d484', 'a47ac10b-58cc-4372-a567-0e02b2c3d481', 'Hair Wash & Style', 20.00, 25, 'Professional hair wash and styling')
ON CONFLICT (id) DO NOTHING;

-- Sample booking
INSERT INTO public.bookings (id, customer_id, shop_id, service_ids, booking_date, slot_time, total_price, status, notes, created_at)
VALUES (
  'c47ac10b-58cc-4372-a567-0e02b2c3d481',
  'f47ac10b-58cc-4372-a567-0e02b2c3d480',
  'a47ac10b-58cc-4372-a567-0e02b2c3d481',
  ARRAY['b47ac10b-58cc-4372-a567-0e02b2c3d481', 'b47ac10b-58cc-4372-a567-0e02b2c3d482'],
  CURRENT_DATE + INTERVAL '1 day',
  '10:00',
  40.00,
  'confirmed',
  'Please take extra care with the beard trim',
  NOW()
) ON CONFLICT (id) DO NOTHING;

-- Sample queue entry
INSERT INTO public.queue (id, booking_id, customer_id, shop_id, position, status, created_at)
VALUES (
  'd47ac10b-58cc-4372-a567-0e02b2c3d481',
  'c47ac10b-58cc-4372-a567-0e02b2c3d481',
  'f47ac10b-58cc-4372-a567-0e02b2c3d480',
  'a47ac10b-58cc-4372-a567-0e02b2c3d481',
  1,
  'waiting',
  NOW()
) ON CONFLICT (id) DO NOTHING;

-- IMPORTANT: Manually enable Realtime for the queue table in Supabase Dashboard
-- Go to Database > Realtime and toggle ON for 'public.queue' table
