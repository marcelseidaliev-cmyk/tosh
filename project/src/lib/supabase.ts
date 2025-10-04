import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Создаем клиент только если есть переменные окружения
export const supabase = supabaseUrl && supabaseAnonKey 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// Функция для проверки доступности Supabase
export const isSupabaseAvailable = () => {
  return !!(supabaseUrl && supabaseAnonKey && supabase);
};

// ImgBB API configuration
export const IMGBB_API_KEY = import.meta.env.VITE_IMGBB_API_KEY || '';
export const IMGBB_UPLOAD_URL = 'https://api.imgbb.com/1/upload';

export async function uploadImageToImgBB(file: File): Promise<string> {
  if (!IMGBB_API_KEY) {
    throw new Error('ImgBB API key not configured');
  }

  const formData = new FormData();
  formData.append('image', file);
  formData.append('key', IMGBB_API_KEY);

  try {
    const response = await fetch(IMGBB_UPLOAD_URL, {
      method: 'POST',
      body: formData,
    });

    const result = await response.json();
    
    if (result.success) {
      return result.data.url;
    } else {
      throw new Error('Failed to upload image');
    }
  } catch (error) {
    console.error('Error uploading image:', error);
    throw error;
  }
}