import { Character } from "@/types/ICharacter";
import { useState } from "react";
import { characterService } from "./CharacterService";

interface AddCharacterModalProps {
  storyId: string;
  onClose: () => void;
  onAddCharacter: (character: Character) => void;
}

const AddCharacterModal = ({
  storyId,
  onClose,
  onAddCharacter,
}: AddCharacterModalProps) => {
  const [character, setCharacter] = useState<Omit<Character, "id">>({
    name: "",
    age: 0,
    backstory: "",
    affiliations: "",
    notes: "",
    userId: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setCharacter((prev) => ({
      ...prev,
      [name]: name === "age" ? parseInt(value) : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const newCharacterId = await characterService.addCharacter(
        storyId,
        character
      );
      onAddCharacter({ ...character, id: newCharacterId });
    } catch (error) {
      console.error("Error adding character:", error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
      <div className="bg-white p-6 rounded-lg">
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            name="name"
            value={character.name}
            onChange={handleChange}
            placeholder="Name"
            className="w-full mb-2 p-2 border rounded"
            required
          />
          <input
            type="number"
            name="age"
            value={character.age}
            onChange={handleChange}
            placeholder="Age"
            className="w-full mb-2 p-2 border rounded"
            required
          />
          <textarea
            name="backstory"
            value={character.backstory}
            onChange={handleChange}
            placeholder="Backstory"
            className="w-full mb-2 p-2 border rounded"
            required
          />
          <input
            type="text"
            name="affiliations"
            value={character.affiliations}
            onChange={handleChange}
            placeholder="Affiliations"
            className="w-full mb-2 p-2 border rounded"
          />
          <textarea
            name="notes"
            value={character.notes}
            onChange={handleChange}
            placeholder="Notes"
            className="w-full mb-2 p-2 border rounded"
          />
          <div className="flex justify-end">
            <button
              type="button"
              onClick={onClose}
              className="bg-gray-300 text-black px-4 py-2 rounded mr-2"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-blue-500 text-white px-4 py-2 rounded"
            >
              Add Character
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddCharacterModal;
