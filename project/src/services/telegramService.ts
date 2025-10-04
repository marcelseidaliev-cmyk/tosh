import { supabase } from '../lib/supabase';
import { isSupabaseAvailable } from '../lib/supabase';
import type { Profile, TelegramUser } from '../types';

const BOT_USERNAME = 'TOSHKENT_UYJOYLAR_bot';

// Создание или получение пользователя Telegram
export const createOrGetTelegramUser = async (telegramData: {
  telegram_id: number;
  username?: string;
  first_name?: string;
  last_name?: string;
}): Promise<Profile | null> => {
  try {
    if (!isSupabaseAvailable() || !supabase) {
      console.error('Supabase недоступен');
      return null;
    }

    console.log('Создание/получение пользователя:', telegramData);

    // Проверяем, существует ли пользователь
    const { data: existingUser } = await supabase
      .from('profiles')
      .select('*, regions(*)')
      .eq('telegram_id', telegramData.telegram_id)
      .single();

    if (existingUser) {
      console.log('Пользователь найден, обновляем данные');

      // Обновляем данные пользователя
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          telegram_username: telegramData.username,
          first_name: telegramData.first_name,
          last_name: telegramData.last_name,
          last_seen: new Date().toISOString(),
        })
        .eq('telegram_id', telegramData.telegram_id);

      if (updateError) {
        console.error('Error updating user:', updateError);
      }

      // Получаем обновленного пользователя
      const { data: updatedUser } = await supabase
        .from('profiles')
        .select('*, regions(*)')
        .eq('telegram_id', telegramData.telegram_id)
        .single();

      return updatedUser;
    }

    // Создаем нового пользователя
    console.log('Создание нового пользователя');

    const { data: newUser, error } = await supabase
      .from('profiles')
      .insert([
        {
          telegram_id: telegramData.telegram_id,
          telegram_username: telegramData.username,
          first_name: telegramData.first_name,
          last_name: telegramData.last_name,
          last_seen: new Date().toISOString(),
        },
      ])
      .select('*, regions(*)')
      .single();

    if (error) throw error;

    // Создаем баланс пользователя
    await supabase
      .from('user_balances')
      .insert([{ user_id: newUser.id }]);

    console.log('Новый пользователь создан:', newUser);

    return newUser;
  } catch (error) {
    console.error('Error creating/getting telegram user:', error);
    return null;
  }
};

// Получение пользователя по Telegram ID
export const getTelegramUser = async (telegramId: number): Promise<Profile | null> => {
  try {
    if (!isSupabaseAvailable() || !supabase) {
      console.error('Supabase недоступен');
      return null;
    }

    const { data, error } = await supabase
      .from('profiles')
      .select('*, regions(*)')
      .eq('telegram_id', telegramId)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error getting telegram user:', error);
    return null;
  }
};

// Инициализация Telegram Web App
export const initTelegramWebApp = () => {
  if (typeof window !== 'undefined' && (window as any).Telegram?.WebApp) {
    const tg = (window as any).Telegram.WebApp;
    
    console.log('Инициализация Telegram WebApp...');
    console.log('WebApp объект:', tg);
    console.log('initData:', tg.initData);
    console.log('initDataUnsafe:', tg.initDataUnsafe);
    
    tg.ready();
    tg.expand();
    
    // Настраиваем тему
    try {
      tg.setHeaderColor('#ffffff');
      tg.setBackgroundColor('#f8fafc');
    } catch (e) {
      console.log('Не удалось установить цвета темы:', e);
    }
    
    console.log('Telegram WebApp инициализирован:', tg);
    return tg;
  }
  console.log('Telegram WebApp недоступен');
  return null;
};

// Получение данных пользователя из Telegram Web App
export const getTelegramWebAppUser = () => {
  const tg = initTelegramWebApp();
  
  console.log('Telegram WebApp объект:', tg);
  console.log('initDataUnsafe:', tg?.initDataUnsafe);
  
  if (tg && tg.initDataUnsafe?.user) {
    console.log('Данные пользователя из Telegram:', tg.initDataUnsafe.user);
    return tg.initDataUnsafe.user;
  } else if (tg && tg.initData) {
    // Попробуем парсить initData вручную
    console.log('Попытка парсинга initData:', tg.initData);
    try {
      const urlParams = new URLSearchParams(tg.initData);
      const userParam = urlParams.get('user');
      if (userParam) {
        const user = JSON.parse(decodeURIComponent(userParam));
        console.log('Пользователь из initData:', user);
        return user;
      }
    } catch (error) {
      console.error('Ошибка парсинга initData:', error);
    }
  }
  
  console.log('Данные пользователя недоступны');
  return null;
};

// Проверка, запущено ли приложение в Telegram
export const isRunningInTelegram = (): boolean => {
  const inTelegram = typeof window !== 'undefined' && !!(window as any).Telegram?.WebApp;
  console.log('Проверка Telegram WebApp:', inTelegram);
  console.log('window.Telegram:', (window as any).Telegram);
  return inTelegram;
};

// Получение URL для открытия Web App
export const getTelegramWebAppUrl = (): string => {
  // Используем простой параметр для startapp
  return `https://t.me/${BOT_USERNAME}/start`;
};

// Открытие Telegram Web App
export const openTelegramWebApp = (): void => {
  const webAppUrl = getTelegramWebAppUrl();
  console.log('Открытие Telegram Web App:', webAppUrl);
  window.open(webAppUrl, '_blank');
};