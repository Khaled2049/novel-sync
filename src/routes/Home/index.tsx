import React, { useEffect, useState } from "react";
import { Loader, User } from "lucide-react";

import { useAuthContext } from "../../contexts/AuthContext";
import { IUser } from "../../types/IUser";
import { AiOutlineLoading3Quarters, AiOutlinePlus } from "react-icons/ai";
import Posts from "./posts";
import Clubs from "./clubs";

import { Link } from "react-router-dom";
import { bookClubRepo } from "../BookClub/bookClubRepo";

const Home: React.FC = () => {
  const [users, setUsers] = useState<IUser[]>([]);
  const [following, setFollowing] = useState([] as string[]);
  const [clubs, setClubs] = useState<any>([]);
  const [loading, setLoading] = useState<string | null>(null);
  const [usersLoading, setUsersLoading] = useState<boolean>(true);
  const [showSignIn, setShowSignIn] = useState<boolean>(false);

  const { fetchUsersOrderedByLastLogin, user, followUser, unfollowUser } =
    useAuthContext();

  useEffect(() => {
    setUsersLoading(true);
    if (!user?.uid) {
      setUsersLoading(false);
      setShowSignIn(true);
      return;
    }
    setShowSignIn(false);
    const fetchUsers = async () => {
      try {
        // Call the fetch function with the limit (e.g., 5)
        const fetchedUsers = await fetchUsersOrderedByLastLogin(5);
        const fetchedBookClubs = await bookClubRepo.getBookClubs();
        setClubs(fetchedBookClubs);
        setUsers(fetchedUsers); // Set the fetched users to state
        setFollowing(user?.following || []); // Set the following list
        setUsersLoading(false); // Set loading state to false
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };

    // Call the fetch function when the component mounts
    fetchUsers();
  }, [user?.uid]);

  const handleFollow = async (uid: string) => {
    setLoading(uid); // Set loading state
    try {
      await followUser(uid);
      setFollowing([...following, uid]);
      setUsers(
        users.map((author) =>
          author.uid === uid
            ? { ...author, followers: [...author.followers, user?.uid || ""] }
            : author
        )
      );
    } catch (error) {
      console.error("Error following user:", error);
    } finally {
      setLoading(null); // Reset loading state
    }
  };

  const handleUnfollow = async (uid: string) => {
    setLoading(uid); // Set loading state
    try {
      await unfollowUser(uid);
      setFollowing(following.filter((id) => id !== uid));
      setUsers(
        users.map((author) =>
          author.uid === uid
            ? {
                ...author,
                followers: author.followers.filter(
                  (follower) => follower !== user?.uid
                ),
              }
            : author
        )
      );
    } catch (error) {
      console.error("Error unfollowing user:", error);
    } finally {
      setLoading(null); // Reset loading state
    }
  };

  return (
    <div className="flex flex-col lg:flex-row min-h-screen py-24 bg-amber-50">
      {/* Left column - Authors list */}

      {usersLoading ? (
        <Loader className="m-auto" size={48} />
      ) : (
        <div className="w-full lg:w-1/4 bg-amber-50 p-4 overflow-y-auto">
          <h2 className="text-xl sm:text-2xl font-serif font-bold mb-4 text-amber-900 text-left">
            Authors
          </h2>

          {showSignIn && (
            <button className="w-full sm:w-auto bg-amber-600 text-white py-2 px-4 rounded-md shadow-sm hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 transition-colors duration-200 text-sm sm:text-base mb-4 sm:mb-0">
              <Link
                to="/sign-in"
                className="flex justify-center sm:justify-start items-center"
              >
                Sign in
              </Link>
            </button>
          )}

          <ul>
            {users.map((author) => {
              const isFollowing = following.includes(author.uid);
              const isLoading = loading === author.uid;

              return (
                <li
                  key={author.uid}
                  className="flex items-center justify-between mb-4 sm:mb-2 p-2 border-b last:border-b-0"
                >
                  {/* Left-aligned username */}
                  <div className="flex items-center">
                    <User className="mr-2 text-amber-700" />
                    <span className="font-serif text-sm sm:text-base text-amber-800">
                      {author.username}
                    </span>
                  </div>

                  {/* Right-aligned follow button */}
                  {author.uid !== user?.uid && (
                    <button
                      onClick={() =>
                        isFollowing
                          ? handleUnfollow(author.uid)
                          : handleFollow(author.uid)
                      }
                      className={`flex items-center justify-center text-sm sm:text-base ${
                        isFollowing
                          ? "text-red-700 bg-red-100 hover:bg-red-200"
                          : "text-amber-700 bg-amber-100 hover:bg-amber-200"
                      } rounded p-2 transition duration-300`}
                      aria-label={`${isFollowing ? "Unfollow" : "Follow"} ${
                        author.username
                      }`}
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <AiOutlineLoading3Quarters className="animate-spin text-lg" />
                      ) : isFollowing ? (
                        <>Unfollow</>
                      ) : (
                        <>
                          Follow <AiOutlinePlus className="ml-1 text-lg" />
                        </>
                      )}
                      <span className="sr-only">
                        {isFollowing ? "Unfollow" : "Follow"} {author.username}
                      </span>
                    </button>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      )}

      <Posts />

      {clubs ? <Clubs bookClubs={clubs} /> : "loading..."}
    </div>
  );
};

export default Home;
