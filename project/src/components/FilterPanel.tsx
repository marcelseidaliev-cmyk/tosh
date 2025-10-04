import { useState } from 'react';
import { X } from 'lucide-react';
import type { ListingFilters, Region } from '../types';

interface FilterPanelProps {
  filters: ListingFilters;
  regions: Region[];
  onFiltersChange: (filters: ListingFilters) => void;
  onClose: () => void;
}

export function FilterPanel({ filters, regions, onFiltersChange, onClose }: FilterPanelProps) {
  const [localFilters, setLocalFilters] = useState<ListingFilters>(filters);

  const handleApply = () => {
    onFiltersChange(localFilters);
  };

  const handleReset = () => {
    setLocalFilters({});
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end">
      <div className="bg-white w-full max-h-[80vh] overflow-y-auto rounded-t-2xl">
        <div className="sticky top-0 bg-white border-b border-slate-200 p-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-800">Фильтры</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-slate-600" />
            </button>
          </div>
        </div>

        <div className="p-4 space-y-6">
          {/* Property Type */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-3">
              Тип недвижимости
            </label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { value: 'apartment', label: 'Квартира' },
                { value: 'house', label: 'Дом' },
                { value: 'land', label: 'Земля' },
                { value: 'commercial', label: 'Коммерческая' },
              ].map(option => (
                <button
                  key={option.value}
                  onClick={() => setLocalFilters({ ...localFilters, property_type: option.value })}
                  className={`p-3 text-sm rounded-lg border transition-colors ${
                    localFilters.property_type === option.value
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* Listing Type */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-3">
              Тип объявления
            </label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { value: 'sale', label: 'Продажа' },
                { value: 'rent', label: 'Аренда' },
              ].map(option => (
                <button
                  key={option.value}
                  onClick={() => setLocalFilters({ ...localFilters, listing_type: option.value })}
                  className={`p-3 text-sm rounded-lg border transition-colors ${
                    localFilters.listing_type === option.value
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* Region */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-3">
              Регион
            </label>
            <select
              value={localFilters.region_id || ''}
              onChange={(e) => setLocalFilters({ ...localFilters, region_id: e.target.value || undefined })}
              className="w-full p-3 border border-slate-200 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            >
              <option value="">Все регионы</option>
              {regions.map(region => (
                <option key={region.id} value={region.id}>
                  {region.name_ru}
                </option>
              ))}
            </select>
          </div>

          {/* Price Range */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-3">
              Цена (сум)
            </label>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="number"
                placeholder="От"
                value={localFilters.min_price || ''}
                onChange={(e) => setLocalFilters({ ...localFilters, min_price: Number(e.target.value) || undefined })}
                className="p-3 border border-slate-200 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
              <input
                type="number"
                placeholder="До"
                value={localFilters.max_price || ''}
                onChange={(e) => setLocalFilters({ ...localFilters, max_price: Number(e.target.value) || undefined })}
                className="p-3 border border-slate-200 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Rooms Count */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-3">
              Количество комнат
            </label>
            <div className="grid grid-cols-4 gap-2">
              {[1, 2, 3, 4].map(count => (
                <button
                  key={count}
                  onClick={() => setLocalFilters({ 
                    ...localFilters, 
                    rooms_count: localFilters.rooms_count === count ? undefined : count 
                  })}
                  className={`p-3 text-sm rounded-lg border transition-colors ${
                    localFilters.rooms_count === count
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {count}
                </button>
              ))}
            </div>
          </div>

          {/* Sort By */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-3">
              Сортировка
            </label>
            <select
              value={localFilters.sort_by || ''}
              onChange={(e) => setLocalFilters({ ...localFilters, sort_by: e.target.value as any })}
              className="w-full p-3 border border-slate-200 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            >
              <option value="">По умолчанию</option>
              <option value="date_desc">Сначала новые</option>
              <option value="price_asc">Сначала дешевые</option>
              <option value="price_desc">Сначала дорогие</option>
              <option value="popularity">По популярности</option>
            </select>
          </div>
        </div>

        <div className="sticky bottom-0 bg-white border-t border-slate-200 p-4 flex gap-3">
          <button
            onClick={handleReset}
            className="flex-1 py-3 px-4 border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
          >
            Сбросить
          </button>
          <button
            onClick={handleApply}
            className="flex-1 py-3 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Применить
          </button>
        </div>
      </div>
    </div>
  );
}