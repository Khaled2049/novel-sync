import React from "react";
import { Book, Sparkles } from "lucide-react";
import AITools from "@/components/AITools";
import { Chapter } from "@/types/IStory";

interface SidebarPanelProps {
  chapters: Chapter[];
  currentChapterId: string;
  chapterTitle: string;
  selectedText: string;
  onChapterSelect: (chapter: Chapter) => void;
  activeTab?: "chapters" | "ai";
  onTabChange?: (tab: "chapters" | "ai") => void;
}

export const SidebarPanel: React.FC<SidebarPanelProps> = ({
  chapters,
  currentChapterId,
  chapterTitle,
  selectedText,
  onChapterSelect,
  activeTab = "chapters",
  onTabChange = () => {},
}) => {
  return (
    <div className="h-full flex flex-col">
      {/* Tab Navigation */}
      <div className="flex border-b border-black/10 dark:border-white/10">
        <button
          className={`flex-1 py-3 px-4 flex items-center justify-center space-x-2 text-sm transition-colors ${
            activeTab === "chapters"
              ? "border-b-2 border-dark-green dark:border-light-green text-black dark:text-white font-medium"
              : "text-black/50 dark:text-white/50 hover:text-black/70 dark:hover:text-white/70"
          }`}
          onClick={() => onTabChange("chapters")}
        >
          <Book className="w-4 h-4" />
          <span>Chapters</span>
        </button>
        <button
          className={`flex-1 py-3 px-4 flex items-center justify-center space-x-2 text-sm transition-colors ${
            activeTab === "ai"
              ? "border-b-2 border-dark-green dark:border-light-green text-black dark:text-white font-medium"
              : "text-black/50 dark:text-white/50 hover:text-black/70 dark:hover:text-white/70"
          }`}
          onClick={() => onTabChange("ai")}
        >
          <Sparkles className="w-4 h-4" />
          <span>AI Tools</span>
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        {activeTab === "chapters" ? (
          <div className="space-y-2">
            {chapters.length === 0 ? (
              <div className="text-center py-12">
                <Book className="w-10 h-10 text-black/30 dark:text-white/30 mx-auto mb-3" />
                <p className="text-sm text-black/50 dark:text-white/50">
                  No chapters yet
                </p>
              </div>
            ) : (
              chapters.map((chapter) => (
                <button
                  key={chapter.id}
                  onClick={() => onChapterSelect(chapter)}
                  className={`w-full text-left px-4 py-3 rounded-lg transition-all ${
                    currentChapterId === chapter.id
                      ? "bg-dark-green/10 dark:bg-light-green/10 text-black dark:text-white"
                      : "text-black/70 dark:text-white/70 hover:bg-black/5 dark:hover:bg-white/5"
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <Book className="w-4 h-4 flex-shrink-0 text-dark-green dark:text-light-green" />
                    <span className="text-sm truncate">
                      {chapterTitle || "Untitled"}
                    </span>
                  </div>
                </button>
              ))
            )}
          </div>
        ) : (
          <div className="text-center py-12">
            <Sparkles className="w-10 h-10 text-black/30 dark:text-white/30 mx-auto mb-3" />
            <p className="text-sm text-black/50 dark:text-white/50 mb-2">
              {selectedText ? "AI tools ready" : "Select text to use AI tools"}
            </p>
            <p className="text-xs text-black/40 dark:text-white/40">
              Press{" "}
              <kbd className="px-2 py-1 bg-black/5 dark:bg-white/5 rounded">
                Tab
              </kbd>{" "}
              to continue with AI
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
