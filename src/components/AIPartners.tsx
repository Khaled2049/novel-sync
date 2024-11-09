import React, { useState } from "react";
import { profiles } from "../profiles";
import { useAI } from "../contexts/AIContext";
import { AITextGenerator } from "./AITextGenerator";

const AIPartners: React.FC = () => {
  const { setSelectedAI } = useAI();
  const [selectedProfileId, setSelectedProfileId] = useState<number>(0);

  const handleClick = (profile: any) => {
    const aiGenerator = new AITextGenerator(profile.id);
    setSelectedAI(aiGenerator);
    setSelectedProfileId(profile.id);
  };

  return (
    <div className="flex items-center flex-col justify-center bg-amber-50 p-2">
      <h2 className="text-2xl font-serif mb-4 text-amber-800">AI Partners</h2>
      <div className="flex flex-wrap justify-center gap-8">
        {profiles.map((profile) => (
          <div
            key={profile.id}
            className={`flex flex-col items-center w-32 cursor-pointer p-2 rounded-lg transition-transform transform hover:scale-105 ${
              selectedProfileId === profile.id
                ? "bg-amber-300 border-2 border-amber-500"
                : "bg-white border border-gray-300"
            }`}
            onClick={() => handleClick(profile)}
          >
            <div className="w-24 h-24 rounded-full bg-red-200 overflow-hidden mb-2">
              <img src={profile.img} alt={profile.name} />
            </div>
            <span className="text-sm font-medium text-center">
              {profile.name}
            </span>
            <span className="text-xs text-gray-600 text-center my-3">
              {profile.desc}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AIPartners;
