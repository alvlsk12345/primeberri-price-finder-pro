
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useSearch } from "@/contexts/SearchContext";

type Country = {
  code: string;
  name: string;
  flag: string;
};

const EUROPEAN_COUNTRIES: Country[] = [
  { code: 'gb', name: 'Великобритания', flag: '🇬🇧' },
  { code: 'de', name: 'Германия', flag: '🇩🇪' },
  { code: 'fr', name: 'Франция', flag: '🇫🇷' },
  { code: 'it', name: 'Италия', flag: '🇮🇹' },
  { code: 'es', name: 'Испания', flag: '🇪🇸' },
];

export const CountrySelector: React.FC = () => {
  const { selectedCountry, setSelectedCountry, handleSearch } = useSearch();

  const handleCountryChange = (value: string) => {
    setSelectedCountry(value);
    // Trigger a new search with the first page when country changes
    handleSearch(1, true);
  };

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-muted-foreground">Страна:</span>
      <Select value={selectedCountry} onValueChange={handleCountryChange}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Выберите страну" />
        </SelectTrigger>
        <SelectContent>
          {EUROPEAN_COUNTRIES.map((country) => (
            <SelectItem key={country.code} value={country.code}>
              <div className="flex items-center gap-2">
                <span>{country.flag}</span>
                <span>{country.name}</span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};
