-- =============================================================================
-- FadeUp Database Schema - Complete Setup
-- =============================================================================
-- This file contains the complete database schema for the FadeUp application.
-- Run this file in your Supabase SQL Editor to set up the entire database.
-- =============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";

-- Set timezone
ALTER DATABASE postgres SET timezone TO 'UTC';

-- =============================================================================
-- CUSTOM TYPES
-- =============================================================================

CREATE TYPE user_role AS ENUM ('customer', 'shopkeeper');
CREATE TYPE booking_status AS ENUM ('pending', 'confirmed', 'in_progress', 'completed', 'cancelled');
CREATE TYPE queue_status AS ENUM ('waiting', 'in_service', 'ready_next', 'completed', 'skipped');

-- =============================================================================
-- TABLES
-- =============================================================================

-- Users table (extends Supabase auth.users)
CREATE TABLE public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  email TEXT UNIQUE NOT NULL,
  role user_role NOT NULL DEFAULT 'customer',
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  phone_number TEXT,
  shop_id UUID, -- References public.shops(id), added after shops table creation
  avatar_url TEXT, -- URL to user's profile image
  expo_push_token TEXT -- Stores Expo Push Notification token
);

-- Shops table
CREATE TABLE public.shops (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  address TEXT NOT NULL,
  owner_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  latitude NUMERIC(9,6) NOT NULL,
  longitude NUMERIC(9,6) NOT NULL,
  phone_number TEXT,
  email TEXT,
  social_instagram TEXT,
  social_facebook TEXT,
  website_url TEXT,
  image_url TEXT,
  images TEXT[], -- Array of additional image URLs
  average_rating NUMERIC(2,1) DEFAULT 0,
  total_ratings INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  opening_hours_json JSONB DEFAULT '{}'::jsonb -- Flexible storage for daily opening/closing times
);

-- Add foreign key constraint for shop_id in users table
ALTER TABLE public.users ADD CONSTRAINT users_shop_id_fkey 
  FOREIGN KEY (shop_id) REFERENCES public.shops(id) ON DELETE SET NULL;

-- Services table
CREATE TABLE public.services (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  shop_id UUID NOT NULL REFERENCES public.shops(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  price NUMERIC(10,2) NOT NULL,
  duration INTEGER NOT NULL, -- Service duration in minutes
  is_active BOOLEAN DEFAULT true
);

-- Bookings table
CREATE TABLE public.bookings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  customer_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  shop_id UUID NOT NULL REFERENCES public.shops(id) ON DELETE CASCADE,
  service_ids TEXT[] NOT NULL, -- Array of UUID strings referencing services.id
  booking_date DATE NOT NULL,
  slot_time TEXT NOT NULL, -- E.g., 'HH:MM' string
  total_price NUMERIC(10,2) NOT NULL,
  status booking_status NOT NULL DEFAULT 'pending',
  notes TEXT,
  estimated_duration INTEGER, -- Duration in minutes
  actual_start_time TIMESTAMPTZ,
  actual_end_time TIMESTAMPTZ
);

-- Queue table for real-time queue management
CREATE TABLE public.queue (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  booking_id UUID UNIQUE NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
  customer_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  shop_id UUID NOT NULL REFERENCES public.shops(id) ON DELETE CASCADE,
  position INTEGER NOT NULL,
  status queue_status NOT NULL DEFAULT 'waiting',
  estimated_wait_time INTEGER, -- Estimated wait time in minutes
  in_progress_start_time TIMESTAMPTZ -- Timestamp for when status changed to 'in_service'
);

-- Add unique constraint for shop position (for active queue items)
ALTER TABLE public.queue ADD CONSTRAINT unique_shop_position 
  UNIQUE (shop_id, position);

-- Feedback/Reviews table
CREATE TABLE public.feedback (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  booking_id UUID UNIQUE NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
  customer_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  shop_id UUID NOT NULL REFERENCES public.shops(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  submitted_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Notifications table
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL, -- 'booking_confirmed', 'queue_update', 'review_request', etc.
  is_read BOOLEAN DEFAULT false,
  data JSONB -- Additional data for the notification
);

-- Shop availability table
CREATE TABLE public.shop_availability (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  shop_id UUID NOT NULL REFERENCES public.shops(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  is_available BOOLEAN DEFAULT true,
  UNIQUE(shop_id, date, start_time, end_time)
);

-- =============================================================================
-- INDEXES FOR PERFORMANCE
-- =============================================================================

CREATE INDEX idx_shops_location ON public.shops USING GIST (ST_Point(longitude, latitude));
CREATE INDEX idx_shops_owner ON public.shops(owner_id);
CREATE INDEX idx_shops_active ON public.shops(is_active);
CREATE INDEX idx_services_shop ON public.services(shop_id);
CREATE INDEX idx_services_active ON public.services(is_active);
CREATE INDEX idx_bookings_customer_id ON public.bookings(customer_id);
CREATE INDEX idx_bookings_shop_id ON public.bookings(shop_id);
CREATE INDEX idx_bookings_date ON public.bookings(booking_date);
CREATE INDEX idx_bookings_status ON public.bookings(status);
CREATE INDEX idx_queue_shop_id ON public.queue(shop_id);
CREATE INDEX idx_queue_status ON public.queue(status);
CREATE INDEX idx_queue_position ON public.queue(position);
CREATE INDEX idx_queue_customer ON public.queue(customer_id);
CREATE INDEX idx_feedback_shop ON public.feedback(shop_id);
CREATE INDEX idx_feedback_customer ON public.feedback(customer_id);
CREATE INDEX idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX idx_notifications_unread ON public.notifications(user_id, is_read);
CREATE INDEX idx_notifications_type ON public.notifications(type);
CREATE INDEX idx_availability_shop_date ON public.shop_availability(shop_id, date);

-- =============================================================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================================================

-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shops ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shop_availability ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can read their own profile" ON public.users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile on signup" ON public.users
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.users
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Shopkeepers can read customer profiles for their bookings" ON public.users
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.bookings 
      WHERE public.bookings.shop_id IN (
        SELECT id FROM public.shops WHERE owner_id = auth.uid()
      ) 
      AND public.bookings.customer_id = id
    )
  );

-- Shops policies
CREATE POLICY "Anyone authenticated can read active shops" ON public.shops
  FOR SELECT USING (is_active = true);

CREATE POLICY "Shop owners can manage their own shop" ON public.shops
  FOR ALL USING (auth.uid() = owner_id);

-- Services policies
CREATE POLICY "Anyone authenticated can read active services" ON public.services
  FOR SELECT USING (is_active = true);

CREATE POLICY "Shop owners can manage services for their shop" ON public.services
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.shops 
      WHERE public.shops.id = shop_id 
      AND public.shops.owner_id = auth.uid()
    )
  );

-- Bookings policies
CREATE POLICY "Customers can manage their own bookings" ON public.bookings
  FOR ALL USING (auth.uid() = customer_id);

CREATE POLICY "Shop owners can view/update bookings for their shop" ON public.bookings
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.shops 
      WHERE public.shops.id = shop_id 
      AND public.shops.owner_id = auth.uid()
    )
  );

-- Queue policies
CREATE POLICY "Customers can read their own queue entry" ON public.queue
  FOR SELECT USING (auth.uid() = customer_id);

CREATE POLICY "Customers can insert their own queue entry" ON public.queue
  FOR INSERT WITH CHECK (auth.uid() = customer_id);

CREATE POLICY "Shopkeepers can manage their shop's queue" ON public.queue
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.shops 
      WHERE public.shops.id = shop_id 
      AND public.shops.owner_id = auth.uid()
    )
  );

-- Feedback policies
CREATE POLICY "Anyone authenticated can read feedback" ON public.feedback
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Customers can create reviews for their completed bookings" ON public.feedback
  FOR INSERT WITH CHECK (
    auth.uid() = customer_id AND
    EXISTS (
      SELECT 1 FROM public.bookings 
      WHERE id = booking_id 
      AND customer_id = auth.uid() 
      AND status = 'completed'
    )
  );

CREATE POLICY "Customers can update their own feedback" ON public.feedback
  FOR UPDATE USING (auth.uid() = customer_id);

-- Notifications policies
CREATE POLICY "Users can view their own notifications" ON public.notifications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications" ON public.notifications
  FOR UPDATE USING (auth.uid() = user_id);

-- Shop availability policies
CREATE POLICY "Anyone authenticated can view shop availability" ON public.shop_availability
  FOR SELECT TO authenticated;

CREATE POLICY "Shop owners can manage their availability" ON public.shop_availability
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.shops 
      WHERE public.shops.id = shop_id 
      AND public.shops.owner_id = auth.uid()
    )
  );

-- =============================================================================
-- FUNCTIONS AND TRIGGERS
-- =============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at columns
CREATE TRIGGER update_users_updated_at 
  BEFORE UPDATE ON public.users 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_shops_updated_at 
  BEFORE UPDATE ON public.shops 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_services_updated_at 
  BEFORE UPDATE ON public.services 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bookings_updated_at 
  BEFORE UPDATE ON public.bookings 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_queue_updated_at 
  BEFORE UPDATE ON public.queue 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

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
    a = sin(dlat/2) * sin(dlat/2) + cos(radians(lat1)) 
        * cos(radians(lat2)) * sin(dlon/2) * sin(dlon/2);
    c = 2 * atan2(sqrt(a), sqrt(1-a));
    RETURN r * c;
END;
$$ LANGUAGE plpgsql;

-- Function to get nearby shops with distances
CREATE OR REPLACE FUNCTION get_nearby_shops(
    user_lat DOUBLE PRECISION,
    user_lng DOUBLE PRECISION,
    radius_km DOUBLE PRECISION DEFAULT 10
)
RETURNS TABLE (
    id UUID,
    name TEXT,
    description TEXT,
    address TEXT,
    latitude NUMERIC(9,6),
    longitude NUMERIC(9,6),
    phone_number TEXT,
    average_rating NUMERIC(2,1),
    total_ratings INTEGER,
    distance_km DOUBLE PRECISION
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        s.id,
        s.name,
        s.description,
        s.address,
        s.latitude,
        s.longitude,
        s.phone_number,
        s.average_rating,
        s.total_ratings,
        calculate_distance(s.latitude, s.longitude, user_lat, user_lng) AS distance_km
    FROM public.shops s
    WHERE s.is_active = true
    AND calculate_distance(s.latitude, s.longitude, user_lat, user_lng) <= radius_km
    ORDER BY distance_km;
END;
$$ LANGUAGE plpgsql;

-- Function to update shop average rating
CREATE OR REPLACE FUNCTION update_shop_average_rating()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.shops
    SET 
        average_rating = (
            SELECT AVG(rating)::NUMERIC(2,1)
            FROM public.feedback
            WHERE shop_id = COALESCE(NEW.shop_id, OLD.shop_id)
        ),
        total_ratings = (
            SELECT COUNT(*)
            FROM public.feedback
            WHERE shop_id = COALESCE(NEW.shop_id, OLD.shop_id)
        )
    WHERE id = COALESCE(NEW.shop_id, OLD.shop_id);
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Trigger for updating shop ratings
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
    AND status IN ('waiting', 'ready_next', 'in_service');
    
    RETURN next_position;
END;
$$ LANGUAGE plpgsql;

-- Function to update queue positions
CREATE OR REPLACE FUNCTION update_queue_positions()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.queue 
    SET position = subquery.new_position,
        estimated_wait_time = calculate_estimated_wait_time(subquery.shop_id, subquery.new_position)
    FROM (
        SELECT id, shop_id,
               ROW_NUMBER() OVER (
                   PARTITION BY shop_id 
                   ORDER BY CASE 
                       WHEN status = 'in_service' THEN 1 
                       WHEN status = 'ready_next' THEN 2
                       WHEN status = 'waiting' THEN 3
                       ELSE 4
                   END, 
                   created_at
               ) as new_position
        FROM public.queue
        WHERE shop_id = COALESCE(NEW.shop_id, OLD.shop_id)
        AND status IN ('waiting', 'ready_next', 'in_service')
    ) as subquery
    WHERE queue.id = subquery.id;
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Trigger for updating queue positions
CREATE TRIGGER queue_position_trigger
    AFTER INSERT OR UPDATE OR DELETE ON public.queue
    FOR EACH ROW
    EXECUTE FUNCTION update_queue_positions();

-- Function to calculate estimated wait time
CREATE OR REPLACE FUNCTION calculate_estimated_wait_time(
    shop_id_param UUID,
    position_param INTEGER
)
RETURNS INTEGER AS $$
DECLARE
    avg_service_time INTEGER;
    current_queue_load INTEGER;
    estimated_time INTEGER;
BEGIN
    -- Get average service time for the shop (default to 30 minutes if no data)
    SELECT COALESCE(AVG(duration), 30)::INTEGER
    INTO avg_service_time
    FROM public.services
    WHERE shop_id = shop_id_param 
    AND is_active = true;
    
    -- Get current queue load factor (number of active services)
    SELECT COUNT(*)
    INTO current_queue_load
    FROM public.queue
    WHERE shop_id = shop_id_param
    AND status IN ('waiting', 'ready_next', 'in_service');
    
    -- Calculate estimated wait time based on position and average service time
    -- Add 5 minutes buffer between services
    estimated_time := (position_param - 1) * (avg_service_time + 5);
    
    -- Apply a load factor adjustment (longer waits when busy)
    IF current_queue_load > 5 THEN 
        estimated_time := estimated_time * 1.2;
    END IF;
    
    RETURN GREATEST(estimated_time, 0);
END;
$$ LANGUAGE plpgsql;

-- Function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.users (
        id,
        email,
        first_name,
        last_name,
        role
    )
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
        COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
        COALESCE(NEW.raw_user_meta_data->>'role', 'customer')::user_role
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user creation
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- Function to send notifications
CREATE OR REPLACE FUNCTION send_notification(
    user_id_param UUID,
    title_param TEXT,
    message_param TEXT,
    type_param TEXT,
    data_param JSONB DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    notification_id UUID;
BEGIN
    INSERT INTO public.notifications (
        user_id,
        title,
        message,
        type,
        data
    )
    VALUES (
        user_id_param,
        title_param,
        message_param,
        type_param,
        data_param
    )
    RETURNING id INTO notification_id;
    
    RETURN notification_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================================================
-- REAL-TIME SUBSCRIPTIONS
-- =============================================================================

-- Enable real-time for key tables
ALTER publication supabase_realtime ADD TABLE public.queue;
ALTER publication supabase_realtime ADD TABLE public.bookings;
ALTER publication supabase_realtime ADD TABLE public.notifications;

-- Create realtime subscriptions policies
CREATE POLICY "Enable realtime for authenticated users" ON public.queue
    FOR SELECT TO authenticated
    USING (true);

CREATE POLICY "Enable realtime for authenticated users" ON public.bookings
    FOR SELECT TO authenticated
    USING (true);

CREATE POLICY "Enable realtime for authenticated users" ON public.notifications
    FOR SELECT TO authenticated
    USING (true);

-- =============================================================================
-- PERMISSIONS
-- =============================================================================

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated;

-- =============================================================================
-- SAMPLE DATA (OPTIONAL - FOR TESTING)
-- =============================================================================

-- Uncomment the lines below to insert sample data for testing

/*
-- Sample users
INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at)
VALUES
    ('f47ac10b-58cc-4372-a567-0e02b2c3d479', 'shopkeeper@example.com', crypt('password123', gen_salt('bf')), NOW()),
    ('f47ac10b-58cc-4372-a567-0e02b2c3d480', 'customer@example.com', crypt('password123', gen_salt('bf')), NOW())
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.users (id, email, role, first_name, last_name, phone_number)
VALUES
    ('f47ac10b-58cc-4372-a567-0e02b2c3d479', 'shopkeeper@example.com', 'shopkeeper', 'John', 'Barber', '+1234567890'),
    ('f47ac10b-58cc-4372-a567-0e02b2c3d480', 'customer@example.com', 'customer', 'Jane', 'Customer', '+1234567891')
ON CONFLICT (id) DO NOTHING;

-- Sample shop
INSERT INTO public.shops (
    id, name, address, description, owner_id, 
    latitude, longitude, phone_number, 
    opening_hours_json
)
VALUES (
    'a47ac10b-58cc-4372-a567-0e02b2c3d481',
    'Classic Cuts Barbershop',
    '123 Main Street, Downtown',
    'Professional barbershop offering traditional and modern cuts.',
    'f47ac10b-58cc-4372-a567-0e02b2c3d479',
    40.7128,
    -74.0060,
    '+1234567892',
    '{"Mon": "09:00-18:00", "Tue": "09:00-18:00", "Wed": "09:00-18:00", "Thu": "09:00-18:00", "Fri": "09:00-20:00", "Sat": "08:00-17:00", "Sun": "Closed"}'
) ON CONFLICT (id) DO NOTHING;

-- Update shopkeeper's shop_id
UPDATE public.users 
SET shop_id = 'a47ac10b-58cc-4372-a567-0e02b2c3d481' 
WHERE id = 'f47ac10b-58cc-4372-a567-0e02b2c3d479';

-- Sample services
INSERT INTO public.services (shop_id, name, price, duration, description)
VALUES 
    ('a47ac10b-58cc-4372-a567-0e02b2c3d481', 'Classic Haircut', 25.00, 30, 'Traditional scissor cut with styling'),
    ('a47ac10b-58cc-4372-a567-0e02b2c3d481', 'Beard Trim', 15.00, 20, 'Professional beard trimming and shaping'),
    ('a47ac10b-58cc-4372-a567-0e02b2c3d481', 'Hair & Beard Combo', 35.00, 45, 'Complete hair and beard grooming service')
ON CONFLICT DO NOTHING;
*/

-- =============================================================================
-- DATABASE SETUP COMPLETE
-- =============================================================================
-- 
-- NEXT STEPS:
-- 1. Enable Realtime for the tables listed above in your Supabase Dashboard
-- 2. Set up your environment variables in your application
-- 3. Test the authentication flow
-- 4. Optional: Uncomment and run the sample data section for testing
-- 
-- =============================================================================
