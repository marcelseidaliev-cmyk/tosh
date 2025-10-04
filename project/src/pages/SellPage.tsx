import { useAuth } from '../hooks/useAuth';
import { TelegramLogin } from '../components/TelegramLogin';
import { ArrowLeft, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';

export function SellPage() {
  const { user, isGuest } = useAuth();

  // Показываем экран входа для гостей
  if (isGuest || !user) {
    return <TelegramLogin />;
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-slate-200">
        <div className="px-4 py-4">
          <div className="flex items-center gap-3">
            <Link to="/" className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
              <ArrowLeft className="w-5 h-5 text-slate-600" />
            </Link>
            <h1 className="text-xl font-semibold text-slate-800">Мои объявления</h1>
          </div>
        </div>
      </div>

      <div className="p-4">
        {/* Create New Listing Button */}
        <button className="w-full flex items-center justify-center gap-3 p-6 bg-gradient-to-r from-blue-500 to-orange-400 text-white rounded-xl shadow-sm hover:shadow-md transition-all mb-6">
          <Plus className="w-6 h-6" />
          <span className="text-lg font-semibold">Создать новое объявление</span>
        </button>

        {/* User's Listings */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-slate-800">Ваши объявления</h2>
          
          {/* Empty State */}
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-slate-200 rounded-full mx-auto mb-4 flex items-center justify-center">
              <Plus className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-semibold text-slate-800 mb-2">Нет объявлений</h3>
            <p className="text-slate-600 mb-4">Создайте свое первое объявление</p>
            <button className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              Создать объявление
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}