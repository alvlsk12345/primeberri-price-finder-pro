
import React from 'react';
import { Slider } from "@/components/ui/slider";

interface RatingFilterProps {
  rating: number;
  onRatingChange: (values: number[]) => void;
}

export const RatingFilter: React.FC<RatingFilterProps> = ({ rating, onRatingChange }) => {
  return (
    <div>
      <h3 className="font-medium mb-2">Минимальный рейтинг</h3>
      <div className="px-2">
        <Slider
          defaultValue={[rating || 0]}
          min={0}
          max={5}
          step={0.5}
          value={[rating || 0]}
          onValueChange={onRatingChange}
          className="mb-2"
        />
        <div className="text-center text-sm">
          {rating ? `${rating} и выше` : 'Любой рейтинг'}
        </div>
      </div>
    </div>
  );
};
