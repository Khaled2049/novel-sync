import { useState, useEffect } from "react";

import { useAuthContext } from "../../contexts/AuthContext";

import { BookOpen, Edit, Loader, PenTool } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { storiesRepo } from "@/components/StoriesRepo";
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
    console.log(editedText);
    if (!user) return;
    await updateBio(user?.uid, editedText);

    setIsEditing(false); // Exit editing mode
  };

  return (
    <div className="bg-amber-50 min-h-screen p-4">
      {/* Profile Section */}
      <div className="max-w-xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">{profile.name}</h1>
        </div>

        {/* About Section */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex justify-between items-center">
              <span>About</span>
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="text-gray-400 hover:text-gray-600"
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
                  className="w-full"
                  rows={4}
                />
                <Button onClick={handleSave} className="mt-2">
                  Save
                </Button>
              </>
            ) : (
              <p className="text-gray-600">{profile.bio}</p>
            )}
          </CardContent>
        </Card>

        {/* Stats Section */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex justify-between items-center">
              <span>Stats</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <BookOpen className="w-5 h-5 text-amber-600 mr-2" />
              {loading ? (
                <Loader className="w-5 h-5 text-amber-600" />
              ) : (
                <span className="text-gray-600">
                  Published Stories: {stories.length}
                </span>
              )}
            </div>
            <div className="flex items-center">
              <PenTool className="w-5 h-5 text-amber-600 mr-2" />
              {loading ? (
                <Loader className="w-5 h-5 text-amber-600" />
              ) : (
                <span className="text-gray-600">
                  Drafts: {stories.filter((s) => !s.isPublished).length}
                </span>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Message Wall Section */}
        <div className="bg-white shadow p-4 rounded-lg mb-6">
          <h2 className="text-lg font-bold mb-4">Message Wall</h2>
          <Textarea
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Write something..."
            className="w-full mb-4"
            rows={3}
          />
          <button
            onClick={handlePostMessage}
            className="bg-amber-600 text-white py-2 px-4 rounded"
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
                  className="p-4 bg-amber-50 rounded-lg shadow"
                >
                  <p className="text-gray-700">{message.text}</p>
                </div>
              ))
            ) : (
              <p className="text-gray-500">
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
