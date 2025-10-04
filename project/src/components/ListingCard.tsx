import { Link } from 'react-router-dom';
import { Heart, Eye, MapPin, Calendar } from 'lucide-react';
import type { Listing } from '../types';

interface ListingCardProps {
  listing: Listing;
  isPromoted?: boolean;
}

export function ListingCard({ listing, isPromoted }: ListingCardProps) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ru-RU').format(price);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'short',
    });
  };

  const getPropertyTypeLabel = (type: string) => {
    const labels = {
      apartment: 'Квартира',
      house: 'Дом',
      land: 'Земельный участок',
      commercial: 'Коммерческая',
    };
    return labels[type as keyof typeof labels] || type;
  };

  const getListingTypeLabel = (type: string) => {
    return type === 'sale' ? 'Продажа' : 'Аренда';
  };

  const mainImage = listing.listing_images?.[0]?.image_url;

  return (
    <Link to={`/listing/${listing.id}`}>
      <div className={`bg-white rounded-xl shadow-sm overflow-hidden border transition-all hover:shadow-md ${
        isPromoted ? 'border-orange-200 ring-2 ring-orange-100' : 'border-slate-200'
      }`}>
        {/* Image */}
        <div className="relative h-48 bg-slate-200">
          {mainImage ? (
            <img
              src={mainImage}
              alt={listing.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-slate-400">
              <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
              </svg>
            </div>
          )}
          
          {isPromoted && (
            <div className="absolute top-2 left-2 bg-gradient-to-r from-orange-400 to-orange-500 text-white px-2 py-1 rounded-lg text-xs font-semibold">
              ТОП
            </div>
          )}

          <div className="absolute top-2 right-2 bg-white bg-opacity-90 backdrop-blur-sm rounded-lg px-2 py-1">
            <span className="text-xs font-medium text-slate-700">
              {getListingTypeLabel(listing.listing_type)}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          <div className="flex items-start justify-between mb-2">
            <h3 className="font-semibold text-slate-800 text-sm line-clamp-2 flex-1 mr-2">
              {listing.title}
            </h3>
            <div className="text-lg font-bold text-blue-600 whitespace-nowrap">
              {formatPrice(listing.price)} сум
            </div>
          </div>

          <div className="flex items-center gap-2 mb-3">
            <span className="text-xs px-2 py-1 bg-slate-100 text-slate-600 rounded">
              {getPropertyTypeLabel(listing.property_type)}
            </span>
            {listing.rooms_count && (
              <span className="text-xs px-2 py-1 bg-slate-100 text-slate-600 rounded">
                {listing.rooms_count} комн.
              </span>
            )}
            {listing.area_sqm && (
              <span className="text-xs px-2 py-1 bg-slate-100 text-slate-600 rounded">
                {listing.area_sqm} м²
              </span>
            )}
          </div>

          {listing.address && (
            <div className="flex items-center gap-1 mb-3">
              <MapPin className="w-3 h-3 text-slate-400" />
              <span className="text-xs text-slate-600 line-clamp-1">
                {listing.address}
              </span>
            </div>
          )}

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 text-xs text-slate-500">
              <div className="flex items-center gap-1">
                <Eye className="w-3 h-3" />
                <span>{listing.view_count}</span>
              </div>
              <div className="flex items-center gap-1">
                <Heart className="w-3 h-3" />
                <span>{listing.like_count}</span>
              </div>
            </div>
            <div className="flex items-center gap-1 text-xs text-slate-500">
              <Calendar className="w-3 h-3" />
              <span>{formatDate(listing.created_at)}</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}