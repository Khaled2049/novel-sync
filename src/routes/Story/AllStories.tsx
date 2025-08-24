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
    <div className="min-h-screen relative  dark:bg-black text-black dark:text-white transition-colors duration-300">
      <div className="container mx-auto px-4">
        {user ? (
          <div className="max-w-4xl mx-auto sm:p-6  dark:bg-black rounded-lg shadow-lg dark:shadow-white/20 mb-8 transition-colors duration-300">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-serif text-dark-green dark:text-light-green mb-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              {/* Welcome Message */}
              <span>
                {user.displayName
                  ? `Welcome back, ${user.displayName}!`
                  : "Welcome Back!"}
              </span>

              {/* Button */}
              <button
                onClick={handleNewStory}
                className="bg-dark-green dark:bg-light-green text-white px-3 sm:px-4 py-2 rounded-full font-sans text-sm sm:text-base hover:bg-light-green dark:hover:bg-dark-green transition-colors duration-200 flex items-center justify-center w-full sm:w-auto"
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
          <div className="max-w-4xl mx-auto p-4 sm:p-6  dark:bg-black rounded-lg shadow-lg dark:shadow-white/20 mb-8 transition-colors duration-300">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-serif text-dark-green dark:text-light-green mb-4 flex flex-col sm:flex-row items-center sm:items-center justify-center sm:justify-between gap-4 text-center sm:text-left">
              <span>Welcome to NovelSync!</span>
              <Link
                to="/sign-in"
                className="bg-dark-green dark:bg-light-green text-white px-3 sm:px-4 py-2 rounded-full font-sans text-sm sm:text-base hover:bg-light-green dark:hover:bg-dark-green transition-colors duration-200 flex items-center justify-center"
              >
                Sign In
                <FaArrowRight className="ml-2" />
              </Link>
            </h1>
          </div>
        )}

        <div className="flex flex-wrap mx-4">
          <div className="w-full lg:w-1/4 px-4 border-t-2 lg:border-t-0 lg:border-r-2 border-black/20 dark:border-white/20 space-y-4 order-2 lg:order-1 pt-5 transition-colors duration-300">
            <BookRecommendation />
          </div>

          <div className="w-full lg:w-3/4 px-4 lg:order-1">
            <h2 className="text-2xl font-serif text-black dark:text-white mb-6">
              Stories
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {currentStories.map((story) => (
                <Card
                  key={story.id}
                  onClick={() => handleStoryClick(story)}
                  className="hover:shadow-lg dark:hover:shadow-white/20 transition-shadow duration-200 cursor-pointer  dark:bg-black text-black dark:text-white border border-black/20 dark:border-white/20"
                >
                  <CardHeader>
                    <CardTitle className="font-serif text-lg sm:text-xl text-dark-green dark:text-light-green text-left">
                      {story.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="flex flex-col sm:flex-row items-start">
                    {/* Story Cover Thumbnail */}
                    {story.coverImageUrl ? (
                      <img
                        src={story.coverImageUrl}
                        alt={`${story.title} cover`}
                        className="w-20 sm:w-24 h-28 sm:h-32 object-cover rounded-md mb-4 sm:mb-0 sm:mr-4 border border-black/20 dark:border-white/20"
                      />
                    ) : null}

                    <div>
                      <h3 className="text-base sm:text-lg text-black dark:text-white mb-2">
                        Description
                      </h3>
                      <p className="text-black/70 dark:text-white/70 mb-1">
                        {story.description}
                      </p>
                      <p className="text-black/70 dark:text-white/70 mb-1">
                        By {story.author}
                      </p>
                      <p className="text-black/50 dark:text-white/50 text-xs sm:text-sm mb-4">
                        Last Updated:{" "}
                        {new Date(story.updatedAt).toLocaleDateString()}
                      </p>
                      {story.tags && (
                        <div className="flex flex-wrap gap-2 mt-2">
                          {story.tags.map((tag, index) => (
                            <span
                              key={index}
                              className="bg-light-green/10 dark:bg-dark-green/10 text-dark-green dark:text-light-green text-xs px-2 py-1 rounded-full"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </CardContent>
                  <CardFooter className="flex items-center gap-2 text-black/70 dark:text-white/70 text-lg">
                    <div className="flex items-center">
                      <FaEye className="mr-1 text-dark-green dark:text-light-green" />{" "}
                      {story.views}
                    </div>
                    <div className="flex items-center">
                      <FaThumbsUp className="mr-1 text-dark-green dark:text-light-green" />{" "}
                      {story.likes}
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
                    className={`mx-1 px-3 py-1 rounded transition-colors duration-200 ${
                      currentPage === pageNumber
                        ? "bg-dark-green dark:bg-light-green text-white"
                        : "text-dark-green dark:text-light-green hover:bg-light-green/10 dark:hover:bg-dark-green/10"
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
