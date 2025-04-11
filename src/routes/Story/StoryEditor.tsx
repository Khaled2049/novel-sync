import { useState, useEffect, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Loader, AlertOctagon } from "lucide-react";

import { Chapter } from "@/types/IStory";

// Import components
import { TipTapEditor } from "./TipTapEditor";
import { StoryMetadata } from "./StoryMetadata";

import { SaveControls } from "./SaveControls";
import { AIToolsPanel } from "./AITools";
import { ChaptersList } from "./ChapterList";
import { useStory } from "@/hooks/useStory";

export function StoryEditor() {
  const navigate = useNavigate();
  const { storyId } = useParams<{ storyId: string }>();

  // UI state
  const [rightColumnVisible, setRightColumnVisible] = useState(false);
  const [aitoolsVisible, setAitoolsVisible] = useState(false);
  const [selectedText, setSelectedText] = useState("");
  const [editorContent, setEditorContent] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [timeoutError, setTimeoutError] = useState<string | null>(null);

  const handleStoryError = useCallback((error: Error) => {
    setError(error.message);
  }, []);

  // Initialize story hook with better error handling
  const {
    currentStory,
    chapters,
    currentChapter,
    storyTitle,
    storyDescription,
    chapterTitle,
    saveStatus,
    isLoading,
    setStoryTitle,
    setStoryDescription,
    setChapterTitle,
    loadStory,
    saveStory,
    createNewChapter,
    togglePublish,
    selectChapter,
  } = useStory({
    storyId,
    onError: handleStoryError,
  });

  useEffect(() => {
    const failsafeTimeout = setTimeout(() => {
      if (isLoading && !error) {
        console.warn("Failsafe timeout reached - assuming loading failed");
        setTimeoutError("Loading timed out. Please try again.");
      }
    }, 15000); // 15 seconds

    return () => clearTimeout(failsafeTimeout);
  }, [isLoading, error]);

  // Update editor content when chapter changes
  useEffect(() => {
    if (currentChapter) {
      setEditorContent(currentChapter.content || "");
    }
  }, [currentChapter]);

  // Update initial load state when loading completes
  useEffect(() => {}, [isLoading]);

  // Manual load function if automatic loading fails
  const handleManualLoad = () => {
    if (storyId) {
      setError(null);
      loadStory(storyId);
    }
  };

  // Event handlers
  const toggleAiTools = () => setAitoolsVisible(!aitoolsVisible);
  const toggleRightColumn = () => setRightColumnVisible(!rightColumnVisible);

  const handleEditorContentChange = (content: string) => {
    setEditorContent(content);
  };

  const handleChapterSelect = (chapter: Chapter) => {
    selectChapter(chapter);
  };

  const handleMetadataChange = () => {
    saveStory(editorContent);
  };

  if (timeoutError) {
    // Render a specific timeout error message, similar to the general error block
    return (
      <div className="flex flex-col items-center justify-center h-screen p-4">
        <AlertOctagon className="w-16 h-16 text-orange-500 mb-4" />
        <h2 className="text-2xl font-bold text-orange-700 mb-2">
          Loading Timeout
        </h2>
        <p className="text-gray-600 mb-6 text-center">{timeoutError}</p>
        {/* Add retry/navigate buttons */}
      </div>
    );
  }

  // Handle loading state with timeout protection
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <Loader className="w-12 h-12 text-amber-800 animate-spin mb-4" />
        <p className="text-amber-800">Loading your story...</p>
      </div>
    );
  }

  // Handle error state with retry option
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-screen p-4">
        <AlertOctagon className="w-16 h-16 text-red-500 mb-4" />
        <h2 className="text-2xl font-bold text-red-700 mb-2">
          Something went wrong
        </h2>
        <p className="text-gray-600 mb-6 text-center">{error}</p>
        <div className="flex space-x-4">
          <button
            onClick={handleManualLoad}
            className="px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors"
          >
            Try Again
          </button>
          <button
            onClick={() => navigate("/stories")}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Return to stories
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex p-2 mt-4 justify-center h-screen overflow-auto">
      <div className="flex h-full w-full">
        {/* Main Editor Area */}
        <div
          className={`p-4 bg-amber-50 rounded-lg shadow-lg overflow-y-auto transition-all duration-300 ${
            rightColumnVisible || aitoolsVisible ? "w-2/3" : "w-full"
          }`}
        >
          <StoryMetadata
            storyTitle={storyTitle}
            storyDescription={storyDescription}
            chapterTitle={chapterTitle}
            onStoryTitleChange={setStoryTitle}
            onStoryDescriptionChange={setStoryDescription}
            onChapterTitleChange={setChapterTitle}
            onMetadataChange={handleMetadataChange}
          />

          <TipTapEditor
            initialContent={editorContent}
            onContentChange={handleEditorContentChange}
            onSave={saveStory}
            onSelectionChange={setSelectedText}
          />

          <SaveControls
            isPublished={currentStory?.isPublished || false}
            saveStatus={saveStatus}
            onPublish={togglePublish}
            onNewChapter={createNewChapter}
          />
        </div>

        {/* AI Tools Panel */}
        <AIToolsPanel
          isVisible={aitoolsVisible}
          selectedText={selectedText}
          onToggle={toggleAiTools}
        />

        {/* Chapters List */}
        <ChaptersList
          isVisible={rightColumnVisible}
          currentChapterId={currentChapter?.id || ""}
          chapters={chapters}
          onChapterSelect={handleChapterSelect}
          onToggle={toggleRightColumn}
          chapterTitle={chapterTitle}
        />
      </div>
    </div>
  );
}
