import "./style.css";
import { useCallback, useEffect, useRef, useState } from "react";
import { Loader } from "lucide-react";

import { useNavigate, useParams } from "react-router-dom";
import { useAuthContext } from "../contexts/AuthContext";
import { storiesRepo } from "../services/StoriesRepo";
import { Chapter, Story } from "@/types/IStory";

// Import your new components
import { SidebarPanel } from "@/components/SidebarPanel";
import { StoryMetadata } from "@/components/StoryMetadata";
import { SaveControls } from "@/components/SaveControls";
import { TipTapEditor } from "@/components/TipTapEditor";

export function SimpleEditor() {
  const navigate = useNavigate();
  const { storyId } = useParams<{ storyId: string }>();
  const { user } = useAuthContext();

  // State variables
  const [currentStory, setCurrentStory] = useState<Story | null>(null);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [currentChapter, setCurrentChapter] = useState<Chapter | null>(null);
  const [storyTitle, setStoryTitle] = useState("");
  const [storyDescription, setStoryDescription] = useState("");
  const [chapterTitle, setChapterTitle] = useState("");
  const [saveStatus, setSaveStatus] = useState("");
  const [storyLoading, setStoryLoading] = useState(true);
  const [selectedText, setSelectedText] = useState("");
  const [activeTab, setActiveTab] = useState<"chapters" | "ai">("chapters");

  // Refs for debouncing
  const storyTitleRef = useRef(storyTitle);
  const storyDescriptionRef = useRef(storyDescription);
  const chapterTitleRef = useRef(chapterTitle);

  // Load story and chapters
  const loadStory = async (storyId: string) => {
    setStoryLoading(true);
    const story = await storiesRepo.getStory(storyId);

    if (story) {
      setCurrentStory(story);
      setStoryTitle(story.title);
      setStoryDescription(story.description);
      const storyChapters = await storiesRepo.getChapters(storyId);
      setChapters(storyChapters);
      if (storyChapters.length > 0) {
        setCurrentChapter(storyChapters[0]);
        setChapterTitle(storyChapters[0].title);
        setStoryLoading(false);
      } else {
        setCurrentChapter(null);
        setChapterTitle("");
        setStoryLoading(false);
      }
    }
  };

  // Save function
  const handleSave = useCallback(
    async (content: string) => {
      if (!currentStory) {
        console.error("No story selected");
        return;
      }
      setSaveStatus("Saving...");
      try {
        const saveChapter = async () => {
          if (currentChapter) {
            // Update existing chapter
            await storiesRepo.updateChapter(
              currentStory.id,
              currentChapter.id,
              chapterTitleRef.current,
              content
            );
          } else if (content.trim() || chapterTitleRef.current.trim()) {
            // Add new chapter if content or title is not empty
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
        };

        // Save chapter and story
        await saveChapter();
        await storiesRepo.updateStory(
          currentStory.id,
          storyTitleRef.current,
          storyDescriptionRef.current
        );

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
      } finally {
        setTimeout(() => setSaveStatus(""), 2000);
      }
    },
    [currentStory, currentChapter]
  );

  // Handle new chapter creation
  const handleNewChapter = async () => {
    if (!currentStory) return;
    const newChapterId = await storiesRepo.addChapter(
      currentStory.id,
      "New Chapter"
    );
    await loadStory(currentStory.id); // This will refresh the chapters list
    const newChapter = await storiesRepo.getChapter(
      currentStory.id,
      newChapterId
    );
    if (newChapter) {
      setCurrentChapter(newChapter);
      setChapterTitle(newChapter.title);
    }
  };

  // Handle publishing
  const handlePublish = async () => {
    if (!currentStory) return;
    await storiesRepo.handlePublish(currentStory.id);
    navigate("/stories");
    setTimeout(() => setSaveStatus(""), 2000);
  };

  // Update refs when state changes
  useEffect(() => {
    storyTitleRef.current = storyTitle;
    storyDescriptionRef.current = storyDescription;
    chapterTitleRef.current = chapterTitle;
  }, [storyTitle, storyDescription, chapterTitle]);

  // Load story on component mount
  useEffect(() => {
    if (storyId) {
      loadStory(storyId);
    }
  }, [storyId, user]);

  // Handle chapter selection
  const handleChapterSelect = (chapter: Chapter) => {
    setCurrentChapter(chapter);
    setChapterTitle(chapter.title);
  };

  // Handle metadata changes
  const handleMetadataChange = () => {
    if (currentChapter && currentChapter.content) {
      handleSave(currentChapter.content);
    }
  };

  // Handle content changes in editor
  const handleContentChange = (content: string) => {
    if (currentChapter) {
      setCurrentChapter((prev) => (prev ? { ...prev, content } : null));
    }
  };

  // Handle selection changes in editor
  const handleSelectionChange = (text: string) => {
    setSelectedText(text);
  };

  return (
    <div className="flex p-4 mt-4 justify-center overflow-auto">
      {storyLoading ? (
        <div className="flex items-center justify-center w-full h-full">
          <Loader className="w-12 h-12 text-amber-800 animate-spin" />
        </div>
      ) : (
        <div className="flex flex-col lg:flex-row h-screen w-full gap-4 ">
          {/* Main Content Area */}
          <div className="lg:w-2/3 flex flex-col space-y-4">
            <div className="bg-amber-50 p-6 rounded-lg ">
              <h1 className="mb-4 text-3xl font-bold text-slate-800 italic">
                Summon your ultimate writing muse by pressing{" "}
                <span className="underline decoration-wavy text-blue-600">
                  TAB
                </span>
              </h1>

              {/* Story Metadata Component */}
              <StoryMetadata
                storyTitle={storyTitle}
                storyDescription={storyDescription}
                chapterTitle={chapterTitle}
                onStoryTitleChange={setStoryTitle}
                onStoryDescriptionChange={setStoryDescription}
                onChapterTitleChange={setChapterTitle}
                onMetadataChange={handleMetadataChange}
              />

              {/* TipTap Editor Component */}
              {currentChapter && (
                <TipTapEditor
                  initialContent={currentChapter.content}
                  onContentChange={handleContentChange}
                  onSave={handleSave}
                  onSelectionChange={handleSelectionChange}
                />
              )}

              {/* Save Controls Component */}
              <SaveControls
                isPublished={currentStory?.isPublished || false}
                saveStatus={saveStatus}
                onPublish={handlePublish}
                onNewChapter={handleNewChapter}
              />
            </div>
          </div>

          {/* Sidebar Panel Component */}
          <div className="lg:w-1/3">
            <SidebarPanel
              chapters={chapters}
              currentChapterId={currentChapter?.id || ""}
              chapterTitle={chapterTitle}
              selectedText={selectedText}
              onChapterSelect={handleChapterSelect}
              activeTab={activeTab}
              onTabChange={setActiveTab}
            />
          </div>
        </div>
      )}
    </div>
  );
}
