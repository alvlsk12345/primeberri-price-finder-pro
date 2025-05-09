
import React, { useState, useEffect } from 'react';
import { getExchangeRate } from "@/services/exchangeService";

interface ProductCardPriceProps {
  price: string;
  availability?: string;
  currency: string;
}

export const ProductCardPrice: React.FC<ProductCardPriceProps> = ({ 
  price,
  availability,
  currency
}) => {
  const [parsedPrice, setParsedPrice] = useState(0);
  const [priceInRubles, setPriceInRubles] = useState<string | null>(null);
  
  // Extract numeric price value from string
  useEffect(() => {
    const priceMatch = price.match(/\d+([.,]\d+)?/);
    const extractedPrice = priceMatch ? parseFloat(priceMatch[0].replace(',', '.')) : 0;
    setParsedPrice(extractedPrice);
  }, [price]);
  
  // Calculate price in rubles
  useEffect(() => {
    const calculatePrice = async () => {
      try {
        // Constants
        const deliveryCost = 9.5;
        const exchangeRate = 105;
        const customsFee = 0.05; // 5%
        
        let totalPriceInRubles;
        
        // Apply the formula based on price
        if (parsedPrice > 200) {
          // Formula for items over 200 EUR
          // (price + (price - 200)*0.15 + price*0.05)*105 + 9.5*105
          const customsDuty = (parsedPrice - 200) * 0.15;
          totalPriceInRubles = (parsedPrice + customsDuty + parsedPrice * customsFee) * exchangeRate + 
                               (deliveryCost * exchangeRate);
        } else {
          // Formula for items 200 EUR or less
          // (price + price*0.05)*105 + 9.5*105
          totalPriceInRubles = (parsedPrice + parsedPrice * customsFee) * exchangeRate + 
                               (deliveryCost * exchangeRate);
        }
        
        // Format price with thousand separator
        setPriceInRubles(totalPriceInRubles.toLocaleString('ru-RU', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2
        }));
      } catch (error) {
        console.error('Error calculating price in rubles:', error);
        setPriceInRubles(null);
      }
    };
    
    if (parsedPrice > 0) {
      calculatePrice();
    }
  }, [parsedPrice]);
  
  // Format the original price to show the currency symbol after the number
  const formattedPrice = () => {
    const priceMatch = price.match(/\d+([.,]\d+)?/);
    if (priceMatch) {
      return `${priceMatch[0]} €`;
    }
    return price;
  };
  
  return (
    <div className="min-h-[4rem] flex flex-col justify-center">
      <div className="font-bold text-lg">
        {formattedPrice()}
      </div>
      {priceInRubles && (
        <div className="text-xs text-blue-600 font-medium">
          {priceInRubles} ₽ <span className="whitespace-nowrap">С доставкой в 🇷🇺</span>
        </div>
      )}
      {availability && (
        <div className="text-xs text-gray-500 mt-1">
          {availability}
        </div>
      )}
    </div>
  );
};
