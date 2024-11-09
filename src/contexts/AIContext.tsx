import React, { createContext, useContext, useState, ReactNode } from "react";
import { AITextGenerator } from "../components/AITextGenerator"; // Assuming AITextGenerator is in the same directory

type AIContextType = {
  selectedAI: AITextGenerator | null;
  setSelectedAI: (ai: AITextGenerator) => void;
};

const AIContext = createContext<AIContextType | undefined>(undefined);

export const AIProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [selectedAI, setSelectedAI] = useState<AITextGenerator | null>(null);

  return (
    <AIContext.Provider value={{ selectedAI, setSelectedAI }}>
      {children}
    </AIContext.Provider>
  );
};

export const useAI = (): AIContextType => {
  const context = useContext(AIContext);
  if (!context) {
    throw new Error("useAI must be used within an AIProvider");
  }
  return context;
};
