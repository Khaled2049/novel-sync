import { firestore } from "@/config/firebase";
import { IClub } from "@/types/IClub";
import {
  arrayRemove,
  arrayUnion,
  collection,
  deleteDoc,
  doc,
  DocumentReference,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
} from "firebase/firestore";

class BookClubRepo {
  private bookClubCollection = collection(firestore, "bookClubs");

  createBookClub = async (club: IClub) => {
    try {
      const clubRef: DocumentReference = doc(
        collection(firestore, "bookClubs")
      );
      await setDoc(clubRef, { ...club, id: clubRef.id });
    } catch (error) {
      console.error("Error creating book club:", error);
    }
  };

  getBookClubs = async () => {
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

  getBookClub = async (id: string): Promise<IClub | undefined> => {
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

  updateBookClub = async (id: string, updatedClub: IClub) => {
    try {
      const clubRef = doc(firestore, "bookClubs", id);
      const clubDoc = await getDoc(clubRef);

      const clubDocData = clubDoc.data();

      if (!clubDoc.exists() || !clubDocData) {
        throw new Error("Club does not exist");
      }

      const newClub = { ...clubDocData, ...updatedClub };

      await updateDoc(clubRef, newClub);
    } catch (error) {
      console.error("Error updating book club:", error);
    }
  };

  deleteBookClub = async (id: string) => {
    try {
      await deleteDoc(doc(firestore, "bookClubs", id));
    } catch (error) {
      console.error("Error deleting book club:", error);
    }
  };

  joinBookClub = async (clubId: string, userName: string) => {
    try {
      const clubRef = doc(firestore, "bookClubs", clubId);
      await updateDoc(clubRef, {
        members: arrayUnion(userName),
      });
    } catch (error) {
      console.error("Error joining book club:", error);
    }
  };

  leaveBookClub = async (clubId: string, userId: string) => {
    try {
      const clubRef = doc(firestore, "bookClubs", clubId);
      await updateDoc(clubRef, {
        members: arrayRemove(userId),
      });
    } catch (error) {
      console.error("Error leaving book club:", error);
    }
  };
}

export const bookClubRepo = new BookClubRepo();
