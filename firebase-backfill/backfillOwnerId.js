// backfillOwnerId.js
import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import serviceAccount from './serviceAccountKey.json'; // Replace with your key path

initializeApp({
  credential: cert(serviceAccount)
});

const db = getFirestore();

async function backfillOwnerIds() {
  const usersSnapshot = await db.collection('users').listDocuments();

  for (const userDocRef of usersSnapshot) {
    const userId = userDocRef.id;

    const collectionRef = db.collection(`users/${userId}/collection`);
    const cardDocs = await collectionRef.get();

    console.log(`🧾 Checking cards for user ${userId}...`);

    for (const cardDoc of cardDocs.docs) {
      const cardData = cardDoc.data();
      const cardId = cardDoc.id;

      // If ownerId is missing or incorrect
      if (!cardData.ownerId || cardData.ownerId !== userId) {
        await cardDoc.ref.update({ ownerId: userId });
        console.log(`✅ Updated ownerId on user card: ${cardId}`);
      }

      // Also check global /cards collection
      const globalCardRef = db.collection('cards').doc(cardId);
      const globalCardSnap = await globalCardRef.get();

      if (globalCardSnap.exists) {
        const globalCardData = globalCardSnap.data();
        if (!globalCardData.ownerId || globalCardData.ownerId !== userId) {
          await globalCardRef.update({ ownerId: userId });
          console.log(`🌐 Updated ownerId on global card: ${cardId}`);
        }
      }
    }
  }

  console.log('🎉 All cards processed.');
}

backfillOwnerIds().catch((err) => {
  console.error('🔥 Error during backfill:', err);
}); 