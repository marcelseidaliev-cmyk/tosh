export interface Profile {
  id: string;
  telegram_id: number;
  telegram_username?: string;
  first_name?: string;
  last_name?: string;
  phone_number?: string;
  language: 'ru' | 'uz';
  region_id?: string;
  is_admin: boolean;
  last_seen: string;
  created_at: string;
  updated_at: string;
}

export interface Region {
  id: string;
  name_ru: string;
  name_uz: string;
  created_at: string;
}

export interface Listing {
  id: string;
  user_id: string;
  title: string;
  description: string;
  property_type: 'apartment' | 'house' | 'land' | 'commercial';
  listing_type: 'sale' | 'rent';
  price: number;
  area_sqm?: number;
  area_sotka?: number;
  rooms_count?: number;
  location?: { lat: number; lng: number };
  address?: string;
  region_id?: string;
  status: 'pending' | 'approved' | 'rejected';
  view_count: number;
  like_count: number;
  is_promoted: boolean;
  promoted_until?: string;
  created_at: string;
  updated_at: string;
  images?: ListingImage[];
  region?: Region;
  profile?: Profile;
}

export interface ListingImage {
  id: string;
  listing_id: string;
  image_url: string;
  display_order: number;
  created_at: string;
}

export interface UserBalance {
  id: string;
  user_id: string;
  balance: number;
  total_spent: number;
  updated_at: string;
}

export interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  photo_url?: string;
  auth_date: number;
  hash: string;
}

export interface ListingFilters {
  property_type?: string;
  listing_type?: string;
  region_id?: string;
  min_price?: number;
  max_price?: number;
  rooms_count?: number;
  sort_by?: 'price_asc' | 'price_desc' | 'date_desc' | 'popularity';
}