import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { useAuthContext } from "../../contexts/AuthContext";
import { storiesRepo } from "../../services/StoriesRepo";
import { StoryMetadata } from "@/types/IStory";
import { StoryCard } from "./StoryCard";

const UserStories = () => {
  const { user } = useAuthContext();
  const [stories, setStories] = useState<StoryMetadata[]>([]);

  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      if (user) {
        setLoading(true);

        await loadStories();
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  const editStory = (storyId: string) => {
    navigate(`/create/${storyId}`);
  };

  const deleteStory = async (storyId: string) => {
    if (!user) return;

    await storiesRepo.deleteStory(storyId);
    await loadStories();
  };

  const loadStories = async () => {
    if (!user) return;
    const storyList = await storiesRepo.getUserStories(user?.uid);
    setStories(storyList);
  };

  const unPublishStory = async (storyId: string) => {
    if (!user) return;
    await storiesRepo.handlePublish(storyId);
    await loadStories();
  };

  if (loading) {
    return <div className="text-center py-6">Loading...</div>;
  }
  const drafts = stories.filter((story) => !story.isPublished);
  const publishedStories = stories.filter((story) => story.isPublished);

  return (
    <div className="min-h-screen py-24  dark:bg-black text-black dark:text-white transition-colors duration-300">
      <div className="container mx-auto px-4 md:py-16">
        {/*
          This flex container handles the responsiveness.
          - flex-col: Stacks columns vertically on mobile.
          - lg:flex-row: Switches to horizontal columns on large screens.
          - gap-8: Provides consistent spacing in both directions.
        */}
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Drafts Column */}
          <div className="w-full lg:w-1/2 flex flex-col gap-6">
            <h2 className="text-3xl font-bold text-black dark:text-white border-b-2 border-dark-green dark:border-light-green pb-2 transition-colors duration-300">
              Drafts
            </h2>
            {drafts.length === 0 ? (
              <div className="text-center py-10 px-6  dark:bg-black rounded-lg shadow-sm border border-black/20 dark:border-white/20 transition-colors duration-300">
                <p className="text-black/70 dark:text-white/70">
                  You have no drafts.
                </p>
                <p className="text-black/50 dark:text-white/50 text-sm mt-1">
                  Start writing a new story!
                </p>
              </div>
            ) : (
              drafts.map((story) => (
                <StoryCard
                  key={story.id}
                  story={story}
                  onEdit={editStory}
                  onDelete={deleteStory}
                  onUnpublish={unPublishStory}
                />
              ))
            )}
          </div>

          {/* Published Stories Column */}
          <div className="w-full lg:w-1/2 flex flex-col gap-6">
            <h2 className="text-3xl font-bold text-black dark:text-white border-b-2 border-dark-green dark:border-light-green pb-2 transition-colors duration-300">
              Published Stories
            </h2>
            {publishedStories.length === 0 ? (
              <div className="text-center py-10 px-6  dark:bg-black rounded-lg shadow-sm border border-black/20 dark:border-white/20 transition-colors duration-300">
                <p className="text-black/70 dark:text-white/70">
                  You have no published stories.
                </p>
              </div>
            ) : (
              publishedStories.map((story) => (
                <StoryCard
                  key={story.id}
                  story={story}
                  onEdit={editStory}
                  onUnpublish={unPublishStory}
                  onDelete={deleteStory}
                />
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserStories;
