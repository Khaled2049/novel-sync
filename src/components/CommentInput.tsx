import { CommentService } from "@/services/CommentService";
import { IUser } from "@/types/IUser";
import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Send } from "lucide-react";

interface CommentInputProps {
  storyId: string;
  chapterId: string;
  currentUser: IUser;
}

export const CommentInput: React.FC<CommentInputProps> = ({
  storyId,
  chapterId,
  currentUser,
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
    <form onSubmit={handleSubmit} className="mb-6 p-4 bg-opacity-50 w-full ">
      <Textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder={
          currentUser ? "Add a comment..." : "Please login to comment"
        }
        disabled={!currentUser}
        className={`w-full p-3 rounded-lg border transition-all duration-200 resize-none
          bg-gray-900 border-gray-700 text-gray-200
          focus:outline-none focus:ring-2
        `}
        rows={3}
      />
      {currentUser && (
        <Button
          type="submit"
          disabled={!message.trim()}
          className={`mt-3 w-full py-2 text-lg font-medium flex items-center justify-center gap-2 transition-all duration-200 
            ${
              !message.trim()
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-gray-700 hover:bg-gray-600"
            }`}
        >
          <Send className="w-5 h-5" /> Post Comment
        </Button>
      )}
    </form>
  );
};
