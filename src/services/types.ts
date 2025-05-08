
// Определение типов для сервисов
export type Product = {
  id: string;
  title: string;
  subtitle: string;
  price: string;
  currency: string;
  image: string;
  link: string;
  rating: number;
  source: string;
};

// Тип для карты доменов магазинов
export type StoreMap = {
  [key: string]: string;
};
