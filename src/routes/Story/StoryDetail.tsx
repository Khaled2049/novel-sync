import React, { useState, useEffect } from "react";
import { Loader } from "lucide-react";
import { useParams } from "react-router-dom";
import { storiesRepo } from "../../components/StoriesRepo";
import ThemeToggle from "@/components/ThemeToggle";
import { Chapter } from "@/types/IStory";

const StoryDetail: React.FC = () => {
  const [story, setStory] = useState<any>(null);
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(true);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [currentChapterIndex, setCurrentChapterIndex] = useState<number>(0);
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    const fetchStory = async () => {
      if (id) {
        try {
          await loadStory(id);
        } catch (error) {
          console.error("Error fetching story:", error);
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };

    fetchStory();
  }, [id]);

  const loadStory = async (storyId: string) => {
    try {
      const story = await storiesRepo.getStory(storyId);
      const storyChapters = await storiesRepo.getChapters(storyId);
      setChapters(storyChapters);
      setStory(story);
    } catch (error) {
      console.error("Error fetching story:", error);
    }
  };

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  const renderContent = (content: string) => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(content, "text/html");
    const elements = Array.from(doc.body.childNodes);

    return elements.map((el, index) => {
      if (el.nodeName === "P") {
        return <p key={index}>{el.textContent}</p>;
      } else if (el.nodeName === "IMG") {
        const src = (el as HTMLImageElement).src;
        return (
          <div key={index} className="flex justify-center mb-4">
            <img src={src} alt="" className="max-w-full h-auto" />
          </div>
        );
      } else if (el.nodeName === "UL") {
        const listItems = Array.from(el.childNodes).map((li, liIndex) => (
          <li key={liIndex} className="ml-6 list-disc">
            {(li as HTMLElement).textContent}
          </li>
        ));
        return (
          <ul key={index} className="mb-4">
            {listItems}
          </ul>
        );
      } else {
        return null;
      }
    });
  };

  const handlePrevChapter = () => {
    setCurrentChapterIndex((prevIndex) => Math.max(prevIndex - 1, 0));
  };

  const handleNextChapter = () => {
    setCurrentChapterIndex((prevIndex) =>
      Math.min(prevIndex + 1, chapters.length - 1)
    );
  };

  const currentChapter = chapters[currentChapterIndex];

  return (
    <div
      className={`min-h-screen ${
        isDarkMode ? "bg-gray-900 text-white" : "bg-amber-50 text-black"
      }`}
    >
      {story && (
        <>
          {loading ? (
            <Loader className="m-auto" size="2rem" />
          ) : (
            <div className="max-w-[90%] md:max-w-[75%] lg:max-w-[65%] mx-auto p-4 md:p-8 rounded-lg">
              <div className="flex justify-end mb-4">
                <ThemeToggle
                  isDarkMode={isDarkMode}
                  toggleTheme={toggleTheme}
                />
              </div>

              {story.coverImageUrl && (
                <img
                  src={story?.coverImageUrl}
                  alt={`${story.title} cover`}
                  className="w-full h-64 object-cover rounded-md mb-4"
                />
              )}
              <h1
                className={`text-3xl md:text-4xl font-bold mb-4 md:mb-6 text-center ${
                  isDarkMode ? "text-amber-400" : "text-amber-900"
                }`}
              >
                {story.title}
              </h1>
              <p
                className={`text-lg md:text-xl mb-1 md:mb-2 text-center ${
                  isDarkMode ? "text-gray-300" : "text-gray-700"
                }`}
              >
                By {story.author}
              </p>
              <p
                className={`text-xs md:text-sm mb-4 md:mb-6 text-center ${
                  isDarkMode ? "text-gray-400" : "text-gray-500"
                }`}
              >
                Last updated: {new Date(story.updatedAt).toLocaleDateString()}
              </p>

              <div
                className={`prose prose-lg max-w-none p-4 md:p-6 rounded-md leading-relaxed ${
                  isDarkMode ? "prose-invert" : ""
                }`}
              >
                {currentChapter && (
                  <div className="mb-6">
                    <h2
                      className={`text-2xl md:text-3xl font-semibold mb-4 ${
                        isDarkMode ? "text-amber-400" : "text-amber-900"
                      }`}
                    >
                      {currentChapter.title}
                    </h2>
                    <div
                      className={`text-base md:text-lg py-1 px-2 ${
                        isDarkMode ? "text-gray-200" : "text-gray-800"
                      }`}
                    >
                      {renderContent(currentChapter.content)}
                    </div>
                  </div>
                )}
                <div className="flex justify-between mt-4">
                  <button
                    onClick={handlePrevChapter}
                    disabled={currentChapterIndex === 0}
                    className={`px-4 py-2 rounded-md ${
                      currentChapterIndex === 0
                        ? "bg-gray-300 cursor-not-allowed"
                        : isDarkMode
                        ? "bg-amber-600 hover:bg-amber-700"
                        : "bg-amber-500 hover:bg-amber-600"
                    } text-white`}
                  >
                    Previous
                  </button>
                  <button
                    onClick={handleNextChapter}
                    disabled={currentChapterIndex === chapters.length - 1}
                    className={`px-4 py-2 rounded-md ${
                      currentChapterIndex === chapters.length - 1
                        ? "bg-gray-300 cursor-not-allowed"
                        : isDarkMode
                        ? "bg-amber-600 hover:bg-amber-700"
                        : "bg-amber-500 hover:bg-amber-600"
                    } text-white`}
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default StoryDetail;
