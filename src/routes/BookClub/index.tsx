import { useEffect, useState } from "react";
import { Book, Plus } from "lucide-react";
import BookClubCard from "../../components/BookClubCard";
import { IClub } from "../../types/IClub";
import CreateBookClub from "./CreateBookClub";
import UpdateBookClub from "./UpdateBookClub";

import { useAuthContext } from "../../contexts/AuthContext";
import { bookClubRepo } from "./bookClubRepo";
import { Link } from "react-router-dom";

const BookClubs = () => {
  const { user } = useAuthContext();

  const [bookClubs, setBookClubs] = useState<IClub[]>([]);

  useEffect(() => {
    // fetch book clubs
    const fetchBookClubs = async () => {
      const clubs = await bookClubRepo.getBookClubs();
      if (clubs) {
        setBookClubs(clubs);
      }
    };
    fetchBookClubs();
  }, []);

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showUpdateForm, setShowUpdateForm] = useState(false);
  const [selectedClub, setSelectedClub] = useState<IClub | null>(null);

  const handleCreateClub = async (newClub: IClub) => {
    if (user) {
      newClub.creatorId = user.uid;
    }
    await bookClubRepo.createBookClub(newClub);
    setShowCreateForm(false);
  };

  const handleShowCreateForm = () => {
    setShowCreateForm(true);
  };

  const handleCancelCreateClub = () => {
    setShowCreateForm(false);
  };

  const handleUpdateClub = (updatedClub: IClub) => {
    bookClubRepo.updateBookClub(updatedClub.id, updatedClub);
    setShowUpdateForm(false);
    setSelectedClub(null);
  };

  const handleShowUpdateForm = (club: IClub) => {
    if (club.creatorId === user?.uid) {
      setSelectedClub(club);
      setShowUpdateForm(true);
    } else {
      alert("You can only update clubs you created.");
    }
  };

  const handleJoinClub = (clubId: string) => {
    if (user) {
      bookClubRepo.joinBookClub(clubId, user.uid);
    } else {
      alert("You must be logged in to join a club.");
    }
  };

  const handleDeleteClub = (club: IClub) => {
    if (club.creatorId === user?.uid) {
      if (window.confirm("Are you sure you want to delete this club?")) {
        bookClubRepo.deleteBookClub(club.id);
      }
    } else {
      alert("You can only delete clubs you created.");
    }
  };

  const handleLeaveClub = (clubId: string) => {
    if (user) {
      bookClubRepo.leaveBookClub(clubId, user.uid);
    }
  };

  const handleCancelUpdateClub = () => {
    setShowUpdateForm(false);
    setSelectedClub(null);
  };

  if (!user) {
    return (
      <div className="flex items-center bg-amber-50  justify-center h-screen ">
        <div className="text-center bg-white p-8 rounded-lg shadow-lg max-w-md mx-auto">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">
            Please Sign In
          </h2>
          <p className="text-gray-600 mb-6">
            You need to be logged in to view book clubs.
          </p>
          <Link
            to="/sign-in"
            className="px-6 py-2 bg-amber-500 text-white rounded-full flex items-center justify-center hover:bg-amber-600 transition duration-300"
          >
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-amber-50 min-h-screen p-6">
      {!showCreateForm && !showUpdateForm ? (
        <>
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-center mb-8">
              <h1 className="text-3xl md:text-4xl font-serif font-bold text-amber-800 mb-4 md:mb-0 flex items-center">
                <Book className="mr-3" size={36} />
                Discover Book Clubs
              </h1>
              <button
                onClick={handleShowCreateForm}
                className="bg-amber-600 hover:bg-amber-700 text-white px-6 py-3 rounded-full flex items-center transition duration-300 ease-in-out transform hover:scale-105 shadow-lg"
              >
                <Plus size={20} className="mr-2" />
                Create Club
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {bookClubs.map((club: IClub) => (
                <div key={club.id}>
                  <BookClubCard
                    joined={user ? club.members.includes(user.uid) : false}
                    club={club}
                    onEdit={() => handleShowUpdateForm(club)}
                    onDelete={() => handleDeleteClub(club)}
                    onJoin={() => handleJoinClub(club.id)}
                    onLeave={() => handleLeaveClub(club.id)}
                  />
                </div>
              ))}
            </div>
          </div>
        </>
      ) : showCreateForm && user ? (
        <div className="max-w-2xl mx-auto p-6 rounded-lg shadow-lg">
          <CreateBookClub
            user={user}
            onCreate={handleCreateClub}
            onCancel={handleCancelCreateClub}
          />
        </div>
      ) : (
        showUpdateForm &&
        selectedClub && (
          <div className="max-w-2xl mx-auto bg-white p-6 rounded-lg shadow-lg">
            <UpdateBookClub
              club={selectedClub}
              onUpdate={handleUpdateClub}
              onCancel={handleCancelUpdateClub}
            />
          </div>
        )
      )}
    </div>
  );
};

export default BookClubs;
