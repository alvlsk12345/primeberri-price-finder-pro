
// Определение типов для сервисов
export type Product = {
  id: string;
  name: string;
  price: number;
  currency: string;
  image: string;
  store: string;
};

// Тип для карты доменов магазинов
export type StoreMap = {
  [key: string]: string;
};
