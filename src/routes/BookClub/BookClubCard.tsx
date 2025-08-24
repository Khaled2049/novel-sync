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
    <div className="h-56  rounded-lg shadow-md overflow-hidden mb-4 border  transition-all duration-300 hover:shadow-lg">
      {/* <img
    src={club.image}
    alt={club.name}
    className="w-full h-48 object-cover"
  /> */}
      <div className="p-4 h-full flex flex-col justify-between">
        <div>
          <Link
            to={`/book-clubs/${club.id}`}
            key={club.id}
            className="block transition duration-300"
          >
            <h2 className="text-2xl font-serif font-bold mb-2  truncate">
              {club.name}
            </h2>
          </Link>
          <p className=" mb-3 font-serif overflow-hidden text-ellipsis">
            {club.description}
          </p>
        </div>
        <div>
          <div className="flex items-center text-sm  mb-3">
            <Users size={16} className="mr-1" />
            <span className="mr-3">
              {club.members.length.toLocaleString()} members
            </span>
            <BookOpen size={16} className="mr-1" />
            <span className="mr-3">{club.category}</span>
            <Clock size={16} className="mr-1" />
            <span>{club.activity}</span>
          </div>
          <div className="flex justify-between items-center">
            <div className="flex-grow">
              {!joined ? (
                <button
                  onClick={() => onJoin(club.id)}
                  className="w-full py-2 px-4 rounded-full  text-white flex items-center justify-center  transition duration-300"
                >
                  <UserPlus size={16} className="mr-2" />
                  Join Group
                </button>
              ) : (
                <button
                  onClick={() => onLeave(club.id)}
                  className="w-full py-2 px-4 rounded-full   flex items-center justify-center  transition duration-300"
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
                className="w-full py-2 px-3 0 text-white rounded-full flex items-center justify-center hover: transition duration-300"
              >
                <Edit size={16} />
              </button>
              <button
                onClick={onDelete}
                className="w-full py-2 px-3 bg-red-600 text-white rounded-full flex items-center justify-center hover:bg-red-700 transition duration-300"
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
