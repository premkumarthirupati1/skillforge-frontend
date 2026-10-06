import React, { useState } from 'react';
import { Star } from 'lucide-react';

const StarRating = ({ rating, setRating, readOnly = false, size = 20 }) => {
    const [hover, setHover] = useState(0);

    return (
        <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((star) => {
                const isFilled = star <= (hover || rating);
                return (
                    <button
                        key={star}
                        type="button"
                        disabled={readOnly}
                        className={`transition-colors ${readOnly ? 'cursor-default' : 'cursor-pointer'} ${
                            isFilled ? 'text-yellow-400 fill-yellow-400' : 'text-slate-300 dark:text-slate-600'
                        }`}
                        onClick={() => !readOnly && setRating && setRating(star)}
                        onMouseEnter={() => !readOnly && setHover(star)}
                        onMouseLeave={() => !readOnly && setHover(0)}
                        style={{ background: 'none', border: 'none', padding: 0 }}
                    >
                        <Star size={size} fill={isFilled ? 'currentColor' : 'none'} strokeWidth={1.5} />
                    </button>
                );
            })}
        </div>
    );
};

export default StarRating;
