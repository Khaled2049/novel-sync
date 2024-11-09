import React, { createContext, useContext, useState, ReactNode } from "react";
import { IClub } from "../types/IClub"; // Define your BookClub type here
import { firestore } from "../config/firebase";
import {
  collection,
  doc,
  setDoc,
  getDoc,
  deleteDoc,
  updateDoc,
  arrayUnion,
  arrayRemove,
  DocumentReference,
  getDocs,
} from "firebase/firestore";

interface BookClubContextProps {
  bookClubs: IClub[];
  createBookClub: (club: IClub) => Promise<void>;
  getBookClub: (id: string) => Promise<IClub | undefined>;
  updateBookClub: (id: string, updatedClub: IClub) => Promise<void>;
  deleteBookClub: (id: string) => Promise<void>;
  joinBookClub: (clubId: string, userName: string) => Promise<void>;
  leaveBookClub: (clubId: string, userId: string) => Promise<void>;
  getBookClubs: () => Promise<IClub[] | undefined>;
}

const BookClubContext = createContext<BookClubContextProps | undefined>(
  undefined
);

export const useBookClub = () => {
  const context = useContext(BookClubContext);
  if (!context) {
    throw new Error("useBookClub must be used within a BookClubProvider");
  }
  return context;
};

export const BookClubProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [bookClubs, setBookClubs] = useState<IClub[]>([]);

  const createBookClub = async (club: IClub) => {
    try {
      const clubRef: DocumentReference = doc(
        collection(firestore, "bookClubs")
      );
      await setDoc(clubRef, { ...club, id: clubRef.id });
      setBookClubs([...bookClubs, { ...club, id: clubRef.id }]);
    } catch (error) {
      console.error("Error creating book club:", error);
    }
  };

  const getBookClubs = async () => {
    try {
      const bookClubsSnapshot = await getDocs(
        collection(firestore, "bookClubs")
      );
      const bookClubsData = bookClubsSnapshot.docs.map(
        (doc) => doc.data() as IClub
      );
      return bookClubsData;
    } catch (error) {
      console.error("Error getting book clubs:", error);
    }
  };

  const getBookClub = async (id: string): Promise<IClub | undefined> => {
    try {
      const clubDoc = await getDoc(doc(firestore, "bookClubs", id));
      if (clubDoc.exists()) {
        return clubDoc.data() as IClub;
      }
    } catch (error) {
      console.error("Error getting book club:", error);
    }
    return undefined;
  };

  const updateBookClub = async (id: string, updatedClub: IClub) => {
    try {
      const clubRef = doc(firestore, "bookClubs", id);
      const clubDoc = await getDoc(clubRef);

      const clubDocData = clubDoc.data();

      if (!clubDoc.exists() || !clubDocData) {
        throw new Error("Club does not exist");
      }

      const newClub = { ...clubDocData, ...updatedClub };

      await updateDoc(clubRef, newClub);

      // Update the local state with the updated club information
      setBookClubs(
        bookClubs.map((club) =>
          club.id === id ? { ...club, ...updatedClub } : club
        )
      );
    } catch (error) {
      console.error("Error updating book club:", error);
    }
  };

  const deleteBookClub = async (id: string) => {
    try {
      await deleteDoc(doc(firestore, "bookClubs", id));
      setBookClubs(bookClubs.filter((club) => club.id !== id));
    } catch (error) {
      console.error("Error deleting book club:", error);
    }
  };

  const joinBookClub = async (clubId: string, userName: string) => {
    try {
      const clubRef = doc(firestore, "bookClubs", clubId);
      await updateDoc(clubRef, {
        members: arrayUnion(userName),
      });
      setBookClubs(
        bookClubs.map((club) =>
          club.id === clubId
            ? { ...club, members: [...club.members, userName] }
            : club
        )
      );
    } catch (error) {
      console.error("Error joining book club:", error);
    }
  };

  const leaveBookClub = async (clubId: string, userId: string) => {
    try {
      const clubRef = doc(firestore, "bookClubs", clubId);
      await updateDoc(clubRef, {
        members: arrayRemove(userId),
      });
      setBookClubs(
        bookClubs.map((club) =>
          club.id === clubId
            ? { ...club, members: club.members.filter((id) => id !== userId) }
            : club
        )
      );
    } catch (error) {
      console.error("Error leaving book club:", error);
    }
  };

  return (
    <BookClubContext.Provider
      value={{
        bookClubs,
        createBookClub,
        getBookClub,
        updateBookClub,
        deleteBookClub,
        joinBookClub,
        leaveBookClub,
        getBookClubs,
      }}
    >
      {children}
    </BookClubContext.Provider>
  );
};
