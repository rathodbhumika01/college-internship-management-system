import React from 'react';
import { Star } from 'lucide-react';

interface StarRatingProps {
  value: number; // 1 to 5
  onChange?: (val: number) => void;
  readOnly?: boolean;
  size?: 'sm' | 'md' | 'lg';
  label?: string;
}

export const StarRating: React.FC<StarRatingProps> = ({
  value,
  onChange,
  readOnly = false,
  size = 'md',
  label,
}) => {
  const iconSize = size === 'sm' ? 14 : size === 'lg' ? 22 : 18;

  return (
    <div className="flex flex-col gap-1">
      {label && <span className="text-xs font-medium text-slate-700">{label}</span>}
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => {
          const filled = star <= Math.round(value);
          return (
            <button
              type="button"
              key={star}
              disabled={readOnly}
              onClick={() => onChange && onChange(star)}
              className={`p-0.5 transition-colors ${
                readOnly ? 'cursor-default' : 'cursor-pointer hover:scale-110'
              }`}
              title={`${star} star${star > 1 ? 's' : ''}`}
            >
              <Star
                size={iconSize}
                className={
                  filled
                    ? 'text-amber-500 fill-amber-500'
                    : 'text-slate-300 stroke-slate-300'
                }
              />
            </button>
          );
        })}
        {readOnly && (
          <span className="text-xs font-semibold text-slate-600 ml-1.5 tabular-nums">
            {value.toFixed(1)}
          </span>
        )}
      </div>
    </div>
  );
};
