
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
  
  return countries[countryCode] || countryCode;
};

export const ProductCardRating: React.FC<ProductCardRatingProps> = ({
  source,
  rating,
  country
}) => {
  // Определяем флаг для отображения
  const flag = country ? getCountryFlag(country) : null;
  const countryName = country ? getCountryName(country) : '';
  
  return (
    <div className="text-sm my-2 flex items-center justify-between h-5 px-2">
      <span className="text-xs text-left truncate max-w-[60%]">{source}</span>
      <div className="flex items-center gap-2">
        <div className="flex items-center">
          <Star size={14} className="text-yellow-500 fill-yellow-500" />
          <span className="text-xs ml-1">{rating}</span>
        </div>
        
        {flag && (
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
        )}
      </div>
    </div>
  );
};
