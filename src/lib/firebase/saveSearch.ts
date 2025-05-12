import { getAuth } from "firebase/auth";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "./config";
import { SearchData } from "@/types/search";

export async function saveSearch(searchData: SearchData) {
  const auth = getAuth();
  const user = auth.currentUser;

  if (!user) {
    throw new Error("User not authenticated");
  }

  const docRef = await addDoc(collection(db, "savedSearches"), {
    ...searchData,
    userId: user.uid,
    timestamp: serverTimestamp(),
  });

  return docRef.id;
} 