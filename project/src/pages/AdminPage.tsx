import { useAuth } from '../hooks/useAuth';
import { TelegramLogin } from '../components/TelegramLogin';
import { Shield, Users, FileText, BarChart3, Settings } from 'lucide-react';

export function AdminPage() {
  const { user, isGuest } = useAuth();

  // Показываем экран входа для гостей
  if (isGuest || !user) {
    return <TelegramLogin />;
  }

  // Проверяем права администратора
  if (!user.is_admin) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-sm p-8 max-w-md w-full text-center">
          <Shield className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-slate-800 mb-2">Доступ запрещен</h2>
          <p className="text-slate-600">У вас нет прав администратора для доступа к этой странице.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-slate-200">
        <div className="px-4 py-4">
          <div className="flex items-center gap-3">
            <Shield className="w-6 h-6 text-blue-600" />
            <h1 className="text-xl font-semibold text-slate-800">Админ панель</h1>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white rounded-xl shadow-sm p-4">
            <div className="flex items-center gap-3 mb-2">
              <Users className="w-5 h-5 text-blue-600" />
              <span className="text-sm font-medium text-slate-700">Пользователи</span>
            </div>
            <div className="text-2xl font-bold text-slate-800">0</div>
            <div className="text-xs text-slate-500">Всего зарегистрировано</div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-4">
            <div className="flex items-center gap-3 mb-2">
              <FileText className="w-5 h-5 text-orange-600" />
              <span className="text-sm font-medium text-slate-700">Объявления</span>
            </div>
            <div className="text-2xl font-bold text-slate-800">0</div>
            <div className="text-xs text-slate-500">На модерации</div>
          </div>
        </div>

        {/* Admin Actions */}
        <div className="space-y-2">
          <button className="w-full flex items-center justify-between p-4 bg-white rounded-xl shadow-sm hover:bg-slate-50 transition-colors">
            <div className="flex items-center gap-3">
              <FileText className="w-5 h-5 text-orange-600" />
              <span className="font-medium text-slate-800">Модерация объявлений</span>
            </div>
            <span className="text-slate-400">→</span>
          </button>

          <button className="w-full flex items-center justify-between p-4 bg-white rounded-xl shadow-sm hover:bg-slate-50 transition-colors">
            <div className="flex items-center gap-3">
              <Users className="w-5 h-5 text-blue-600" />
              <span className="font-medium text-slate-800">Управление пользователями</span>
            </div>
            <span className="text-slate-400">→</span>
          </button>

          <button className="w-full flex items-center justify-between p-4 bg-white rounded-xl shadow-sm hover:bg-slate-50 transition-colors">
            <div className="flex items-center gap-3">
              <BarChart3 className="w-5 h-5 text-green-600" />
              <span className="font-medium text-slate-800">Статистика</span>
            </div>
            <span className="text-slate-400">→</span>
          </button>

          <button className="w-full flex items-center justify-between p-4 bg-white rounded-xl shadow-sm hover:bg-slate-50 transition-colors">
            <div className="flex items-center gap-3">
              <Settings className="w-5 h-5 text-slate-600" />
              <span className="font-medium text-slate-800">Настройки системы</span>
            </div>
            <span className="text-slate-400">→</span>
          </button>
        </div>
      </div>
    </div>
  );
}