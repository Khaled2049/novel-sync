import React, { useCallback, useEffect, useRef } from "react";
import { useEditor, EditorContent, BubbleMenu } from "@tiptap/react";
import Document from "@tiptap/extension-document";
import Paragraph from "@tiptap/extension-paragraph";
import Text from "@tiptap/extension-text";
import Bold from "@tiptap/extension-bold";
import Underline from "@tiptap/extension-underline";
import Italic from "@tiptap/extension-italic";
import Image from "@tiptap/extension-image";
import CharacterCount from "@tiptap/extension-character-count";
import Heading from "@tiptap/extension-heading";
import History from "@tiptap/extension-history";
import Placeholder from "@tiptap/extension-placeholder";
import BulletList from "@tiptap/extension-bullet-list";
import ListItem from "@tiptap/extension-list-item";
import { Extension } from "@tiptap/core";
import { AITextGenerator } from "@/components/AITextGenerator";
import EditorHeader from "@/components/EditorHeader";

const limit = 50000;

interface TipTapEditorProps {
  initialContent: string;
  onContentChange: (content: string) => void;
  onSave: (content: string) => void;
  onSelectionChange: (selectedText: string) => void;
}

export const TipTapEditor: React.FC<TipTapEditorProps> = ({
  initialContent,
  onContentChange,
  onSave,
  onSelectionChange,
}) => {
  const aiGeneratorRef = useRef<AITextGenerator | null>(null);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Initialize the AI generator
  const aiGenerator = new AITextGenerator(0);

  // Create Tab key extension for AI generation
  const LiteralTab = Extension.create({
    name: "literalTab",

    addOptions() {
      return {
        cooldown: 5000,
      };
    },

    addKeyboardShortcuts() {
      let isCooldown = false;
      let tabPressCount = 0;
      const maxTabPresses = 15;

      return {
        Tab: () => {
          if (isCooldown) {
            return false;
          }

          if (tabPressCount >= maxTabPresses) {
            alert("Chill out with the tab key, will ya?");
            return false;
          }

          const editor = this.editor;
          const currentContent = editor.getText();

          (async () => {
            isCooldown = true;
            setTimeout(() => {
              isCooldown = false;
            }, this.options.cooldown);

            try {
              if (tabPressCount < maxTabPresses) {
                const generatedText = aiGeneratorRef.current
                  ? await aiGeneratorRef.current.generateLine(currentContent)
                  : await aiGenerator.generateLine(currentContent);

                if (generatedText) {
                  editor.chain().focus().insertContent(generatedText).run();
                  tabPressCount += 1;
                }
              }
            } catch (error) {
              console.error("Error generating line:", error);
            }
          })();

          return true;
        },
      };
    },
  });

  // Initialize the editor
  const editor = useEditor({
    extensions: [
      Document,
      History,
      Paragraph,
      Text,
      Bold,
      Underline,
      Italic,
      Image,
      LiteralTab,
      CharacterCount.configure({
        limit,
      }),
      Heading.configure({
        levels: [1, 2],
        HTMLAttributes: {
          "1": { class: "text-3xl font-bold mb-4" },
          "2": { class: "text-2xl font-semibold mb-3" },
        },
      }),
      Placeholder.configure({
        placeholder: "Write something already ya silly goose…",
      }),
      BulletList.configure({
        HTMLAttributes: {
          class: "list-disc",
        },
      }),
      ListItem,
    ],
    content: initialContent,
    onUpdate: ({ editor }) => {
      const content = editor.getHTML();
      onContentChange(content);
      debouncedSave(content);
    },
    onSelectionUpdate: ({ editor }) => {
      const { from, to } = editor.state.selection;
      if (from !== to) {
        const selectedText = editor.state.doc.textBetween(from, to);
        onSelectionChange(selectedText);
      } else {
        onSelectionChange("");
      }
    },
  });

  // Update editor content when initialContent changes
  useEffect(() => {
    if (editor && editor.getHTML() !== initialContent) {
      editor.commands.setContent(initialContent);
    }
  }, [editor, initialContent]);

  // Debounce save function
  const debouncedSave = useCallback(
    (content: string) => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }

      debounceTimerRef.current = setTimeout(() => {
        onSave(content);
        debounceTimerRef.current = null;
      }, 3000);
    },
    [onSave]
  );

  // AI actions for the bubble menu
  const handleAction = async (actionType: string) => {
    if (!editor) return;

    const { from, to } = editor.state.selection;
    const selectedText = editor.state.doc.textBetween(from, to);

    try {
      let result: string;
      switch (actionType) {
        case "summarize":
          result = await aiGenerator.summarizePlotOrScene(selectedText);
          break;
        case "paraphraseText":
          result = await aiGenerator.paraphraseText(selectedText);
          break;
        case "expandText":
          result = await aiGenerator.extpandText(selectedText);
          break;
        default:
          throw new Error("Unknown action type");
      }

      // Apply the changes to the editor
      editor.chain().focus().deleteSelection().insertContent(result).run();
    } catch (error) {
      console.error("Error:", error);
    }
  };

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  if (!editor) {
    return null;
  }

  return (
    <div className="mb-4">
      <BubbleMenu
        editor={editor}
        tippyOptions={{ duration: 150 }}
        className="bg-gray-800 text-white rounded-lg shadow-lg"
        shouldShow={({ from, to }) => from !== to}
      >
        <div className="flex min-w-[18rem] justify-center bg-gray-800 p-1 rounded-lg shadow-lg">
          <button
            className="py-1 px-3 m-1 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            onClick={() => handleAction("expandText")}
          >
            Expand
          </button>
          <button
            className="py-1 px-3 m-1 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            onClick={() => handleAction("paraphraseText")}
          >
            Paraphrase
          </button>
          <button
            className="py-1 px-3 m-1 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            onClick={() => handleAction("summarize")}
          >
            Summarize
          </button>
        </div>
      </BubbleMenu>

      <div className="bg-white p-4 rounded-lg border border-gray-300">
        <div className="min-h-[28rem] w-full flex justify-center">
          <div className="w-full focus:outline-none bg-white selection:bg-blue-100">
            <EditorContent
              onClick={() => editor.commands.focus()}
              className="w-full focus:outline-none bg-white selection:bg-blue-100"
              editor={editor}
            />
          </div>
        </div>
      </div>

      <div className="flex my-3">
        <EditorHeader editor={editor} />
      </div>
    </div>
  );
};
