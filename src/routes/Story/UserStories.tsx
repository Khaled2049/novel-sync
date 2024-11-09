import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { useAuthContext } from "../../contexts/AuthContext";
import { FaEdit, FaEyeSlash, FaTrash } from "react-icons/fa";
import { storiesRepo } from "../../components/StoriesRepo";
import { StoryMetadata } from "@/types/IStory";

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

  return (
    <div className="mx-auto p-6 bg-amber-50 min-h-screen">
      <div className="flex space-x-6">
        {/* Drafts Column */}
        <div className="w-1/2 space-y-6 overflow-y-auto">
          <h2 className="text-2xl font-bold mb-4">Drafts</h2>
          {stories.length === 0 ? (
            <p className="text-gray-600">No drafts available.</p>
          ) : (
            stories.map(
              (story) =>
                !story.isPublished && (
                  <div
                    key={story.id}
                    className="bg-amber-100 p-4 rounded-lg shadow-sm mb-4"
                  >
                    <h3 className="font-serif text-xl text-amber-900 mb-2">
                      {story.title}
                    </h3>
                    <div className="flex">
                      <button
                        onClick={() => editStory(story.id)}
                        className="bg-green-500 flex px-3 py-2 mx-2 text-white rounded hover:bg-green-700"
                      >
                        <FaEdit className="mr-1" /> Edit
                      </button>
                      <button
                        onClick={() => deleteStory(story.id)}
                        className="bg-red-500 flex px-3 py-2 text-white rounded hover:bg-red-700"
                      >
                        <FaTrash className="mr-1" /> Delete
                      </button>
                    </div>
                  </div>
                )
            )
          )}
        </div>

        <div className="w-1/2 space-y-6 overflow-y-auto">
          <h2 className="text-2xl font-bold mb-4">Published Stories</h2>
          {stories.length === 0 ? (
            <p className="text-gray-600">No drafts available.</p>
          ) : (
            stories.map(
              (story) =>
                story.isPublished && (
                  <div
                    key={story.id}
                    className="bg-amber-100 p-4 rounded-lg shadow-sm mb-4"
                  >
                    <h3 className="font-serif text-xl text-amber-900 mb-2">
                      {story.title}
                    </h3>
                    <div className="flex">
                      <button
                        onClick={() => editStory(story.id)}
                        className="bg-green-500 flex px-3 py-2 text-white rounded hover:bg-green-700"
                      >
                        <FaEdit className="mr-1" /> Edit
                      </button>
                      {/* Unpublish button */}
                      <button
                        onClick={() => unPublishStory(story.id)}
                        className="bg-red-500 flex px-3 py-2 mx-2 text-white rounded hover:bg-red-700"
                      >
                        <FaEyeSlash className="mr-1" />
                      </button>
                    </div>
                  </div>
                )
            )
          )}
        </div>
      </div>
    </div>
  );
};

export default UserStories;
