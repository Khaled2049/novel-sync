import {
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  setDoc,
} from "firebase/firestore";
import { firestore, auth } from "../../config/firebase";
import { IPost } from "@/types/IPost";

class PostsService {
  private usersCollection = collection(firestore, "users");
  private allPostsCollection = collection(firestore, "posts");

  async getPosts(userId: string): Promise<IPost[]> {
    try {
      const postsCollection = collection(this.usersCollection, userId, "posts");
      const postsSnapshot = await getDocs(postsCollection);
      return postsSnapshot.docs.map((doc) => doc.data() as IPost);
    } catch (error) {
      console.error("Error getting posts:", error);
      throw error;
    }
  }

  // gets all posts created by any user
  async getAllPosts(): Promise<IPost[]> {
    try {
      // Query Firestore to get the latest 5 posts
      const postsQuery = query(
        this.allPostsCollection,
        orderBy("createdAt", "desc"), // Sort by createdAt descending
        limit(5) // Limit to 5 results
      );

      const postsSnapshot = await getDocs(postsQuery);
      return postsSnapshot.docs.map((doc) => doc.data() as IPost);
    } catch (error) {
      console.error("Error getting latest posts:", error);
      throw error;
    }
  }

  async addPost(userId: string, post: Omit<IPost, "id">): Promise<string> {
    try {
      const postsRef = doc(this.usersCollection, userId);
      const postsCollection = collection(postsRef, "posts");
      const newPostRef = doc(postsCollection);

      const newPost: IPost = {
        ...post,
        id: newPostRef.id,
        createdAt: new Date(),
        content: post.content,
        authorName: auth.currentUser?.displayName || "",
      };

      await setDoc(newPostRef, newPost);

      // Add post to allPosts collection
      await setDoc(doc(this.allPostsCollection, newPostRef.id), newPost);

      return newPostRef.id;
    } catch (error) {
      console.error("Error adding place:", error);
      throw error;
    }
  }

  async getFollowingPosts(userId: string): Promise<IPost[]> {
    try {
      const userDoc = doc(this.usersCollection, userId);
      const userDocSnap = await getDoc(userDoc);
      const userData = userDocSnap.data();

      if (!userData) {
        throw new Error("User not found");
      }

      const followingPosts: IPost[] = [];
      for (const followingId of userData.following) {
        const posts = await this.getPosts(followingId);
        followingPosts.push(...posts);
      }

      return followingPosts;
    } catch (error) {
      console.error("Error getting following posts:", error);
      throw error;
    }
  }
}

export const postsService = new PostsService();
