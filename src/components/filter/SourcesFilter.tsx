
import React from 'react';
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

interface SourcesFilterProps {
  availableSources: string[];
  selectedSources: string[];
  onSourceChange: (source: string, checked: boolean) => void;
}

export const SourcesFilter: React.FC<SourcesFilterProps> = ({
  availableSources,
  selectedSources,
  onSourceChange
}) => {
  if (availableSources.length === 0) return null;
  
  return (
    <div>
      <h3 className="font-medium mb-2">Магазины</h3>
      <div className="max-h-32 overflow-y-auto space-y-2">
        {availableSources.map(source => (
          <div key={source} className="flex items-center space-x-2">
            <Checkbox 
              id={`source-${source}`} 
              checked={selectedSources.includes(source)}
              onCheckedChange={(checked) => 
                onSourceChange(source, checked as boolean)
              }
            />
            <Label htmlFor={`source-${source}`} className="text-sm">
              {source}
            </Label>
          </div>
        ))}
      </div>
    </div>
  );
};
