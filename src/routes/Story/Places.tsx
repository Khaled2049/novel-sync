import React, { useEffect, useState } from "react";

import AddPlaceModal from "@/components/places/AddPlaceModal";

import { useParams } from "react-router-dom";
import { Place } from "@/types/IPlace";
import { placeService } from "@/components/places/PlaceService";
import UpdatePlaceModal from "@/components/places/UpdatePlaceModal";

const places: React.FC = () => {
  const { storyId } = useParams<{ storyId: string }>();
  const [places, setplaces] = useState<Place[]>([]);
  const [selectedplace, setSelectedplace] = useState<Place | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [placeToUpdate, setplaceToUpdate] = useState<Place | null>(null);

  useEffect(() => {
    loadplaces();
  }, [storyId]);

  // const removePlace = async (id: string) => {
  //   if (!storyId) return;
  //   await placeService.deletePlace(storyId, id);
  //   setplaces(places.filter((place) => place.id !== id));
  // };

  const loadplaces = async () => {
    if (!storyId) return;
    const places = await placeService.getPlaces(storyId);
    setplaces(places);
  };

  const handleplaceClick = (place: Place) => {
    setSelectedplace(place);
  };

  const handleAddplace = (newplace: Place) => {
    setplaces([...places, newplace]);
    setIsAddModalOpen(false);
  };

  const handleUpdateplace = (updatedplace: Place) => {
    setplaces((prevplaces) =>
      prevplaces.map((place) =>
        place.id === updatedplace.id ? updatedplace : place
      )
    );
    setIsUpdateModalOpen(false);
    setplaceToUpdate(null);
    if (selectedplace?.id === updatedplace.id) {
      setSelectedplace(updatedplace);
    }
  };

  const handleDeleteplace = async (placeId: string) => {
    if (!storyId) return;
    try {
      await placeService.deletePlace(storyId, placeId);
      setplaces((prevplaces) =>
        prevplaces.filter((place) => place.id !== placeId)
      );
      if (selectedplace?.id === placeId) {
        setSelectedplace(null);
      }
    } catch (error) {
      console.error("Error deleting place:", error);
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
        <h2 className="text-xl font-bold mb-4">places</h2>
        <button
          className="bg-blue-500 text-white px-4 py-2 rounded mb-4"
          onClick={() => setIsAddModalOpen(true)}
        >
          Add place
        </button>
        <ul>
          {places.map((place) => (
            <li
              key={place.id}
              className="flex items-center justify-between hover:bg-gray-100 p-2"
            >
              <span
                className="cursor-pointer"
                onClick={() => handleplaceClick(place)}
              >
                {place.name}
              </span>
              <div>
                <button
                  className="bg-yellow-500 text-white px-2 py-1 rounded mr-2"
                  onClick={() => {
                    setplaceToUpdate(place);
                    setIsUpdateModalOpen(true);
                  }}
                >
                  Update
                </button>
                <button
                  className="bg-red-500 text-white px-2 py-1 rounded"
                  onClick={() => handleDeleteplace(place.id)}
                >
                  Remove
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>
      <div className="w-1/2 p-4">
        <h2 className="text-xl font-bold mb-4">place Details</h2>
        {selectedplace ? (
          <div>
            <h3 className="text-lg font-semibold">{selectedplace.name}</h3>
            <p>Description: {selectedplace.description}</p>
            {selectedplace.notes && <p>Notes: {selectedplace.notes}</p>}
          </div>
        ) : (
          <p>Select a place to view details</p>
        )}
      </div>
      {isAddModalOpen && storyId && (
        <AddPlaceModal
          storyId={storyId}
          onClose={() => setIsAddModalOpen(false)}
          onAddPlace={handleAddplace}
        />
      )}
      {isUpdateModalOpen && storyId && placeToUpdate && (
        <UpdatePlaceModal
          storyId={storyId}
          place={placeToUpdate}
          onClose={() => setIsUpdateModalOpen(false)}
          onUpdateplace={handleUpdateplace}
        />
      )}
    </div>
  );
};

export default places;
