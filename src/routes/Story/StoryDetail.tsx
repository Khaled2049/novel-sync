import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useParams } from "react-router-dom";
import { storiesRepo } from "../../services/StoriesRepo";
import { Chapter, Story } from "@/types/IStory";
import { CommentService } from "@/services/CommentService";
import { Comment as IComment } from "@/types/IComment";
import { useAuthContext } from "@/contexts/AuthContext";
import { onSnapshot, orderBy, query } from "firebase/firestore";
import { StoryLoadingState } from "./components/StoryLoadingState";
import { StoryErrorState } from "./components/StoryErrorState";
import { StorySidebar } from "./components/StorySidebar";
import { StoryHeader } from "./components/StoryHeader";
import { StorySynopsis } from "./components/StorySynopsis";
import { StoryAuthorBio } from "./components/StoryAuthorBio";
import { StoryCommentsSection } from "./components/StoryCommentsSection";
import { ChapterReader } from "./components/reader/ChapterReader";

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

type ViewMode = "details" | "reader";

const LIKE_LIMIT = 5;
const LIKE_COOLDOWN = 1000;

const StoryDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuthContext();
  const commentService = useMemo(() => new CommentService(), []);

  // New state to control the view
  const [viewMode, setViewMode] = useState<ViewMode>("details");

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

  // --- Data Loading ---
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
          story: storyData,
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

  // --- Handlers ---
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
      setState((prev) => ({ ...prev, likes: prev.likes - 1 }));
    }

    setTimeout(() => {
      setState((prev) => ({ ...prev, hasLikedRecently: false }));
    }, LIKE_COOLDOWN);
  }, [id, state.likes, state.hasLikedRecently]);

  const handlePrevChapter = useCallback(() => {
    setState((prev) => ({
      ...prev,
      currentChapterIndex: Math.max(prev.currentChapterIndex - 1, 0),
      currentChapter:
        prev.chapters[Math.max(prev.currentChapterIndex - 1, 0)] || null,
    }));
    window.scrollTo(0, 0);
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
    window.scrollTo(0, 0);
  }, []);

  // --- Comment Logic ---
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

  // --- Effects ---
  useEffect(() => {
    if (id) {
      loadStory(id, state.currentChapterIndex);
    }
  }, [id, loadStory]);

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

  // --- Common Components ---
  if (state.loading) {
    return <StoryLoadingState />;
  }

  if (state.error || !state.story) {
    return (
      <StoryErrorState
        error={state.error}
        onRetry={() => id && loadStory(id)}
      />
    );
  }

  if (viewMode === "details") {
    const genres = state.story.tags || ["Fiction", "Adventure", "Fantasy"];

    return (
      <div className="min-h-screen bg-white dark:bg-black transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-6 pt-24 pb-20">
          <div className="flex flex-col md:flex-row gap-12 lg:gap-16">
            <StorySidebar
              title={state.story.title}
              coverImageUrl={state.story.coverImageUrl}
              likes={state.likes}
              chaptersCount={state.chapters.length}
              hasLikedRecently={state.hasLikedRecently}
              onReadNow={() => setViewMode("reader")}
              onLike={handleLike}
            />

            <main className="md:w-2/3 lg:w-3/4">
              <StoryHeader
                title={state.story.title}
                author={state.story.author}
                genres={genres}
              />

              <StorySynopsis description={state.story.description} />

              <hr className="border-black/10 dark:border-white/10 mb-12" />

              <StoryAuthorBio author={state.story.author} />

              <hr className="border-black/10 dark:border-white/10 mb-12" />

              {state.currentChapter && (
                <StoryCommentsSection
                  storyId={id!}
                  chapterId={state.currentChapter.id}
                  comments={state.comments}
                  commentsLoading={state.commentsLoading}
                  currentUser={user}
                  onLike={handleCommentLike}
                  onReply={handleReply}
                  onDelete={handleDelete}
                  onEdit={handleEdit}
                />
              )}
            </main>
          </div>
        </div>
      </div>
    );
  }

  // --- VIEW 2: READER ---
  if (!state.currentChapter) {
    return <StoryErrorState error="No chapter available" onRetry={() => {}} />;
  }

  return (
    <ChapterReader
      currentChapter={state.currentChapter}
      currentChapterIndex={state.currentChapterIndex}
      totalChapters={state.chapters.length}
      onBackToDetails={() => setViewMode("details")}
      onPrevChapter={handlePrevChapter}
      onNextChapter={handleNextChapter}
    />
  );
};

export default StoryDetail;
