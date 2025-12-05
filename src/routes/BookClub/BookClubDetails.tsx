import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import {
  Book,
  Calendar,
  MessageCircle,
  ChevronDown,
  ChevronUp,
  Users,
  User,
  PanelRightOpen,
} from "lucide-react";
import { IClub } from "../../types/IClub";
import { bookClubRepo } from "./bookClubRepo";
import { useAuthContext } from "@/contexts/AuthContext";
import BookClubChat from "./BookClubChat";

const BookClubDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user, loading } = useAuthContext();
  const [club, setClub] = useState<IClub | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);
  const [isChatOpen, setIsChatOpen] = useState(false);

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
      <div className="min-h-screen flex items-center justify-center bg-neutral-50 dark:bg-neutral-950">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-dark-green dark:border-light-green border-t-transparent animate-spin mx-auto mb-4"></div>
          <h1 className="text-2xl font-serif text-neutral-900 dark:text-white">
            Loading...
          </h1>
        </div>
      </div>
    );
  }

  if (!club) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50 dark:bg-neutral-950">
        <div className="text-center">
          <h1 className="text-3xl font-serif text-neutral-900 dark:text-white">
            Club not found
          </h1>
        </div>
      </div>
    );
  }

  return (
    <div className="flex w-full h-full overflow-hidden bg-neutral-50 dark:bg-neutral-950 transition-colors duration-300">
      <aside className="w-80 border-r border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 z-20 hidden md:block">
        <div className="p-6 border-b border-neutral-200 dark:border-neutral-800">
          <h2 className="text-2xl font-serif font-bold text-neutral-900 dark:text-white flex items-center gap-3">
            <Users
              className="text-dark-green dark:text-light-green"
              size={24}
            />
            Members
            <span className="text-sm font-sans font-normal text-neutral-600 dark:text-neutral-400 bg-neutral-100 dark:bg-neutral-800 px-2 py-0.5 rounded">
              {club.members?.length || 0}
            </span>
          </h2>
        </div>

        <div className="flex-1 p-4 space-y-3 overflow-y-auto">
          {club.members && club.members.length > 0 ? (
            club.members.map((member, index) => (
              <div
                key={index}
                className="group flex items-center gap-4 p-4 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-all duration-200 border border-transparent hover:border-neutral-200 dark:hover:border-neutral-700 rounded-lg"
              >
                {/* Avatar Placeholder */}
                <div className="w-12 h-12 bg-neutral-200 dark:bg-neutral-700 flex items-center justify-center text-neutral-700 dark:text-neutral-200 font-bold text-lg rounded-full">
                  {member.charAt(0).toUpperCase()}
                </div>

                {/* Name */}
                <div className="flex-1 min-w-0">
                  <p className="text-lg font-semibold text-neutral-900 dark:text-white truncate group-hover:text-dark-green dark:group-hover:text-light-green transition-colors">
                    {member}
                  </p>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400">
                    Member
                  </p>
                </div>
              </div>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center h-40 text-neutral-400 dark:text-neutral-500">
              <User size={48} className="mb-2 opacity-20" />
              <p className="italic">No members yet</p>
            </div>
          )}
        </div>
      </aside>

      <main className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto">
          {/* Chat Toggle Button (Visible when chat is closed) */}
          {!isChatOpen && (
            <button
              onClick={() => setIsChatOpen(true)}
              className="absolute top-6 right-6 z-30 p-2 bg-white dark:bg-neutral-900 text-neutral-600 dark:text-neutral-300 border border-neutral-200 dark:border-neutral-800 hover:text-dark-green dark:hover:text-light-green transition-all hover:scale-110 rounded-lg shadow-sm"
              title="Open Discussion"
            >
              <PanelRightOpen size={20} />
            </button>
          )}

          <div className="max-w-4xl mx-auto px-6 py-10 lg:px-12">
            {/* Club Hero */}
            <div className="bg-white dark:bg-neutral-900 p-8 sm:p-10 mb-10 relative overflow-hidden group border border-neutral-200 dark:border-neutral-800 rounded-2xl shadow-sm transition-colors duration-300">
              <h1 className="text-4xl sm:text-5xl font-serif font-bold mb-4 text-neutral-900 dark:text-white">
                {club.name}
              </h1>
              <p className="text-neutral-600 dark:text-neutral-400 text-lg leading-relaxed max-w-2xl font-medium">
                {club.description}
              </p>
            </div>

            {/* Book of the Month */}
            <section className="mb-10">
              <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 p-8 rounded-2xl shadow-sm transition-all duration-300">
                <div className="flex items-center gap-3 mb-8">
                  <div className="p-3 bg-neutral-100 dark:bg-neutral-800 text-dark-green dark:text-light-green rounded-lg">
                    <Book size={28} />
                  </div>
                  <h2 className="text-3xl font-serif font-bold text-neutral-900 dark:text-white">
                    Reading Now
                  </h2>
                </div>

                {club.bookOfTheMonth ? (
                  <div className="flex flex-col md:flex-row gap-8 items-start">
                    {/* Book Cover with 3D effect */}
                    <div className="relative group mx-auto md:mx-0 shrink-0 perspective-1000">
                      <div className="absolute inset-0 bg-neutral-900/20 dark:bg-neutral-100/20 translate-y-4 translate-x-4 blur-md rounded-lg"></div>
                      <img
                        src={
                          club.bookOfTheMonth.volumeInfo.imageLinks?.thumbnail
                        }
                        alt={club.bookOfTheMonth.volumeInfo.title}
                        className="w-48 h-72 object-cover relative z-10 transform group-hover:-rotate-y-6 transition-transform duration-500 rounded-lg shadow-lg"
                      />
                    </div>

                    <div className="flex-1 space-y-4 pt-2">
                      <h3 className="text-3xl font-bold text-neutral-900 dark:text-white leading-tight">
                        {club.bookOfTheMonth.volumeInfo.title}
                      </h3>
                      <p className="text-xl text-dark-green dark:text-light-green font-medium font-serif italic">
                        by {club.bookOfTheMonth.volumeInfo.authors?.join(", ")}
                      </p>
                      <div className="w-16 h-1 bg-dark-green dark:bg-light-green my-4"></div>
                      <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed text-lg">
                        {club.bookOfTheMonth.volumeInfo.description}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-neutral-400 dark:text-neutral-500 border-2 border-dashed border-neutral-200 dark:border-neutral-800 rounded-lg">
                    <Book size={40} className="mb-3 opacity-50" />
                    <p className="text-lg">No book selected for this month.</p>
                  </div>
                )}
              </div>
            </section>

            {/* Meetup Schedule */}
            <section className="mb-10">
              <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 p-8 rounded-2xl shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 bg-neutral-100 dark:bg-neutral-800 text-dark-green dark:text-light-green rounded-lg">
                    <Calendar size={28} />
                  </div>
                  <h2 className="text-3xl font-serif font-bold text-neutral-900 dark:text-white">
                    Next Meetup
                  </h2>
                </div>

                {club.meetUp ? (
                  <div className="bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 p-6 flex items-start gap-4 rounded-lg">
                    <div className="h-full w-1 bg-dark-green dark:bg-light-green rounded-full"></div>
                    <div>
                      <p className="text-neutral-900 dark:text-white text-lg font-medium">
                        {club.meetUp}
                      </p>
                      <p className="text-neutral-500 dark:text-neutral-400 text-sm mt-1">
                        Don't forget to bring your notes!
                      </p>
                    </div>
                  </div>
                ) : (
                  <p className="italic text-neutral-400 dark:text-neutral-500 pl-4 border-l-4 border-neutral-200 dark:border-neutral-800">
                    No meetup scheduled yet.
                  </p>
                )}
              </div>
            </section>
            {user && (
              <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 overflow-hidden mb-6 rounded-2xl shadow-sm">
                <button
                  onClick={() => setIsChatOpen(!isChatOpen)}
                  className="w-full p-6 flex items-center justify-between hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors duration-200"
                >
                  <h2 className="text-2xl sm:text-3xl font-serif font-bold text-neutral-900 dark:text-white flex items-center">
                    <MessageCircle
                      className="mr-3 text-dark-green dark:text-light-green"
                      size={28}
                    />
                    Chat Room
                  </h2>
                  {isChatOpen ? (
                    <ChevronUp
                      className="text-dark-green dark:text-light-green"
                      size={28}
                    />
                  ) : (
                    <ChevronDown
                      className="text-dark-green dark:text-light-green"
                      size={28}
                    />
                  )}
                </button>
                {isChatOpen && (
                  <div className="p-6 pt-0 animate-in slide-in-from-top-2 duration-300">
                    <BookClubChat clubId={club.id} user={user} />
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default BookClubDetails;
