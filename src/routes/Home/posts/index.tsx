import React, { useEffect, useState } from "react";
import { User, Send, BookOpen } from "lucide-react";
import { IPost } from "@/types/IPost";
import { postsService } from "@/services/PostService";
import { useAuthContext } from "@/contexts/AuthContext";
import { v4 as uuidv4 } from "uuid";

const Posts = () => {
  const [post, setPost] = useState("");
  const [followingPosts, setFollowingPosts] = useState<IPost[]>([]);
  const [allPosts, setAllPosts] = useState<IPost[]>([]);
  const maxCharacters = 280;
  const [isMyFeed, setIsMyFeed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const { user } = useAuthContext();
  useEffect(() => {
    loadPosts();
    getFollowedPosts();
  }, [user]);

  const loadPosts = async () => {
    if (!user) return;
    const posts = await postsService.getAllPosts();

    setAllPosts(posts);
  };

  const getFollowedPosts = async () => {
    if (!user) return;
    const posts = await postsService.getFollowingPosts(user.uid);

    setFollowingPosts(posts);
  };

  const handlePostSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    if (!user) return;

    const p: IPost = {
      id: uuidv4(),
      authorName: user.displayName || "",
      content: post,
      createdAt: new Date(),
    };
    const res = await postsService.addPost(user.uid, p);
    if (res === "TOXIC") {
      setErrorMessage("Take that negativity and go away.");
      setLoading(false);
      setPost("");
      return;
    }
    setPost("");
    loadPosts();
    setLoading(false);
  };

  return (
    <div className="w-full lg:w-1/2  p-4 overflow-y-auto  ">
      <form onSubmit={handlePostSubmit} className="mb-6">
        <div className="flex items-center  rounded-lg p-2 border ">
          <input
            type="text"
            value={post}
            onChange={(e) => setPost(e.target.value)}
            placeholder="Share your thoughts..."
            maxLength={maxCharacters}
            className="flex-grow bg-transparent outline-none font-serif  p-3"
          />
          <button
            type="submit"
            className="ml-2  hover:"
            disabled={post.length === 0}
          >
            {loading ? <span>Posting...</span> : <Send size={20} />}
          </button>
        </div>

        {errorMessage && (
          <div className="text-red-500 mt-2 text-sm">{errorMessage}</div>
        )}

        <div className="text-right mt-2 text-sm ">
          {maxCharacters - post.length} characters left
        </div>
      </form>

      <div className="flex justify-between mb-4">
        <button
          onClick={() => setIsMyFeed(true)}
          className={`w-full py-2 px-4 text-center font-serif font-bold ${
            isMyFeed ? " text-white" : " "
          }`}
        >
          My Feed
        </button>
        <button
          onClick={() => setIsMyFeed(false)}
          className={`w-full py-2 px-4 text-center font-serif font-bold ${
            !isMyFeed ? " text-white" : " "
          }`}
        >
          Discover
        </button>
      </div>

      {/* All Posts */}

      {isMyFeed
        ? followingPosts.map((post, index) => (
            <div key={index} className=" shadow rounded-lg p-4 mb-4 border ">
              <div className="flex items-center mb-2 justify-between">
                <div className="flex items-center">
                  <User className="mr-2 " />
                  <span className="font-serif font-bold ">
                    {post.authorName}
                  </span>
                </div>
                <span className=" text-sm">Post #{index + 1}</span>
              </div>
              <p className="mb-2 font-serif ">{post.content}</p>
              <div className="flex items-center ">
                <BookOpen size={16} className="mr-1" />
                <span>100 likes</span>
              </div>
            </div>
          ))
        : allPosts.map((post, index) => (
            <div key={index} className=" shadow rounded-lg p-4 mb-4 border ">
              <div className="flex items-center mb-2 justify-between">
                <div className="flex items-center">
                  <User className="mr-2 " />
                  <span className="font-serif font-bold ">
                    {post.authorName}
                  </span>
                </div>
                <span className=" text-sm">Post #{index + 1}</span>
              </div>
              <p className="mb-2 font-serif ">{post.content}</p>
              <div className="flex items-center ">
                <BookOpen size={16} className="mr-1" />
                <span>100 likes</span>
              </div>
            </div>
          ))}
    </div>
  );
};

export default Posts;
