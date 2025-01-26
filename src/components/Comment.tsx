// Comment.tsx
import React, { useState, useMemo } from "react";
import { Heart, MessageCircle, Edit2, Trash2 } from "lucide-react";
import { Comment as CommentType } from "@/types/IComment";
import { IUser } from "@/types/IUser";

interface CommentProps {
  comment: CommentType;
  allComments: CommentType[];
  currentUser: IUser | null;
  isDarkMode: boolean;
  onLike: (commentId: string) => Promise<void>;
  onReply: (parentId: string, message: string) => Promise<void>;
  onDelete: (commentId: string) => Promise<void>;
  onEdit: (commentId: string, newMessage: string) => Promise<void>;
  depth: number;
}

const MAX_DEPTH = 3;

export const Comment: React.FC<CommentProps> = React.memo(
  ({
    comment,
    allComments,
    currentUser,
    isDarkMode,
    onLike,
    onReply,
    onDelete,
    onEdit,
    depth,
  }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editedMessage, setEditedMessage] = useState(comment.message);
    const [isReplying, setIsReplying] = useState(false);
    const [replyMessage, setReplyMessage] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const replies = useMemo(
      () => allComments.filter((c) => c.parentId === comment.id),
      [allComments, comment.id]
    );

    // const isLiked = useMemo(
    //   () =>
    //     currentUser?.uid
    //       ? comment.likes
    //           .map((like) => like.commentId)
    //           .includes(currentUser.uid)
    //       : false,
    //   [comment.likes, currentUser]
    // );

    const handleEdit = async () => {
      if (editedMessage.trim() === "") return;
      setIsLoading(true);
      try {
        await onEdit(comment.id, editedMessage);
        setIsEditing(false);
        setError(null);
      } catch (err) {
        setError("Failed to update comment");
      } finally {
        setIsLoading(false);
      }
    };

    const handleReply = async () => {
      if (replyMessage.trim() === "") return;
      setIsLoading(true);
      try {
        await onReply(comment.id, replyMessage);
        setReplyMessage("");
        setIsReplying(false);
        setError(null);
      } catch (err) {
        setError("Failed to post reply");
      } finally {
        setIsLoading(false);
      }
    };

    return (
      <div
        className={`ml-${
          depth > 0 ? depth * 2 : 0
        } mt-2 pl-4 border-l-2 transition-all ${
          isDarkMode ? "border-gray-700" : "border-gray-200"
        }`}
      >
        <div
          className={`p-4 rounded-lg border shadow-md transition-colors ${
            isDarkMode
              ? "bg-gray-800 border-gray-600"
              : "bg-white border-gray-300"
          }`}
        >
          {/* Error Message */}
          {error && <div className="mb-2 text-sm text-red-500">{error}</div>}

          {/* Comment Header */}
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span
                className={`font-medium ${
                  isDarkMode ? "text-gray-200" : "text-gray-900"
                }`}
              >
                {comment?.username}
              </span>
              <span
                className={`text-sm ${
                  isDarkMode ? "text-gray-400" : "text-gray-500"
                }`}
              >
                {new Date(comment.createdAt).toLocaleString()}
              </span>
            </div>
          </div>

          {/* Comment Content */}
          {isEditing ? (
            <div className="mt-2">
              <textarea
                value={editedMessage}
                onChange={(e) => setEditedMessage(e.target.value)}
                className={`w-full p-3 rounded-md border focus:ring-2 focus:ring-amber-500 transition-all ${
                  isDarkMode
                    ? "bg-gray-700 border-gray-600 text-gray-200"
                    : "bg-white border-gray-300"
                }`}
                rows={3}
                disabled={isLoading}
              />
              <div className="flex gap-2 mt-2">
                <button
                  onClick={handleEdit}
                  className="px-4 py-2 text-sm font-medium rounded-md bg-amber-500 text-white hover:bg-amber-600 disabled:opacity-50"
                  disabled={isLoading}
                >
                  {isLoading ? "Saving..." : "Save"}
                </button>
                <button
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 text-sm font-medium rounded-md bg-gray-500 text-white hover:bg-gray-600 disabled:opacity-50"
                  disabled={isLoading}
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <p
              className={`whitespace-pre-wrap text-sm leading-relaxed ${
                isDarkMode ? "text-gray-200" : "text-gray-800"
              }`}
            >
              {comment.message}
            </p>
          )}

          {/* Comment Actions */}
          <div className="flex items-center gap-4 mt-3 text-sm">
            {/* <button
              onClick={() => onLike(comment.id)}
              className={`flex items-center gap-1 text-sm ${
                isLiked
                  ? "text-red-500"
                  : isDarkMode
                  ? "text-gray-400 hover:text-gray-300"
                  : "text-gray-600 hover:text-gray-500"
              }`}
              disabled={isLoading}
            >
              <Heart size={16} fill={isLiked ? "currentColor" : "none"} />
              {comment.likes.length}
            </button> */}

            {depth < MAX_DEPTH && (
              <button
                onClick={() => setIsReplying(!isReplying)}
                className={`flex items-center gap-1 transition-colors ${
                  isDarkMode
                    ? "text-gray-400 hover:text-gray-300"
                    : "text-gray-600 hover:text-gray-500"
                }`}
                disabled={isLoading}
              >
                <MessageCircle size={16} />
                Reply
              </button>
            )}
            {currentUser?.uid === comment.userId && (
              <>
                <button
                  onClick={() => setIsEditing(true)}
                  className={`flex items-center gap-1 transition-colors ${
                    isDarkMode
                      ? "text-gray-400 hover:text-gray-300"
                      : "text-gray-600 hover:text-gray-500"
                  }`}
                  disabled={isLoading}
                >
                  <Edit2 size={16} />
                  Edit
                </button>
                <button
                  onClick={() => onDelete(comment.id)}
                  className={`flex items-center gap-1 transition-colors ${
                    isDarkMode
                      ? "text-gray-400 hover:text-gray-300"
                      : "text-gray-600 hover:text-gray-500"
                  }`}
                  disabled={isLoading}
                >
                  <Trash2 size={16} />
                  Delete
                </button>
              </>
            )}
          </div>

          {/* Reply Form */}
          {isReplying && (
            <div className="mt-4">
              <textarea
                value={replyMessage}
                onChange={(e) => setReplyMessage(e.target.value)}
                placeholder="Write a reply..."
                className={`w-full p-3 rounded-md border focus:ring-2 focus:ring-amber-500 transition-all ${
                  isDarkMode
                    ? "bg-gray-700 border-gray-600 text-gray-200"
                    : "bg-white border-gray-300"
                }`}
                rows={3}
                disabled={isLoading}
              />
              <div className="flex gap-2 mt-2">
                <button
                  onClick={handleReply}
                  className="px-4 py-2 text-sm font-medium rounded-md bg-amber-500 text-white hover:bg-amber-600 disabled:opacity-50"
                  disabled={isLoading}
                >
                  {isLoading ? "Posting..." : "Reply"}
                </button>
                <button
                  onClick={() => setIsReplying(false)}
                  className="px-4 py-2 text-sm font-medium rounded-md bg-gray-500 text-white hover:bg-gray-600 disabled:opacity-50"
                  disabled={isLoading}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Nested Replies */}
        {replies.length > 0 && (
          <div className="mt-2">
            {replies.map((reply) => (
              <Comment
                key={reply.id}
                comment={reply}
                allComments={allComments}
                currentUser={currentUser}
                isDarkMode={isDarkMode}
                onLike={onLike}
                onReply={onReply}
                onDelete={onDelete}
                onEdit={onEdit}
                depth={depth + 1}
              />
            ))}
          </div>
        )}
      </div>
    );
  }
);
