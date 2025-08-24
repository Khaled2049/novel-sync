import { Link } from "react-router-dom";
import { IClub } from "@/types/IClub";
import {
  BookOpen,
  Clock,
  UserPlus,
  Users,
  X,
  Edit,
  Trash2,
} from "lucide-react";

interface BookClubCardProps {
  club: IClub;
  joined: boolean;
  onEdit: () => void;
  onDelete: () => void;
  onJoin: (clubId: string) => void;
  onLeave: (clubId: string) => void;
}

const BookClubCard = ({
  joined,
  onJoin,
  club,
  onEdit,
  onDelete,
  onLeave,
}: BookClubCardProps) => {
  return (
    <div className="h-56 rounded-lg shadow-md overflow-hidden mb-4 border border-black/20 dark:border-white/20 transition-all duration-300 hover:shadow-lg hover:shadow-black/20 dark:hover:shadow-white/20 bg-white dark:bg-black">
      <div className="p-4 h-full flex flex-col justify-between">
        <div>
          <Link
            to={`/book-clubs/${club.id}`}
            key={club.id}
            className="block transition-colors duration-200"
          >
            <h2 className="text-2xl font-serif font-bold mb-2 text-dark-green dark:text-light-green truncate">
              {club.name}
            </h2>
          </Link>
          <p className="mb-3 font-serif overflow-hidden text-ellipsis text-black/70 dark:text-white/70">
            {club.description}
          </p>
        </div>
        <div>
          <div className="flex items-center text-sm text-black dark:text-white mb-3">
            <Users
              size={16}
              className="mr-1 text-dark-green dark:text-light-green"
            />
            <span className="mr-3">
              {club.members.length.toLocaleString()} members
            </span>
            <BookOpen
              size={16}
              className="mr-1 text-dark-green dark:text-light-green"
            />
            <span className="mr-3">{club.category}</span>
            <Clock
              size={16}
              className="mr-1 text-dark-green dark:text-light-green"
            />
            <span>{club.activity}</span>
          </div>
          <div className="flex justify-between items-center">
            <div className="flex-grow">
              {!joined ? (
                <button
                  onClick={() => onJoin(club.id)}
                  className="w-full py-2 px-4 rounded-full bg-dark-green dark:bg-light-green text-white flex items-center justify-center hover:bg-light-green dark:hover:bg-dark-green transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-dark-green dark:focus:ring-light-green focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-black"
                >
                  <UserPlus size={16} className="mr-2" />
                  Join Group
                </button>
              ) : (
                <button
                  onClick={() => onLeave(club.id)}
                  className="w-full py-2 px-4 rounded-full border border-dark-green dark:border-light-green text-dark-green dark:text-light-green flex items-center justify-center hover:bg-dark-green dark:hover:bg-light-green hover:text-white dark:hover:text-black transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-dark-green dark:focus:ring-light-green focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-black"
                >
                  <X size={16} className="mr-2" />
                  Leave Group
                </button>
              )}
            </div>

            {/* Edit and Delete Buttons */}
            <div className="ml-4 flex space-x-2 flex-grow">
              <button
                onClick={onEdit}
                className="w-full py-2 px-3 bg-white dark:bg-black text-dark-green dark:text-light-green border border-dark-green dark:border-light-green rounded-full flex items-center justify-center hover:bg-dark-green dark:hover:bg-light-green hover:text-white dark:hover:text-black transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-dark-green dark:focus:ring-light-green focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-black"
              >
                <Edit size={16} />
              </button>
              <button
                onClick={onDelete}
                className="w-full py-2 px-3 bg-red-600 text-white rounded-full flex items-center justify-center hover:bg-red-700 transition-colors duration-200"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookClubCard;
