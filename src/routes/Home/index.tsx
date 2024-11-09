import React, { useEffect, useState } from "react";
import { Loader, User } from "lucide-react";

import { useAuthContext } from "../../contexts/AuthContext";
import { IUser } from "../../types/IUser";
import { AiOutlineLoading3Quarters, AiOutlinePlus } from "react-icons/ai";
import Posts from "./posts";
import Clubs from "./clubs";
import { useBookClub } from "@/contexts/BookClubContext";

const Home: React.FC = () => {
  const [users, setUsers] = useState<IUser[]>([]);
  const [following, setFollowing] = useState([] as string[]);
  const [clubs, setClubs] = useState<any>([]);
  const [loading, setLoading] = useState<string | null>(null);
  const [usersLoading, setUsersLoading] = useState<boolean>(true);

  const { fetchUsersOrderedByLastLogin, user, followUser, unfollowUser } =
    useAuthContext();

  const { getBookClubs } = useBookClub();

  useEffect(() => {
    setUsersLoading(true);
    const fetchUsers = async () => {
      try {
        // Call the fetch function with the limit (e.g., 5)
        const fetchedUsers = await fetchUsersOrderedByLastLogin(5);
        const fetchedBookClubs = await getBookClubs();
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
    <div className="flex flex-col lg:flex-row min-h-screen bg-amber-50">
      {/* Left column - Authors list */}
      {usersLoading ? (
        <Loader className="m-auto" size={48} />
      ) : (
        <div className="w-full lg:w-1/4 bg-amber-50 p-4 overflow-y-auto">
          <h2 className="text-2xl font-serif font-bold mb-4 text-amber-900">
            Authors
          </h2>
          <ul>
            {users.map((author) => {
              const isFollowing = following.includes(author.uid);
              const isLoading = loading === author.uid;

              return (
                <li
                  key={author.uid}
                  className="flex items-center justify-between mb-2 p-2"
                >
                  <div className="flex items-center">
                    <User className="mr-2 text-amber-700" />
                    <span className="font-serif text-amber-800">
                      {author.username}
                    </span>
                  </div>
                  {author.uid !== user?.uid && (
                    <button
                      onClick={() =>
                        isFollowing
                          ? handleUnfollow(author.uid)
                          : handleFollow(author.uid)
                      }
                      className={`flex items-center ${
                        isFollowing
                          ? "text-red-700 bg-red-100 hover:bg-red-200"
                          : "text-amber-700 bg-amber-100 hover:bg-amber-200"
                      } rounded p-2 transition duration-300`}
                      aria-label={`${isFollowing ? "Unfollow" : "Follow"} ${
                        author.username
                      }`}
                      disabled={isLoading} // Disable the button while loading
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
