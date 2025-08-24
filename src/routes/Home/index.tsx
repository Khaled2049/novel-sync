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
    <div className="flex flex-col lg:flex-row min-h-screen py-24  dark:bg-black">
      {usersLoading ? (
        <Loader
          className="m-auto text-dark-green dark:text-light-green"
          size={48}
        />
      ) : (
        <div className="w-full lg:w-1/4 p-4 overflow-y-auto border-r border-black dark:border-white">
          <h2 className="text-xl sm:text-2xl font-serif font-bold mb-4 text-left text-black dark:text-white">
            Authors
          </h2>

          {showSignIn && (
            <button className="w-full sm:w-auto bg-dark-green dark:bg-light-green hover:bg-light-green dark:hover:bg-dark-green text-white py-2 px-4 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-dark-green dark:focus:ring-light-green focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-black transition-colors duration-200 text-sm sm:text-base mb-4 sm:mb-0">
              <Link
                to="/sign-in"
                className="flex justify-center sm:justify-start items-center text-white"
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
                  className="flex items-center justify-between mb-4 sm:mb-2 p-2 border-b border-black dark:border-white last:border-b-0 hover:bg-light-green/10 dark:hover:bg-dark-green/10 transition-colors duration-200"
                >
                  {/* Left-aligned username */}
                  <div className="flex items-center">
                    <User className="mr-2 text-dark-green dark:text-light-green" />
                    <span className="font-serif text-sm sm:text-base text-black dark:text-white">
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
                      className={`flex items-center justify-center text-sm sm:text-base rounded p-2 transition duration-300 ${
                        isFollowing
                          ? "text-white bg-black dark: dark:text-black hover:bg-dark-green dark:hover:bg-light-green border border-black dark:border-white"
                          : "text-white bg-dark-green dark:bg-light-green hover:bg-light-green dark:hover:bg-dark-green border border-dark-green dark:border-light-green"
                      }`}
                      aria-label={`${isFollowing ? "Unfollow" : "Follow"} ${
                        author.username
                      }`}
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <AiOutlineLoading3Quarters className="animate-spin text-lg text-current" />
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

      {clubs ? (
        <Clubs bookClubs={clubs} />
      ) : (
        <div className="text-black dark:text-white">loading...</div>
      )}
    </div>
  );
};

export default Home;
