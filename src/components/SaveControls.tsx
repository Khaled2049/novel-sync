import React from "react";
import { BookPlus, Upload } from "lucide-react";

interface SaveControlsProps {
  isPublished: boolean;
  saveStatus: string;
  onPublish: () => void;
  onNewChapter: () => void;
}

export const SaveControls: React.FC<SaveControlsProps> = ({
  isPublished,
  saveStatus,
  onPublish,
  onNewChapter,
}) => {
  return (
    <div className="">
      {/* Save Status */}
      <div
        className={`text-sm px-2 py-4 h-2 text-center rounded-md ${
          saveStatus === "Saved"
            ? "text-green-600"
            : saveStatus === "Saving..."
            ? "text-amber-600"
            : saveStatus.includes("Error")
            ? "text-red-600"
            : "text-gray-600"
        }`}
      >
        {saveStatus}
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={onPublish}
          className={`p-3 flex items-center justify-center rounded-lg shadow-sm transition-colors ${
            isPublished
              ? "bg-red-500 text-white hover:bg-red-600"
              : "bg-green-500 text-white hover:bg-green-600"
          }`}
        >
          <Upload className="w-5 h-5 mr-2" />
          <span>{isPublished ? "Unpublish" : "Publish"}</span>
        </button>

        <button
          onClick={onNewChapter}
          className="p-3 bg-blue-500 text-white rounded-lg shadow-sm hover:bg-blue-600 transition-colors flex items-center justify-center"
        >
          <BookPlus className="w-5 h-5 mr-2" />
          <span>New Chapter</span>
        </button>
      </div>
    </div>
  );
};
