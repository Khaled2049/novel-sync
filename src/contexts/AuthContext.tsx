import React, { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth, firestore } from "../config/firebase";
import {
  arrayRemove,
  arrayUnion,
  doc,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  updateDoc,
} from "firebase/firestore";
import { IUser } from "../types/IUser";
import { collection } from "firebase/firestore";

interface AuthContextType {
  user: IUser | null;
  loading: boolean;
  fetchUsersOrderedByLastLogin: (userLimit: number) => Promise<IUser[]>;
  followUser: (uid: string) => Promise<void>;
  unfollowUser: (uid: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<IUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // Fetch additional user data from Firestore
        const userDocRef = doc(firestore, "users", firebaseUser.uid);
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists()) {
          const userData = userDoc.data();
          setUser({
            ...firebaseUser,
            ...userData,
            createdAt: userData.createdAt,
            username: userData.username,
            followers: userData.followers,
            following: userData.following,
            stories: userData.posts,
            likedPosts: userData.likedPosts,
            savedPosts: userData.savedPosts,
            lastLogin: userData.lastLogin,
          });
        } else {
          const newUser: IUser = {
            ...firebaseUser,
            createdAt: new Date().toISOString(),
            username: user?.displayName || "",
            followers: ["default"],
            following: ["default"],
            stories: [],
            likedPosts: [],
            savedPosts: [],
            lastLogin: new Date().toISOString(),
          };
          // Here you would typically save this new user to Firestore
          setUser(newUser);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // fetches last 5 logedin users
  const fetchUsersOrderedByLastLogin = async (
    userLimit: number
  ): Promise<IUser[]> => {
    try {
      const usersCollection = collection(firestore, "users");
      const usersQuery = query(
        usersCollection,
        orderBy("lastLogin", "desc"), // Order by lastLogin descending
        limit(userLimit) // Limit the number of returned users
      );
      const usersSnapshot = await getDocs(usersQuery);

      const users: IUser[] = usersSnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          ...data,
          uid: doc.id, // Assuming you want to use Firestore's document ID as the user's UID
        } as IUser;
      });

      return users;
    } catch (error) {
      console.error("Error fetching users ordered by last login:", error);
      throw new Error("Failed to fetch users");
    }
  };

  const followUser = async (uid: string) => {
    if (!user) {
      throw new Error("User not authenticated");
    }

    try {
      const userDocRef = doc(firestore, "users", uid);

      await updateDoc(userDocRef, {
        followers: arrayUnion(user.uid), // Add the current user's UID to the followers array
      });

      await updateDoc(doc(firestore, "users", user.uid), {
        following: arrayUnion(uid),
      });
    } catch (error) {
      console.error("Error following user:", error);
      throw new Error("Failed to follow user");
    }
  };

  const unfollowUser = async (uid: string) => {
    if (!user) {
      throw new Error("User not authenticated");
    }

    try {
      const userDocRef = doc(firestore, "users", uid);

      await updateDoc(userDocRef, {
        followers: arrayRemove(user.uid), // Remove the current user's UID from the followers array
      });

      await updateDoc(doc(firestore, "users", user.uid), {
        following: arrayRemove(uid),
      });
    } catch (error) {
      console.error("Error unfollowing user:", error);
      throw new Error("Failed to unfollow user");
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        fetchUsersOrderedByLastLogin,
        followUser,
        unfollowUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuthContext must be used within an EditorProvider");
  }
  return context;
};
