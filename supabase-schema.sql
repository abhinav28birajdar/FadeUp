-- FadeUp: Complete Barber Shop Booking Application Schema
-- Supabase PostgreSQL Database Schema with Real-time Capabilities

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";

-- Enable Row Level Security
ALTER DATABASE postgres SET timezone TO 'UTC';

-- Create enum types
CREATE TYPE user_role AS ENUM ('customer', 'shopkeeper');
CREATE TYPE booking_status AS ENUM ('pending', 'confirmed', 'in_progress', 'completed', 'cancelled');
CREATE TYPE queue_status AS ENUM ('waiting', 'in_service', 'completed', 'cancelled');

-- Users table (extends Supabase auth.users)
CREATE TABLE public.users (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    role user_role NOT NULL DEFAULT 'customer',
    phone TEXT,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    PRIMARY KEY (id)
);

-- Shops table
CREATE TABLE public.shops (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    owner_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    address TEXT NOT NULL,
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    phone TEXT,
    email TEXT,
    opening_hours JSONB, -- {"monday": {"open": "09:00", "close": "18:00", "closed": false}, ...}
    images TEXT[], -- Array of image URLs
    rating DECIMAL(2,1) DEFAULT 0,
    total_ratings INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Services table
CREATE TABLE public.services (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    shop_id UUID REFERENCES public.shops(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    duration INTEGER NOT NULL, -- Duration in minutes
    price DECIMAL(10,2) NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Bookings table
CREATE TABLE public.bookings (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    customer_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    shop_id UUID REFERENCES public.shops(id) ON DELETE CASCADE,
    service_id UUID REFERENCES public.services(id) ON DELETE CASCADE,
    booking_date DATE NOT NULL,
    booking_time TIME NOT NULL,
    status booking_status DEFAULT 'pending',
    total_price DECIMAL(10,2) NOT NULL,
    notes TEXT,
    estimated_duration INTEGER, -- Duration in minutes
    actual_start_time TIMESTAMP WITH TIME ZONE,
    actual_end_time TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Queue table for real-time queue management
CREATE TABLE public.queue (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    shop_id UUID REFERENCES public.shops(id) ON DELETE CASCADE,
    customer_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    booking_id UUID REFERENCES public.bookings(id) ON DELETE CASCADE,
    position INTEGER NOT NULL,
    status queue_status DEFAULT 'waiting',
    estimated_wait_time INTEGER, -- Estimated wait time in minutes
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Reviews table
CREATE TABLE public.reviews (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    booking_id UUID REFERENCES public.bookings(id) ON DELETE CASCADE,
    customer_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    shop_id UUID REFERENCES public.shops(id) ON DELETE CASCADE,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5) NOT NULL,
    comment TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Notifications table
CREATE TABLE public.notifications (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT NOT NULL, -- 'booking_confirmed', 'queue_update', 'review_request', etc.
    is_read BOOLEAN DEFAULT false,
    data JSONB, -- Additional data for the notification
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Shop availability table
CREATE TABLE public.shop_availability (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    shop_id UUID REFERENCES public.shops(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    is_available BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    UNIQUE(shop_id, date, start_time, end_time)
);

-- Create indexes for better performance
CREATE INDEX idx_shops_location ON public.shops USING GIST (ST_Point(longitude, latitude));
CREATE INDEX idx_bookings_customer_id ON public.bookings(customer_id);
CREATE INDEX idx_bookings_shop_id ON public.bookings(shop_id);
CREATE INDEX idx_bookings_date ON public.bookings(booking_date);
CREATE INDEX idx_queue_shop_id ON public.queue(shop_id);
CREATE INDEX idx_queue_status ON public.queue(status);
CREATE INDEX idx_queue_position ON public.queue(position);
CREATE INDEX idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX idx_notifications_unread ON public.notifications(user_id, is_read);

-- Enable Row Level Security (RLS)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shops ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shop_availability ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Users policies
CREATE POLICY "Users can view their own profile" ON public.users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.users
    FOR UPDATE USING (auth.uid() = id);

-- Shops policies
CREATE POLICY "Anyone can view active shops" ON public.shops
    FOR SELECT USING (is_active = true);

CREATE POLICY "Shop owners can manage their shops" ON public.shops
    FOR ALL USING (auth.uid() = owner_id);

-- Services policies
CREATE POLICY "Anyone can view active services" ON public.services
    FOR SELECT USING (is_active = true);

CREATE POLICY "Shop owners can manage their services" ON public.services
    FOR ALL USING (
        auth.uid() IN (
            SELECT owner_id FROM public.shops WHERE id = shop_id
        )
    );

-- Bookings policies
CREATE POLICY "Users can view their own bookings" ON public.bookings
    FOR SELECT USING (
        auth.uid() = customer_id OR 
        auth.uid() IN (
            SELECT owner_id FROM public.shops WHERE id = shop_id
        )
    );

CREATE POLICY "Customers can create bookings" ON public.bookings
    FOR INSERT WITH CHECK (auth.uid() = customer_id);

CREATE POLICY "Shop owners can update bookings for their shop" ON public.bookings
    FOR UPDATE USING (
        auth.uid() IN (
            SELECT owner_id FROM public.shops WHERE id = shop_id
        )
    );

-- Queue policies
CREATE POLICY "Users can view queue for shops they have access to" ON public.queue
    FOR SELECT USING (
        auth.uid() = customer_id OR 
        auth.uid() IN (
            SELECT owner_id FROM public.shops WHERE id = shop_id
        )
    );

CREATE POLICY "Customers can join queue" ON public.queue
    FOR INSERT WITH CHECK (auth.uid() = customer_id);

CREATE POLICY "Shop owners can update queue for their shop" ON public.queue
    FOR UPDATE USING (
        auth.uid() IN (
            SELECT owner_id FROM public.shops WHERE id = shop_id
        )
    );

-- Reviews policies
CREATE POLICY "Anyone can view reviews" ON public.reviews
    FOR SELECT TO authenticated;

CREATE POLICY "Customers can create reviews for their bookings" ON public.reviews
    FOR INSERT WITH CHECK (
        auth.uid() = customer_id AND
        auth.uid() IN (
            SELECT customer_id FROM public.bookings WHERE id = booking_id
        )
    );

-- Notifications policies
CREATE POLICY "Users can view their own notifications" ON public.notifications
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications" ON public.notifications
    FOR UPDATE USING (auth.uid() = user_id);

-- Shop availability policies
CREATE POLICY "Anyone can view shop availability" ON public.shop_availability
    FOR SELECT TO authenticated;

CREATE POLICY "Shop owners can manage their availability" ON public.shop_availability
    FOR ALL USING (
        auth.uid() IN (
            SELECT owner_id FROM public.shops WHERE id = shop_id
        )
    );

-- Functions and Triggers

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_shops_updated_at BEFORE UPDATE ON public.shops 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_services_updated_at BEFORE UPDATE ON public.services 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bookings_updated_at BEFORE UPDATE ON public.bookings 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_queue_updated_at BEFORE UPDATE ON public.queue 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to handle user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
    INSERT INTO public.users (id, email, full_name)
    VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'full_name', ''));
    RETURN NEW;
END;
$$ language plpgsql security definer;

-- Trigger for new user creation
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update queue positions
CREATE OR REPLACE FUNCTION update_queue_positions()
RETURNS TRIGGER AS $$
BEGIN
    -- Update positions for the shop
    UPDATE public.queue 
    SET position = (
        SELECT ROW_NUMBER() OVER (ORDER BY joined_at)
        FROM public.queue q2 
        WHERE q2.shop_id = queue.shop_id 
        AND q2.status = 'waiting'
        AND q2.id = queue.id
    )
    WHERE shop_id = COALESCE(NEW.shop_id, OLD.shop_id)
    AND status = 'waiting';
    
    RETURN COALESCE(NEW, OLD);
END;
$$ language plpgsql;

-- Trigger to update queue positions
CREATE TRIGGER queue_position_trigger
    AFTER INSERT OR UPDATE OR DELETE ON public.queue
    FOR EACH ROW EXECUTE FUNCTION update_queue_positions();

-- Function to calculate estimated wait time
CREATE OR REPLACE FUNCTION calculate_estimated_wait_time(shop_id_param UUID, position_param INTEGER)
RETURNS INTEGER AS $$
DECLARE
    avg_service_time INTEGER;
    estimated_time INTEGER;
BEGIN
    -- Get average service time for the shop (default to 30 minutes if no data)
    SELECT COALESCE(AVG(duration), 30) INTO avg_service_time
    FROM public.services
    WHERE shop_id = shop_id_param AND is_active = true;
    
    -- Calculate estimated wait time based on position and average service time
    estimated_time := (position_param - 1) * avg_service_time;
    
    RETURN GREATEST(estimated_time, 0);
END;
$$ language plpgsql;

-- Function to update shop ratings
CREATE OR REPLACE FUNCTION update_shop_rating()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.shops 
    SET 
        rating = (
            SELECT AVG(rating)::DECIMAL(2,1) 
            FROM public.reviews 
            WHERE shop_id = NEW.shop_id
        ),
        total_ratings = (
            SELECT COUNT(*) 
            FROM public.reviews 
            WHERE shop_id = NEW.shop_id
        )
    WHERE id = NEW.shop_id;
    
    RETURN NEW;
END;
$$ language plpgsql;

-- Trigger to update shop ratings
CREATE TRIGGER update_shop_rating_trigger
    AFTER INSERT ON public.reviews
    FOR EACH ROW EXECUTE FUNCTION update_shop_rating();

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
    INSERT INTO public.notifications (user_id, title, message, type, data)
    VALUES (user_id_param, title_param, message_param, type_param, data_param)
    RETURNING id INTO notification_id;
    
    RETURN notification_id;
END;
$$ language plpgsql security definer;

-- Function to get nearby shops
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
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    phone TEXT,
    rating DECIMAL(2,1),
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
        s.phone,
        s.rating,
        s.total_ratings,
        ST_Distance(
            ST_Point(s.longitude, s.latitude)::geography,
            ST_Point(user_lng, user_lat)::geography
        ) / 1000 AS distance_km
    FROM public.shops s
    WHERE s.is_active = true
    AND ST_DWithin(
        ST_Point(s.longitude, s.latitude)::geography,
        ST_Point(user_lng, user_lat)::geography,
        radius_km * 1000
    )
    ORDER BY distance_km;
END;
$$ language plpgsql;

-- Sample data for testing
INSERT INTO public.users (id, email, full_name, role, phone) VALUES
    ('11111111-1111-1111-1111-111111111111', 'john@example.com', 'John Customer', 'customer', '+1234567890'),
    ('22222222-2222-2222-2222-222222222222', 'mike@barbershop.com', 'Mike Wilson', 'shopkeeper', '+1234567891'),
    ('33333333-3333-3333-3333-333333333333', 'sarah@salonpro.com', 'Sarah Johnson', 'shopkeeper', '+1234567892');

INSERT INTO public.shops (id, owner_id, name, description, address, latitude, longitude, phone, opening_hours) VALUES
    ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '22222222-2222-2222-2222-222222222222', 'Mike''s Barber Shop', 'Professional haircuts and grooming services', '123 Main St, Downtown', 40.7128, -74.0060, '+1234567891', 
     '{"monday": {"open": "09:00", "close": "18:00", "closed": false}, "tuesday": {"open": "09:00", "close": "18:00", "closed": false}, "wednesday": {"open": "09:00", "close": "18:00", "closed": false}, "thursday": {"open": "09:00", "close": "18:00", "closed": false}, "friday": {"open": "09:00", "close": "19:00", "closed": false}, "saturday": {"open": "08:00", "close": "17:00", "closed": false}, "sunday": {"closed": true}}'),
    ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '33333333-3333-3333-3333-333333333333', 'Elite Hair Salon', 'Premium styling and grooming services', '456 Fashion Ave, Uptown', 40.7589, -73.9851, '+1234567892',
     '{"monday": {"open": "10:00", "close": "19:00", "closed": false}, "tuesday": {"open": "10:00", "close": "19:00", "closed": false}, "wednesday": {"open": "10:00", "close": "19:00", "closed": false}, "thursday": {"open": "10:00", "close": "20:00", "closed": false}, "friday": {"open": "10:00", "close": "20:00", "closed": false}, "saturday": {"open": "09:00", "close": "18:00", "closed": false}, "sunday": {"open": "11:00", "close": "17:00", "closed": false}}');

INSERT INTO public.services (shop_id, name, description, duration, price) VALUES
    ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Classic Haircut', 'Traditional men''s haircut with styling', 30, 25.00),
    ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Beard Trim', 'Professional beard trimming and shaping', 20, 15.00),
    ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Hair Wash & Style', 'Complete hair wash and styling service', 45, 35.00),
    ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Premium Cut & Style', 'Luxury haircut with premium styling', 60, 65.00),
    ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Deluxe Grooming', 'Complete grooming package with facial', 90, 95.00),
    ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Quick Trim', 'Fast and efficient hair trimming', 25, 30.00);

-- Enable real-time for queue table
ALTER publication supabase_realtime ADD table public.queue;
ALTER publication supabase_realtime ADD table public.bookings;
ALTER publication supabase_realtime ADD table public.notifications;

-- Create a function to check if a user can access real-time updates
CREATE OR REPLACE FUNCTION public.can_access_realtime(table_name text, user_id uuid)
RETURNS boolean AS $$
BEGIN
    -- Users can access real-time updates for their own data
    RETURN user_id = auth.uid();
END;
$$ language plpgsql security definer;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated;

-- Create realtime subscriptions policy
CREATE POLICY "Enable realtime for authenticated users" ON public.queue
    FOR SELECT TO authenticated
    USING (true);

CREATE POLICY "Enable realtime for authenticated users" ON public.bookings
    FOR SELECT TO authenticated
    USING (true);

CREATE POLICY "Enable realtime for authenticated users" ON public.notifications
    FOR SELECT TO authenticated
    USING (true);
