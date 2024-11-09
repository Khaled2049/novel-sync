import { useState } from "react";
import { AITextGenerator } from "./AITextGenerator";
import { Copy } from "lucide-react";

interface AIToolsProps {
  text: string;
}

const AITools = ({ text }: AIToolsProps) => {
  const [showToneDropdown, setShowToneDropdown] = useState(false);
  const [showDialogueDropdown, setShowDialogueDropdown] = useState(false);
  const [showThemeDropdown, setShowThemeDropdown] = useState(false);
  const [generatedText, setGeneratedText] = useState("");
  const aiGenerator = new AITextGenerator(0);

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
        <div className="absolute z-10 mt-1 w-40 bg-white rounded-md shadow-lg">
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
    const res = await aiGenerator.adjustToneAndStyle(text, option);
    setGeneratedText(res);
  };

  const handlEnhanceDialogue = async (character: string) => {
    const res = await aiGenerator.enhanceCharacterDialogue(text, character);
    setGeneratedText(res);
  };

  const handleThemeSelection = async (option: string) => {
    const res = await aiGenerator.exploreTheme(text, option);
    setGeneratedText(res);
  };

  const copyGeneratedText = () => {
    navigator.clipboard.writeText(generatedText);
  };
  return (
    <div className="p-2 my-3 shadow-lg rounded-md bg-amber-50">
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
          bgColor="bg-amber-600"
        />
        <DropdownButton
          label="Dialogue"
          options={dialogueCharacters}
          showDropdown={showDialogueDropdown}
          setShowDropdown={setShowDialogueDropdown}
          onSelect={(option) => handlEnhanceDialogue(option)}
          bgColor="bg-amber-600"
        />
        <DropdownButton
          label="Theme"
          options={themeOptions}
          showDropdown={showThemeDropdown}
          setShowDropdown={setShowThemeDropdown}
          onSelect={(option) => handleThemeSelection(option)}
          bgColor="bg-amber-600"
        />
      </div>
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
            className="w-full py-2 px-3 bg-amber-500 text-white rounded-full flex items-center justify-center hover:bg-amber-600 transition duration-300"
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
