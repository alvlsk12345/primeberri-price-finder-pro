
// Функция для создания слага из имени продукта
export const createProductSlug = (name: string | undefined): string => {
  // Добавляем проверку на null/undefined и обеспечиваем значение по умолчанию
  if (!name) {
    console.warn('Product name is undefined, using default slug');
    return 'product';
  }
  
  return name.toLowerCase()
    .replace(/[^a-zа-яё0-9]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, ''); // Удаляем тире в начале и конце
};
