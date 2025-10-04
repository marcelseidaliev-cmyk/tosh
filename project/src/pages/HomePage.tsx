import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase, isSupabaseAvailable } from '../lib/supabase';
import { ListingCard } from '../components/ListingCard';
import { FilterPanel } from '../components/FilterPanel';
import { useAuth } from '../hooks/useAuth';
import type { Listing, ListingFilters, Region } from '../types';
import { SlidersHorizontal, Plus } from 'lucide-react';

export function HomePage() {
  const { user, isGuest } = useAuth();
  const [listings, setListings] = useState<Listing[]>([]);
  const [regions, setRegions] = useState<Region[]>([]);
  const [filters, setFilters] = useState<ListingFilters>({});
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchListings();
    fetchRegions();
  }, [filters]);

  const fetchListings = async () => {
    try {
      setLoading(true);
      
      if (!isSupabaseAvailable() || !supabase) {
        console.log('Supabase недоступен, показываем демо данные');
        setListings([]);
        return;
      }

      let query = supabase
        .from('listings')
        .select(`
          *,
          regions(*),
          profiles(*),
          listing_images(*)
        `)
        .eq('status', 'approved');

      // Apply filters
      if (filters.property_type) {
        query = query.eq('property_type', filters.property_type);
      }
      if (filters.listing_type) {
        query = query.eq('listing_type', filters.listing_type);
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
      setListings([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchRegions = async () => {
    try {
      if (!isSupabaseAvailable() || !supabase) {
        console.log('Supabase недоступен, регионы недоступны');
        setRegions([]);
        return;
      }

      const { data, error } = await supabase
        .from('regions')
        .select('*')
        .order('name_ru');

      if (error) throw error;
      setRegions(data || []);
    } catch (error) {
      console.error('Error fetching regions:', error);
      setRegions([]);
    }
  };

  const handleFilterChange = (newFilters: ListingFilters) => {
    setFilters(newFilters);
    setShowFilters(false);
  };

  const promotedListings = listings.filter(listing => listing.is_promoted);
  const regularListings = listings.filter(listing => !listing.is_promoted);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-slate-200">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-slate-800">Uytop</h1>
            {isGuest && (
              <Link
                to="/profile"
                className="px-3 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition-colors"
              >
                Войти
              </Link>
            )}
            {!isGuest && (
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 px-3 py-2 bg-slate-100 rounded-lg text-slate-700 hover:bg-slate-200 transition-colors"
              >
                <SlidersHorizontal className="w-4 h-4" />
                <span className="text-sm">Фильтры</span>
              </button>
            )}
          </div>

          {/* Quick filters */}
          <div className="flex gap-2 overflow-x-auto pb-2">
            <button
              onClick={() => setFilters({})}
              className={`px-3 py-1 rounded-full text-sm whitespace-nowrap transition-colors ${
                Object.keys(filters).length === 0
                  ? 'bg-blue-100 text-blue-700'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Все
            </button>
            <button
              onClick={() => setFilters({ property_type: 'apartment' })}
              className={`px-3 py-1 rounded-full text-sm whitespace-nowrap transition-colors ${
                filters.property_type === 'apartment'
                  ? 'bg-blue-100 text-blue-700'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Квартиры
            </button>
            <button
              onClick={() => setFilters({ property_type: 'house' })}
              className={`px-3 py-1 rounded-full text-sm whitespace-nowrap transition-colors ${
                filters.property_type === 'house'
                  ? 'bg-blue-100 text-blue-700'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Дома
            </button>
            <button
              onClick={() => setFilters({ listing_type: 'rent' })}
              className={`px-3 py-1 rounded-full text-sm whitespace-nowrap transition-colors ${
                filters.listing_type === 'rent'
                  ? 'bg-blue-100 text-blue-700'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Аренда
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
            {!isSupabaseAvailable() && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                <h3 className="text-yellow-800 font-medium mb-2">Демо режим</h3>
                <p className="text-yellow-700 text-sm">
                  Приложение работает в демо режиме. База данных недоступна.
                  Для полной функциональности необходимо настроить Supabase.
                </p>
              </div>
            )}

            {/* Promoted listings */}
            {promotedListings.length > 0 && (
              <div className="mb-6">
                <h2 className="text-lg font-semibold text-slate-800 mb-3 flex items-center gap-2">
                  <span className="text-orange-500">⭐</span>
                  Топ объявления
                </h2>
                <div className="space-y-4">
                  {promotedListings.map(listing => (
                    <ListingCard key={listing.id} listing={listing} isPromoted />
                  ))}
                </div>
              </div>
            )}

            {/* Regular listings */}
            {regularListings.length > 0 ? (
              <div className="space-y-4">
                {regularListings.map(listing => (
                  <ListingCard key={listing.id} listing={listing} />
                ))}
              </div>
            ) : (
              !loading && listings.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-slate-600 mb-4">
                    {isSupabaseAvailable() ? 'Объявления не найдены' : 'Добро пожаловать в Uytop!'}
                  </p>
                  {user ? (
                    <Link
                      to="/sell"
                      className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                      Разместить объявление
                    </Link>
                  ) : (
                    <Link
                      to="/profile"
                      className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Войти для размещения
                    </Link>
                  )}
                </div>
              )
            )}
          </>
        )}
      </div>
    </div>
  );
}