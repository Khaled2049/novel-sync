import React, { useState, useEffect } from "react";
import { Loader } from "lucide-react";
import { useParams } from "react-router-dom";
import { storiesRepo } from "../../services/StoriesRepo";
import { Chapter } from "@/types/IStory";
import { CommentInput } from "@/components/CommentInput";
import { CommentList } from "@/components/CommentList";
import { CommentService } from "@/services/CommentService";
import { Comment as IComment } from "@/types/IComment";
import { useAuthContext } from "@/contexts/AuthContext";
import { onSnapshot, orderBy, query } from "firebase/firestore";

const StoryDetail: React.FC = () => {
  const [story, setStory] = useState<any>(null);
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(true);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [currentChapterIndex, setCurrentChapterIndex] = useState<number>(0);
  const [currentChapter, setCurrentChapter] = useState<Chapter | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [likes, setLikes] = useState(0);
  const { user } = useAuthContext();

  const [comments, setComments] = useState<IComment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const commentService = new CommentService();

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
  }, [id, currentChapterIndex]);

  // Real-time comments listener
  useEffect(() => {
    if (!id || !currentChapter) return;

    const commentsCollection = commentService.getCommentsCollection(
      id,
      currentChapter.id
    );
    const q = query(commentsCollection, orderBy("createdAt", "asc"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const updatedComments = snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          storyId: id,
          chapterId: currentChapter.id,
          message: data.message,
          userId: data.userId,
          parentId: data.parentId || null,
          likes: data.likes || [],
          createdAt: data.createdAt?.toDate(),
          updatedAt: data.updatedAt?.toDate(),
          username: data.username,
        };
      });
      setComments(updatedComments);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [id, currentChapter]);

  const handleCommentLike = async (commentId: string) => {
    if (!user || !id || !currentChapter) return;
    try {
      await commentService.addLike(id, currentChapter.id, commentId, user.uid);
    } catch (error) {
      console.error("Error toggling like:", error);
    }
  };

  const handleReply = async (parentId: string, message: string) => {
    if (!user || !id || !currentChapter) return;
    try {
      await commentService.addComment(
        id,
        currentChapter.id,
        user.uid,
        user.username,
        message,
        parentId
      );
    } catch (error) {
      console.error("Error adding reply:", error);
    }
  };

  const handleDelete = async (commentId: string) => {
    try {
      if (!id || !currentChapter) return;
      await commentService.deleteComment(id, currentChapter.id, commentId);
    } catch (error) {
      console.error("Error deleting comment:", error);
    }
  };

  const handleEdit = async (commentId: string, newMessage: string) => {
    try {
      if (!id || !currentChapter) return;
      await commentService.updateComment(
        id,
        currentChapter.id,
        commentId,
        newMessage
      );
    } catch (error) {
      console.error("Error updating comment:", error);
    }
  };

  const handleLike = async () => {
    if (!id) return;
    if (likes === 5) {
      alert("Chill out homie!");
      return;
    }
    setLikes((prevLikes) => prevLikes + 1);
    await storiesRepo.incrementLikeCount(id);
  };

  const loadStory = async (storyId: string) => {
    try {
      const story = await storiesRepo.getStory(storyId);
      const storyChapters = await storiesRepo.getChapters(storyId);
      const currentChapter = storyChapters[currentChapterIndex];

      if (!story) {
        return;
      }
      setLikes(story.likes || 0);
      setChapters(storyChapters);
      setStory(story);
      setCurrentChapter(currentChapter);
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

  return (
    <div
      className={`min-h-screen ${
        isDarkMode ? "bg-gray-900 text-white" : " text-black"
      }`}
    >
      {story && (
        <>
          {loading ? (
            <Loader className="m-auto" size="2rem" />
          ) : (
            <div className="max-w-[90%] md:max-w-[75%] lg:max-w-[65%] mx-auto p-4 md:p-8 rounded-lg">
              {story.coverImageUrl && (
                <img
                  src={story?.coverImageUrl}
                  alt={`${story.title} cover`}
                  className="w-full h-64 object-cover rounded-md mb-4"
                />
              )}
              <h1
                className={`text-3xl md:text-4xl font-bold mb-4 md:mb-6 text-center ${
                  isDarkMode ? "" : ""
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
              <div className="flex justify-center items-center mb-4">
                <button
                  onClick={handleLike}
                  className={`flex items-center px-4 py-2 rounded-md mr-2 ${
                    isDarkMode ? "  text-white" : "0 hover: text-white"
                  }`}
                >
                  👍 Like
                </button>
                <span
                  className={`text-lg ${
                    isDarkMode ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  {likes} {likes === 1 ? "like" : "likes"}
                </span>
              </div>

              <div
                className={`prose prose-lg max-w-none p-4 md:p-6 rounded-md leading-relaxed ${
                  isDarkMode ? "prose-invert" : ""
                }`}
              >
                {currentChapter && (
                  <div className="mb-6">
                    <h2
                      className={`text-2xl md:text-3xl font-semibold mb-4 ${
                        isDarkMode ? "" : ""
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
                        ? " "
                        : "0 hover:"
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
                        ? " "
                        : "0 hover:"
                    } text-white`}
                  >
                    Next
                  </button>
                </div>
                <div className="mt-8">
                  <h2
                    className={`text-2xl font-semibold mb-6 ${
                      isDarkMode ? "" : ""
                    }`}
                  >
                    Comments
                  </h2>

                  {id && currentChapter && user && (
                    <CommentInput
                      storyId={id}
                      chapterId={currentChapter.id}
                      currentUser={user}
                      isDarkMode={isDarkMode}
                    />
                  )}

                  {isLoading ? (
                    <div className="text-center py-8">Loading comments...</div>
                  ) : (
                    <CommentList
                      comments={comments}
                      currentUser={user}
                      isDarkMode={isDarkMode}
                      onLike={handleCommentLike}
                      onReply={handleReply}
                      onDelete={handleDelete}
                      onEdit={handleEdit}
                    />
                  )}
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
