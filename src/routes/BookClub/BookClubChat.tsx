import { IMessage } from "@/types/IMessage";
import { useEffect, useRef, useState } from "react";
import { bookClubRepo } from "./bookClubRepo";
import { MessageCircle } from "lucide-react";

const BookClubChat: React.FC<{ clubId: string; userName: string }> = ({
  clubId,
  userName,
}) => {
  const [messages, setMessages] = useState<IMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

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
      sender: userName,
    };

    await bookClubRepo.sendMessage(clubId, message);
    setNewMessage("");
  };

  return (
    <div className="bg-white shadow-lg rounded-lg p-6 mb-6">
      <h2 className="text-2xl font-serif font-bold mb-4 text-amber-800 flex items-center">
        <MessageCircle className="mr-2" /> Chat Room
      </h2>

      {/* Messages Container */}
      <div className="h-96 overflow-y-auto mb-4 border border-amber-200 rounded-lg p-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`mb-2 ${
              message.sender === userName ? "text-right" : "text-left"
            }`}
          >
            <div
              className={`inline-block p-3 rounded-lg ${
                message.sender === userName
                  ? "bg-amber-100 text-amber-800"
                  : "bg-gray-100 text-gray-800"
              }`}
            >
              <p className="text-sm font-semibold">{message.sender}</p>
              <p>{message.content}</p>
              <p className="text-xs text-gray-500">
                {message.timestamp?.toDate().toLocaleTimeString()}
              </p>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <form onSubmit={handleSendMessage} className="flex gap-2">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type your message..."
          className="flex-1 p-2 border border-amber-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
        />
        <button
          type="submit"
          className="bg-amber-600 text-white px-4 py-2 rounded-lg hover:bg-amber-700 transition-colors"
        >
          Send
        </button>
      </form>
    </div>
  );
};

export default BookClubChat;
