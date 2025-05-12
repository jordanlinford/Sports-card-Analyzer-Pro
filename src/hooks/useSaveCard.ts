import { useMutation, useQueryClient } from "@tanstack/react-query";
import { getAuth } from "firebase/auth";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { Card } from "@/types/Card";
import { toast } from "sonner";

async function saveCard(cardData: Omit<Card, "id" | "createdAt" | "updatedAt" | "ownerId">) {
  const auth = getAuth();
  const user = auth.currentUser;

  if (!user) {
    throw new Error("User not authenticated");
  }

  const userCardsRef = collection(db, "users", user.uid, "cards");

  const docRef = await addDoc(userCardsRef, {
    ...cardData,
    ownerId: user.uid,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  return {
    id: docRef.id,
    ...cardData,
    ownerId: user.uid,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

export function useSaveCard() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: saveCard,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cards"] });
      toast.success("Card saved successfully");
    },
    onError: (error) => {
      console.error("Error saving card:", error);
      toast.error("Failed to save card");
    },
  });
} 