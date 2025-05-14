
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * Утилита для объединения классов с помощью clsx и tailwind-merge
 * Это стандартная утилита для проектов с Tailwind CSS и позволяет 
 * эффективно объединять условные классы, массивы классов и т.д.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Утилита для безопасного парсинга значения из localStorage
 * @param key Ключ в localStorage
 * @param defaultValue Значение по умолчанию
 * @returns Распарсенное значение или defaultValue в случае ошибки
 */
export function getLocalStorageItem<T>(key: string, defaultValue: T): T {
  try {
    const item = localStorage.getItem(key);
    if (item === null) return defaultValue;
    return JSON.parse(item) as T;
  } catch (error) {
    console.error(`Ошибка при чтении ${key} из localStorage:`, error);
    // При ошибке пытаемся очистить повреждённые данные
    try {
      localStorage.removeItem(key);
    } catch (e) {
      console.error(`Не удалось удалить ${key} из localStorage:`, e);
    }
    return defaultValue;
  }
}

/**
 * Утилита для безопасного сохранения значения в localStorage
 * @param key Ключ в localStorage
 * @param value Значение для сохранения
 * @returns true если сохранение успешно, false в противном случае
 */
export function setLocalStorageItem<T>(key: string, value: T): boolean {
  try {
    const serialized = JSON.stringify(value);
    localStorage.setItem(key, serialized);
    return true;
  } catch (error) {
    console.error(`Ошибка при сохранении ${key} в localStorage:`, error);
    return false;
  }
}

/**
 * Функция для задержки выполнения
 * @param ms Задержка в миллисекундах
 * @returns Promise который разрешается через указанное время
 */
export function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Безопасно выполняет callback с тайм-аутом
 * @param callback Функция для выполнения
 * @param timeoutMs Тайм-аут в миллисекундах
 * @param fallback Значение по умолчанию в случае тайм-аута
 * @returns Результат callback или fallback в случае тайм-аута
 */
export async function withTimeout<T>(
  callback: () => Promise<T>, 
  timeoutMs: number, 
  fallback: T
): Promise<T> {
  let timeoutId: NodeJS.Timeout;
  const timeoutPromise = new Promise<T>((_, reject) => {
    timeoutId = setTimeout(() => reject(new Error('Timeout')), timeoutMs);
  });

  try {
    const result = await Promise.race([callback(), timeoutPromise]);
    clearTimeout(timeoutId!);
    return result as T;
  } catch (error) {
    console.error('Операция прервана из-за тайм-аута:', error);
    return fallback;
  }
}
