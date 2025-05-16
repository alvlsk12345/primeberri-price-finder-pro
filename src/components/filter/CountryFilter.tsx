
import React from 'react';
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, ChevronUp } from 'lucide-react';

type CountryOption = {
  code: string;
  name: string;
  flag: string;
};

// Фиксированный список стран ЕС в порядке приоритета
export const EUROPEAN_COUNTRIES: CountryOption[] = [
  { code: 'de', name: 'Германия', flag: '🇩🇪' },
  { code: 'fr', name: 'Франция', flag: '🇫🇷' },
  { code: 'es', name: 'Испания', flag: '🇪🇸' },
  { code: 'it', name: 'Италия', flag: '🇮🇹' },
  { code: 'nl', name: 'Нидерланды', flag: '🇳🇱' },
  { code: 'be', name: 'Бельгия', flag: '🇧🇪' },
  { code: 'pl', name: 'Польша', flag: '🇵🇱' },
  { code: 'gb', name: 'Великобритания', flag: '🇬🇧' },
];

interface CountryFilterProps {
  selectedCountries: string[];
  onCountryChange: (country: string, checked: boolean) => void;
}

export const CountryFilter: React.FC<CountryFilterProps> = ({
  selectedCountries,
  onCountryChange
}) => {
  const [isOpen, setIsOpen] = React.useState(true);

  return (
    <div className="space-y-2">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium">Страны</h3>
          <CollapsibleTrigger asChild>
            <button className="p-1 rounded-md hover:bg-accent">
              {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>
          </CollapsibleTrigger>
        </div>
        <Separator className="my-2" />
        <CollapsibleContent>
          <div className="space-y-2 mt-2">
            {EUROPEAN_COUNTRIES.map((country) => (
              <div key={country.code} className="flex items-center space-x-2">
                <Checkbox
                  id={`country-${country.code}`}
                  checked={selectedCountries.includes(country.code)}
                  onCheckedChange={(checked) => {
                    onCountryChange(country.code, checked === true);
                  }}
                />
                <Label
                  htmlFor={`country-${country.code}`}
                  className="text-sm flex items-center cursor-pointer"
                >
                  <span className="mr-2">{country.flag}</span>
                  <span>{country.name}</span>
                </Label>
              </div>
            ))}
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
};
