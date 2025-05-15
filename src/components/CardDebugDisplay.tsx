import React, { useEffect, useState } from "react";
import { Card } from "@/types/Card";
import { DisplayCase } from "@/types/display-case";
import { collection, getDocs, query, where, doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { useAuth } from "@/context/AuthContext";

export function CardDebugDisplay() {
  const [cards, setCards] = useState<Card[]>([]);
  const [displayCases, setDisplayCases] = useState<DisplayCase[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    async function fetchData() {
      if (!user?.uid) {
        setError("User not authenticated");
        setLoading(false);
        return;
      }

      try {
        // Fetch cards
        const cardPaths = [
          collection(db, "users", user.uid, "cards"),
          collection(db, "users", user.uid, "collection")
        ];
        
        let allCards: Card[] = [];
        
        // Try first path
        try {
          const cardsSnapshot = await getDocs(cardPaths[0]);
          console.log(`Debug: Found ${cardsSnapshot.docs.length} cards in users/${user.uid}/cards`);
          
          const cardsFromFirstPath = cardsSnapshot.docs.map(doc => ({
            ...doc.data(),
            id: doc.id,
            tags: doc.data().tags || [],
          } as Card));
          
          allCards = [...allCards, ...cardsFromFirstPath];
        } catch (error) {
          console.error("Error fetching from cards path:", error);
        }
        
        // Try second path
        try {
          const collectionSnapshot = await getDocs(cardPaths[1]);
          console.log(`Debug: Found ${collectionSnapshot.docs.length} cards in users/${user.uid}/collection`);
          
          const cardsFromSecondPath = collectionSnapshot.docs.map(doc => ({
            ...doc.data(),
            id: doc.id,
            tags: doc.data().tags || [],
          } as Card));
          
          // Merge all cards, avoiding duplicates by id
          cardsFromSecondPath.forEach(card => {
            if (!allCards.some(existingCard => existingCard.id === card.id)) {
              allCards.push(card);
            }
          });
        } catch (error) {
          console.error("Error fetching from collection path:", error);
        }

        // Fetch display cases
        const displayCasesRef = collection(db, "users", user.uid, "display_cases");
        const displayCasesSnapshot = await getDocs(displayCasesRef);
        const fetchedDisplayCases = displayCasesSnapshot.docs.map(doc => ({
          ...doc.data(),
          id: doc.id,
        } as DisplayCase));

        setCards(allCards);
        setDisplayCases(fetchedDisplayCases);
        setLoading(false);

        console.log("Debug: Cards count", allCards.length);
        console.log("Debug: Display cases count", fetchedDisplayCases.length);
        
        // Log sample data
        if (allCards.length > 0) {
          console.log("Debug: Sample card", allCards[0]);
        }
        
        if (fetchedDisplayCases.length > 0) {
          console.log("Debug: Sample display case", fetchedDisplayCases[0]);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        setError("Error fetching data. See console for details.");
        setLoading(false);
      }
    }

    fetchData();
  }, [user]);

  // Check if cards in display cases exist in the cards collection
  const analyzeDisplayCases = () => {
    return displayCases.map(displayCase => {
      const foundCardIds = displayCase.cardIds?.filter(id => 
        cards.some(card => card.id === id)
      ) || [];
      
      const missingCardIds = displayCase.cardIds?.filter(id => 
        !cards.some(card => card.id === id)
      ) || [];
      
      return {
        displayCase,
        foundCardIds,
        missingCardIds,
        matchPercentage: displayCase.cardIds?.length 
          ? Math.round((foundCardIds.length / displayCase.cardIds.length) * 100) 
          : 0
      };
    });
  };

  const analysis = analyzeDisplayCases();

  if (loading) {
    return <div className="p-4">Loading card data...</div>;
  }

  if (error) {
    return <div className="p-4 text-red-500">{error}</div>;
  }

  return (
    <div className="p-4 bg-white rounded shadow-lg">
      <h2 className="text-xl font-bold mb-4">Card Debug Display</h2>
      
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2">Summary</h3>
        <ul className="list-disc pl-6">
          <li>Total cards: <span className="font-medium">{cards.length}</span></li>
          <li>Total display cases: <span className="font-medium">{displayCases.length}</span></li>
          <li>Cards with images: <span className="font-medium">{cards.filter(card => card.imageUrl).length}</span></li>
        </ul>
      </div>
      
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2">Display Case Analysis</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse">
            <thead>
              <tr className="bg-gray-100">
                <th className="border px-4 py-2">Display Case</th>
                <th className="border px-4 py-2">Total Cards</th>
                <th className="border px-4 py-2">Found Cards</th>
                <th className="border px-4 py-2">Missing Cards</th>
                <th className="border px-4 py-2">Match %</th>
              </tr>
            </thead>
            <tbody>
              {analysis.map(item => (
                <tr key={item.displayCase.id}>
                  <td className="border px-4 py-2">{item.displayCase.name}</td>
                  <td className="border px-4 py-2">{item.displayCase.cardIds?.length || 0}</td>
                  <td className="border px-4 py-2">{item.foundCardIds.length}</td>
                  <td className="border px-4 py-2">{item.missingCardIds.length}</td>
                  <td className="border px-4 py-2">{item.matchPercentage}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      {displayCases.length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-2">Missing Card IDs</h3>
          {analysis.filter(item => item.missingCardIds.length > 0).map(item => (
            <div key={item.displayCase.id} className="mb-4">
              <h4 className="font-medium">{item.displayCase.name}</h4>
              <ul className="list-disc pl-6">
                {item.missingCardIds.map(id => (
                  <li key={id}>{id}</li>
                ))}
              </ul>
            </div>
          ))}
          {!analysis.some(item => item.missingCardIds.length > 0) && (
            <p className="text-green-600">No missing card IDs found!</p>
          )}
        </div>
      )}
      
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2">Card Image Check</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {cards.slice(0, 9).map(card => (
            <div key={card.id} className="border p-2 rounded">
              <p className="text-sm font-medium">{card.playerName}</p>
              <p className="text-xs text-gray-500 mb-2">ID: {card.id}</p>
              {card.imageUrl ? (
                <img 
                  src={card.imageUrl} 
                  alt={card.playerName} 
                  className="h-40 w-auto object-contain mx-auto"
                />
              ) : (
                <div className="h-40 bg-gray-200 flex items-center justify-center text-gray-500">
                  No image available
                </div>
              )}
              <div className="mt-2 text-xs">
                <p>Tags: {card.tags?.join(", ") || "None"}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 