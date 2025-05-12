import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { collection, query, where, getDocs, deleteDoc, doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { DisplayCase } from "@/types/display-case";
import { useAuth } from "@/context/AuthContext";
import { createDisplayCase as createDisplayCaseFn } from "@/lib/firebase/display-cases";

export function useDisplayCases() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const queryKey = ["displayCases", user?.uid];

  const { data: displayCases, isLoading, refetch } = useQuery<DisplayCase[]>({
    queryKey,
    queryFn: async () => {
      if (!user) return [];
      const displayCasesRef = collection(db, "users", user.uid, "display_cases");
      const querySnapshot = await getDocs(displayCasesRef);
      return querySnapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id,
      })) as DisplayCase[];
    },
    enabled: !!user,
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await deleteDoc(doc(db, "users", user!.uid, "display_cases", id));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });

  // Create Display Case mutation
  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      return createDisplayCaseFn(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });

  // Update Display Case mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string, data: Partial<DisplayCase> }) => {
      if (!user) throw new Error("User must be authenticated to update a display case");
      const displayCaseRef = doc(db, "users", user.uid, "display_cases", id);
      await updateDoc(displayCaseRef, {
        ...data,
        updatedAt: new Date()
      });
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });

  return {
    displayCases,
    isLoading,
    deleteDisplayCase: deleteMutation.mutate,
    createDisplayCase: createMutation.mutateAsync,
    updateDisplayCase: (id: string, data: Partial<DisplayCase>) => 
      updateMutation.mutateAsync({ id, data }),
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    refetch,
  };
} 