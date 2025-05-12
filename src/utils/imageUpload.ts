// Utility functions for image upload should go here.
// (This file previously contained a misplaced React component.)

import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { auth } from '../lib/firebase';

// Uploads an image to Firebase Storage and returns the download URL
export async function uploadImage(file: File, userId: string): Promise<string> {
  const storage = getStorage();
  const imageRef = ref(storage, `cards/${userId}/${Date.now()}-${file.name}`);
  await uploadBytes(imageRef, file);
  const url = await getDownloadURL(imageRef);
  return url;
}

// Example placeholder:
// export async function uploadImage(file: File, userId: string): Promise<string> {
//   // ...upload logic...
//   return imageUrl;
// }

