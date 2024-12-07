import { firestore } from "@/config/firebase";
import { IClub } from "@/types/IClub";
import { IMessage } from "@/types/IMessage";
import {
  arrayRemove,
  arrayUnion,
  collection,
  deleteDoc,
  doc,
  DocumentReference,
  getDoc,
  getDocs,
  limit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
} from "firebase/firestore";

class BookClubRepo {
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
      const clubDoc = await getDoc(clubRef);

      if (!clubDoc.exists()) {
        throw new Error("Club not found");
      }

      const currentMembers = clubDoc.data().members || [];

      if (currentMembers.length >= 10) {
        throw new Error("This book club is full (maximum 10 members)");
      }

      await updateDoc(clubRef, {
        members: arrayUnion(userName),
      });
    } catch (error) {
      console.error("Error joining book club:", error);
      throw error;
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

  sendMessage = async (clubId: string, message: IMessage) => {
    try {
      const messagesRef = collection(firestore, `bookClubs/${clubId}/messages`);

      // Get current message count
      const messageCount = (await getDocs(messagesRef)).size;

      if (messageCount >= 100) {
        throw new Error("Message limit reached");
      }

      // Add new message
      const messageRef = doc(messagesRef);
      await setDoc(messageRef, {
        ...message,
        id: messageRef.id,
        timestamp: serverTimestamp(),
      });
    } catch (error) {
      console.error("Error sending message:", error);
      throw error;
    }
  };

  getMessages = (clubId: string, callback: (messages: IMessage[]) => void) => {
    const messagesRef = collection(firestore, `bookClubs/${clubId}/messages`);
    const q = query(messagesRef, orderBy("timestamp", "asc"), limit(50));

    return onSnapshot(q, (snapshot) => {
      const messages = snapshot.docs.map((doc) => doc.data() as IMessage);
      callback(messages);
    });
  };

  checkMembership = async (clubId: string, userId: string) => {
    const clubRef = doc(firestore, "bookClubs", clubId);
    const clubDoc = await getDoc(clubRef);
    if (clubDoc.exists()) {
      const clubData = clubDoc.data() as IClub;
      return clubData.members.includes(userId);
    }
    return false;
  };
}

export const bookClubRepo = new BookClubRepo();
