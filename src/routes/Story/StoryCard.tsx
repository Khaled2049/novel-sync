import { FaEdit, FaTrash, FaEyeSlash, FaBookOpen } from "react-icons/fa";

interface Story {
  id: string;
  title: string;
  isPublished: boolean;
}

interface StoryCardProps {
  story: Story;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onUnpublish: (id: string) => void;
}

export const StoryCard: React.FC<StoryCardProps> = ({
  story,
  onEdit,
  onDelete,
  onUnpublish,
}) => {
  // Use a different icon and color based on the published status
  const isPublished = story.isPublished;

  return (
    <div className="border border-black/20 dark:border-white/20 rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 bg-white dark:bg-black text-black dark:text-white">
      <div className="p-5">
        <div className="flex items-center justify-between mb-3">
          {/* Status Indicator */}
          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
              isPublished
                ? "bg-light-green/20 dark:bg-dark-green/20 text-dark-green dark:text-light-green"
                : "bg-black/10 dark:bg-white/10 text-black/70 dark:text-white/70"
            }`}
          >
            {isPublished ? (
              <FaBookOpen className="mr-1.5" />
            ) : (
              <FaEdit className="mr-1.5" />
            )}
            {isPublished ? "Published" : "Draft"}
          </span>
        </div>

        {/* Story Title */}
        <h3 className="text-2xl font-serif font-bold text-black dark:text-white mb-4 truncate">
          {story.title}
        </h3>

        {/* Action Buttons */}
        <div className="flex items-center space-x-3">
          <button
            onClick={() => onEdit(story.id)}
            className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-dark-green dark:bg-light-green hover:bg-light-green dark:hover:bg-dark-green rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-dark-green dark:focus:ring-light-green focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-black"
          >
            <FaEdit className="mr-2" />
            Edit
          </button>
          {isPublished ? (
            <button
              onClick={() => onUnpublish(story.id)}
              className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-black dark:text-white border border-black dark:border-white hover:bg-black/10 dark:hover:bg-white/10 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-black"
            >
              <FaEyeSlash className="mr-2" />
              Unpublish
            </button>
          ) : (
            <button
              onClick={() => onDelete(story.id)}
              className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-red-700 bg-red-100 hover:bg-red-200 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
            >
              <FaTrash className="mr-2" />
              Delete
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
