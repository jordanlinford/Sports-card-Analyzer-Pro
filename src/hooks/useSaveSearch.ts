import { useMutation, useQueryClient } from "@tanstack/react-query";
import { doc, setDoc, serverTimestamp, addDoc, collection } from "firebase/firestore";
import { db } from "../lib/firebase/config";
import { toast } from "sonner";
import { getAuth } from "firebase/auth";

interface SearchData {
  playerName: string;
  year?: string;
  cardSet?: string;
  variation?: string;
  cardNumber?: string;
  condition: string;
  price: number | null;
}

async function saveSearch(searchData: SearchData) {
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

export function useSaveSearch() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: saveSearch,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["searches"] });
      toast.success("Search saved successfully");
    },
    onError: (error) => {
      console.error("Error saving search:", error);
      toast.error("Failed to save search");
    },
  });
} 