
import { useToast as useToastShadcn } from "@/components/ui/toast";
import { toast as toastSonner } from "sonner";

// Реэкспортируем хук из UI компонента
export const useToast = useToastShadcn;

// Обертка для toast функции из sonner
export const toast = toastSonner;
