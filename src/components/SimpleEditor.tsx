import "./style.css";
import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Loader } from "lucide-react";

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
  const [_saveStatus, setSaveStatus] = useState("");
  const [storyLoading, setStoryLoading] = useState(true);
  const [selectedText, setSelectedText] = useState("");
  const [activeTab, setActiveTab] = useState<"chapters" | "ai">("chapters");
  const [leftSidebarOpen, setLeftSidebarOpen] = useState(true);
  const [rightSidebarOpen, setRightSidebarOpen] = useState(false);

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
    <div className="h-screen w-full bg-neutral-50 dark:bg-neutral-950 flex overflow-hidden transition-colors duration-200">
      {storyLoading ? (
        <div className="flex items-center justify-center w-full h-full text-dark-green dark:text-light-green">
          <Loader className="w-12 h-12 animate-spin" />
        </div>
      ) : (
        <>
          {/* Left Sidebar - Chapters/AI Tools */}
          <div
            className={`relative bg-neutral-50 dark:bg-black border-r border-black/10 dark:border-white/10 transition-all duration-300 ease-in-out ${
              leftSidebarOpen ? "w-80" : "w-0"
            } overflow-hidden`}
          >
            <div className="w-80 h-full">
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

          {/* Left Sidebar Toggle Button */}
          <button
            onClick={() => setLeftSidebarOpen(!leftSidebarOpen)}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-neutral-50 dark:bg-black border border-black/10 dark:border-white/10 rounded-r-lg p-2 shadow-lg hover:bg-black/5 dark:hover:bg-neutral-50/5 transition-all duration-200"
            style={{ left: leftSidebarOpen ? "320px" : "0px" }}
          >
            {leftSidebarOpen ? (
              <ChevronLeft className="w-4 h-4 text-black dark:text-white" />
            ) : (
              <ChevronRight className="w-4 h-4 text-black dark:text-white" />
            )}
          </button>

          {/* Main Editor Area */}
          <div className="flex-1 overflow-auto">
            <div className="max-w-4xl mx-auto px-8 py-12 ">
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
                <div className="bg-neutral-50 dark:bg-transparent">
                  <TipTapEditor
                    initialContent={currentChapter.content}
                    onContentChange={handleContentChange}
                    onSave={handleSave}
                    onSelectionChange={handleSelectionChange}
                  />
                </div>
              )}

              {/* Save Controls Component */}
              <SaveControls
                isPublished={currentStory?.isPublished || false}
                onPublish={handlePublish}
                onNewChapter={handleNewChapter}
              />
            </div>
          </div>

          {/* Right Sidebar Toggle Button */}
          <button
            onClick={() => setRightSidebarOpen(!rightSidebarOpen)}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-neutral-50 dark:bg-black border border-black/10 dark:border-white/10 rounded-l-lg p-2 shadow-lg hover:bg-black/5 dark:hover:bg-neutral-50/5 transition-all duration-200"
            style={{ right: rightSidebarOpen ? "320px" : "0px" }}
          >
            {rightSidebarOpen ? (
              <ChevronRight className="w-4 h-4 text-black dark:text-white" />
            ) : (
              <ChevronLeft className="w-4 h-4 text-black dark:text-white" />
            )}
          </button>

          {/* Right Sidebar - Writing Stats */}
          <div
            className={`relative bg-neutral-50 dark:bg-black border-l border-black/10 dark:border-white/10 transition-all duration-300 ease-in-out ${
              rightSidebarOpen ? "w-80" : "w-0"
            } overflow-hidden`}
          >
            <div className="w-80 h-full p-6">
              <h3 className="text-lg font-semibold mb-4 text-black dark:text-white">
                Writing Stats
              </h3>
              <div className="space-y-4 text-sm text-black/70 dark:text-white/70">
                <div className="flex justify-between">
                  <span>Words:</span>
                  <span className="font-medium text-black dark:text-white">
                    {currentChapter?.content
                      ? currentChapter.content.split(/\s+/).filter(Boolean)
                          .length
                      : 0}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Characters:</span>
                  <span className="font-medium text-black dark:text-white">
                    {currentChapter?.content?.length || 0}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Reading time:</span>
                  <span className="font-medium text-black dark:text-white">
                    {currentChapter?.content
                      ? Math.ceil(
                          currentChapter.content.split(/\s+/).filter(Boolean)
                            .length / 200
                        )
                      : 0}{" "}
                    min
                  </span>
                </div>
                <div className="flex justify-between pt-4 border-t border-black/10 dark:border-white/10">
                  <span>Chapters:</span>
                  <span className="font-medium text-black dark:text-white">
                    {chapters.length}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
