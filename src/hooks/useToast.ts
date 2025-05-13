
/**
 * Хук для работы с всплывающими уведомлениями
 * Реэкспортирует функционал из соннера для унифицированного доступа
 */
import { toast as sonnerToast } from "sonner";

export const toast = sonnerToast;

export function useToast() {
  return {
    toast: sonnerToast,
  };
}
