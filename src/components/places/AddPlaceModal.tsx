import { Place } from "@/types/IPlace";
import { useState } from "react";
import { placeService } from "./PlaceService";

interface AddPlaceModalProps {
  storyId: string;
  onClose: () => void;
  onAddPlace: (place: Place) => void;
}

const AddPlaceModal = ({
  storyId,
  onClose,
  onAddPlace,
}: AddPlaceModalProps) => {
  const [place, setPlace] = useState<Omit<Place, "id">>({
    name: "",
    description: "",
    notes: "",
    storyId,
    userId: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const newPlaceId = await placeService.addPlace(storyId, place);
      onAddPlace({ ...place, id: newPlaceId });
    } catch (error) {
      console.error("Error adding character:", error);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setPlace((prevPlace) => ({
      ...prevPlace,
      [name]: value,
    }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
      <div className="bg-white p-6 rounded-lg">
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            name="name"
            value={place.name}
            onChange={handleChange}
            placeholder="Name"
            className="w-full mb-2 p-2 border rounded"
            required
          />
          <input
            type="text"
            name="description"
            value={place.description}
            onChange={handleChange}
            placeholder="description"
            className="w-full mb-2 p-2 border rounded"
            required
          />
          <textarea
            name="notes"
            value={place.notes}
            onChange={handleChange}
            placeholder="notes"
            className="w-full mb-2 p-2 border rounded"
            required
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
              Add Place
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddPlaceModal;
