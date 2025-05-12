import { useQuery } from "@tanstack/react-query";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { useAuth } from "@/context/AuthContext";
import { SavedSearch } from "@/types/search";

export function useSavedSearches() {
  const { user } = useAuth();

  return useQuery<SavedSearch[]>({
    queryKey: ["savedSearches", user?.uid],
    queryFn: async () => {
      if (!user) return [];
      
      const q = query(
        collection(db, "users", user.uid, "saved_searches"),
        where("userId", "==", user.uid)
      );
      
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as SavedSearch[];
    },
    enabled: !!user,
  });
} 