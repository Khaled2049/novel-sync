import { useEffect, useState } from "react";
import { Book, Plus } from "lucide-react";
import BookClubCard from "../../components/BookClubCard";
import { IClub } from "../../types/IClub";
import CreateBookClub from "./CreateBookClub";
import UpdateBookClub from "./UpdateBookClub";
import { useBookClub } from "../../contexts/BookClubContext";
import { useAuthContext } from "../../contexts/AuthContext";

const BookClubs = () => {
  const {
    bookClubs,
    createBookClub,
    updateBookClub,
    deleteBookClub,
    joinBookClub,
    leaveBookClub,
    getBookClubs,
  } = useBookClub();
  const { user } = useAuthContext();

  useEffect(() => {
    getBookClubs();
  }, []);

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showUpdateForm, setShowUpdateForm] = useState(false);
  const [selectedClub, setSelectedClub] = useState<IClub | null>(null);

  const handleCreateClub = async (newClub: IClub) => {
    if (user) {
      newClub.creatorId = user.uid;
    }
    await createBookClub(newClub);
    setShowCreateForm(false);
  };

  const handleShowCreateForm = () => {
    setShowCreateForm(true);
  };

  const handleCancelCreateClub = () => {
    setShowCreateForm(false);
  };

  const handleUpdateClub = (updatedClub: IClub) => {
    updateBookClub(updatedClub.id, updatedClub);
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
      joinBookClub(clubId, user.username);
    } else {
      alert("You must be logged in to join a club.");
    }
  };

  const handleDeleteClub = (club: IClub) => {
    if (club.creatorId === user?.uid) {
      if (window.confirm("Are you sure you want to delete this club?")) {
        deleteBookClub(club.id);
      }
    } else {
      alert("You can only delete clubs you created.");
    }
  };

  const handleLeaveClub = (clubId: string) => {
    if (user) {
      leaveBookClub(clubId, user.uid);
    }
  };

  const handleCancelUpdateClub = () => {
    setShowUpdateForm(false);
    setSelectedClub(null);
  };

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
              {bookClubs.map((club) => (
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
