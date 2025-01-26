import { CommentService } from "@/services/CommentService";
import { IUser } from "@/types/IUser";
import { useState } from "react";

interface CommentInputProps {
  storyId: string;
  chapterId: string;
  currentUser: IUser;
  isDarkMode: boolean;
}

export const CommentInput: React.FC<CommentInputProps> = ({
  storyId,
  chapterId,
  currentUser,
  isDarkMode,
}) => {
  const [message, setMessage] = useState("");
  const commentService = new CommentService();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !message.trim()) return;

    try {
      await commentService.addComment(
        storyId,
        chapterId,
        currentUser.uid,
        currentUser.username,
        message.trim()
      );
      setMessage("");
    } catch (error) {
      console.error("Error adding comment:", error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mb-6">
      <textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder={
          currentUser ? "Add a comment..." : "Please login to comment"
        }
        disabled={!currentUser}
        className={`w-full p-3 rounded-md border ${
          isDarkMode
            ? "bg-gray-800 border-gray-700 text-gray-200"
            : "bg-white border-gray-300 text-gray-800"
        } focus:outline-none focus:ring-2 focus:ring-amber-500`}
        rows={3}
      />
      {currentUser && (
        <button
          type="submit"
          disabled={!message.trim()}
          className={`mt-2 px-4 py-2 rounded-md ${
            !message.trim()
              ? "bg-gray-300 cursor-not-allowed"
              : isDarkMode
              ? "bg-amber-600 hover:bg-amber-700"
              : "bg-amber-500 hover:bg-amber-600"
          } text-white`}
        >
          Post Comment
        </button>
      )}
    </form>
  );
};
