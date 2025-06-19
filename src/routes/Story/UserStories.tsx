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
    <div className="bg-amber-50 min-h-screen py-24">
      <div className="container mx-auto px-4md:py-16">
        {/*
          This flex container handles the responsiveness.
          - flex-col: Stacks columns vertically on mobile.
          - lg:flex-row: Switches to horizontal columns on large screens.
          - gap-8: Provides consistent spacing in both directions.
        */}
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Drafts Column */}
          <div className="w-full lg:w-1/2 flex flex-col gap-6">
            <h2 className="text-3xl font-bold text-slate-800 border-b-2 border-amber-400 pb-2">
              Drafts
            </h2>
            {drafts.length === 0 ? (
              <div className="text-center py-10 px-6 bg-white rounded-lg shadow-sm">
                <p className="text-gray-500">You have no drafts.</p>
                <p className="text-gray-400 text-sm mt-1">
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
            <h2 className="text-3xl font-bold text-slate-800 border-b-2 border-sky-400 pb-2">
              Published Stories
            </h2>
            {publishedStories.length === 0 ? (
              <div className="text-center py-10 px-6 bg-white rounded-lg shadow-sm">
                <p className="text-gray-500">You have no published stories.</p>
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
