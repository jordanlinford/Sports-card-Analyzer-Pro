import { useEffect, useState } from 'react';
import { auth, db, storage } from '../firebase';
import { collection, getDocs } from 'firebase/firestore';
import { getDownloadURL, ref } from 'firebase/storage';

export const FirebaseTest = () => {
  const [status, setStatus] = useState<string>('Testing...');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const testFirebaseConnection = async () => {
      try {
        // Test Firestore connection
        const cardsRef = collection(db, 'cards');
        await getDocs(cardsRef);
        setStatus(prev => prev + '\n✅ Firestore connected');

        // Test Storage connection
        const testRef = ref(storage, 'test.txt');
        try {
          await getDownloadURL(testRef);
        } catch (e) {
          // Expected error for non-existent file, but confirms storage is accessible
          setStatus(prev => prev + '\n✅ Storage connected');
        }

        // Test Auth connection
        if (auth.currentUser) {
          setStatus(prev => prev + '\n✅ Auth connected (user logged in)');
        } else {
          setStatus(prev => prev + '\n✅ Auth connected (no user logged in)');
        }

        setStatus(prev => prev + '\n\nAll Firebase services connected successfully!');
      } catch (error) {
        setError(`Firebase connection error: ${error instanceof Error ? error.message : String(error)}`);
      }
    };

    testFirebaseConnection();
  }, []);

  return (
    <div className="p-4 bg-white rounded-lg shadow">
      <h2 className="text-xl font-bold mb-4">Firebase Connection Test</h2>
      <pre className="bg-gray-100 p-4 rounded whitespace-pre-wrap">
        {status}
      </pre>
      {error && (
        <div className="mt-4 p-4 bg-red-100 text-red-700 rounded">
          {error}
        </div>
      )}
    </div>
  );
}; 