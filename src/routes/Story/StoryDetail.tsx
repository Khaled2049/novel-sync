import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  Loader,
  ChevronLeft,
  ChevronRight,
  ThumbsUp,
  AlertCircle,
} from "lucide-react";
import { useParams } from "react-router-dom";
import { storiesRepo } from "../../services/StoriesRepo";
import { Chapter } from "@/types/IStory";
import { CommentInput } from "@/components/CommentInput";
import { CommentList } from "@/components/CommentList";
import { CommentService } from "@/services/CommentService";
import { Comment as IComment } from "@/types/IComment";
import { useAuthContext } from "@/contexts/AuthContext";
import { onSnapshot, orderBy, query } from "firebase/firestore";

interface Story {
  id: string;
  title: string;
  author: string;
  coverImageUrl?: string;
  updatedAt: string;
  likes: number;
}

interface StoryDetailState {
  story: Story | null;
  chapters: Chapter[];
  currentChapter: Chapter | null;
  currentChapterIndex: number;
  likes: number;
  comments: IComment[];
  loading: boolean;
  commentsLoading: boolean;
  error: string | null;
  hasLikedRecently: boolean;
}

const LIKE_LIMIT = 5;
const LIKE_COOLDOWN = 1000; // 1 second

const StoryDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuthContext();
  const commentService = useMemo(() => new CommentService(), []);

  const [state, setState] = useState<StoryDetailState>({
    story: null,
    chapters: [],
    currentChapter: null,
    currentChapterIndex: 0,
    likes: 0,
    comments: [],
    loading: true,
    commentsLoading: true,
    error: null,
    hasLikedRecently: false,
  });

  // Memoized content renderer
  const renderContent = useCallback((content: string) => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(content, "text/html");
    const elements = Array.from(doc.body.childNodes);

    return elements.map((el, index) => {
      const key = `content-${index}`;

      switch (el.nodeName) {
        case "P":
          return (
            <p key={key} className="mb-4 text-black dark:text-white/80">
              {el.textContent}
            </p>
          );

        case "IMG": {
          const src = (el as HTMLImageElement).src;
          const alt = (el as HTMLImageElement).alt || "Story image";
          return (
            <div key={key} className="flex justify-center mb-4">
              <img
                src={src}
                alt={alt}
                className="max-w-full h-auto rounded-md shadow-sm"
                loading="lazy"
              />
            </div>
          );
        }

        case "UL": {
          const listItems = Array.from(el.childNodes).map((li, liIndex) => (
            <li
              key={liIndex}
              className="ml-6 list-disc mb-1 text-black dark:text-white/80"
            >
              {(li as HTMLElement).textContent}
            </li>
          ));
          return (
            <ul key={key} className="mb-4">
              {listItems}
            </ul>
          );
        }

        case "H1":
        case "H2":
        case "H3":
        case "H4":
        case "H5":
        case "H6":
          return React.createElement(
            el.nodeName.toLowerCase() as keyof JSX.IntrinsicElements,
            {
              key,
              className: "font-semibold mb-3 mt-6 text-black dark:text-white",
            },
            el.textContent
          );

        default:
          return el.textContent ? (
            <div key={key} className="mb-2 text-black dark:text-white/80">
              {el.textContent}
            </div>
          ) : null;
      }
    });
  }, []);

  // Load story data
  const loadStory = useCallback(
    async (storyId: string, chapterIndex: number = 0) => {
      try {
        setState((prev) => ({ ...prev, loading: true, error: null }));

        const [storyData, chaptersData] = await Promise.all([
          storiesRepo.getStory(storyId),
          storiesRepo.getChapters(storyId),
        ]);

        if (!storyData) {
          setState((prev) => ({
            ...prev,
            loading: false,
            error: "Story not found",
          }));
          return;
        }

        const validChapterIndex = Math.max(
          0,
          Math.min(chapterIndex, chaptersData.length - 1)
        );
        const currentChapter = chaptersData[validChapterIndex] || null;

        setState((prev) => ({
          ...prev,
          story: {
            ...storyData,
            updatedAt:
              typeof storyData.updatedAt === "string"
                ? storyData.updatedAt
                : storyData.updatedAt?.toISOString?.() ?? "",
          },
          chapters: chaptersData,
          currentChapter,
          currentChapterIndex: validChapterIndex,
          likes: storyData.likes || 0,
          loading: false,
        }));
      } catch (error) {
        console.error("Error fetching story:", error);
        setState((prev) => ({
          ...prev,
          loading: false,
          error: "Failed to load story",
        }));
      }
    },
    []
  );

  // Handle like functionality with rate limiting
  const handleLike = useCallback(async () => {
    if (!id || state.hasLikedRecently) return;

    if (state.likes >= LIKE_LIMIT) {
      alert("Chill out homie!");
      return;
    }

    setState((prev) => ({
      ...prev,
      likes: prev.likes + 1,
      hasLikedRecently: true,
    }));

    try {
      await storiesRepo.incrementLikeCount(id);
    } catch (error) {
      console.error("Error incrementing like count:", error);
      // Revert optimistic update on error
      setState((prev) => ({ ...prev, likes: prev.likes - 1 }));
    }

    // Reset like cooldown
    setTimeout(() => {
      setState((prev) => ({ ...prev, hasLikedRecently: false }));
    }, LIKE_COOLDOWN);
  }, [id, state.likes, state.hasLikedRecently]);

  // Chapter navigation
  const handlePrevChapter = useCallback(() => {
    setState((prev) => ({
      ...prev,
      currentChapterIndex: Math.max(prev.currentChapterIndex - 1, 0),
      currentChapter:
        prev.chapters[Math.max(prev.currentChapterIndex - 1, 0)] || null,
    }));
  }, []);

  const handleNextChapter = useCallback(() => {
    setState((prev) => {
      const nextIndex = Math.min(
        prev.currentChapterIndex + 1,
        prev.chapters.length - 1
      );
      return {
        ...prev,
        currentChapterIndex: nextIndex,
        currentChapter: prev.chapters[nextIndex] || null,
      };
    });
  }, []);

  // Comment handlers
  const handleCommentLike = useCallback(
    async (commentId: string) => {
      if (!user || !id || !state.currentChapter) return;

      try {
        await commentService.addLike(
          id,
          state.currentChapter.id,
          commentId,
          user.uid
        );
      } catch (error) {
        console.error("Error toggling like:", error);
      }
    },
    [user, id, state.currentChapter, commentService]
  );

  const handleReply = useCallback(
    async (parentId: string, message: string) => {
      if (!user || !id || !state.currentChapter) return;

      try {
        await commentService.addComment(
          id,
          state.currentChapter.id,
          user.uid,
          user.username,
          message,
          parentId
        );
      } catch (error) {
        console.error("Error adding reply:", error);
      }
    },
    [user, id, state.currentChapter, commentService]
  );

  const handleDelete = useCallback(
    async (commentId: string) => {
      if (!id || !state.currentChapter) return;

      try {
        await commentService.deleteComment(
          id,
          state.currentChapter.id,
          commentId
        );
      } catch (error) {
        console.error("Error deleting comment:", error);
      }
    },
    [id, state.currentChapter, commentService]
  );

  const handleEdit = useCallback(
    async (commentId: string, newMessage: string) => {
      if (!id || !state.currentChapter) return;

      try {
        await commentService.updateComment(
          id,
          state.currentChapter.id,
          commentId,
          newMessage
        );
      } catch (error) {
        console.error("Error updating comment:", error);
      }
    },
    [id, state.currentChapter, commentService]
  );

  // Load story on mount and chapter change
  useEffect(() => {
    if (id) {
      loadStory(id, state.currentChapterIndex);
    }
  }, [id, loadStory]); // Remove currentChapterIndex from deps to prevent infinite loop

  // Real-time comments listener
  useEffect(() => {
    if (!id || !state.currentChapter) {
      setState((prev) => ({ ...prev, comments: [], commentsLoading: false }));
      return;
    }

    setState((prev) => ({ ...prev, commentsLoading: true }));

    const commentsCollection = commentService.getCommentsCollection(
      id,
      state.currentChapter.id
    );
    const q = query(commentsCollection, orderBy("createdAt", "asc"));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const updatedComments = snapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            storyId: id,
            chapterId: state.currentChapter!.id,
            message: data.message,
            userId: data.userId,
            parentId: data.parentId || null,
            likes: data.likes || [],
            createdAt: data.createdAt?.toDate(),
            updatedAt: data.updatedAt?.toDate(),
            username: data.username,
          };
        });

        setState((prev) => ({
          ...prev,
          comments: updatedComments,
          commentsLoading: false,
        }));
      },
      (error) => {
        console.error("Error listening to comments:", error);
        setState((prev) => ({ ...prev, commentsLoading: false }));
      }
    );

    return () => unsubscribe();
  }, [id, state.currentChapter, commentService]);

  // Memoized navigation buttons
  const navigationButtons = useMemo(
    () => (
      <div className="flex justify-between items-center mt-6 pt-4 border-t border-black/20 dark:border-white/20">
        <button
          onClick={handlePrevChapter}
          disabled={state.currentChapterIndex === 0}
          className={`flex items-center gap-2 px-4 py-2 rounded-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-dark-green dark:focus:ring-light-green focus:ring-offset-white dark:focus:ring-offset-black ${
            state.currentChapterIndex === 0
              ? "bg-black/10 dark:bg-white/10 text-black/50 dark:text-white/50 cursor-not-allowed"
              : "bg-dark-green dark:bg-light-green hover:bg-light-green dark:hover:bg-dark-green text-white shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
          }`}
        >
          <ChevronLeft size={18} />
          Previous
        </button>

        <span className="text-sm text-black/70 dark:text-white/70">
          Chapter {state.currentChapterIndex + 1} of {state.chapters.length}
        </span>

        <button
          onClick={handleNextChapter}
          disabled={state.currentChapterIndex === state.chapters.length - 1}
          className={`flex items-center gap-2 px-4 py-2 rounded-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-dark-green dark:focus:ring-light-green focus:ring-offset-white dark:focus:ring-offset-black ${
            state.currentChapterIndex === state.chapters.length - 1
              ? "bg-black/10 dark:bg-white/10 text-black/50 dark:text-white/50 cursor-not-allowed"
              : "bg-dark-green dark:bg-light-green hover:bg-light-green dark:hover:bg-dark-green text-white shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
          }`}
        >
          Next
          <ChevronRight size={18} />
        </button>
      </div>
    ),
    [
      state.currentChapterIndex,
      state.chapters.length,
      handlePrevChapter,
      handleNextChapter,
    ]
  );

  // Loading state
  if (state.loading) {
    return (
      <div className="min-h-screen pt-20 bg-white dark:bg-black flex items-center justify-center transition-colors duration-200">
        <div className="text-center">
          <Loader className="w-12 h-12 animate-spin mx-auto mb-4 text-dark-green dark:text-light-green" />
          <p className="text-black/70 dark:text-white/70">Loading story...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (state.error) {
    return (
      <div className="min-h-screen pt-20 bg-white dark:bg-black flex items-center justify-center transition-colors duration-200">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 mx-auto mb-4 text-red-500" />
          <p className="text-red-600 dark:text-red-400 mb-4">{state.error}</p>
          <button
            onClick={() => id && loadStory(id)}
            className="px-4 py-2 bg-dark-green dark:bg-light-green text-white rounded-md hover:bg-light-green dark:hover:bg-dark-green transition-colors focus:outline-none focus:ring-2 focus:ring-dark-green dark:focus:ring-light-green focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-black"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // No story found
  if (!state.story) {
    return (
      <div className="min-h-screen pt-20 bg-white dark:bg-black flex items-center justify-center transition-colors duration-200">
        <div className="text-center">
          <p className="text-black/70 dark:text-white/70">Story not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 bg-white dark:bg-black transition-colors duration-200">
      <div className="max-w-4xl mx-auto p-6">
        {/* Story Header */}
        <div className="bg-white dark:bg-black rounded-xl shadow-lg overflow-hidden mb-8 border border-black/20 dark:border-white/20">
          {state.story.coverImageUrl && (
            <div className="relative h-64 md:h-80 overflow-hidden">
              <img
                src={state.story.coverImageUrl}
                alt={`${state.story.title} cover`}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/20 dark:bg-black/20"></div>
            </div>
          )}

          <div className="p-6 md:p-8">
            <h1 className="text-3xl md:text-4xl font-bold mb-4 text-black dark:text-white">
              {state.story.title}
            </h1>

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
              <div>
                <p className="text-lg text-black/70 dark:text-white/70 mb-1">
                  By {state.story.author}
                </p>
                <p className="text-sm text-black/50 dark:text-white/50">
                  Last updated:{" "}
                  {new Date(state.story.updatedAt).toLocaleDateString()}
                </p>
              </div>

              <div className="flex items-center gap-4 mt-4 sm:mt-0">
                <button
                  onClick={handleLike}
                  disabled={state.hasLikedRecently}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-dark-green dark:focus:ring-light-green focus:ring-offset-white dark:focus:ring-offset-black ${
                    state.hasLikedRecently
                      ? "bg-black/10 dark:bg-white/10 text-black/50 dark:text-white/50 cursor-not-allowed"
                      : "bg-dark-green dark:bg-light-green hover:bg-light-green dark:hover:bg-dark-green text-white shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                  }`}
                >
                  <ThumbsUp size={18} />
                  Like
                </button>
                <span className="text-lg font-medium text-black/70 dark:text-white/70">
                  {state.likes} {state.likes === 1 ? "like" : "likes"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Chapter Content */}
        {state.currentChapter && (
          <div className="bg-white dark:bg-black rounded-xl shadow-lg p-6 md:p-8 mb-8 border border-black/20 dark:border-white/20">
            <h2 className="text-2xl md:text-3xl font-bold mb-6 text-black dark:text-white">
              {state.currentChapter.title}
            </h2>

            <div className="prose prose-lg max-w-none text-black/80 dark:text-white/80 leading-relaxed">
              {renderContent(state.currentChapter.content)}
            </div>

            {navigationButtons}
          </div>
        )}

        {/* Comments Section */}
        <div className="bg-white dark:bg-black rounded-xl shadow-lg p-6 md:p-8 border border-black/20 dark:border-white/20">
          <h2 className="text-2xl font-bold mb-6 text-black dark:text-white">
            Comments
          </h2>

          {id && state.currentChapter && user && (
            <div className="mb-8">
              <CommentInput
                storyId={id}
                chapterId={state.currentChapter.id}
                currentUser={user}
              />
            </div>
          )}

          {state.commentsLoading ? (
            <div className="text-center py-8">
              <Loader className="w-8 h-8 animate-spin mx-auto mb-2 text-dark-green dark:text-light-green" />
              <p className="text-black/70 dark:text-white/70">
                Loading comments...
              </p>
            </div>
          ) : (
            <CommentList
              comments={state.comments}
              currentUser={user}
              onLike={handleCommentLike}
              onReply={handleReply}
              onDelete={handleDelete}
              onEdit={handleEdit}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default StoryDetail;
