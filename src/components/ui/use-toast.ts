
// Реэкспорт из hooks для обратной совместимости
import { useToast } from "@/hooks/use-toast";
import { toast as originalToast } from "sonner";

// Безопасная обертка для toast
const toast = {
  ...originalToast,
  
  // Переопределяем dismiss, чтобы он был безопасным при отсутствии тоста с указанным id
  dismiss: (toastId?: string) => {
    try {
      if (toastId) {
        console.log(`[toast] Закрытие toast с ID: ${toastId}`);
      }
      originalToast.dismiss(toastId);
    } catch (error) {
      console.error(`[toast] Ошибка при закрытии toast${toastId ? ` с ID ${toastId}` : ''}:`, error);
    }
  },
  
  // Безопасная версия success
  success: (message: string, options?: any) => {
    try {
      return originalToast.success(message, options);
    } catch (error) {
      console.error(`[toast] Ошибка при отображении toast.success:`, error);
      return null; // Возвращаем null, чтобы избежать ошибок при использовании результата
    }
  },
  
  // Безопасная версия error
  error: (message: string, options?: any) => {
    try {
      return originalToast.error(message, options);
    } catch (error) {
      console.error(`[toast] Ошибка при отображении toast.error:`, error);
      return null;
    }
  },
  
  // Безопасная версия loading
  loading: (message: string, options?: any) => {
    try {
      return originalToast.loading(message, options);
    } catch (error) {
      console.error(`[toast] Ошибка при отображении toast.loading:`, error);
      return null;
    }
  }
};

export { useToast, toast };
