import { useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { IClub } from "../../types/IClub";
import { IUser } from "../../types/IUser";
import { Book, X } from "lucide-react";

import { IBook } from "../../types/IBook";
import BookSearch from "../../components/BookSearch";

const CreateBookClub = ({
  user,
  onCreate,
  onCancel,
}: {
  user: IUser;
  onCreate: (newClub: IClub) => void;
  onCancel: () => void;
}) => {
  const [bookOfTheMonth, setBookOfTheMonth] = useState<IBook>({
    id: "",
    volumeInfo: {
      title: "",
      authors: [],
      description: "",
      imageLinks: {
        thumbnail: "",
      },
    },
  });
  const [newClub, setNewClub] = useState<IClub>({
    id: "",
    name: "",
    description: "",
    image: "",
    members: [],
    category: "",
    activity: "",
    creatorId: "",
    bookOfTheMonth: {
      id: "",
      volumeInfo: {
        title: "",
        authors: [],
        description: "",
        imageLinks: {
          thumbnail: "",
        },
      },
    },
    meetUp: "",
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setNewClub({
      ...newClub,
      [e.target.name]: e.target.value,
    });
  };

  const handleBookSelect = (book: IBook) => {
    setBookOfTheMonth(book);
    setNewClub({
      ...newClub,
      bookOfTheMonth: book,
    });
  };

  const handleCreateClub = () => {
    const clubWithDefaults = {
      ...newClub,
      id: uuidv4(),
      members: [user.username],
      activity: "New",
      image: "/api/placeholder/400/250",
      creatorId: user.uid,
      bookOfTheMonth: {
        id: bookOfTheMonth.id,
        volumeInfo: {
          title: bookOfTheMonth.volumeInfo.title,
          authors: bookOfTheMonth.volumeInfo.authors,
          description: bookOfTheMonth.volumeInfo.description,
          imageLinks: {
            thumbnail: bookOfTheMonth.volumeInfo.imageLinks?.thumbnail || "",
          },
        },
      },
      meetUp: newClub.meetUp,
    };
    onCreate(clubWithDefaults);
  };

  return (
    <div className="bg-amber-50 ">
      <div className="max-w-2xl mx-auto rounded-lg  p-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-3xl font-serif font-bold text-amber-800 flex items-center">
            <Book className="mr-3" size={32} />
            Create New Club
          </h2>
          <button
            onClick={onCancel}
            className="text-amber-600 hover:text-amber-800 transition-colors"
            aria-label="Close"
          >
            <X size={24} />
          </button>
        </div>

        <div className="space-y-6">
          <div>
            <label
              className="block text-amber-800 font-semibold mb-2"
              htmlFor="name"
            >
              Club Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={newClub.name}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-amber-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-colors"
              placeholder="Enter club name"
            />
          </div>

          <div>
            <label
              className="block text-amber-800 font-semibold mb-2"
              htmlFor="description"
            >
              Club Description
            </label>
            <textarea
              id="description"
              name="description"
              value={newClub.description}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-amber-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-colors h-32"
              placeholder="Enter club description"
            />
          </div>

          <div>
            <label
              className="block text-amber-800 font-semibold mb-2"
              htmlFor="category"
            >
              Category
            </label>
            <input
              type="text"
              id="category"
              name="category"
              value={newClub.category}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-amber-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-colors"
              placeholder="Enter club category"
            />
          </div>

          <div>
            <label
              className="block text-amber-800 font-semibold mb-2"
              htmlFor="meetup"
            >
              Meetup
            </label>
            <input
              type="text"
              id="meetUp"
              name="meetUp"
              value={newClub.meetUp}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-amber-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-colors"
              placeholder="Location"
            />
          </div>
        </div>

        <div className="mt-6">
          <h3 className="text-amber-800 font-semibold mb-2">
            Book of the Month
          </h3>
          <BookSearch onBookSelect={handleBookSelect} />
        </div>

        <div className="flex justify-end mt-8 space-x-4">
          <button
            onClick={onCancel}
            className="px-6 py-2 bg-amber-100 text-amber-800 rounded-full hover:bg-amber-200 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleCreateClub}
            className="px-6 py-2 bg-amber-600 text-white rounded-full hover:bg-amber-700 transition-colors"
          >
            Create Club
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateBookClub;
