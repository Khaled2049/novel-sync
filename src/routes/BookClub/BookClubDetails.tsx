import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Book, Calendar, MessageCircle } from "lucide-react";
import { IClub } from "../../types/IClub";
import { bookClubRepo } from "./bookClubRepo";
import { useAuthContext } from "@/contexts/AuthContext";
import BookClubChat from "./BookClubChat";

const BookClubDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user, loading } = useAuthContext();
  const [club, setClub] = useState<IClub | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchClub = async () => {
      if (!id) {
        setIsLoading(false);
        return;
      }
      try {
        const clubData = await bookClubRepo.getBookClub(id);
        setClub(clubData);
      } catch (error) {
        console.error("Error fetching club:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchClub();
  }, [id]);

  if (loading || isLoading) {
    return (
      <div className="mx-auto p-4 text-center">
        <h1 className="text-3xl font-serif text-amber-800">Loading...</h1>
      </div>
    );
  }

  if (!club) {
    return (
      <div className="mx-auto p-4 text-center">
        <h1 className="text-3xl font-serif text-amber-800">Club not found</h1>
      </div>
    );
  }

  return (
    <div className="mx-auto py-24 flex container">
      {/* Main Content */}
      <div className="justify-center">
        {/* Club Header */}
        <div className="bg-gradient-to-r from-amber-700 to-amber-900 text-white shadow-lg rounded-lg p-6 mb-6">
          <h1 className="text-3xl font-serif font-bold mb-2">{club.name}</h1>
          <p className="text-amber-100">{club.description}</p>
        </div>

        {/* Book of the Month */}
        <div className="bg-white shadow-lg rounded-lg p-6 mb-6">
          <h2 className="text-2xl font-serif font-bold mb-4 text-amber-800 flex items-center">
            <Book className="mr-2" /> Book of the Month
          </h2>
          {club.bookOfTheMonth ? (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-amber-900">
                {club.bookOfTheMonth.volumeInfo.title}
              </h3>
              <img
                src={club.bookOfTheMonth.volumeInfo.imageLinks?.thumbnail}
                alt={club.bookOfTheMonth.volumeInfo.title}
                className="w-32 h-32 rounded-lg"
              />
              <p className="text-amber-800">
                {club.bookOfTheMonth.volumeInfo.authors?.join(", ")}
              </p>
              <p className="text-sm text-amber-600">
                {club.bookOfTheMonth.volumeInfo.description}
              </p>
            </div>
          ) : (
            <p className="text-amber-600 italic">
              No book of the month selected.
            </p>
          )}
        </div>

        {/* Meetup Schedule */}
        <div className="bg-white shadow-lg rounded-lg p-6 mb-6">
          <h2 className="text-2xl font-serif font-bold mb-4 text-amber-800 flex items-center">
            <Calendar className="mr-2" /> Meet Up
          </h2>
          {club.meetUp ? (
            <p className="text-amber-700 bg-amber-100 p-3 rounded-lg">
              {club.meetUp}
            </p>
          ) : (
            <p className="text-amber-600 italic">No meet up scheduled yet.</p>
          )}
        </div>

        {/* Discussion Forum */}
        <div className="bg-white shadow-lg rounded-lg p-6 mb-6">
          <h2 className="text-2xl font-serif font-bold mb-4 text-amber-800 flex items-center">
            <MessageCircle className="mr-2" /> Discussion Forum
          </h2>
          {club.discussions && club.discussions.length > 0 ? (
            <ul className="space-y-4">
              {club.discussions.map((discussion) => (
                <li key={discussion.id} className="bg-amber-100 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold text-amber-900">
                    {discussion.title}
                  </h3>
                  <p className="text-amber-800 mt-2">{discussion.content}</p>
                  <p className="text-sm text-amber-600 mt-2">
                    Posted by {discussion.creatorId} on {discussion.date}
                  </p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-amber-600 italic">
              No discussions yet. Be the first to start one!
            </p>
          )}
        </div>
        {loading && <p>Loading...</p>}
        {user && <BookClubChat clubId={club.id} user={user} />}
      </div>
    </div>
  );
};

export default BookClubDetails;
