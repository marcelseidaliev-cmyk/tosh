import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { ListingCard } from '../components/ListingCard';
import { FilterPanel } from '../components/FilterPanel';
import { useAuth } from '../hooks/useAuth';
import type { Listing, ListingFilters, Region } from '../types';
import { SlidersHorizontal, MapPin } from 'lucide-react';

export function BuyPage() {
  const { user, isGuest } = useAuth();
  const [listings, setListings] = useState<Listing[]>([]);
  const [regions, setRegions] = useState<Region[]>([]);
  const [filters, setFilters] = useState<ListingFilters>({ listing_type: 'sale' });
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchListings();
    fetchRegions();
  }, [filters]);

  const fetchListings = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from('listings')
        .select(`
          *,
          regions(*),
          profiles(*),
          listing_images(*)
        `)
        .eq('status', 'approved')
        .eq('listing_type', 'sale'); // Only show sale listings

      // Apply filters
      if (filters.property_type) {
        query = query.eq('property_type', filters.property_type);
      }
      if (filters.region_id) {
        query = query.eq('region_id', filters.region_id);
      }
      if (filters.min_price) {
        query = query.gte('price', filters.min_price);
      }
      if (filters.max_price) {
        query = query.lte('price', filters.max_price);
      }
      if (filters.rooms_count) {
        query = query.eq('rooms_count', filters.rooms_count);
      }

      // Apply sorting
      switch (filters.sort_by) {
        case 'price_asc':
          query = query.order('price', { ascending: true });
          break;
        case 'price_desc':
          query = query.order('price', { ascending: false });
          break;
        case 'popularity':
          query = query.order('like_count', { ascending: false });
          break;
        default:
          query = query.order('is_promoted', { ascending: false })
                      .order('created_at', { ascending: false });
      }

      const { data, error } = await query.limit(20);

      if (error) throw error;
      setListings(data || []);
    } catch (error) {
      console.error('Error fetching listings:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRegions = async () => {
    try {
      const { data, error } = await supabase
        .from('regions')
        .select('*')
        .order('name_ru');

      if (error) throw error;
      setRegions(data || []);
    } catch (error) {
      console.error('Error fetching regions:', error);
    }
  };

  const handleFilterChange = (newFilters: ListingFilters) => {
    setFilters({ ...newFilters, listing_type: 'sale' });
    setShowFilters(false);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-slate-200">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-slate-800">Купить недвижимость</h1>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-3 py-2 bg-slate-100 rounded-lg text-slate-700 hover:bg-slate-200 transition-colors"
            >
              <SlidersHorizontal className="w-4 h-4" />
              <span className="text-sm">Фильтры</span>
            </button>
          </div>

          {/* Quick filters */}
          <div className="flex gap-2 overflow-x-auto pb-2">
            <button
              onClick={() => setFilters({ listing_type: 'sale' })}
              className={`px-3 py-1 rounded-full text-sm whitespace-nowrap transition-colors ${
                !filters.property_type
                  ? 'bg-blue-100 text-blue-700'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Все
            </button>
            <button
              onClick={() => setFilters({ listing_type: 'sale', property_type: 'apartment' })}
              className={`px-3 py-1 rounded-full text-sm whitespace-nowrap transition-colors ${
                filters.property_type === 'apartment'
                  ? 'bg-blue-100 text-blue-700'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Квартиры
            </button>
            <button
              onClick={() => setFilters({ listing_type: 'sale', property_type: 'house' })}
              className={`px-3 py-1 rounded-full text-sm whitespace-nowrap transition-colors ${
                filters.property_type === 'house'
                  ? 'bg-blue-100 text-blue-700'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Дома
            </button>
            <button
              onClick={() => setFilters({ listing_type: 'sale', property_type: 'land' })}
              className={`px-3 py-1 rounded-full text-sm whitespace-nowrap transition-colors ${
                filters.property_type === 'land'
                  ? 'bg-blue-100 text-blue-700'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Земля
            </button>
          </div>
        </div>
      </div>

      {/* Filter Panel */}
      {showFilters && (
        <FilterPanel
          filters={filters}
          regions={regions}
          onFiltersChange={handleFilterChange}
          onClose={() => setShowFilters(false)}
        />
      )}

      {/* Content */}
      <div className="p-4">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <>
            {listings.length > 0 ? (
              <div className="space-y-4">
                {listings.map(listing => (
                  <ListingCard key={listing.id} listing={listing} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <MapPin className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-slate-800 mb-2">Объявления не найдены</h3>
                <p className="text-slate-600">Попробуйте изменить фильтры поиска</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}