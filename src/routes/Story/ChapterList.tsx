import React from "react";
import { Book, ChevronRight, ChevronLeft } from "lucide-react";
import { Chapter } from "@/types/IStory";

interface ChaptersListProps {
  isVisible: boolean;
  chapters: Chapter[];
  currentChapterId: string;
  chapterTitle: string;
  onChapterSelect: (chapter: Chapter) => void;
  onToggle: () => void;
}

export const ChaptersList: React.FC<ChaptersListProps> = ({
  isVisible,
  chapters,
  currentChapterId,
  chapterTitle,
  onChapterSelect,
  onToggle,
}) => {
  return (
    <div
      className={`transition-all duration-300 bg-amber-100 ml-2 rounded-lg shadow-md ${
        isVisible ? "w-1/3" : "w-24"
      } flex flex-col`}
    >
      {/* Toggle Header */}
      <div className="p-2 bg-amber-500 text-white rounded-t-lg hover:bg-amber-600 transition-colors">
        <button
          onClick={onToggle}
          className="flex items-center h-12 justify-center w-full"
        >
          {isVisible ? (
            <div className="flex items-center space-x-2">
              <ChevronRight className="w-5 h-5" />
              <span>Hide Chapters</span>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <ChevronLeft className="w-5 h-5" />
              <span className="text-sm">Show</span>
            </div>
          )}
        </button>
      </div>

      {/* Chapters List */}
      {isVisible && (
        <div className="p-6 rounded-lg overflow-y-auto flex-1">
          <h2 className="text-2xl font-bold mb-4 text-amber-800">
            Editing: {chapterTitle || "Untitled Chapter"}
          </h2>

          {chapters.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10">
              <Book className="w-12 h-12 text-amber-400 mb-4" />
              <p className="text-amber-700 italic text-center">
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
                      ? "bg-amber-200 border-l-4 border-amber-500"
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
                          currentChapterId === chapter.id
                            ? "text-amber-700"
                            : "text-amber-600"
                        }`}
                      />
                      <span
                        className={`font-medium ${
                          currentChapterId === chapter.id
                            ? "text-amber-900"
                            : "text-amber-800"
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
        </div>
      )}
    </div>
  );
};
