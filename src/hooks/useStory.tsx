import { useState, useEffect, useCallback, useRef } from "react";
import { Story, Chapter } from "@/types/IStory";
import { storiesRepo } from "@/services/StoriesRepo";

interface UseStoryOptions {
  storyId: string | undefined;
  onError?: (error: Error) => void;
}

export function useStory({ storyId, onError }: UseStoryOptions) {
  // Story data state
  const [currentStory, setCurrentStory] = useState<Story | null>(null);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [currentChapter, setCurrentChapter] = useState<Chapter | null>(null);
  const [storyTitle, setStoryTitle] = useState("");
  const [storyDescription, setStoryDescription] = useState("");
  const [chapterTitle, setChapterTitle] = useState("");

  // UI state
  const [saveStatus, setSaveStatus] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  // Refs for debounced values
  const storyTitleRef = useRef(storyTitle);
  const storyDescriptionRef = useRef(storyDescription);
  const chapterTitleRef = useRef(chapterTitle);

  // Update refs when values change
  useEffect(() => {
    storyTitleRef.current = storyTitle;
    storyDescriptionRef.current = storyDescription;
    chapterTitleRef.current = chapterTitle;
  }, [storyTitle, storyDescription, chapterTitle]);

  // Load story data
  const loadStory = useCallback(
    async (id: string) => {
      setIsLoading(true);
      try {
        const story = await storiesRepo.getStory(id);

        if (story) {
          setCurrentStory(story);
          setStoryTitle(story.title);
          setStoryDescription(story.description);
          const storyChapters = await storiesRepo.getChapters(id);
          if (storyChapters.length > 0) {
            setChapters(storyChapters);
            setCurrentChapter(storyChapters[0]);
          } else {
            console.warn(`[useStory] No chapters found for story ID: ${id}`);
          }
        } else {
          console.log(`[useStory] Story not found for ID: ${id}`);
        }
      } catch (error) {
        if (onError && error instanceof Error) {
          onError(error);
        }
      } finally {
        setIsLoading(false);
      }
    },
    [onError]
  );

  // Save story data
  const saveStory = useCallback(
    async (content: string) => {
      if (!currentStory) {
        console.error("No story selected");
        return;
      }

      setSaveStatus("Saving...");
      try {
        // Save chapter content
        if (currentChapter) {
          await storiesRepo.updateChapter(
            currentStory.id,
            currentChapter.id,
            chapterTitleRef.current,
            content
          );
        } else if (content.trim() || chapterTitleRef.current.trim()) {
          // Create new chapter if needed
          const newChapterId = await storiesRepo.addChapter(
            currentStory.id,
            chapterTitleRef.current
          );

          await storiesRepo.updateChapter(
            currentStory.id,
            newChapterId,
            chapterTitleRef.current,
            content
          );

          const newChapter = await storiesRepo.getChapter(
            currentStory.id,
            newChapterId
          );

          if (newChapter) {
            setCurrentChapter(newChapter);
            setChapters((prevChapters) => [...prevChapters, newChapter]);
          }
        }

        // Save story metadata
        await storiesRepo.updateStory(
          currentStory.id,
          storyTitleRef.current,
          storyDescriptionRef.current
        );

        // Update chapters list
        setChapters((prevChapters) =>
          prevChapters.map((chapter) =>
            chapter.id === currentChapter?.id
              ? {
                  ...chapter,
                  title: chapterTitleRef.current,
                  content,
                }
              : chapter
          )
        );

        setSaveStatus("Saved");
      } catch (error) {
        console.error("Error saving:", error);
        setSaveStatus(error instanceof Error ? error.message : "Error saving");

        if (onError && error instanceof Error) {
          onError(error);
        }
      } finally {
        setTimeout(() => setSaveStatus(""), 2000);
      }
    },
    [currentStory, currentChapter, onError]
  );

  // Create new chapter
  const createNewChapter = useCallback(async () => {
    if (!currentStory) return;

    try {
      const newChapterId = await storiesRepo.addChapter(
        currentStory.id,
        "New Chapter"
      );

      // Refresh story data
      await loadStory(currentStory.id);

      // Select the new chapter
      const newChapter = await storiesRepo.getChapter(
        currentStory.id,
        newChapterId
      );

      if (newChapter) {
        setCurrentChapter(newChapter);
        setChapterTitle(newChapter.title);
        return newChapter;
      }
    } catch (error) {
      console.error("Error creating chapter:", error);
      if (onError && error instanceof Error) {
        onError(error);
      }
    }
  }, [currentStory, loadStory, onError]);

  // Toggle publish status
  const togglePublish = useCallback(async () => {
    if (!currentStory) return;

    try {
      await storiesRepo.handlePublish(currentStory.id);
      setSaveStatus(currentStory.isPublished ? "Unpublished" : "Published");

      // Refresh the story data
      await loadStory(currentStory.id);
    } catch (error) {
      console.error("Error toggling publish status:", error);
      if (onError && error instanceof Error) {
        onError(error);
      }
    }
  }, [currentStory, loadStory, onError]);

  // Select a chapter
  const selectChapter = useCallback((chapter: Chapter) => {
    setCurrentChapter(chapter);
    setChapterTitle(chapter.title);
  }, []);

  // Load story when storyId changes
  useEffect(() => {
    if (storyId) {
      loadStory(storyId);
    }
  }, [storyId, loadStory]);

  return {
    // State
    currentStory,
    chapters,
    currentChapter,
    storyTitle,
    storyDescription,
    chapterTitle,
    saveStatus,
    isLoading,

    // Setters
    setStoryTitle,
    setStoryDescription,
    setChapterTitle,

    // Actions
    loadStory,
    saveStory,
    createNewChapter,
    togglePublish,
    selectChapter,
  };
}
