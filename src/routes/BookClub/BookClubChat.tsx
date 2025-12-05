import { IMessage } from "@/types/IMessage";
import { useEffect, useRef, useState } from "react";
import { bookClubRepo } from "./bookClubRepo";
import { Send } from "lucide-react";
import { IUser } from "@/types/IUser";

const BookClubChat: React.FC<{ clubId: string; user: IUser }> = ({
  clubId,
  user,
}) => {
  const [messages, setMessages] = useState<IMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { displayName } = user;

  useEffect(() => {
    // Subscribe to messages
    const unsubscribe = bookClubRepo.getMessages(clubId, (updatedMessages) => {
      setMessages(updatedMessages);
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, [clubId]);

  useEffect(() => {
    // Scroll to bottom when new messages arrive
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const message: IMessage = {
      content: newMessage.trim(),
      sender: displayName || "Anonymous",
    };

    // Check if user is member of the club
    const isMember = await bookClubRepo.checkMembership(clubId, user.uid);
    if (!isMember) {
      alert("You must be a member to send messages");
      return;
    }

    await bookClubRepo.sendMessage(clubId, message);
    setNewMessage("");
  };

  return (
    <div className="space-y-4">
      {/* Messages Container */}
      <div className="h-96 overflow-y-auto rounded-xl border border-amber-200/50 dark:border-slate-600/50 bg-gradient-to-br from-amber-50/30 to-orange-50/30 dark:from-slate-900/30 dark:to-slate-800/30 p-4 space-y-3 scrollbar-thin scrollbar-thumb-amber-300 dark:scrollbar-thumb-slate-600 scrollbar-track-transparent">
        {messages.length === 0 ? (
          <p className="text-center text-slate-400 dark:text-slate-500 italic py-8">
            No messages yet. Start the conversation!
          </p>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${
                message.sender === displayName ? "justify-end" : "justify-start"
              } animate-in slide-in-from-bottom-2 duration-300`}
            >
              <div
                className={`max-w-[75%] sm:max-w-[65%] p-3 rounded-2xl shadow-md ${
                  message.sender === displayName
                    ? "bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-br-sm"
                    : "bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 rounded-bl-sm"
                }`}
              >
                <p
                  className={`text-xs font-semibold mb-1 ${
                    message.sender === displayName
                      ? "text-white/90"
                      : "text-amber-600 dark:text-amber-400"
                  }`}
                >
                  {message.sender}
                </p>
                <p className="break-words leading-relaxed">{message.content}</p>
                <p
                  className={`text-xs mt-1 ${
                    message.sender === displayName
                      ? "text-white/70"
                      : "text-slate-400 dark:text-slate-500"
                  }`}
                >
                  {message.timestamp?.toDate().toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <form onSubmit={handleSendMessage} className="flex gap-2 sm:gap-3">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type your message..."
          className="flex-1 p-3 sm:p-4 border border-amber-200 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500 dark:focus:ring-amber-600 focus:border-transparent transition-all duration-200"
        />
        <button
          type="submit"
          disabled={!newMessage.trim()}
          className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 disabled:from-slate-300 disabled:to-slate-400 dark:disabled:from-slate-600 dark:disabled:to-slate-700 text-white px-4 sm:px-6 py-3 sm:py-4 rounded-xl font-medium transition-all duration-200 shadow-lg hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-50 flex items-center gap-2"
        >
          <span className="hidden sm:inline">Send</span>
          <Send size={18} />
        </button>
      </form>
    </div>
  );
};

export default BookClubChat;
