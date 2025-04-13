import React from "react";
import { ChevronRight, Sparkles } from "lucide-react";
import AITools from "@/components/AITools";

interface AIToolsPanelProps {
  isVisible: boolean;
  selectedText: string;
  onToggle: () => void;
}

export const AIToolsPanel: React.FC<AIToolsPanelProps> = ({
  isVisible,
  selectedText,
  onToggle,
}) => {
  return (
    <div
      className={`transition-all duration-300 bg-amber-100 mx-2 rounded-lg shadow-md ${
        isVisible ? "w-1/3" : "w-24"
      } flex flex-col`}
    >
      {/* Toggle Header */}
      <div className="p-2 bg-amber-500 text-white rounded-t-lg hover:bg-amber-600 transition-colors">
        <button
          onClick={onToggle}
          className="flex items-center h-12 justify-center w-full"
        >
          {isVisible ? (
            <div className="flex items-center space-x-2">
              <ChevronRight className="w-5 h-5" />
              <span>Hide Tools</span>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <Sparkles className="w-5 h-5" />
              <span className="text-sm">AI</span>
            </div>
          )}
        </button>
      </div>

      {/* AI Tools Content */}
      {isVisible && (
        <div className="p-6 bg-amber-100 flex-1 overflow-y-auto">
          <h2 className="text-2xl font-bold mb-4 text-amber-800">
            AI Writing Assistant
          </h2>

          {selectedText ? (
            <AITools text={selectedText} />
          ) : (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <Sparkles className="w-12 h-12 text-amber-400 mb-4" />
              <p className="text-amber-700 mb-2">
                Select text in the editor to use AI tools
              </p>
              <p className="text-amber-600 text-sm">
                Or press <span className="font-bold">TAB</span> to continue your
                writing with AI assistance
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
