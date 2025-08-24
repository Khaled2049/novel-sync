import { useState, useEffect } from "react";

import { useAuthContext } from "../../contexts/AuthContext";

import { BookOpen, Edit, Loader, PenTool } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { storiesRepo } from "@/services/StoriesRepo";
import { StoryMetadata } from "@/types/IStory";

const UserProfile = () => {
  const { user, updateBio } = useAuthContext();

  const [isEditing, setIsEditing] = useState(false);
  const [stories, setStories] = useState<StoryMetadata[]>([]);
  const [loading, setLoading] = useState(true);

  interface UserProfile {
    id: string;
    name: string;
    bio: string;
    occupation: string;
    location: string;
  }

  const profile: UserProfile = {
    id: user?.uid || "",
    name: user?.displayName || "",
    bio: user?.bio || "Write an about me section here...",
    occupation: user?.occupation || "Occupation",
    location: user?.location || "Location",
  };

  const [messages, setMessages] = useState<{ text: string; id: Date }[]>([]);
  const [newMessage, setNewMessage] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      if (user) {
        setLoading(true);

        await loadStories();
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  const handlePostMessage = () => {
    if (newMessage.trim() !== "") {
      setMessages([...messages, { text: newMessage, id: new Date() }]);
      setNewMessage("");
    }
  };

  const loadStories = async () => {
    if (!user) return;
    const storyList = await storiesRepo.getUserStories(user?.uid);
    setStories(storyList);
  };

  const [editedText, setEditedText] = useState(profile.bio);

  const handleSave = async () => {
    if (!user) return;
    await updateBio(user?.uid, editedText);

    setIsEditing(false); // Exit editing mode
  };

  return (
    <div className="min-h-screen p-24 bg-white dark:bg-black text-black dark:text-white transition-colors duration-200">
      {/* Profile Section */}
      <div className="max-w-xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-black dark:text-white">
            {profile.name}
          </h1>
        </div>

        {/* About Section */}
        <Card className="mb-6 border border-black/20 dark:border-white/20 bg-white dark:bg-black shadow">
          <CardHeader>
            <CardTitle className="flex justify-between items-center text-black dark:text-white">
              <span>About</span>
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="text-black/70 dark:text-white/70 hover:text-dark-green dark:hover:text-light-green transition-colors duration-200"
              >
                <Edit className="w-4 h-4" />
              </button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isEditing ? (
              <>
                <Textarea
                  value={editedText}
                  onChange={(e) => setEditedText(e.target.value)}
                  className="w-full bg-white dark:bg-black border border-black/20 dark:border-white/20 text-black dark:text-white focus:ring-dark-green dark:focus:ring-light-green"
                  rows={4}
                />
                <Button
                  onClick={handleSave}
                  className="mt-2 bg-dark-green dark:bg-light-green text-white hover:bg-light-green dark:hover:bg-dark-green transition-colors duration-200 focus:ring-2 focus:ring-dark-green dark:focus:ring-light-green focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-black"
                >
                  Save
                </Button>
              </>
            ) : (
              <p className="text-black/70 dark:text-white/70">{profile.bio}</p>
            )}
          </CardContent>
        </Card>

        {/* Stats Section */}
        <Card className="mb-6 border border-black/20 dark:border-white/20 bg-white dark:bg-black shadow">
          <CardHeader>
            <CardTitle className="flex justify-between items-center text-black dark:text-white">
              <span>Stats</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center text-black/70 dark:text-white/70">
              <BookOpen className="w-5 h-5 text-dark-green dark:text-light-green mr-2" />
              {loading ? (
                <Loader className="w-5 h-5 text-black/70 dark:text-white/70 animate-spin" />
              ) : (
                <span>Published Stories: {stories.length}</span>
              )}
            </div>
            <div className="flex items-center text-black/70 dark:text-white/70">
              <PenTool className="w-5 h-5 text-dark-green dark:text-light-green mr-2" />
              {loading ? (
                <Loader className="w-5 h-5 text-black/70 dark:text-white/70 animate-spin" />
              ) : (
                <span>
                  Drafts: {stories.filter((s) => !s.isPublished).length}
                </span>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Message Wall Section */}
        <div className="shadow p-4 rounded-lg mb-6 border border-black/20 dark:border-white/20 bg-white dark:bg-black">
          <h2 className="text-lg font-bold mb-4 text-black dark:text-white">
            Message Wall
          </h2>
          <Textarea
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Write something..."
            className="w-full mb-4 bg-white dark:bg-black border border-black/20 dark:border-white/20 text-black dark:text-white focus:ring-dark-green dark:focus:ring-light-green"
            rows={3}
          />
          <button
            onClick={handlePostMessage}
            className="bg-dark-green dark:bg-light-green text-white py-2 px-4 rounded transition-colors duration-200 hover:bg-light-green dark:hover:bg-dark-green disabled:bg-black/20 dark:disabled:bg-white/20 disabled:text-black/50 dark:disabled:text-white/50"
            disabled={true} // Disable the button for now
          >
            Post
          </button>

          {/* Display Messages */}
          <div className="mt-4 space-y-4">
            {messages.length > 0 ? (
              messages.map((message) => (
                <div
                  key={String(message.id)}
                  className="p-4 rounded-lg shadow border border-black/20 dark:border-white/20 bg-white dark:bg-black"
                >
                  <p className="text-black/70 dark:text-white/70">
                    {message.text}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-black/50 dark:text-white/50">
                No messages yet. Be the first to post!
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
