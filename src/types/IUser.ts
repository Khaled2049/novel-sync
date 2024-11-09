import { User as FirebaseUser } from "firebase/auth";

export interface IUser extends FirebaseUser {
  username: string;
  followers: string[];
  following: string[];
  createdAt: string;
  lastLogin: string;
  stories: string[];
  likedPosts: string[];
  savedPosts: string[];
}
