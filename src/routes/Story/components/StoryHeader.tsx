import React from "react";
import { Star } from "lucide-react";

interface StoryHeaderProps {
  title: string;
  author: string;
  rating?: number;
  genres?: string[];
}

export const StoryHeader: React.FC<StoryHeaderProps> = ({
  title,
  author,
  rating = 4.5,
  genres = ["Fiction", "Adventure", "Fantasy"],
}) => {
  return (
    <div className="mb-8">
      <h1 className="text-4xl md:text-6xl font-serif font-bold mb-3 text-black dark:text-white leading-tight">
        {title}
      </h1>

      <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6">
        <div className="text-xl text-black/80 dark:text-white/80">
          <span className="opacity-60">by</span>{" "}
          <span className="font-semibold underline decoration-2 decoration-dark-green/30 dark:decoration-light-green/30 underline-offset-4">
            {author}
          </span>
        </div>

        {/* Star Rating Display */}
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <Star
              key={star}
              size={18}
              className={`${
                star <= Math.round(rating)
                  ? "fill-yellow-400 text-yellow-400"
                  : "text-neutral-300 dark:text-neutral-700"
              }`}
            />
          ))}
          <span className="ml-2 text-sm text-black/50 dark:text-white/50">
            420 ratings
          </span>
        </div>
      </div>

      {/* Genres */}
      <div className="flex flex-wrap gap-2 mb-8">
        {genres.map((g) => (
          <span
            key={g}
            className="px-3 py-1 rounded-full text-xs font-medium bg-neutral-100 dark:bg-neutral-800 text-black/70 dark:text-white/70 uppercase tracking-wide"
          >
            {g}
          </span>
        ))}
      </div>
    </div>
  );
};

