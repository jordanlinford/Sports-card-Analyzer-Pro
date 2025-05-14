import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { collection, query, where, getDocs, deleteDoc, doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { DisplayCase } from "@/types/display-case";
import { useAuth } from "@/context/AuthContext";
import { createDisplayCase as createDisplayCaseFn, likeDisplayCase as likeDisplayCaseFn, commentOnDisplayCase as commentOnDisplayCaseFn } from "@/lib/firebase/display-cases";

export function useDisplayCases() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const queryKey = ["displayCases", user?.uid];

  const { data: displayCases, isLoading, refetch } = useQuery<DisplayCase[]>({
    queryKey,
    queryFn: async () => {
      if (!user) return [];
      
      console.log("Fetching display cases for user:", user.uid);
      
      // Get display cases from user's collection
      const displayCasesRef = collection(db, "users", user.uid, "display_cases");
      const querySnapshot = await getDocs(displayCasesRef);
      
      const cases = await Promise.all(querySnapshot.docs.map(async (docSnapshot) => {
        const displayCase = {
          ...docSnapshot.data(),
          id: docSnapshot.id,
        } as DisplayCase;
        
        // Also check for public version to get the most up-to-date stats
        try {
          const publicRef = doc(db, "public_display_cases", docSnapshot.id);
          const publicSnapshot = await getDoc(publicRef);
          
          if (publicSnapshot.exists()) {
            const publicData = publicSnapshot.data();
            
            // Use the public stats if they exist
            return {
              ...displayCase,
              likes: publicData.likes || displayCase.likes || 0,
              comments: publicData.comments || displayCase.comments || [],
              visits: publicData.visits || displayCase.visits || 0
            } as DisplayCase;
          }
        } catch (error) {
          console.error("Error fetching public display case:", error);
        }
        
        return displayCase;
      }));
      
      console.log("Fetched display cases:", cases.length);
      return cases;
    },
    enabled: !!user,
    staleTime: 30 * 1000, // Consider data stale after 30 seconds
    refetchOnWindowFocus: true, // Refresh when window regains focus
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

  // Like Display Case mutation
  const likeMutation = useMutation({
    mutationFn: async (displayCaseId: string) => {
      if (!user) throw new Error('User must be authenticated to like a display case');
      await likeDisplayCaseFn(user.uid, displayCaseId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });

  // Comment on Display Case mutation
  const commentMutation = useMutation({
    mutationFn: async ({ displayCaseId, comment }: { displayCaseId: string; comment: { user: string; text: string; createdAt: any } }) => {
      if (!user) throw new Error('User must be authenticated to comment on a display case');
      await commentOnDisplayCaseFn(user.uid, displayCaseId, comment);
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
    likeDisplayCase: likeMutation.mutate,
    commentOnDisplayCase: (displayCaseId: string, comment: { user: string; text: string; createdAt: any }) => commentMutation.mutate({ displayCaseId, comment }),
  };
} 