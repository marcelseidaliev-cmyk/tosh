import { useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { getTelegramWebAppUser, initTelegramWebApp, isRunningInTelegram, openTelegramWebApp } from '../services/telegramService';

export function TelegramLogin() {
  const { loginWithTelegram } = useAuth();

  useEffect(() => {
    if (isRunningInTelegram()) {
      console.log('Приложение запущено в Telegram');
      initTelegramWebApp();
      const tgUser = getTelegramWebAppUser();
      
      if (tgUser) {
        console.log('Автоматический вход для пользователя:', tgUser);
        loginWithTelegram(tgUser)
          .then(() => {
            console.log('Авторизация успешна');
          })
          .catch((error) => {
            console.error('Ошибка авторизации:', error);
          });
      } else {
        console.log('Пользователь не авторизован в Telegram');
      }
    } else {
      console.log('Приложение открыто вне Telegram');
    }
  }, [loginWithTelegram]);

  const handleTelegramLogin = () => {
    console.log('Открытие Telegram Web App');
    
    if (isRunningInTelegram()) {
      // Если уже в Telegram, попробуем получить данные пользователя
      const tgUser = getTelegramWebAppUser();
      if (tgUser) {
        loginWithTelegram(tgUser);
      } else {
        console.log('Не удалось получить данные пользователя в Telegram');
      }
    } else {
      // Открываем Web App в Telegram
      openTelegramWebApp();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 to-blue-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-800 mb-2">Uytop</h1>
          <p className="text-slate-600">Платформа недвижимости Узбекистана</p>
        </div>

        <div className="mb-8">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-400 to-orange-300 rounded-full mx-auto mb-4 flex items-center justify-center">
            <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-slate-800 mb-2">Авторизация через Telegram</h2>
          <p className="text-slate-600 text-sm">
            Войдите через Telegram для создания объявлений и управления профилем
          </p>
        </div>

        <div className="mb-6">
          {isRunningInTelegram() ? (
            <div className="text-sm text-green-600 mb-4 p-3 bg-green-50 rounded-lg">
              ✓ Приложение запущено в Telegram
            </div>
          ) : (
            <div className="text-sm text-blue-600 mb-4 p-3 bg-blue-50 rounded-lg">
              ℹ️ Для авторизации откройте приложение в Telegram
            </div>
          )}
          
          <button
            onClick={handleTelegramLogin}
            className="w-full py-3 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium mb-4"
          >
            {isRunningInTelegram() ? 'Войти' : 'Открыть в Telegram'}
          </button>
        </div>

        {!isRunningInTelegram() && (
          <div className="text-xs text-slate-500 space-y-2 mb-6">
            <p>Для входа необходимо:</p>
            <ol className="list-decimal list-inside mt-1 space-y-1">
              <li>Нажать кнопку "Открыть в Telegram"</li>
              <li>В открывшемся боте нажать "Запустить"</li>
              <li>Выбрать "Открыть приложение" или использовать кнопку Web App</li>
            </ol>
          </div>
        )}

        <div className="mt-6 text-xs text-slate-500 text-center">
          <p>Авторизация безопасна и соответствует условиям Telegram</p>
        </div>
      </div>
    </div>
  );
}