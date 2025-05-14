
import { BrandSuggestion } from "@/services/types";

// Фиксированные предложения для разных категорий запросов
export const getFixedSuggestions = (type: string): BrandSuggestion[] => {
  switch(type) {
    case 'headphones':
      return [
        {
          brand: "Sony",
          product: "WH-1000XM5",
          description: "Беспроводные наушники с активным шумоподавлением, 30 часов работы и высоким качеством звука."
        },
        {
          brand: "Bose",
          product: "QuietComfort 45",
          description: "Премиальные наушники с фирменной технологией шумоподавления и комфортом для длительного ношения."
        },
        {
          brand: "Apple",
          product: "AirPods Max",
          description: "Полноразмерные наушники с пространственным звуком и адаптивным эквалайзером для идеального звучания."
        },
        {
          brand: "Sennheiser",
          product: "Momentum 4 Wireless",
          description: "Студийное качество звука с поддержкой aptX HD и до 60 часов автономной работы."
        },
        {
          brand: "JBL",
          product: "Tour One",
          description: "Наушники с технологией True Adaptive Noise Cancelling и поддержкой голосовых ассистентов."
        },
        {
          brand: "Anker",
          product: "Soundcore Space Q45",
          description: "Доступные наушники с качественным звуком, шумоподавлением и долгим временем работы."
        }
      ];
      
    case 'cases':
      return [
        {
          brand: "Spigen",
          product: "Ultra Hybrid",
          description: "Прозрачный чехол с усиленными углами для максимальной защиты от падений."
        },
        {
          brand: "OtterBox",
          product: "Defender Series",
          description: "Многослойный защитный чехол с встроенной защитой экрана и клипсой для ремня."
        },
        {
          brand: "PITAKA",
          product: "MagEZ Case Pro",
          description: "Ультратонкий чехол из арамидного волокна с поддержкой MagSafe и беспроводной зарядки."
        },
        {
          brand: "Mous",
          product: "Limitless 5.0",
          description: "Защитный чехол с технологией AiroShock и совместимостью с аксессуарами для крепления."
        },
        {
          brand: "Nomad",
          product: "Modern Leather Case",
          description: "Премиальный кожаный чехол с патиной, которая приобретает уникальный внешний вид со временем."
        },
        {
          brand: "Moment",
          product: "Thin Photo Case",
          description: "Чехол для фотографов с креплением для дополнительных объективов и ремешком для руки."
        }
      ];
      
    default:
      return [
        {
          brand: "Sony",
          product: "WH-1000XM5",
          description: "Наушники с лучшим в своем классе шумоподавлением и режимом разговора."
        },
        {
          brand: "Apple",
          product: "AirPods Pro 2",
          description: "Беспроводные наушники с шумоподавлением, пространственным звуком и голосовым управлением."
        },
        {
          brand: "Samsung",
          product: "Galaxy Watch 6 Classic",
          description: "Стильные смарт-часы с функциями мониторинга здоровья и поддержкой приложений."
        },
        {
          brand: "Anker",
          product: "PowerCore III Elite",
          description: "Портативная батарея на 25600 мАч с быстрой зарядкой и несколькими портами."
        },
        {
          brand: "DJI",
          product: "Mini 3 Pro",
          description: "Компактный дрон с 4K камерой, длительным временем полета и продвинутыми функциями съемки."
        },
        {
          brand: "Logitech",
          product: "MX Master 3S",
          description: "Беспроводная мышь с высокоточным сенсором, бесшумными кнопками и эргономичным дизайном."
        }
      ];
  }
};
