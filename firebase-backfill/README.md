# Firebase ownerId Backfill Script

This script adds or corrects the `ownerId` field on all cards in your Firebase database to ensure they match the user who owns them. This is essential for card deletion to work properly with Firebase security rules.

## Setup Instructions

1. Place your Firebase service account key in this directory:
   - Go to Firebase Console > Project Settings > Service Accounts
   - Click "Generate new private key"
   - Save the JSON file as `serviceAccountKey.json` in this directory

2. Install dependencies:
   ```
   npm install
   ```

3. Run the script:
   ```
   npm start
   ```

## What This Script Does

1. Finds all users in your database
2. For each user, checks their cards in `/users/{userId}/collection/{cardId}`
3. Adds or corrects the `ownerId` field to match the user ID
4. Also updates matching cards in the global `/cards/{cardId}` collection
5. Logs all changes made

After running this script, card deletion should work properly since the security rules can verify the user is the owner of the card they're trying to delete. 