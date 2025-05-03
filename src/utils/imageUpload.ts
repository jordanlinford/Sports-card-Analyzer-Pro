import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../firebase';

export const uploadImage = async (file: File, userId: string): Promise<string> => {
  try {
    // Create a unique file path with user ID and timestamp
    const filePath = `cardImages/${userId}/${Date.now()}_${file.name}`;
    const storageRef = ref(storage, filePath);
    
    // Upload the file
    await uploadBytes(storageRef, file);
    
    // Get the download URL
    const downloadURL = await getDownloadURL(storageRef);
    
    return downloadURL;
  } catch (error) {
    console.error('Error uploading image:', error);
    throw error;
  }
}; 