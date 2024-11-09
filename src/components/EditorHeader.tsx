import { useCallback, useState } from "react";
import * as Icons from "./Icons";
import { Editor } from "@tiptap/react";
import { LinkModal } from "./LinkModal";
import axiosInstance from "../api";
// import { RiAiGenerate } from "react-icons/ri";
import { List } from "lucide-react";
interface EditorHeaderProps {
  editor: Editor;
}

const EditorHeader: React.FC<EditorHeaderProps> = ({ editor }) => {
  const [modalIsOpen, setIsOpen] = useState(false);
  const [genImage, setGenImage] = useState("");
  const [_isLoading, setIsLoading] = useState(false);

  const generateImage = async (prompt: string) => {
    setIsLoading(true);
    try {
      const response = await axiosInstance.post("/generate", { prompt });
      const imageData = response.data.image;
      editor
        .chain()
        .focus()
        .setImage({ src: `data:image/png;base64,${imageData}` })
        .run();
      // Handle the response data as needed
    } catch (error) {
      console.error("Error generating text:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleBold = useCallback(() => {
    editor.chain().focus().toggleBold().run();
  }, [editor]);

  const toggleUnderline = useCallback(() => {
    editor.chain().focus().toggleUnderline().run();
  }, [editor]);

  const toggleItalic = useCallback(() => {
    editor.chain().focus().toggleItalic().run();
  }, [editor]);

  // const openModal = useCallback(() => {
  //   setIsOpen(true);
  // }, [editor]);

  const closeModal = useCallback(() => {
    setIsOpen(false);
    setGenImage("");
  }, []);

  const saveLink = useCallback(async () => {
    // Generate image if a prompt is provided
    if (genImage) {
      await generateImage(genImage);
    }

    editor.commands.blur();
    closeModal();
  }, [editor, genImage, closeModal]);

  return (
    <div className="flex flex-wrap gap-2 p-2 bg-amber-600 rounded-lg w-full text-center justify-center">
      <button
        className="p-2 rounded-md hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        onClick={() => editor.chain().focus().undo().run()}
        disabled={!editor.can().undo()}
      >
        <Icons.RotateLeft />
      </button>
      <button
        className="p-2 rounded-md hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        onClick={() => editor.chain().focus().redo().run()}
        disabled={!editor.can().redo()}
      >
        <Icons.RotateRight />
      </button>

      <button
        className={`p-2 rounded-md hover:bg-gray-200 transition-colors ${
          editor.isActive("bold") ? "bg-gray-300" : ""
        }`}
        onClick={toggleBold}
      >
        <Icons.Bold />
      </button>
      <button
        className={`p-2 rounded-md hover:bg-gray-200 transition-colors ${
          editor.isActive("underline") ? "bg-gray-300" : ""
        }`}
        onClick={toggleUnderline}
      >
        <Icons.Underline />
      </button>
      <button
        className={`p-2 rounded-md hover:bg-gray-200 transition-colors ${
          editor.isActive("italic") ? "bg-gray-300" : ""
        }`}
        onClick={toggleItalic}
      >
        <Icons.Italic />
      </button>

      {/* <button
        onClick={openModal}
        className="p-2 rounded-md hover:bg-gray-200 transition-colors relative"
        disabled={isLoading}
      >
        {isLoading ? <h1>Loading...</h1> : <RiAiGenerate />}
      </button> */}

      <button
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        className={`p-2 rounded-md hover:bg-gray-200 transition-colors ${
          editor.isActive("heading", { level: 1 }) ? "bg-gray-300 " : ""
        }`}
      >
        H1
      </button>
      <button
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        className={`p-2 rounded-md hover:bg-gray-200 transition-colors ${
          editor.isActive("heading", { level: 2 }) ? "bg-gray-300 " : ""
        }`}
      >
        H2
      </button>
      <button
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={editor.isActive("bulletList") ? "is-active" : ""}
      >
        <List />
      </button>
      {/* <button
        onClick={() => editor.chain().focus().splitListItem("listItem").run()}
        disabled={!editor.can().splitListItem("listItem")}
      >
        Split list item
      </button>
      <button
        onClick={() => editor.chain().focus().sinkListItem("listItem").run()}
        disabled={!editor.can().sinkListItem("listItem")}
      >
        Sink list item
      </button>
      <button
        onClick={() => editor.chain().focus().liftListItem("listItem").run()}
        disabled={!editor.can().liftListItem("listItem")}
      >
        Lift list item
      </button> */}
      <div className="flex items-center justify-center h-12 p-2 rounded-md">
        {editor.storage.characterCount.words()} words
      </div>
      <LinkModal
        url={genImage}
        isOpen={modalIsOpen}
        onRequestClose={closeModal}
        contentLabel="Enter Prompt Modal"
        closeModal={closeModal}
        onChangeUrl={(e) => setGenImage(e.target.value)}
        onSaveLink={saveLink}
      />
    </div>
  );
};

export default EditorHeader;
