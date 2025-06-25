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
    <div className="border border-gray-200 bg-amber-200 rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300">
      <div className="p-5">
        <div className="flex items-center justify-between mb-3">
          {/* Status Indicator */}
          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
              isPublished
                ? "bg-sky-100 text-sky-800"
                : "bg-amber-100 text-amber-800"
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
        <h3 className="text-2xl font-serif font-bold text-slate-800 mb-4 truncate">
          {story.title}
        </h3>

        {/* Action Buttons */}
        <div className="flex items-center space-x-3">
          <button
            onClick={() => onEdit(story.id)}
            className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-slate-700 hover:bg-slate-900 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2"
          >
            <FaEdit className="mr-2" />
            Edit
          </button>
          {isPublished ? (
            <button
              onClick={() => onUnpublish(story.id)}
              className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
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
