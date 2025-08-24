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
    <div className="  rounded-lg shadow-md w-full flex flex-col">
      {/* Tab Navigation */}
      <div className="flex  border-b  rounded-t-lg">
        <button
          className={`flex-1 py-2 px-4 flex items-center justify-center space-x-2 ${
            activeTab === "chapters" ? " font-medium" : ""
          }`}
          onClick={() => onTabChange("chapters")}
        >
          <Book className="w-4 h-4" />
          <span>Chapters</span>
        </button>
        <button
          className={`flex-1 py-2 px-4 flex items-center justify-center space-x-2 ${
            activeTab === "ai" ? " font-medium" : ""
          }`}
          onClick={() => onTabChange("ai")}
        >
          <Sparkles className="w-4 h-4" />
          <span>AI Tools</span>
        </button>
      </div>

      {/* Content based on active tab */}
      <div className="p-6 overflow-y-auto flex-1">
        {activeTab === "chapters" ? (
          // Chapters Tab
          <>
            <h2 className="text-2xl font-bold mb-4 ">
              Editing: {chapterTitle || "Untitled Chapter"}
            </h2>

            {chapters.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10">
                <Book className="w-12 h-12  mb-4" />
                <p className=" italic text-center">
                  No chapters added yet. Start your journey!
                </p>
              </div>
            ) : (
              <ul className="space-y-2">
                {chapters.map((chapter) => (
                  <li
                    key={chapter.id}
                    className={`rounded-md shadow transition-all hover:shadow-md ${
                      currentChapterId === chapter.id
                        ? " border-l-4 "
                        : "bg-white"
                    }`}
                  >
                    <button
                      className="flex items-center w-full p-3 text-left"
                      onClick={() => onChapterSelect(chapter)}
                    >
                      <div className="flex items-center space-x-3">
                        <Book
                          className={`w-5 h-5 ${
                            currentChapterId === chapter.id ? "" : ""
                          }`}
                        />
                        <span
                          className={`font-medium ${
                            currentChapterId === chapter.id ? "" : ""
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
            <h2 className="text-2xl font-bold mb-4 ">AI Writing Assistant</h2>

            {selectedText ? (
              <AITools text={selectedText} />
            ) : (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <Sparkles className="w-12 h-12  mb-4" />
                <p className=" mb-2">
                  Select text in the editor to use AI tools
                </p>
                <p className=" text-sm">
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
