import React, { useEffect, useState } from "react";
import { Character } from "@/types/ICharacter";
import AddCharacterModal from "@/components/characters/AddCharacterModal";
import { characterService } from "@/components/characters/CharacterService";
import { useParams } from "react-router-dom";
import UpdateCharacterModal from "@/components/characters/UpdateCharacterModal";

const Characters: React.FC = () => {
  const { storyId } = useParams<{ storyId: string }>();
  const [characters, setCharacters] = useState<Character[]>([]);
  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(
    null
  );
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [characterToUpdate, setCharacterToUpdate] = useState<Character | null>(
    null
  );

  useEffect(() => {
    loadCharacters();
  }, [storyId]);

  // const removeCharacter = async (id: string) => {
  //   if (!storyId) return;
  //   await characterService.deleteCharacter(storyId, id);
  //   setCharacters(characters.filter((character) => character.id !== id));
  // };

  const loadCharacters = async () => {
    if (!storyId) return;
    const characters = await characterService.getCharacters(storyId);
    setCharacters(characters);
  };

  const handleCharacterClick = (character: Character) => {
    setSelectedCharacter(character);
  };

  const handleAddCharacter = (newCharacter: Character) => {
    setCharacters([...characters, newCharacter]);
    setIsAddModalOpen(false);
  };

  const handleUpdateCharacter = (updatedCharacter: Character) => {
    setCharacters((prevCharacters) =>
      prevCharacters.map((char) =>
        char.id === updatedCharacter.id ? updatedCharacter : char
      )
    );
    setIsUpdateModalOpen(false);
    setCharacterToUpdate(null);
    if (selectedCharacter?.id === updatedCharacter.id) {
      setSelectedCharacter(updatedCharacter);
    }
  };

  const handleDeleteCharacter = async (characterId: string) => {
    if (!storyId) return;
    try {
      await characterService.deleteCharacter(storyId, characterId);
      setCharacters((prevCharacters) =>
        prevCharacters.filter((char) => char.id !== characterId)
      );
      if (selectedCharacter?.id === characterId) {
        setSelectedCharacter(null);
      }
    } catch (error) {
      console.error("Error deleting character:", error);
    }
  };

  if (!storyId) {
    return (
      <div>Story ID not found in URL. Please check the URL and try again.</div>
    );
  }

  return (
    <div className="flex h-screen">
      <div className="w-1/2 p-4 border-r">
        <h2 className="text-xl font-bold mb-4">Characters</h2>
        <button
          className="bg-blue-500 text-white px-4 py-2 rounded mb-4"
          onClick={() => setIsAddModalOpen(true)}
        >
          Add Character
        </button>
        <ul>
          {characters.map((character) => (
            <li
              key={character.id}
              className="flex items-center justify-between hover:bg-gray-100 p-2"
            >
              <span
                className="cursor-pointer"
                onClick={() => handleCharacterClick(character)}
              >
                {character.name}
              </span>
              <div>
                <button
                  className="bg-yellow-500 text-white px-2 py-1 rounded mr-2"
                  onClick={() => {
                    setCharacterToUpdate(character);
                    setIsUpdateModalOpen(true);
                  }}
                >
                  Update
                </button>
                <button
                  className="bg-red-500 text-white px-2 py-1 rounded"
                  onClick={() => handleDeleteCharacter(character.id)}
                >
                  Remove
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>
      <div className="w-1/2 p-4">
        <h2 className="text-xl font-bold mb-4">Character Details</h2>
        {selectedCharacter ? (
          <div>
            <h3 className="text-lg font-semibold">{selectedCharacter.name}</h3>
            <p>Age: {selectedCharacter.age}</p>
            <p>Backstory: {selectedCharacter.backstory}</p>
            {selectedCharacter.affiliations && (
              <p>Affiliations: {selectedCharacter.affiliations}</p>
            )}
            {selectedCharacter.notes && <p>Notes: {selectedCharacter.notes}</p>}
          </div>
        ) : (
          <p>Select a character to view details</p>
        )}
      </div>
      {isAddModalOpen && storyId && (
        <AddCharacterModal
          storyId={storyId}
          onClose={() => setIsAddModalOpen(false)}
          onAddCharacter={handleAddCharacter}
        />
      )}
      {isUpdateModalOpen && storyId && characterToUpdate && (
        <UpdateCharacterModal
          storyId={storyId}
          character={characterToUpdate}
          onClose={() => setIsUpdateModalOpen(false)}
          onUpdateCharacter={handleUpdateCharacter}
        />
      )}
    </div>
  );
};

export default Characters;
