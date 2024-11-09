import { createContext, useState, useContext, ReactNode } from "react";

interface EditorContextType {
  setsuggestion: React.Dispatch<React.SetStateAction<string>>;
  suggestion: string;
}

const EditorContext = createContext<EditorContextType | undefined>(undefined);

export const EditorProvider = ({ children }: { children: ReactNode }) => {
  const [suggestion, setsuggestion] = useState("");

  return (
    <EditorContext.Provider
      value={{
        setsuggestion,
        suggestion,
      }}
    >
      {children}
    </EditorContext.Provider>
  );
};

export const useEditorContext = () => {
  const context = useContext(EditorContext);
  if (!context) {
    throw new Error("useEditorContext must be used within an EditorProvider");
  }
  return context;
};
