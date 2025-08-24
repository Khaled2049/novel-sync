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
    <div className="bg-white dark:bg-black rounded-lg shadow-md w-full flex flex-col transition-colors duration-200">
      {/* Tab Navigation */}
      <div className="flex border-b border-black/20 dark:border-white/20 rounded-t-lg">
        <button
          className={`flex-1 py-2 px-4 flex items-center justify-center space-x-2 text-black/70 dark:text-white/70 hover:bg-black/10 dark:hover:bg-white/10 transition-colors duration-200 ${
            activeTab === "chapters"
              ? "border-b-2 border-dark-green dark:border-light-green text-black dark:text-white font-medium"
              : ""
          }`}
          onClick={() => onTabChange("chapters")}
        >
          <Book className="w-4 h-4 text-dark-green dark:text-light-green" />
          <span>Chapters</span>
        </button>
        <button
          className={`flex-1 py-2 px-4 flex items-center justify-center space-x-2 text-black/70 dark:text-white/70 hover:bg-black/10 dark:hover:bg-white/10 transition-colors duration-200 ${
            activeTab === "ai"
              ? "border-b-2 border-dark-green dark:border-light-green text-black dark:text-white font-medium"
              : ""
          }`}
          onClick={() => onTabChange("ai")}
        >
          <Sparkles className="w-4 h-4 text-dark-green dark:text-light-green" />
          <span>AI Tools</span>
        </button>
      </div>

      {/* Content based on active tab */}
      <div className="p-6 overflow-y-auto flex-1 text-black dark:text-white">
        {activeTab === "chapters" ? (
          // Chapters Tab
          <>
            <h2 className="text-2xl font-bold mb-4 text-black dark:text-white">
              Editing: {chapterTitle || "Untitled Chapter"}
            </h2>

            {chapters.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10">
                <Book className="w-12 h-12 text-black/50 dark:text-white/50 mb-4" />
                <p className="italic text-black/50 dark:text-white/50 text-center">
                  No chapters added yet. Start your journey!
                </p>
              </div>
            ) : (
              <ul className="space-y-2">
                {chapters.map((chapter) => (
                  <li
                    key={chapter.id}
                    className={`rounded-md shadow transition-all hover:shadow-md hover:bg-black/5 dark:hover:bg-white/5 ${
                      currentChapterId === chapter.id
                        ? "border-l-4 border-dark-green dark:border-light-green"
                        : "border-l-4 border-transparent"
                    }`}
                  >
                    <button
                      className="flex items-center w-full p-3 text-left"
                      onClick={() => onChapterSelect(chapter)}
                    >
                      <div className="flex items-center space-x-3">
                        <Book
                          className={`w-5 h-5 text-dark-green dark:text-light-green`}
                        />
                        <span
                          className={`font-medium ${
                            currentChapterId === chapter.id
                              ? "text-black dark:text-white"
                              : "text-black/70 dark:text-white/70"
                          }`}
                        >
                          {chapter.title || "Untitled Chapter"}
                        </span>
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </>
        ) : (
          // AI Tools Tab
          <>
            <h2 className="text-2xl font-bold mb-4 text-black dark:text-white">
              AI Writing Assistant
            </h2>

            {selectedText ? (
              <AITools text={selectedText} />
            ) : (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <Sparkles className="w-12 h-12 text-black/50 dark:text-white/50 mb-4" />
                <p className="text-black/70 dark:text-white/70 mb-2">
                  Select text in the editor to use AI tools
                </p>
                <p className="text-black/70 dark:text-white/70 text-sm">
                  Or press <span className="font-bold">TAB</span> to continue
                  your writing with AI assistance
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};
