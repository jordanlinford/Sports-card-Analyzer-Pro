import { collection, addDoc, getDocs, query, where, orderBy, doc, getDoc, updateDoc, increment } from "firebase/firestore";
import { db } from "./config";
import { DisplayCase, CreateDisplayCaseData } from "@/types/display-case";
import { getAuth } from "firebase/auth";

export async function createDisplayCase(data: CreateDisplayCaseData): Promise<string> {
  const auth = getAuth();
  const user = auth.currentUser;
  
  if (!user) {
    throw new Error("User must be authenticated to create a display case");
  }

  console.log("createDisplayCase: Creating display case with data:", data);
  const displayCasesRef = collection(db, "users", user.uid, "display_cases");
  const docRef = await addDoc(displayCasesRef, {
    ...data,
    userId: user.uid,
    createdAt: new Date(),
  });

  console.log("createDisplayCase: Display case created with ID:", docRef.id);
  return docRef.id;
}

export async function updateDisplayCase(id: string, data: Partial<DisplayCase>): Promise<void> {
  const auth = getAuth();
  const user = auth.currentUser;
  
  if (!user) {
    throw new Error("User must be authenticated to update a display case");
  }

  console.log("updateDisplayCase: Updating display case", id, "with data:", data);
  const displayCaseRef = doc(db, "users", user.uid, "display_cases", id);
  
  await updateDoc(displayCaseRef, {
    ...data,
    updatedAt: new Date(),
  });
  
  console.log("updateDisplayCase: Display case updated successfully");
}

export async function getUserDisplayCases(userId: string): Promise<DisplayCase[]> {
  const displayCasesRef = collection(db, "users", userId, "display_cases");
  const q = query(displayCasesRef, orderBy("createdAt", "desc"));
  const snapshot = await getDocs(q);
  
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
  })) as DisplayCase[];
}

export async function getDisplayCase(userId: string, displayCaseId: string): Promise<DisplayCase | null> {
  const docRef = doc(db, "users", userId, "display_cases", displayCaseId);
  const docSnap = await getDoc(docRef);
  
  if (!docSnap.exists()) {
    return null;
  }

  return {
    id: docSnap.id,
    ...docSnap.data(),
  } as DisplayCase;
}

export async function likeDisplayCase(userId: string, displayCaseId: string): Promise<void> {
  const displayCaseRef = doc(db, "users", userId, "display_cases", displayCaseId);
  
  // Use Firestore's increment operation to atomically update the likes count
  await updateDoc(displayCaseRef, {
    likes: increment(1),
    updatedAt: new Date()
  });
  
  // Check if a public version exists and update it as well
  try {
    const publicDisplayCaseRef = doc(db, "public_display_cases", displayCaseId);
    const publicDocSnap = await getDoc(publicDisplayCaseRef);
    
    if (publicDocSnap.exists()) {
      await updateDoc(publicDisplayCaseRef, {
        likes: increment(1),
        updatedAt: new Date()
      });
    }
  } catch (error) {
    console.error("Error updating public display case likes:", error);
  }
}

export async function commentOnDisplayCase(userId: string, displayCaseId: string, comment: { user: string; text: string; createdAt: any }): Promise<void> {
  const displayCaseRef = doc(db, "users", userId, "display_cases", displayCaseId);
  const docSnap = await getDoc(displayCaseRef);
  
  // Make sure we have valid data
  if (!docSnap.exists()) {
    throw new Error(`Display case with ID ${displayCaseId} not found`);
  }
  
  const displayCaseData = docSnap.data();
  const prevComments = displayCaseData?.comments || [];
  
  // Update the user's display case
  await updateDoc(displayCaseRef, {
    comments: [...prevComments, comment],
    updatedAt: new Date()
  });
  
  // Check if a public version exists and update it as well
  try {
    const publicDisplayCaseRef = doc(db, "public_display_cases", displayCaseId);
    const publicDocSnap = await getDoc(publicDisplayCaseRef);
    
    if (publicDocSnap.exists()) {
      const publicDisplayCaseData = publicDocSnap.data();
      const publicPrevComments = publicDisplayCaseData?.comments || [];
      
      await updateDoc(publicDisplayCaseRef, {
        comments: [...publicPrevComments, comment],
        updatedAt: new Date()
      });
    }
  } catch (error) {
    console.error("Error updating public display case comments:", error);
  }
}

export async function incrementDisplayCaseVisit(userId: string, displayCaseId: string): Promise<void> {
  // Update the private display case
  const displayCaseRef = doc(db, "users", userId, "display_cases", displayCaseId);
  await updateDoc(displayCaseRef, {
    visits: increment(1),
    updatedAt: new Date()
  });
  
  // Check if a public version exists and update it as well
  try {
    const publicDisplayCaseRef = doc(db, "public_display_cases", displayCaseId);
    const publicDocSnap = await getDoc(publicDisplayCaseRef);
    
    if (publicDocSnap.exists()) {
      await updateDoc(publicDisplayCaseRef, {
        visits: increment(1),
        updatedAt: new Date()
      });
    }
  } catch (error) {
    console.error("Error updating public display case visits:", error);
  }
} 