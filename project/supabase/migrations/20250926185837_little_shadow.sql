/*
# Initial Schema for Uytop Real Estate Platform

1. New Tables
  - `profiles` - User profiles from Telegram
  - `regions` - Uzbekistan regions
  - `property_types` - Types of properties (apartment, house, land, commercial)
  - `listings` - Real estate listings
  - `listing_images` - Images for listings
  - `listing_views` - Track listing views
  - `listing_likes` - Track listing likes
  - `user_balances` - User points balance
  - `promoted_listings` - Promoted/top listings
  - `admin_sessions` - Admin access tracking

2. Security
  - Enable RLS on all tables
  - Add policies for authenticated users
  - Admin-only policies for moderation

3. Features
  - Multi-language support
  - Geolocation support
  - Moderation system
  - Points/balance system
*/

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";

-- Create custom types
CREATE TYPE listing_status AS ENUM ('pending', 'approved', 'rejected');
CREATE TYPE property_type AS ENUM ('apartment', 'house', 'land', 'commercial');
CREATE TYPE listing_type AS ENUM ('sale', 'rent');
CREATE TYPE language_type AS ENUM ('ru', 'uz');

-- Profiles table
CREATE TABLE IF NOT EXISTS profiles (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    telegram_id bigint UNIQUE NOT NULL,
    telegram_username text,
    first_name text,
    last_name text,
    phone_number text,
    language language_type DEFAULT 'ru',
    region_id uuid,
    is_admin boolean DEFAULT false,
    last_seen timestamptz DEFAULT now(),
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Regions table (Uzbekistan regions)
CREATE TABLE IF NOT EXISTS regions (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    name_ru text NOT NULL,
    name_uz text NOT NULL,
    created_at timestamptz DEFAULT now()
);

-- Insert Uzbekistan regions
INSERT INTO regions (name_ru, name_uz) VALUES
('Андижанская область', 'Andijon viloyati'),
('Бухарская область', 'Buxoro viloyati'),
('Джизакская область', 'Jizzax viloyati'),
('Кашкадарьинская область', 'Qashqadaryo viloyati'),
('Навоийская область', 'Navoiy viloyati'),
('Наманганская область', 'Namangan viloyati'),
('Самаркандская область', 'Samarqand viloyati'),
('Сурхандарьинская область', 'Surxondaryo viloyati'),
('Сырдарьинская область', 'Sirdaryo viloyati'),
('Ташкентская область', 'Toshkent viloyati'),
('Ферганская область', 'Farg''ona viloyati'),
('Хорезмская область', 'Xorazm viloyati'),
('Город Ташкент', 'Toshkent shahri'),
('Республика Каракалпакстан', 'Qoraqalpog''iston Respublikasi');

-- Listings table
CREATE TABLE IF NOT EXISTS listings (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
    title text NOT NULL,
    description text NOT NULL,
    property_type property_type NOT NULL,
    listing_type listing_type NOT NULL,
    price decimal(15,2) NOT NULL,
    area_sqm decimal(10,2),
    area_sotka decimal(10,2),
    rooms_count integer,
    location geometry(POINT, 4326),
    address text,
    region_id uuid REFERENCES regions(id),
    status listing_status DEFAULT 'pending',
    view_count integer DEFAULT 0,
    like_count integer DEFAULT 0,
    is_promoted boolean DEFAULT false,
    promoted_until timestamptz,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Listing images table
CREATE TABLE IF NOT EXISTS listing_images (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    listing_id uuid REFERENCES listings(id) ON DELETE CASCADE,
    image_url text NOT NULL,
    display_order integer DEFAULT 0,
    created_at timestamptz DEFAULT now()
);

-- Listing views table
CREATE TABLE IF NOT EXISTS listing_views (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    listing_id uuid REFERENCES listings(id) ON DELETE CASCADE,
    user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
    viewed_at timestamptz DEFAULT now(),
    UNIQUE(listing_id, user_id)
);

-- Listing likes table
CREATE TABLE IF NOT EXISTS listing_likes (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    listing_id uuid REFERENCES listings(id) ON DELETE CASCADE,
    user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
    created_at timestamptz DEFAULT now(),
    UNIQUE(listing_id, user_id)
);

-- User balances table
CREATE TABLE IF NOT EXISTS user_balances (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id uuid REFERENCES profiles(id) ON DELETE CASCADE UNIQUE,
    balance integer DEFAULT 0,
    total_spent integer DEFAULT 0,
    updated_at timestamptz DEFAULT now()
);

-- Promoted listings table
CREATE TABLE IF NOT EXISTS promoted_listings (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    listing_id uuid REFERENCES listings(id) ON DELETE CASCADE,
    user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
    points_spent integer NOT NULL,
    promoted_at timestamptz DEFAULT now(),
    expires_at timestamptz NOT NULL
);

-- Admin sessions table
CREATE TABLE IF NOT EXISTS admin_sessions (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    admin_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
    session_start timestamptz DEFAULT now(),
    session_end timestamptz,
    ip_address inet,
    user_agent text
);

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE regions ENABLE ROW LEVEL SECURITY;
ALTER TABLE listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE listing_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE listing_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE listing_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_balances ENABLE ROW LEVEL SECURITY;
ALTER TABLE promoted_listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_sessions ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view all profiles" ON profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE TO authenticated USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);

-- Regions policies
CREATE POLICY "Everyone can view regions" ON regions FOR SELECT TO authenticated USING (true);

-- Listings policies
CREATE POLICY "Everyone can view approved listings" ON listings FOR SELECT TO authenticated USING (status = 'approved');
CREATE POLICY "Users can view own listings" ON listings FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Users can insert own listings" ON listings FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update own listings" ON listings FOR UPDATE TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Admins can view all listings" ON listings FOR SELECT TO authenticated USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
);
CREATE POLICY "Admins can update all listings" ON listings FOR UPDATE TO authenticated USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
);

-- Listing images policies
CREATE POLICY "Everyone can view listing images" ON listing_images FOR SELECT TO authenticated USING (
    EXISTS (SELECT 1 FROM listings WHERE id = listing_id AND status = 'approved')
);
CREATE POLICY "Users can manage own listing images" ON listing_images FOR ALL TO authenticated USING (
    EXISTS (SELECT 1 FROM listings WHERE id = listing_id AND user_id = auth.uid())
);

-- Listing views policies
CREATE POLICY "Users can view own views" ON listing_views FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Users can insert own views" ON listing_views FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());

-- Listing likes policies
CREATE POLICY "Users can view likes" ON listing_likes FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can manage own likes" ON listing_likes FOR ALL TO authenticated USING (user_id = auth.uid());

-- User balances policies
CREATE POLICY "Users can view own balance" ON user_balances FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Users can update own balance" ON user_balances FOR UPDATE TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Users can insert own balance" ON user_balances FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());

-- Promoted listings policies
CREATE POLICY "Everyone can view promoted listings" ON promoted_listings FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can manage own promoted listings" ON promoted_listings FOR ALL TO authenticated USING (user_id = auth.uid());

-- Admin sessions policies
CREATE POLICY "Admins can manage admin sessions" ON admin_sessions FOR ALL TO authenticated USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
);

-- Functions to update counters
CREATE OR REPLACE FUNCTION update_listing_view_count()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE listings 
    SET view_count = view_count + 1, updated_at = now()
    WHERE id = NEW.listing_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_listing_like_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE listings 
        SET like_count = like_count + 1, updated_at = now()
        WHERE id = NEW.listing_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE listings 
        SET like_count = like_count - 1, updated_at = now()
        WHERE id = OLD.listing_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Triggers
CREATE TRIGGER trigger_update_view_count
    AFTER INSERT ON listing_views
    FOR EACH ROW EXECUTE FUNCTION update_listing_view_count();

CREATE TRIGGER trigger_update_like_count
    AFTER INSERT OR DELETE ON listing_likes
    FOR EACH ROW EXECUTE FUNCTION update_listing_like_count();

-- Update timestamp function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply update timestamp trigger to relevant tables
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_listings_updated_at BEFORE UPDATE ON listings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_balances_updated_at BEFORE UPDATE ON user_balances
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();