import "./style.css";
import { useCallback, useEffect, useRef, useState } from "react";
import { useEditor, EditorContent, Editor, BubbleMenu } from "@tiptap/react";
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
import { Extension } from "@tiptap/core";
import { AITextGenerator } from "./AITextGenerator";
import ListItem from "@tiptap/extension-list-item";
import { storiesRepo } from "./StoriesRepo";

const limit = 5000;
import { Book, Loader } from "lucide-react";

import EditorHeader from "./EditorHeader";
import { useAI } from "../contexts/AIContext";
import { useAuthContext } from "../contexts/AuthContext";

import { useEditorContext } from "../contexts/EditorContext";
import AIPartners from "./AIPartners";
import AITools from "./AITools";
import { useNavigate, useParams } from "react-router-dom";
import { Chapter, Story } from "@/types/IStory";

export function SimpleEditor() {
  const navigate = useNavigate();
  const { storyId } = useParams<{ storyId: string }>();

  const [rightColumnVisible, setRightColumnVisible] = useState(false);
  const [aitoolsVisible, setAitoolsVisible] = useState(false);

  const [selectedText, setSelectedText] = useState("");

  const [currentStory, setCurrentStory] = useState<Story | null>(null);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [currentChapter, setCurrentChapter] = useState<Chapter | null>(null);
  const [storyTitle, setStoryTitle] = useState("");
  const [storyDescription, setStoryDescription] = useState("");
  const [chapterTitle, setChapterTitle] = useState("");
  const [saveStatus, setSaveStatus] = useState("");
  const [storyLoading, setStoryLoading] = useState(true);
  const storyTitleRef = useRef(storyTitle);
  const storyDescriptionRef = useRef(storyDescription);
  const chapterTitleRef = useRef(chapterTitle);

  const toggleAiTools = () => setAitoolsVisible(!aitoolsVisible);
  const toggleRightColumn = () => setRightColumnVisible(!rightColumnVisible);
  const { suggestion, setsuggestion } = useEditorContext();
  const { user } = useAuthContext();

  const { selectedAI } = useAI();
  const aiGeneratorRef = useRef<AITextGenerator | null>(null);

  const aiGenerator = new AITextGenerator(selectedAI?.id || 0);

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
    content: "",
    onUpdate: ({ editor }) => {
      const content = editor.getHTML();
      debouncedSave(content);
    },
  }) as Editor;

  const loadStory = async (storyId: string) => {
    setStoryLoading(true);
    const story = await storiesRepo.getStory(storyId);

    if (story) {
      setCurrentStory(story);
      setStoryTitle(story.title);
      setStoryDescription(story.description);
      const storyChapters = await storiesRepo.getChapters(storyId);
      setChapters(storyChapters);
      if (storyChapters.length > 0) {
        setCurrentChapter(storyChapters[0]);
        setChapterTitle(storyChapters[0].title);
        editor?.commands.setContent(storyChapters[0].content);
        setStoryLoading(false);
      } else {
        setCurrentChapter(null);
        setChapterTitle("");
        editor?.commands.setContent("");
        setStoryLoading(false);
      }
    }
  };

  const handleSave = useCallback(
    async (
      storyTitle: string,
      storyDescription: string,
      chapterTitle: string,
      content: any
    ) => {
      if (!currentStory) {
        console.error("No story selected");
        return;
      }
      setSaveStatus("Saving...");
      try {
        const saveChapter = async () => {
          if (currentChapter) {
            // Update existing chapter
            await storiesRepo.updateChapter(
              currentStory.id,
              currentChapter.id,
              chapterTitle,
              content
            );
          } else if (content.trim() || chapterTitle.trim()) {
            // Add new chapter if content or title is not empty
            const newChapterId = await storiesRepo.addChapter(
              currentStory.id,
              chapterTitle
            );
            await storiesRepo.updateChapter(
              currentStory.id,
              newChapterId,
              chapterTitle,
              content
            );
            const newChapter = await storiesRepo.getChapter(
              currentStory.id,
              newChapterId
            );

            if (newChapter) {
              setCurrentChapter(newChapter);
              setChapters((prevChapters) => [...prevChapters, newChapter]);
            }
          }
        };

        // Save chapter and story
        await saveChapter();
        await storiesRepo.updateStory(
          currentStory.id,
          storyTitle,
          storyDescription
        );

        setChapters((prevChapters) =>
          prevChapters.map((chapter) =>
            chapter.id === currentChapter?.id
              ? { ...chapter, title: chapterTitle, content }
              : chapter
          )
        );

        setSaveStatus("Saved");
      } catch (error) {
        console.error("Error saving:", error);
        setSaveStatus(error instanceof Error ? error.message : "Error saving");
      } finally {
        setTimeout(() => setSaveStatus(""), 2000);
      }
    },
    [currentStory, currentChapter, chapters]
  );

  const debouncedSave = useCallback(
    debounce((content) => {
      handleSave(
        storyTitleRef.current,
        storyDescriptionRef.current,
        chapterTitleRef.current,
        content
      );
    }, 2000),
    [handleSave]
  );

  function debounce<T extends (...args: any[]) => any>(
    func: T,
    delay: number
  ): T {
    let timeoutId: ReturnType<typeof setTimeout>;
    return ((...args: Parameters<T>) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func(...args), delay);
    }) as T;
  }

  const handleNewChapter = async () => {
    if (!currentStory) return;
    const newChapterId = await storiesRepo.addChapter(
      currentStory.id,
      "New Chapter"
    );
    await loadStory(currentStory.id); // This will refresh the chapters list
    const newChapter = await storiesRepo.getChapter(
      currentStory.id,
      newChapterId
    );
    if (newChapter) {
      setCurrentChapter(newChapter);
      setChapterTitle(newChapter.title);
      editor?.commands.setContent(newChapter.content);
    }
  };

  const handlePublish = async () => {
    if (!currentStory) return;
    await storiesRepo.handlePublish(currentStory.id);
    navigate("/stories");
    setTimeout(() => setSaveStatus(""), 2000);
  };

  useEffect(() => {
    storyTitleRef.current = storyTitle;
    storyDescriptionRef.current = storyDescription;
    chapterTitleRef.current = chapterTitle;
  }, [storyTitle, storyDescription, chapterTitle]);

  useEffect(() => {
    if (selectedAI) {
      aiGeneratorRef.current = selectedAI;
    }
    if (suggestion) {
      aiGenerator.generateFromSuggestion(suggestion).then((generatedText) => {
        editor.chain().focus().insertContent(generatedText).run();
      });
    }
    setsuggestion("");
    if (storyId) {
      loadStory(storyId);
    }
  }, [selectedAI, user]);

  const getSelectedText = () => {
    return editor.state.doc.textBetween(
      editor.state.selection.from,
      editor.state.selection.to
    );
  };

  const applyChanges = (newText: string) => {
    editor.chain().focus().insertContent(newText).run();
  };

  const handleAction = async (actionType: string) => {
    const selectedText = getSelectedText();
    setSelectedText(selectedText);
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
      applyChanges(result);
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const handleChange =
    (setter: (value: string) => void) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setter(e.target.value);
      const content = editor.getHTML();
      debouncedSave(content);
    };

  return (
    <div className="flex p-2 mt-4 justify-center overflow-auto">
      <BubbleMenu
        pluginKey="bubbleMenuText"
        className="bg-gray-800 text-white rounded-lg shadow-lg"
        tippyOptions={{ duration: 150 }}
        editor={editor}
        shouldShow={({ from, to }) => {
          // only show if range is selected.
          setSelectedText(editor.state.doc.textBetween(from, to));
          return from !== to;
        }}
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

      {storyLoading ? (
        <div className="text-amber-800">
          <Loader className="w-12 h-12" />
        </div>
      ) : (
        <div className="flex h-screen w-full">
          <div
            className={`p-4 bg-amber-50 rounded-lg shadow-lg overflow-y-auto transition-all duration-300 ${
              rightColumnVisible ? "w-2/3" : "w-full"
            }`}
          >
            <h1 className="mb-4 text-3xl font-bold text-slate-800 italic">
              Summon your ultimate writing muse by pressing{" "}
              <span className="underline decoration-wavy text-blue-600">
                TAB
              </span>
            </h1>

            <div className="text-sm text-gray-400">{saveStatus}</div>

            <input
              type="text"
              value={storyTitle}
              onChange={handleChange(setStoryTitle)}
              placeholder="Story Title"
              className="w-full p-2 mb-2 border border-gray-700 rounded"
              maxLength={80}
            />

            <textarea
              value={storyDescription}
              onChange={handleChange(setStoryDescription)}
              placeholder="Chapter Notes"
              className="w-full p-2 mb-4 border border-gray-700 rounded"
              rows={3}
              maxLength={80}
            />

            <input
              type="text"
              value={chapterTitle}
              onChange={handleChange(setChapterTitle)}
              placeholder="Chapter Title"
              className="w-full p-2 mb-4 border border-gray-700 rounded"
              maxLength={80}
            />
            <div className="bg-white p-4 rounded-lg border border-gray-300">
              <div className="min-h-[28rem] w-full flex justify-center">
                <div className="w-full focus:outline-none bg-white selection:bg-blue-100">
                  <EditorContent
                    onClick={() => editor?.commands.focus()}
                    className="w-full focus:outline-none bg-white selection:bg-blue-100"
                    editor={editor}
                  />
                </div>
              </div>
            </div>
            <div className="flex my-3">
              <EditorHeader editor={editor} />
            </div>

            {currentStory && (
              <button
                className="w-full p-2 mb-2 bg-green-500 text-white rounded hover:bg-green-600"
                onClick={handlePublish}
              >
                {currentStory.isPublished ? "Unpublish" : "Publish"}
              </button>
            )}
            <button
              onClick={handleNewChapter}
              className="w-full p-2 mb-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              New Chapter
            </button>
          </div>

          {/* AI Tools */}
          <div
            className={`transition-all duration-300 bg-amber-100 mx-2 ${
              aitoolsVisible ? "w-1/3" : "w-24"
            } flex flex-col`}
          >
            <div className="p-2 bg-amber-500 text-white rounded-t-lg hover:bg-amber-600 flex justify-center">
              {aitoolsVisible ? (
                <button
                  onClick={toggleAiTools}
                  className="flex items-center h-12 justify-center w-full"
                >
                  <span className="flex items-center space-x-2">
                    <span>Hide Tools</span>
                  </span>
                </button>
              ) : (
                <button
                  onClick={toggleAiTools}
                  className="flex items-center h-12 justify-center w-full"
                >
                  <span className="flex items-center space-x-2">
                    <span>Show Tools</span>
                  </span>
                </button>
              )}
            </div>
            {aitoolsVisible && (
              <div className="p-6 bg-amber-100 transition-all duration-300 flex-1">
                <AIPartners />
                <AITools text={selectedText} />
              </div>
            )}
          </div>

          {/* Chapters */}
          <div
            className={`transition-all duration-300 bg-amber-100 mx-2 ${
              rightColumnVisible ? "w-1/3" : "w-24"
            } flex flex-col`}
          >
            <div className="p-2 bg-amber-500 text-white rounded-t-lg hover:bg-amber-600 flex justify-center">
              {rightColumnVisible ? (
                <button
                  onClick={toggleRightColumn}
                  className="flex items-center h-12 justify-center w-full"
                >
                  <span className="flex items-center space-x-2">
                    <span>Hide Chapters</span>
                  </span>
                </button>
              ) : (
                <button
                  onClick={toggleRightColumn}
                  className="flex items-center h-12 justify-center w-full"
                >
                  <span className="flex items-center space-x-2">
                    <span>Show Chapters</span>
                  </span>
                </button>
              )}
            </div>

            {rightColumnVisible && (
              <div className="p-6 rounded-lg ">
                <h2 className="text-2xl font-bold mb-4 text-amber-800">
                  Editing: {chapterTitle || "Untitled Masterpiece"}
                </h2>
                {chapters.length === 0 ? (
                  <p className="text-amber-700 italic">
                    No chapters added yet. Start your journey!
                  </p>
                ) : (
                  <ul className="space-y-2">
                    {chapters.map((chapter) => (
                      <li
                        key={chapter.id}
                        className="bg-white rounded-md shadow transition-all hover:shadow-md"
                      >
                        <div className="flex items-center justify-between p-3">
                          <div
                            className="flex items-center space-x-3 cursor-pointer"
                            onClick={() => {
                              setCurrentChapter(chapter);
                              setChapterTitle(chapter.title);
                              editor?.commands.setContent(chapter.content);
                            }}
                          >
                            <Book className="w-5 h-5 text-amber-600" />
                            <span className="font-medium text-amber-900">
                              {chapter?.title || "Untitled Chapter"}
                            </span>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
