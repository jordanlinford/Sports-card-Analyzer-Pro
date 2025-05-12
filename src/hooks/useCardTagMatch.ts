import { useState, useEffect } from 'react';
import { Card } from '@/types/Card';
import { DisplayCase } from '@/types/display-case';

/**
 * A hook that provides robust card matching for display cases,
 * handling various tag structure issues that might exist in the database
 */
export function useCardTagMatch(cards: Card[], displayCase: DisplayCase | null) {
  const [matchingCards, setMatchingCards] = useState<Card[]>([]);
  const [cardImageUrls, setCardImageUrls] = useState<string[]>([]);
  const [hasMatches, setHasMatches] = useState(false);

  useEffect(() => {
    if (!displayCase || !cards.length) {
      setMatchingCards([]);
      setCardImageUrls([]);
      setHasMatches(false);
      return;
    }

    // Ensure we have valid display case tags
    const displayCaseTags = Array.isArray(displayCase.tags) ? displayCase.tags : [];
    
    // If no tags, return empty results
    if (displayCaseTags.length === 0) {
      console.log(`Display case ${displayCase.name} has no tags, not showing any cards`);
      setMatchingCards([]);
      setCardImageUrls([]);
      setHasMatches(false);
      return;
    }
    
    console.log(`Finding matching cards for display case: ${displayCase.name}`);
    console.log(`Display case tags: ${JSON.stringify(displayCaseTags)}`);
    
    // Find cards matching any tag
    const matched = cards.filter(card => {
      // Ensure card.tags is an array
      const cardTags = Array.isArray(card.tags) ? card.tags : [];
      
      // Skip cards with no tags
      if (cardTags.length === 0) return false;
      
      // Check if any card tag matches any display case tag
      return cardTags.some(tag => displayCaseTags.includes(tag));
    });
    
    console.log(`Found ${matched.length} matching cards for ${displayCase.name}`);
    
    // Get image URLs
    const cardImages = matched.slice(0, 4).map(card => 
      card.imageUrl || "https://via.placeholder.com/300x420?text=No+Image"
    );
    
    // If no matches, use fallback method
    if (matched.length === 0) {
      console.log("No matching cards found, using fallback (show any card)");
      
      // Fallback: just use the first few cards
      const fallbackCards = cards.slice(0, 4);
      const fallbackImages = fallbackCards.map(card => 
        card.imageUrl || "https://via.placeholder.com/300x420?text=No+Image"
      );
      
      setMatchingCards(fallbackCards);
      setCardImageUrls(fallbackImages);
      setHasMatches(false);
    } else {
      setMatchingCards(matched);
      setCardImageUrls(cardImages);
      setHasMatches(true);
    }
  }, [cards, displayCase]);

  return { matchingCards, cardImageUrls, hasMatches };
} 