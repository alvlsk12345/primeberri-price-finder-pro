
import React from 'react';
import { Star, Flag } from "lucide-react";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";

interface ProductCardRatingProps {
  source: string;
  rating: number;
  country?: string;
}

// Функция для получения эмодзи флага по коду страны
const getCountryFlag = (countryCode: string): string => {
  // Преобразуем код страны к региональным индикаторам Unicode
  if (!countryCode || countryCode.length !== 2) return '🌍';
  
  const codePoints = [...countryCode.toUpperCase()]
    .map(char => 127397 + char.charCodeAt(0));
  
  return String.fromCodePoint(...codePoints);
};

// Функция для получения полного названия страны по коду
const getCountryName = (countryCode: string): string => {
  const countries = {
    'DE': 'Германия',
    'GB': 'Великобритания',
    'US': 'США',
    'FR': 'Франция',
    'IT': 'Италия',
    'ES': 'Испания',
    'NL': 'Нидерланды',
    'PL': 'Польша',
    'AT': 'Австрия',
    'CH': 'Швейцария'
  };
  
  return countries[countryCode.toUpperCase()] || countryCode;
};

// Функция для определения страны по домену в URL
const detectCountryFromUrl = (source: string, link?: string): string => {
  // Если есть прямая ссылка, пытаемся определить по домену
  if (link) {
    try {
      // Пытаемся извлечь домен из URL
      const url = new URL(link);
      const domain = url.hostname.toLowerCase();
      
      // Проверяем домены верхнего уровня
      if (domain.endsWith('.de')) return 'DE';
      if (domain.endsWith('.uk')) return 'GB';
      if (domain.endsWith('.fr')) return 'FR';
      if (domain.endsWith('.it')) return 'IT';
      if (domain.endsWith('.es')) return 'ES';
      if (domain.endsWith('.nl')) return 'NL';
      if (domain.endsWith('.pl')) return 'PL';
      if (domain.endsWith('.at')) return 'AT';
      if (domain.endsWith('.ch')) return 'CH';
      if (domain.endsWith('.com')) {
        // Для .com проверяем поддомены
        if (domain.includes('amazon.de')) return 'DE';
        if (domain.includes('amazon.co.uk')) return 'GB';
        if (domain.includes('amazon.fr')) return 'FR';
      }
    } catch (e) {
      console.log('Ошибка при извлечении домена из URL:', e);
    }
  }
  
  // Проверяем название магазина
  const sourceLC = source.toLowerCase();
  if (sourceLC.includes('amazon.de') || sourceLC.includes('amazon de')) return 'DE';
  if (sourceLC.includes('ebay.de') || sourceLC.includes('ebay de')) return 'DE';
  if (sourceLC.includes('otto.de') || sourceLC.includes('otto de')) return 'DE';
  if (sourceLC.includes('zalando.de')) return 'DE';
  
  // Значение по умолчанию
  return '';
};

export const ProductCardRating: React.FC<ProductCardRatingProps> = ({
  source,
  rating,
  country
}) => {
  // Определяем страну на основе данных товара и источника
  const detectedCountry = country || detectCountryFromUrl(source);
  
  // Определяем флаг для отображения
  const flag = detectedCountry ? getCountryFlag(detectedCountry) : '🌍';
  const countryName = detectedCountry ? getCountryName(detectedCountry) : 'Неизвестно';
  
  return (
    <div className="text-sm my-2 flex items-center justify-between h-5 px-2">
      <span className="text-xs text-left truncate max-w-[60%]">{source}</span>
      <div className="flex items-center gap-2">
        <div className="flex items-center">
          <Star size={14} className="text-yellow-500 fill-yellow-500" />
          <span className="text-xs ml-1">{rating}</span>
        </div>
        
        <HoverCard>
          <HoverCardTrigger asChild>
            <span className="cursor-help text-base">
              {flag}
            </span>
          </HoverCardTrigger>
          <HoverCardContent className="p-2 text-xs">
            <div className="flex items-center gap-2">
              <Flag size={14} />
              <span>Товар из: {countryName}</span>
            </div>
          </HoverCardContent>
        </HoverCard>
      </div>
    </div>
  );
};
