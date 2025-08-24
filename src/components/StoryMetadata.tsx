import React, { useRef, useEffect, ChangeEvent } from "react";

interface StoryMetadataProps {
  storyTitle: string;
  storyDescription: string;
  chapterTitle: string;
  onStoryTitleChange: (title: string) => void;
  onStoryDescriptionChange: (description: string) => void;
  onChapterTitleChange: (title: string) => void;
  onMetadataChange: () => void;
}

export const StoryMetadata: React.FC<StoryMetadataProps> = ({
  storyTitle,
  storyDescription,
  chapterTitle,
  onStoryTitleChange,
  onStoryDescriptionChange,
  onChapterTitleChange,
  onMetadataChange,
}) => {
  // Debounce timer for saving
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Handle changes with debounced saving
  const handleInputChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    setter: (value: string) => void
  ) => {
    const value = e.target.value;
    setter(value);

    // Debounce metadata saves
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      onMetadataChange();
      debounceTimerRef.current = null;
    }, 1000);
  };

  // Clean up debounce timer
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  return (
    <div className="mb-4 space-y-2">
      <div className="relative">
        <input
          type="text"
          value={storyTitle}
          onChange={(e) => handleInputChange(e, onStoryTitleChange)}
          placeholder="Story Title"
          className="w-full p-3 pl-4 border border-black/20 dark:border-white/20 bg-white dark:bg-black text-black dark:text-white rounded-lg shadow-sm focus:ring-2 focus:ring-dark-green dark:focus:ring-light-green focus:border-dark-green dark:focus:border-light-green transition-all duration-200"
          maxLength={80}
        />
        <div className="absolute right-3 bottom-1 text-xs text-black/50 dark:text-white/50">
          {storyTitle.length}/80
        </div>
      </div>

      <div className="relative">
        <textarea
          value={storyDescription}
          onChange={(e) => handleInputChange(e, onStoryDescriptionChange)}
          placeholder="Story Description"
          className="w-full p-3 pl-4 border border-black/20 dark:border-white/20 bg-white dark:bg-black text-black dark:text-white rounded-lg shadow-sm focus:ring-2 focus:ring-dark-green dark:focus:ring-light-green focus:border-dark-green dark:focus:border-light-green transition-all duration-200 resize-none"
          rows={3}
          maxLength={200}
        />
        <div className="absolute right-3 bottom-1 text-xs text-black/50 dark:text-white/50">
          {storyDescription.length}/200
        </div>
      </div>

      <div className="relative">
        <input
          type="text"
          value={chapterTitle}
          onChange={(e) => handleInputChange(e, onChapterTitleChange)}
          placeholder="Chapter Title"
          className="w-full p-3 pl-4 border border-black/20 dark:border-white/20 bg-white dark:bg-black text-black dark:text-white rounded-lg shadow-sm focus:ring-2 focus:ring-dark-green dark:focus:ring-light-green focus:border-dark-green dark:focus:border-light-green transition-all duration-200"
          maxLength={80}
        />
        <div className="absolute right-3 bottom-1 text-xs text-black/50 dark:text-white/50">
          {chapterTitle.length}/80
        </div>
      </div>
    </div>
  );
};
