import { useState, useMemo } from "react";
import { AITextGenerator } from "./AITextGenerator";
import { Copy } from "lucide-react";
import { useAiUsage } from "@/contexts/AiUsageContext";

interface AIToolsProps {
  text: string;
}

const AITools = ({ text }: AIToolsProps) => {
  const { canUseAI, incrementAiUsage } = useAiUsage();
  const [showToneDropdown, setShowToneDropdown] = useState(false);
  const [showDialogueDropdown, setShowDialogueDropdown] = useState(false);
  const [showThemeDropdown, setShowThemeDropdown] = useState(false);
  const [generatedText, setGeneratedText] = useState("");
  const [error, setError] = useState("");

  const aiGenerator = useMemo(() => {
    const gen = new AITextGenerator(0);
    gen.setIncrementUsageCallback(incrementAiUsage);
    return gen;
  }, [incrementAiUsage]);

  const DropdownButton = ({
    label,
    options,
    showDropdown,
    setShowDropdown,
    onSelect,
    bgColor,
  }: {
    label: string;
    options: string[];
    showDropdown: boolean;
    setShowDropdown: (show: boolean) => void;
    onSelect: (option: string) => void;
    bgColor: string;
  }) => (
    <div className="relative">
      <button
        className={`px-3 py-1 m-1 text-sm font-medium text-white ${bgColor} rounded-md hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-opacity-50`}
        onClick={() => setShowDropdown(!showDropdown)}
      >
        {label}
      </button>
      {showDropdown && (
        <div className="absolute z-10 mt-1 w-40  rounded-md shadow-lg">
          {options.map((option) => (
            <button
              key={option}
              className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              onClick={() => {
                onSelect(option);
                setShowDropdown(false);
              }}
            >
              {option}
            </button>
          ))}
        </div>
      )}
    </div>
  );

  const toneOptions = ["Formal", "Casual", "Humorous", "Serious", "Poetic"];
  const dialogueCharacters = [
    "Protagonist",
    "Antagonist",
    "Side Character",
    "Narrator",
  ];
  const themeOptions = ["Love", "Betrayal", "Redemption", "Growth", "Loss"];

  const handleToneSelection = async (option: string) => {
    if (!canUseAI()) {
      setError("Daily AI usage limit reached. Please try again tomorrow.");
      return;
    }
    setError("");
    try {
      const res = await aiGenerator.adjustToneAndStyle(text, option);
      setGeneratedText(res);
    } catch (error) {
      setError("Failed to generate text. Please try again.");
      console.error("Error:", error);
    }
  };

  const handlEnhanceDialogue = async (character: string) => {
    if (!canUseAI()) {
      setError("Daily AI usage limit reached. Please try again tomorrow.");
      return;
    }
    setError("");
    try {
      const res = await aiGenerator.enhanceCharacterDialogue(text, character);
      setGeneratedText(res);
    } catch (error) {
      setError("Failed to generate text. Please try again.");
      console.error("Error:", error);
    }
  };

  const handleThemeSelection = async (option: string) => {
    if (!canUseAI()) {
      setError("Daily AI usage limit reached. Please try again tomorrow.");
      return;
    }
    setError("");
    try {
      const res = await aiGenerator.exploreTheme(text, option);
      setGeneratedText(res);
    } catch (error) {
      setError("Failed to generate text. Please try again.");
      console.error("Error:", error);
    }
  };

  const copyGeneratedText = () => {
    navigator.clipboard.writeText(generatedText);
  };
  return (
    <div className="p-2 my-3 shadow-lg rounded-md ">
      <div className="font-semibold p-2 focus:outline-none">
        Selected Text: {text}
      </div>
      <div className="flex justify-center px-3 rounded-lg">
        <DropdownButton
          label="Tone"
          options={toneOptions}
          showDropdown={showToneDropdown}
          setShowDropdown={setShowToneDropdown}
          onSelect={(option) => handleToneSelection(option)}
          bgColor={canUseAI() ? "" : "opacity-50"}
        />
        <DropdownButton
          label="Dialogue"
          options={dialogueCharacters}
          showDropdown={showDialogueDropdown}
          setShowDropdown={setShowDialogueDropdown}
          onSelect={(option) => handlEnhanceDialogue(option)}
          bgColor={canUseAI() ? "" : "opacity-50"}
        />
        <DropdownButton
          label="Theme"
          options={themeOptions}
          showDropdown={showThemeDropdown}
          setShowDropdown={setShowThemeDropdown}
          onSelect={(option) => handleThemeSelection(option)}
          bgColor={canUseAI() ? "" : "opacity-50"}
        />
      </div>
      {error && (
        <div className="mt-3 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
          <p className="text-xs text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}
      {generatedText && (
        <div className="mt-4">
          <h2 className="text-lg font-semibold mb-2">Generated Text</h2>
          <div className="relative">
            <textarea
              className="w-full h-32 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={generatedText}
              readOnly
            />
          </div>
          <button
            className="w-full py-2 px-3 0 text-white rounded-full flex items-center justify-center hover: transition duration-300"
            onClick={copyGeneratedText}
          >
            Copy <Copy size={16} />
          </button>
        </div>
      )}
    </div>
  );
};

export default AITools;
