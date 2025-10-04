import { useState, useEffect } from 'react';
import { isSupabaseAvailable } from '../lib/supabase';
import { createOrGetTelegramUser, getTelegramWebAppUser, isRunningInTelegram } from '../services/telegramService';
import type { Profile, TelegramUser } from '../types';

export function useAuth() {
  const [user, setUser] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isGuest, setIsGuest] = useState(false);

  useEffect(() => {
    // Проверяем пользователя при загрузке
    checkUser();
  }, []);

  const checkUser = async () => {
    try {
      console.log('Проверка пользователя...');
      console.log('Запущено в Telegram:', isRunningInTelegram());
      console.log('URL:', window.location.href);
      console.log('User Agent:', navigator.userAgent);
      
      // Если Supabase недоступен, работаем в режиме гостя
      if (!isSupabaseAvailable()) {
        console.log('Supabase недоступен, работаем в гостевом режиме');
        setIsGuest(true);
        setLoading(false);
        return;
      }

      // Проверяем, запущено ли в Telegram
      if (isRunningInTelegram()) {
        // Даем время на инициализацию Telegram Web App
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        const tgUser = getTelegramWebAppUser();
        console.log('Пользователь Telegram:', tgUser);
        
        if (tgUser) {
          const telegramUser = {
            telegram_id: tgUser.id,
            username: tgUser.username,
            first_name: tgUser.first_name,
            last_name: tgUser.last_name,
          };
          
          console.log('Авторизация пользователя:', telegramUser);
          
          const dbUser = await createOrGetTelegramUser(telegramUser);
          if (dbUser) {
            console.log('Пользователь авторизован:', dbUser);
            setUser(dbUser);
            setIsGuest(false);
          } else {
            console.log('Ошибка создания пользователя');
            setIsGuest(true);
          }
        } else {
          console.log('Данные пользователя недоступны');
          setIsGuest(true);
        }
      } else {
        console.log('Приложение открыто вне Telegram');
        setIsGuest(true);
      }
    } catch (error) {
      console.error('Ошибка проверки пользователя:', error);
      setIsGuest(true);
    } finally {
      setLoading(false);
    }
  };

  const loginWithTelegram = async (telegramUser: any) => {
    try {
      if (!isSupabaseAvailable()) {
        throw new Error('База данных недоступна');
      }

      setLoading(true);
      console.log('Вход через Telegram:', telegramUser);
      
      if (!telegramUser || !telegramUser.id) {
        throw new Error('Некорректные данные пользователя Telegram');
      }
      
      const dbUser = await createOrGetTelegramUser({
        telegram_id: telegramUser.id,
        username: telegramUser.username,
        first_name: telegramUser.first_name,
        last_name: telegramUser.last_name,
      });
      
      if (dbUser) {
        console.log('Успешная авторизация:', dbUser);
        setUser(dbUser);
        setIsGuest(false);
      } else {
        throw new Error('Не удалось создать пользователя');
      }
    } catch (error) {
      console.error('Ошибка входа через Telegram:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    console.log('Выход из системы');
    setUser(null);
    setIsGuest(true);
  };

  return {
    user,
    isGuest,
    loading,
    loginWithTelegram,
    logout,
  };
}