import { useState } from "react";

interface CollapsibleDivProps {
  title: string;
  children: React.ReactNode;
}

const CollapsibleDiv = ({ title, children }: CollapsibleDivProps) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="border rounded-lg border-amber-300 shadow mb-4">
      <button
        className="w-full p-4 text-left text-2xl bg-amber-50 font-medium text-amber-800 hover:bg-amber-200"
        onClick={() => setIsOpen(!isOpen)}
      >
        {title}
      </button>
      <div
        className={`transition-all duration-300 overflow-hidden w-full ${
          isOpen ? "max-h-screen" : "max-h-0"
        }`}
      >
        {children}
      </div>
    </div>
  );
};

export default CollapsibleDiv;
