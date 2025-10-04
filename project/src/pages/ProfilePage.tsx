import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { TelegramLogin } from '../components/TelegramLogin';
import { supabase } from '../lib/supabase';
import { Settings, LogOut, CreditCard, Star } from 'lucide-react';
import type { Region, UserBalance } from '../types';

export function ProfilePage() {
  const { user, isGuest, logout } = useAuth();
  const [regions, setRegions] = useState<Region[]>([]);
  const [balance, setBalance] = useState<UserBalance | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
    phone_number: user?.phone_number || '',
    language: user?.language || 'ru',
    region_id: user?.region_id || '',
  });

  useEffect(() => {
    if (user) {
      fetchRegions();
      fetchBalance();
      setFormData({
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        phone_number: user.phone_number || '',
        language: user.language || 'ru',
        region_id: user.region_id || '',
      });
    }
  }, [user]);

  // Показываем экран входа для гостей
  if (isGuest || !user) {
    return <TelegramLogin />;
  }

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

  const fetchBalance = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('user_balances')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      setBalance(data);
    } catch (error) {
      console.error('Error fetching balance:', error);
    }
  };

  const handleSave = async () => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          first_name: formData.first_name,
          last_name: formData.last_name,
          phone_number: formData.phone_number,
          language: formData.language,
          region_id: formData.region_id || null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (error) throw error;
      setIsEditing(false);
      // Refresh user data would be handled by useAuth hook
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-slate-200">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-semibold text-slate-800">Профиль</h1>
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <Settings className="w-5 h-5 text-slate-600" />
            </button>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* User Info Card */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-orange-300 rounded-full flex items-center justify-center">
              <span className="text-white font-semibold text-lg">
                {user.first_name?.charAt(0) || user.telegram_username?.charAt(0) || 'U'}
              </span>
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-semibold text-slate-800">
                {user.first_name} {user.last_name}
              </h2>
              <p className="text-slate-600">@{user.telegram_username}</p>
              <p className="text-sm text-slate-500">ID: {user.telegram_id}</p>
            </div>
          </div>

          {isEditing ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Имя
                  </label>
                  <input
                    type="text"
                    value={formData.first_name}
                    onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                    className="w-full p-3 border border-slate-200 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Фамилия
                  </label>
                  <input
                    type="text"
                    value={formData.last_name}
                    onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                    className="w-full p-3 border border-slate-200 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Номер телефона
                </label>
                <input
                  type="tel"
                  value={formData.phone_number}
                  onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                  className="w-full p-3 border border-slate-200 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  placeholder="+998 XX XXX XX XX"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Язык
                </label>
                <select
                  value={formData.language}
                  onChange={(e) => setFormData({ ...formData, language: e.target.value as 'ru' | 'uz' })}
                  className="w-full p-3 border border-slate-200 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                >
                  <option value="ru">Русский</option>
                  <option value="uz">O'zbekcha</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Регион
                </label>
                <select
                  value={formData.region_id}
                  onChange={(e) => setFormData({ ...formData, region_id: e.target.value })}
                  className="w-full p-3 border border-slate-200 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                >
                  <option value="">Выберите регион</option>
                  {regions.map(region => (
                    <option key={region.id} value={region.id}>
                      {region.name_ru}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleSave}
                  className="flex-1 py-3 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Сохранить
                </button>
                <button
                  onClick={() => setIsEditing(false)}
                  className="flex-1 py-3 px-4 border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  Отмена
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-600">Телефон:</span>
                <span className="text-slate-800">{user.phone_number || 'Не указан'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Язык:</span>
                <span className="text-slate-800">{user.language === 'ru' ? 'Русский' : "O'zbekcha"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Регион:</span>
                <span className="text-slate-800">
                  {regions.find(r => r.id === user.region_id)?.name_ru || 'Не указан'}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Balance Card */}
        <div className="bg-gradient-to-r from-blue-500 to-orange-400 rounded-xl shadow-sm p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <CreditCard className="w-6 h-6" />
              <h3 className="text-lg font-semibold">Баланс</h3>
            </div>
            <Star className="w-6 h-6" />
          </div>
          <div className="mb-4">
            <div className="text-3xl font-bold mb-1">
              {balance?.balance || 0} <span className="text-lg">баллов</span>
            </div>
            <div className="text-blue-100 text-sm">
              Потрачено: {balance?.total_spent || 0} баллов
            </div>
          </div>
          <button className="w-full py-3 px-4 bg-white bg-opacity-20 backdrop-blur-sm rounded-lg hover:bg-opacity-30 transition-colors">
            Пополнить баланс
          </button>
        </div>

        {/* Actions */}
        <div className="space-y-2">
          <button className="w-full flex items-center justify-between p-4 bg-white rounded-xl shadow-sm hover:bg-slate-50 transition-colors">
            <span className="font-medium text-slate-800">Мои объявления</span>
            <span className="text-slate-400">→</span>
          </button>
          
          <button className="w-full flex items-center justify-between p-4 bg-white rounded-xl shadow-sm hover:bg-slate-50 transition-colors">
            <span className="font-medium text-slate-800">История транзакций</span>
            <span className="text-slate-400">→</span>
          </button>

          <button 
            onClick={logout}
            className="w-full flex items-center justify-center gap-2 p-4 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Выйти</span>
          </button>
        </div>
      </div>
    </div>
  );
}