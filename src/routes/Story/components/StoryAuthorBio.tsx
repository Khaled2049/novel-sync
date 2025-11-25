import React from "react";
import { User } from "lucide-react";

interface StoryAuthorBioProps {
  author: string;
  bio?: string;
}

export const StoryAuthorBio: React.FC<StoryAuthorBioProps> = ({
  author,
  bio,
}) => {
  const authorBio =
    bio || `${author} is a writer who loves exploring complex themes through storytelling.`;

  return (
    <section className="mb-12">
      <h3 className="text-xs font-bold uppercase tracking-widest text-black/40 dark:text-white/40 mb-4">
        About the Author
      </h3>
      <div className="flex gap-6 items-start">
        <div className="w-16 h-16 rounded-full bg-neutral-200 dark:bg-neutral-800 flex items-center justify-center flex-shrink-0">
          <User size={32} className="text-black/40 dark:text-white/40" />
        </div>
        <div>
          <h4 className="font-bold text-lg text-black dark:text-white mb-2">
            {author}
          </h4>
          <p className="text-black/70 dark:text-white/70 leading-relaxed">
            {authorBio}
          </p>
        </div>
      </div>
    </section>
  );
};

