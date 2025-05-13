
// Добавляем функцию для проверки соединения с Supabase
export const checkSupabaseConnection = async (logOutput: boolean = true): Promise<boolean> => {
  try {
    if (logOutput) {
      console.log('Проверка соединения с Supabase...');
    }
    
    // Проверяем соединение путем запроса общедоступной информации
    const { data, error } = await supabase.rpc('get_connection_status');
    
    if (error) {
      if (logOutput) {
        console.error('Ошибка подключения к Supabase:', error.message);
      }
      return false;
    }
    
    if (logOutput) {
      console.log('Соединение с Supabase успешно установлено');
    }
    
    return true;
  } catch (e) {
    if (logOutput) {
      console.error('Критическая ошибка при проверке соединения с Supabase:', e);
    }
    return false;
  }
};
