import { useAuthContext } from "../../contexts/AuthContext";
import { FaArrowRight, FaEye, FaThumbsUp } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { storiesRepo } from "../../services/StoriesRepo";
import StoryMetadataModal from "./StoryMetadataModal";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { StoryMetadata } from "@/types/IStory";
import BookRecommendation from "@/components/BookRecommendation";

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
    <div className=" min-h-screen relative">
      <div className="container mx-auto px-4">
        {user ? (
          <div className="max-w-4xl mx-auto sm:p-6 bg-white rounded-lg shadow-lg mb-8">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-serif  mb-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              {/* Welcome Message */}
              <span>
                {user.displayName
                  ? `Welcome back, ${user.displayName}!`
                  : "Welcome Back!"}
              </span>

              {/* Button */}
              <button
                onClick={handleNewStory}
                className=" text-white px-3 sm:px-4 py-2 rounded-full font-sans text-sm sm:text-base  transition-colors duration-200 flex items-center justify-center w-full sm:w-auto"
              >
                Start a New Story
                <FaArrowRight className="ml-2" />
              </button>
            </h1>

            {/* Story Metadata Modal */}
            {user && (
              <StoryMetadataModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                userId={user.uid}
              />
            )}
          </div>
        ) : (
          <div className="max-w-4xl mx-auto p-4 sm:p-6 bg-white rounded-lg shadow-lg mb-8">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-serif  mb-4 flex flex-col sm:flex-row items-center sm:items-center justify-center sm:justify-between gap-4 text-center sm:text-left">
              <span>Welcome to NovelSync!</span>
              <Link
                to="/sign-in"
                className=" text-white px-3 sm:px-4 py-2 rounded-full font-sans text-sm sm:text-base  transition-colors duration-200 flex items-center justify-center"
              >
                Sign In
                <FaArrowRight className="ml-2" />
              </Link>
            </h1>
          </div>
        )}

        <div className="flex flex-wrap mx-4">
          <div className="w-full lg:w-1/4 px-4 border-t-2 lg:border-t-0 lg:border-r-2 space-y-4 order-2 lg:order-1 pt-5">
            <BookRecommendation />
          </div>

          <div className="w-full lg:w-3/4 px-4 lg:order-1">
            <h2 className="text-2xl font-serif  mb-6">Stories</h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {currentStories.map((story) => (
                <Card
                  key={story.id}
                  onClick={() => handleStoryClick(story)}
                  className="hover:shadow-lg transition-shadow duration-200 cursor-pointer"
                >
                  <CardHeader>
                    <CardTitle className="font-serif text-lg sm:text-xl  text-left">
                      {story.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="flex flex-col sm:flex-row items-start">
                    {/* Story Cover Thumbnail */}
                    {story.coverImageUrl ? (
                      <img
                        src={story.coverImageUrl}
                        alt={`${story.title} cover`}
                        className="w-20 sm:w-24 h-28 sm:h-32 object-cover rounded-md mb-4 sm:mb-0 sm:mr-4 border "
                      />
                    ) : null}

                    <div>
                      <h3 className="text-base sm:text-lg mb-2">Description</h3>
                      <p className="text-gray-600 mb-1">{story.description}</p>
                      <p className="text-gray-600 mb-1">By {story.author}</p>
                      <p className="text-gray-500 text-xs sm:text-sm mb-4">
                        Last Updated:{" "}
                        {new Date(story.updatedAt).toLocaleDateString()}
                      </p>
                      {story.tags && (
                        <div className="flex flex-wrap gap-2 mt-2">
                          {story.tags.map((tag, index) => (
                            <span
                              key={index}
                              className="  text-xs px-2 py-1 rounded-full"
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

            {/* Pagination */}
            <div className="flex justify-center my-8">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                (pageNumber) => (
                  <button
                    key={pageNumber}
                    onClick={() => handlePageChange(pageNumber)}
                    className={`mx-1 px-3 py-1 rounded ${
                      currentPage === pageNumber ? " text-white" : "  "
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
