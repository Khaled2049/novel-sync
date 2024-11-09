import { useState } from "react";

import { useAuthContext } from "../../contexts/AuthContext";

import { BookOpen, Edit, ImageIcon, PenTool, User } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { Textarea } from "@/components/ui/textarea";

const UserProfile = () => {
  const { user } = useAuthContext();

  const [isEditing, setIsEditing] = useState(false);

  interface UserProfile {
    id: string;
    name: string;
    bio: string;
    occupation: string;
    location: string;
    stories: any[];
  }

  const profile: UserProfile = {
    id: user?.uid || "",
    name: user?.displayName || "",
    bio: "Passionate storyteller and creative writer. I love crafting compelling narratives that transport readers to different worlds.",
    occupation: "Writer & Novelist",
    location: "London, UK",
    stories: [], // Your existing stories array would go here
  };

  const [messages, setMessages] = useState<{ text: string; id: Date }[]>([]);
  const [newMessage, setNewMessage] = useState("");

  const handlePostMessage = () => {
    if (newMessage.trim() !== "") {
      setMessages([...messages, { text: newMessage, id: new Date() }]);
      setNewMessage("");
    }
  };

  return (
    <div className="mx-auto p-6 bg-amber-50 min-h-screen">
      <div className="h-48 bg-gradient-to-r from-amber-100 to-amber-200 relative">
        <button className="absolute bottom-4 right-4 bg-white p-2 rounded-full shadow-sm hover:bg-gray-50">
          <ImageIcon className="w-5 h-5 text-gray-600" />
        </button>
      </div>

      {/* Profile Section */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative -mt-24">
          <div className="flex items-end">
            {/* Profile Picture */}
            <div className="relative">
              <div className="h-40 w-40 rounded-full border-4 border-white bg-gray-200 flex items-center justify-center">
                <User className="h-20 w-20 text-gray-400" />
              </div>
              <button className="absolute bottom-2 right-2 bg-white p-2 rounded-full shadow-sm hover:bg-gray-50">
                <ImageIcon className="w-4 h-4 text-gray-600" />
              </button>
            </div>

            {/* Name and Basic Info */}
            <div className="ml-6 pb-4">
              <h1 className="text-3xl font-bold text-gray-900">
                {profile.name}
              </h1>
              <p className="text-gray-600">
                {profile.occupation} • {profile.location}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-center items-center">
        <div className="grid grid-cols-2 gap-6 mt-6">
          {/* Left Column - About */}
          <div className="col-span-1">
            <Card>
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
                  <Textarea
                    defaultValue={profile.bio}
                    className="w-full"
                    rows={4}
                  />
                ) : (
                  <p className="text-gray-600">{profile.bio}</p>
                )}
              </CardContent>
            </Card>

            {/* Stats Card */}
            <Card className="mt-6">
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div className="flex items-center">
                    <BookOpen className="w-5 h-5 text-amber-600 mr-2" />
                    <span className="text-gray-600">
                      Published Stories:{" "}
                      {profile.stories.filter((s) => s.isPublished).length}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <PenTool className="w-5 h-5 text-amber-600 mr-2" />
                    <span className="text-gray-600">
                      Drafts:{" "}
                      {profile.stories.filter((s) => !s.isPublished).length}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="col-span-1">
            <div className="bg-white shadow p-6 rounded-lg">
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
                className="bg-amber-600 text-white py-2 px-4 rounded "
                disabled={true} // Disable the button for now
              >
                Post
              </button>

              {/* Display Messages */}
              <div className="mt-6 space-y-4">
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
      </div>
    </div>
  );
};

export default UserProfile;
