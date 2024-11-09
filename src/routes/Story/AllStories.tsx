import { useAuthContext } from "../../contexts/AuthContext";
import { FaArrowRight, FaEye, FaThumbsUp } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import Suggestions from "../../components/Suggestions";
import { storiesRepo } from "../../components/StoriesRepo";
import StoryMetadataModal from "@/components/StoryMetadataModal";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { StoryMetadata } from "@/types/IStory";

const AllStories: React.FC = () => {
  const { user } = useAuthContext();

  const [currentPage, setCurrentPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [stories, setStories] = useState<StoryMetadata[]>([]);
  const storiesPerPage = 9;
  const indexOfLastNovel = currentPage * storiesPerPage;
  const indexOfFirstNovel = indexOfLastNovel - storiesPerPage;
  const currentStories = stories.slice(indexOfFirstNovel, indexOfLastNovel);
  const totalPages = Math.ceil(stories.length / storiesPerPage);

  const navigate = useNavigate();

  useEffect(() => {
    loadStories();
  }, []);

  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  const handleNewStory = () => {
    if (user) {
      setIsModalOpen(true);
    } else {
      console.error("User not authenticated");
      // Handle the case where the user is not authenticated
      // Maybe show a login prompt or redirect to login page
    }
  };

  const loadStories = async () => {
    const storyList = await storiesRepo.getPublishedStories();
    setStories(storyList);
  };

  const handleStoryClick = async (story: StoryMetadata) => {
    const storyData = await storiesRepo.getStory(story.id);
    if (storyData) {
      storiesRepo.incrementViewCount(story.id);
      navigate(`/story/${story.id}`);
    }
  };

  return (
    <div className="bg-amber-50 min-h-screen py-8 relative ">
      <div className="container mx-auto px-4">
        {user ? (
          <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg mb-8">
            <h1 className="text-3xl font-serif text-amber-900 mb-4 flex items-center justify-between">
              {user.displayName ? (
                <span>Welcome back, {user.displayName || ""}!</span>
              ) : (
                <span>Welcome Back!</span>
              )}
              <button
                onClick={handleNewStory}
                className="bg-amber-600 text-white px-4 py-2 rounded-full font-sans text-base hover:bg-amber-700 transition-colors duration-200 flex items-center"
              >
                Start a New Story
                <FaArrowRight className="ml-2" />
              </button>
              {user && (
                <StoryMetadataModal
                  isOpen={isModalOpen}
                  onClose={() => setIsModalOpen(false)}
                  userId={user.uid}
                />
              )}
            </h1>
          </div>
        ) : (
          <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg mb-8">
            <h1 className="text-3xl font-serif text-amber-900 mb-4 flex items-center justify-between">
              <span>Welcome to NovelSync!</span>
              <Link
                to="/sign-in"
                className="bg-amber-600 text-white px-4 py-2 rounded-full font-sans text-base hover:bg-amber-700 transition-colors duration-200 flex items-center"
              >
                Sign In
                <FaArrowRight className="ml-2" />
              </Link>
            </h1>
          </div>
        )}

        <div className="flex flex-wrap mx-4">
          <div className="w-full lg:w-1/4 px-4 border-r-2 border-amber-700 space-y-4">
            <Suggestions />
          </div>

          <div className="w-full lg:w-3/4 px-4">
            <h2 className="text-2xl font-serif text-amber-900 mb-6">Stories</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {currentStories.map((story) => (
                <Card
                  key={story.id}
                  onClick={() => handleStoryClick(story)}
                  className="hover:shadow-lg transition-shadow duration-200 cursor-pointer"
                >
                  <CardHeader>
                    <CardTitle className="font-serif text-xl text-amber-900 text-left">
                      {story.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="flex items-start">
                    {/* Story Cover Thumbnail */}
                    {story.coverImageUrl ? (
                      <img
                        src={story.coverImageUrl}
                        alt={`${story.title} cover`}
                        className="w-24 h-32 object-cover rounded-md mr-4 border border-amber-200"
                      />
                    ) : null}

                    <div>
                      <h3 className="text-lg mb-2">Description</h3>

                      <p className="text-gray-600 mb-1">{story.description}</p>
                      <p className="text-gray-600 mb-1">By {story.author}</p>
                      <p className="text-gray-500 text-sm mb-4">
                        Last Updated:{" "}
                        {new Date(story.updatedAt).toLocaleDateString()}
                      </p>
                      {story.tags && (
                        <div className="flex flex-wrap gap-2 mt-2">
                          {story.tags.map((tag, index) => (
                            <span
                              key={index}
                              className="bg-amber-100 text-amber-800 text-xs px-2 py-1 rounded-full"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </CardContent>
                  <CardFooter className="flex items-center gap-2 text-gray-600 text-lg">
                    <div className="flex items-center">
                      <FaEye className="mr-1" /> {story.views}
                    </div>
                    <div className="flex items-center">
                      <FaThumbsUp className="mr-1" /> {story.likes}
                    </div>
                  </CardFooter>
                </Card>
              ))}
            </div>

            {/* New Stories */}

            {/* Pagination */}
            <div className="flex justify-center mt-8">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                (pageNumber) => (
                  <button
                    key={pageNumber}
                    onClick={() => handlePageChange(pageNumber)}
                    className={`mx-1 px-3 py-1 rounded ${
                      currentPage === pageNumber
                        ? "bg-amber-600 text-white"
                        : "bg-amber-100 text-amber-800 hover:bg-amber-200"
                    }`}
                  >
                    {pageNumber}
                  </button>
                )
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AllStories;
