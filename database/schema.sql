-- ============================================================================
-- FadeUp - Complete Database Schema
-- Production-Ready Supabase PostgreSQL Schema
-- ============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- ============================================================================
-- CUSTOM TYPES
-- ============================================================================

CREATE TYPE role_enum AS ENUM ('customer', 'barber', 'admin');
CREATE TYPE shop_status_enum AS ENUM ('pending', 'approved', 'rejected', 'active', 'inactive');
CREATE TYPE booking_status_enum AS ENUM ('pending', 'confirmed', 'cancelled', 'completed', 'no_show');
CREATE TYPE queue_status_enum AS ENUM ('waiting', 'serving', 'completed', 'cancelled');
CREATE TYPE payment_status_enum AS ENUM ('pending', 'completed', 'failed', 'refunded');
CREATE TYPE notification_type_enum AS ENUM ('queue_update', 'booking_reminder', 'promotion', 'system');

-- ============================================================================
-- UTILITY FUNCTIONS
-- ============================================================================

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION calculate_distance(lat1 FLOAT, lon1 FLOAT, lat2 FLOAT, lon2 FLOAT)
RETURNS FLOAT AS $$
DECLARE
    r FLOAT := 6371; -- Earth radius in kilometers
    dlat FLOAT;
    dlon FLOAT;
    a FLOAT;
    c FLOAT;
BEGIN
    dlat := radians(lat2 - lat1);
    dlon := radians(lon2 - lon1);
    a := sin(dlat/2) * sin(dlat/2) + cos(radians(lat1)) * cos(radians(lat2)) * sin(dlon/2) * sin(dlon/2);
    c := 2 * atan2(sqrt(a), sqrt(1-a));
    RETURN r * c;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- ============================================================================
-- CORE TABLES
-- ============================================================================

-- User Profiles
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    phone TEXT,
    full_name TEXT NOT NULL,
    avatar_url TEXT,
    role role_enum NOT NULL DEFAULT 'customer',
    is_onboarded BOOLEAN DEFAULT FALSE,
    language TEXT DEFAULT 'en',
    theme TEXT DEFAULT 'system',
    notification_token TEXT,
    shop_id UUID,
    wallet_balance DECIMAL(10,2) DEFAULT 0.00,
    total_bookings INTEGER DEFAULT 0,
    total_spent DECIMAL(10,2) DEFAULT 0.00,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT valid_email CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

-- Shops
CREATE TABLE public.shops (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    owner_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    name TEXT UNIQUE NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    address TEXT NOT NULL,
    city TEXT,
    state TEXT,
    zip_code TEXT,
    country TEXT DEFAULT 'US',
    latitude DECIMAL(10,8),
    longitude DECIMAL(11,8),
    location GEOGRAPHY(POINT, 4326),
    description TEXT,
    contact_email TEXT,
    contact_phone TEXT,
    website TEXT,
    is_open BOOLEAN DEFAULT FALSE,
    status shop_status_enum DEFAULT 'pending',
    average_rating DECIMAL(3,2) DEFAULT 0.00,
    total_reviews INTEGER DEFAULT 0,
    total_bookings INTEGER DEFAULT 0,
    opening_time TIME,
    closing_time TIME,
    break_start_time TIME,
    break_end_time TIME,
    weekly_schedule JSONB DEFAULT '{}'::JSONB,
    capacity_slots INTEGER DEFAULT 5,
    featured BOOLEAN DEFAULT FALSE,
    verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT valid_rating CHECK (average_rating >= 0 AND average_rating <= 5),
    CONSTRAINT valid_coordinates CHECK (
        (latitude IS NULL AND longitude IS NULL) OR 
        (latitude BETWEEN -90 AND 90 AND longitude BETWEEN -180 AND 180)
    )
);

-- Service Categories
CREATE TABLE public.service_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT UNIQUE NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    icon TEXT,
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Services
CREATE TABLE public.services (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    shop_id UUID NOT NULL REFERENCES shops(id) ON DELETE CASCADE,
    category_id UUID REFERENCES service_categories(id),
    name TEXT NOT NULL,
    description TEXT,
    price DECIMAL(8,2) NOT NULL,
    duration_minutes INTEGER NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    image_url TEXT,
    popular BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT valid_price CHECK (price >= 0),
    CONSTRAINT valid_duration CHECK (duration_minutes > 0)
);

-- Shop Images
CREATE TABLE public.shop_images (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    shop_id UUID NOT NULL REFERENCES shops(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    thumbnail_url TEXT,
    is_primary BOOLEAN DEFAULT FALSE,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Barbers
CREATE TABLE public.barbers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    profile_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    shop_id UUID NOT NULL REFERENCES shops(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    bio TEXT,
    avatar_url TEXT,
    is_available BOOLEAN DEFAULT TRUE,
    experience_years INTEGER DEFAULT 0,
    specialties TEXT[] DEFAULT ARRAY[]::TEXT[],
    rating DECIMAL(3,2) DEFAULT 0.00,
    total_reviews INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT valid_barber_rating CHECK (rating >= 0 AND rating <= 5)
);

-- Bookings
CREATE TABLE public.bookings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    shop_id UUID NOT NULL REFERENCES shops(id) ON DELETE CASCADE,
    barber_id UUID REFERENCES barbers(id) ON DELETE SET NULL,
    service_ids UUID[] NOT NULL,
    booking_time TIMESTAMPTZ NOT NULL,
    estimated_duration INTEGER NOT NULL,
    estimated_end_time TIMESTAMPTZ NOT NULL,
    status booking_status_enum DEFAULT 'pending',
    total_amount DECIMAL(10,2) NOT NULL,
    is_paid BOOLEAN DEFAULT FALSE,
    payment_method TEXT,
    customer_notes TEXT,
    cancellation_reason TEXT,
    cancelled_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT valid_booking_amount CHECK (total_amount >= 0),
    CONSTRAINT future_booking CHECK (booking_time > created_at)
);

-- Queue System
CREATE TABLE public.queue_positions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    shop_id UUID NOT NULL REFERENCES shops(id) ON DELETE CASCADE,
    customer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    booking_id UUID REFERENCES bookings(id) ON DELETE SET NULL,
    service_ids UUID[] NOT NULL,
    position INTEGER NOT NULL,
    estimated_wait_minutes INTEGER,
    status queue_status_enum DEFAULT 'waiting',
    joined_at TIMESTAMPTZ DEFAULT NOW(),
    served_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT unique_active_queue UNIQUE (shop_id, customer_id, status) WHERE status IN ('waiting', 'serving')
);

-- Reviews
CREATE TABLE public.reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
    shop_id UUID NOT NULL REFERENCES shops(id) ON DELETE CASCADE,
    customer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    barber_id UUID REFERENCES barbers(id) ON DELETE SET NULL,
    rating INTEGER NOT NULL,
    comment TEXT,
    response TEXT,
    responded_at TIMESTAMPTZ,
    is_visible BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT valid_review_rating CHECK (rating >= 1 AND rating <= 5),
    CONSTRAINT unique_booking_review UNIQUE (booking_id)
);

-- Notifications
CREATE TABLE public.notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    type notification_type_enum NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    data JSONB DEFAULT '{}'::JSONB,
    is_read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Payments
CREATE TABLE public.payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
    customer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    shop_id UUID NOT NULL REFERENCES shops(id) ON DELETE CASCADE,
    amount DECIMAL(10,2) NOT NULL,
    currency TEXT DEFAULT 'USD',
    status payment_status_enum DEFAULT 'pending',
    payment_method TEXT,
    transaction_id TEXT,
    metadata JSONB DEFAULT '{}'::JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT valid_payment_amount CHECK (amount >= 0)
);

-- Favorites
CREATE TABLE public.favorites (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    shop_id UUID NOT NULL REFERENCES shops(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT unique_favorite UNIQUE (user_id, shop_id)
);

-- Analytics Events
CREATE TABLE public.analytics_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    event_type TEXT NOT NULL,
    event_data JSONB DEFAULT '{}'::JSONB,
    session_id TEXT,
    device_info JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- INDEXES
-- ============================================================================

-- Profiles
CREATE INDEX idx_profiles_role ON public.profiles(role);
CREATE INDEX idx_profiles_shop_id ON public.profiles(shop_id);
CREATE INDEX idx_profiles_email ON public.profiles(email);

-- Shops
CREATE INDEX idx_shops_owner_id ON public.shops(owner_id);
CREATE INDEX idx_shops_status ON public.shops(status);
CREATE INDEX idx_shops_location ON public.shops USING GIST(location);
CREATE INDEX idx_shops_city ON public.shops(city);
CREATE INDEX idx_shops_featured ON public.shops(featured) WHERE featured = true;
CREATE INDEX idx_shops_search ON public.shops USING GIN(to_tsvector('english', name || ' ' || COALESCE(description, '')));

-- Services
CREATE INDEX idx_services_shop_id ON public.services(shop_id);
CREATE INDEX idx_services_category_id ON public.services(category_id);
CREATE INDEX idx_services_active ON public.services(is_active);

-- Barbers
CREATE INDEX idx_barbers_shop_id ON public.barbers(shop_id);
CREATE INDEX idx_barbers_profile_id ON public.barbers(profile_id);
CREATE INDEX idx_barbers_available ON public.barbers(is_available);

-- Bookings
CREATE INDEX idx_bookings_customer_id ON public.bookings(customer_id);
CREATE INDEX idx_bookings_shop_id ON public.bookings(shop_id);
CREATE INDEX idx_bookings_barber_id ON public.bookings(barber_id);
CREATE INDEX idx_bookings_status ON public.bookings(status);
CREATE INDEX idx_bookings_time ON public.bookings(booking_time);

-- Queue
CREATE INDEX idx_queue_shop_id ON public.queue_positions(shop_id);
CREATE INDEX idx_queue_customer_id ON public.queue_positions(customer_id);
CREATE INDEX idx_queue_status ON public.queue_positions(status);
CREATE INDEX idx_queue_position ON public.queue_positions(shop_id, position) WHERE status = 'waiting';

-- Reviews
CREATE INDEX idx_reviews_shop_id ON public.reviews(shop_id);
CREATE INDEX idx_reviews_barber_id ON public.reviews(barber_id);
CREATE INDEX idx_reviews_customer_id ON public.reviews(customer_id);
CREATE INDEX idx_reviews_visible ON public.reviews(is_visible);

-- Notifications
CREATE INDEX idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX idx_notifications_read ON public.notifications(user_id, is_read);
CREATE INDEX idx_notifications_created ON public.notifications(created_at DESC);

-- Payments
CREATE INDEX idx_payments_booking_id ON public.payments(booking_id);
CREATE INDEX idx_payments_customer_id ON public.payments(customer_id);
CREATE INDEX idx_payments_status ON public.payments(status);

-- Analytics
CREATE INDEX idx_analytics_user_id ON public.analytics_events(user_id);
CREATE INDEX idx_analytics_event_type ON public.analytics_events(event_type);
CREATE INDEX idx_analytics_created ON public.analytics_events(created_at DESC);

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Update timestamps
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_shops_updated_at BEFORE UPDATE ON public.shops FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_services_updated_at BEFORE UPDATE ON public.services FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_barbers_updated_at BEFORE UPDATE ON public.barbers FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_bookings_updated_at BEFORE UPDATE ON public.bookings FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_queue_updated_at BEFORE UPDATE ON public.queue_positions FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_reviews_updated_at BEFORE UPDATE ON public.reviews FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON public.payments FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Update shop location on coordinate change
CREATE OR REPLACE FUNCTION update_shop_location()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.latitude IS NOT NULL AND NEW.longitude IS NOT NULL THEN
        NEW.location := ST_SetSRID(ST_MakePoint(NEW.longitude, NEW.latitude), 4326)::geography;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_shop_location BEFORE INSERT OR UPDATE ON public.shops FOR EACH ROW EXECUTE FUNCTION update_shop_location();

-- Update shop rating on review creation/update
CREATE OR REPLACE FUNCTION update_shop_rating()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.shops
    SET 
        average_rating = (SELECT AVG(rating)::DECIMAL(3,2) FROM public.reviews WHERE shop_id = NEW.shop_id AND is_visible = true),
        total_reviews = (SELECT COUNT(*) FROM public.reviews WHERE shop_id = NEW.shop_id AND is_visible = true)
    WHERE id = NEW.shop_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_shop_rating_on_review AFTER INSERT OR UPDATE ON public.reviews FOR EACH ROW EXECUTE FUNCTION update_shop_rating();

-- Update barber rating on review creation/update
CREATE OR REPLACE FUNCTION update_barber_rating()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.barber_id IS NOT NULL THEN
        UPDATE public.barbers
        SET 
            rating = (SELECT AVG(rating)::DECIMAL(3,2) FROM public.reviews WHERE barber_id = NEW.barber_id AND is_visible = true),
            total_reviews = (SELECT COUNT(*) FROM public.reviews WHERE barber_id = NEW.barber_id AND is_visible = true)
        WHERE id = NEW.barber_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_barber_rating_on_review AFTER INSERT OR UPDATE ON public.reviews FOR EACH ROW EXECUTE FUNCTION update_barber_rating();

-- Auto-reorder queue positions
CREATE OR REPLACE FUNCTION reorder_queue_positions()
RETURNS TRIGGER AS $$
BEGIN
    -- Reorder remaining queue items
    WITH ranked_queue AS (
        SELECT id, ROW_NUMBER() OVER (ORDER BY joined_at) as new_position
        FROM public.queue_positions
        WHERE shop_id = OLD.shop_id AND status = 'waiting'
    )
    UPDATE public.queue_positions q
    SET position = rq.new_position
    FROM ranked_queue rq
    WHERE q.id = rq.id;
    
    RETURN OLD;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER reorder_queue_on_status_change AFTER UPDATE OF status ON public.queue_positions 
FOR EACH ROW WHEN (OLD.status = 'waiting' AND NEW.status != 'waiting') EXECUTE FUNCTION reorder_queue_positions();

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shops ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shop_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.barbers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.queue_positions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_categories ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Shops policies
CREATE POLICY "Shops are viewable by everyone" ON public.shops FOR SELECT USING (true);
CREATE POLICY "Shop owners can update their shops" ON public.shops FOR UPDATE USING (auth.uid() = owner_id);
CREATE POLICY "Shop owners can insert shops" ON public.shops FOR INSERT WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "Shop owners can delete their shops" ON public.shops FOR DELETE USING (auth.uid() = owner_id);

-- Services policies
CREATE POLICY "Services are viewable by everyone" ON public.services FOR SELECT USING (true);
CREATE POLICY "Shop owners can manage their services" ON public.services FOR ALL USING (
    EXISTS (SELECT 1 FROM public.shops WHERE shops.id = services.shop_id AND shops.owner_id = auth.uid())
);

-- Shop images policies
CREATE POLICY "Shop images are viewable by everyone" ON public.shop_images FOR SELECT USING (true);
CREATE POLICY "Shop owners can manage their images" ON public.shop_images FOR ALL USING (
    EXISTS (SELECT 1 FROM public.shops WHERE shops.id = shop_images.shop_id AND shops.owner_id = auth.uid())
);

-- Barbers policies
CREATE POLICY "Barbers are viewable by everyone" ON public.barbers FOR SELECT USING (true);
CREATE POLICY "Shop owners can manage their barbers" ON public.barbers FOR ALL USING (
    EXISTS (SELECT 1 FROM public.shops WHERE shops.id = barbers.shop_id AND shops.owner_id = auth.uid())
);

-- Bookings policies
CREATE POLICY "Users can view their own bookings" ON public.bookings FOR SELECT USING (
    auth.uid() = customer_id OR 
    EXISTS (SELECT 1 FROM public.shops WHERE shops.id = bookings.shop_id AND shops.owner_id = auth.uid())
);
CREATE POLICY "Users can create their own bookings" ON public.bookings FOR INSERT WITH CHECK (auth.uid() = customer_id);
CREATE POLICY "Users can update their own bookings" ON public.bookings FOR UPDATE USING (
    auth.uid() = customer_id OR 
    EXISTS (SELECT 1 FROM public.shops WHERE shops.id = bookings.shop_id AND shops.owner_id = auth.uid())
);

-- Queue policies
CREATE POLICY "Queue positions are viewable by shop and customer" ON public.queue_positions FOR SELECT USING (
    auth.uid() = customer_id OR 
    EXISTS (SELECT 1 FROM public.shops WHERE shops.id = queue_positions.shop_id AND shops.owner_id = auth.uid())
);
CREATE POLICY "Customers can join queue" ON public.queue_positions FOR INSERT WITH CHECK (auth.uid() = customer_id);
CREATE POLICY "Queue can be updated by shop and customer" ON public.queue_positions FOR UPDATE USING (
    auth.uid() = customer_id OR 
    EXISTS (SELECT 1 FROM public.shops WHERE shops.id = queue_positions.shop_id AND shops.owner_id = auth.uid())
);

-- Reviews policies
CREATE POLICY "Reviews are viewable by everyone" ON public.reviews FOR SELECT USING (is_visible = true);
CREATE POLICY "Customers can create reviews for their bookings" ON public.reviews FOR INSERT WITH CHECK (
    auth.uid() = customer_id AND 
    EXISTS (SELECT 1 FROM public.bookings WHERE bookings.id = reviews.booking_id AND bookings.status = 'completed')
);
CREATE POLICY "Shop owners can respond to reviews" ON public.reviews FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.shops WHERE shops.id = reviews.shop_id AND shops.owner_id = auth.uid())
);

-- Notifications policies
CREATE POLICY "Users can view their own notifications" ON public.notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update their own notifications" ON public.notifications FOR UPDATE USING (auth.uid() = user_id);

-- Payments policies
CREATE POLICY "Users can view their payments" ON public.payments FOR SELECT USING (
    auth.uid() = customer_id OR 
    EXISTS (SELECT 1 FROM public.shops WHERE shops.id = payments.shop_id AND shops.owner_id = auth.uid())
);

-- Favorites policies
CREATE POLICY "Users can view their favorites" ON public.favorites FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their favorites" ON public.favorites FOR ALL USING (auth.uid() = user_id);

-- Service categories policies
CREATE POLICY "Service categories are viewable by everyone" ON public.service_categories FOR SELECT USING (true);

-- ============================================================================
-- SEED DATA
-- ============================================================================

-- Insert default service categories
INSERT INTO public.service_categories (name, slug, description, icon, sort_order) VALUES
('Haircut', 'haircut', 'Professional haircuts and styling', 'scissors', 1),
('Beard Trim', 'beard-trim', 'Beard grooming and styling', 'mustache', 2),
('Hair Coloring', 'hair-coloring', 'Hair dyeing and highlights', 'palette', 3),
('Shave', 'shave', 'Classic wet shave services', 'razor', 4),
('Kids Cut', 'kids-cut', 'Haircuts for children', 'child', 5),
('Hair Treatment', 'hair-treatment', 'Hair care and treatment services', 'spa', 6)
ON CONFLICT (slug) DO NOTHING;

-- ============================================================================
-- FUNCTIONS FOR API
-- ============================================================================

-- Get nearby shops
CREATE OR REPLACE FUNCTION get_nearby_shops(
    user_lat FLOAT,
    user_lon FLOAT,
    radius_km FLOAT DEFAULT 10,
    limit_count INTEGER DEFAULT 20
)
RETURNS TABLE (
    id UUID,
    name TEXT,
    address TEXT,
    latitude DECIMAL,
    longitude DECIMAL,
    distance_km FLOAT,
    average_rating DECIMAL,
    total_reviews INTEGER,
    is_open BOOLEAN
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        s.id,
        s.name,
        s.address,
        s.latitude,
        s.longitude,
        calculate_distance(user_lat, user_lon, s.latitude::FLOAT, s.longitude::FLOAT) as distance_km,
        s.average_rating,
        s.total_reviews,
        s.is_open
    FROM public.shops s
    WHERE s.status = 'active'
        AND s.latitude IS NOT NULL
        AND s.longitude IS NOT NULL
        AND calculate_distance(user_lat, user_lon, s.latitude::FLOAT, s.longitude::FLOAT) <= radius_km
    ORDER BY distance_km
    LIMIT limit_count;
END;
$$ LANGUAGE plpgsql STABLE;

-- Get queue statistics
CREATE OR REPLACE FUNCTION get_queue_stats(p_shop_id UUID)
RETURNS JSON AS $$
DECLARE
    result JSON;
BEGIN
    SELECT json_build_object(
        'total_waiting', COUNT(*) FILTER (WHERE status = 'waiting'),
        'currently_serving', COUNT(*) FILTER (WHERE status = 'serving'),
        'average_wait_time', AVG(EXTRACT(EPOCH FROM (served_at - joined_at))/60) FILTER (WHERE served_at IS NOT NULL),
        'estimated_wait', SUM(estimated_wait_minutes) FILTER (WHERE status = 'waiting')
    ) INTO result
    FROM public.queue_positions
    WHERE shop_id = p_shop_id;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql STABLE;

-- Grant permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated;
