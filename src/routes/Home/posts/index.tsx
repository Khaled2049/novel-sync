import React, { useEffect, useState } from "react";
import { User, Send, BookOpen } from "lucide-react";
import { IPost } from "@/types/IPost";
import { postsService } from "@/components/posts/PostService";
import { useAuthContext } from "@/contexts/AuthContext";
import { v4 as uuidv4 } from "uuid";

const Posts = () => {
  const [post, setPost] = useState("");
  const [followingPosts, setFollowingPosts] = useState<IPost[]>([]);
  const [allPosts, setAllPosts] = useState<IPost[]>([]);

  const [isMyFeed, setIsMyFeed] = useState(true);

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
    if (!user) return;

    const p: IPost = {
      id: uuidv4(),
      authorName: user.displayName || "",
      content: post,
      createdAt: new Date(),
    };
    await postsService.addPost(user.uid, p);
    setPost("");
    loadPosts();
  };

  return (
    <div className="w-full lg:w-1/2 bg-amber-50 p-4 overflow-y-auto  border-amber-200">
      <form onSubmit={handlePostSubmit} className="mb-6">
        <div className="flex items-center bg-amber-50 rounded-lg p-2 border border-amber-200">
          <input
            type="text"
            value={post}
            onChange={(e) => setPost(e.target.value)}
            placeholder="Share your thoughts..."
            className="flex-grow bg-transparent outline-none font-serif text-amber-900 p-3"
          />
          <button
            type="submit"
            className="ml-2 text-amber-700 hover:text-amber-900"
          >
            <Send size={20} />
          </button>
        </div>
      </form>

      <div className="flex justify-between mb-4">
        <button
          onClick={() => setIsMyFeed(true)}
          className={`w-full py-2 px-4 text-center font-serif font-bold ${
            isMyFeed ? "bg-amber-600 text-white" : "bg-amber-200 text-amber-900"
          }`}
        >
          My Feed
        </button>
        <button
          onClick={() => setIsMyFeed(false)}
          className={`w-full py-2 px-4 text-center font-serif font-bold ${
            !isMyFeed
              ? "bg-amber-600 text-white"
              : "bg-amber-200 text-amber-900"
          }`}
        >
          Discover
        </button>
      </div>

      {/* All Posts */}

      {isMyFeed
        ? followingPosts.map((post, index) => (
            <div
              key={index}
              className="bg-amber-50 shadow rounded-lg p-4 mb-4 border border-amber-200"
            >
              <div className="flex items-center mb-2 justify-between">
                <div className="flex items-center">
                  <User className="mr-2 text-amber-700" />
                  <span className="font-serif font-bold text-amber-900">
                    {post.authorName}
                  </span>
                </div>
                <span className="text-amber-600 text-sm">
                  Post #{index + 1}
                </span>
              </div>
              <p className="mb-2 font-serif text-amber-800">{post.content}</p>
              <div className="flex items-center text-amber-600">
                <BookOpen size={16} className="mr-1" />
                <span>100 likes</span>
              </div>
            </div>
          ))
        : allPosts.map((post, index) => (
            <div
              key={index}
              className="bg-amber-50 shadow rounded-lg p-4 mb-4 border border-amber-200"
            >
              <div className="flex items-center mb-2 justify-between">
                <div className="flex items-center">
                  <User className="mr-2 text-amber-700" />
                  <span className="font-serif font-bold text-amber-900">
                    {post.authorName}
                  </span>
                </div>
                <span className="text-amber-600 text-sm">
                  Post #{index + 1}
                </span>
              </div>
              <p className="mb-2 font-serif text-amber-800">{post.content}</p>
              <div className="flex items-center text-amber-600">
                <BookOpen size={16} className="mr-1" />
                <span>100 likes</span>
              </div>
            </div>
          ))}
    </div>
  );
};

export default Posts;
