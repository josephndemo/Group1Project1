import { Star } from 'lucide-react';

export default function StarRating({
  value,
  onChange,
  size = 20,
  readOnly = false,
  label = 'Rating',
}) {
  return (
    <div>
      <span className="sr-only">{label}</span>

      <div
        role={readOnly ? 'img' : 'radiogroup'}
        aria-label={label}
        className="flex items-center gap-1"
      >
        {[1, 2, 3, 4, 5].map((star) => {
          const filled = star <= value;

          return (
            <button
              key={star}
              type="button"
              role={readOnly ? undefined : 'radio'}
              aria-checked={readOnly ? undefined : filled}
              aria-label={`${star} star${star === 1 ? '' : 's'}`}
              disabled={readOnly}
              onClick={() => onChange?.(star)}
              className={[
                'rounded-md transition-transform duration-150 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2',
                readOnly ? 'cursor-default' : 'hover:scale-110 active:scale-95',
              ].join(' ')}
            >
              <Star
                size={size}
                className={filled ? 'text-amber-500' : 'text-slate-300'}
                fill={filled ? 'currentColor' : 'none'}
              />
            </button>
          );
        })}
      </div>
    </div>
  );
}