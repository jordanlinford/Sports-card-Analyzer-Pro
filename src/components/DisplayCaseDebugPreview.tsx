import React from "react";

// Ultra-simplified component that just shows colored boxes instead of card images
export function DisplayCaseDebugPreview({ cardIds }: { cardIds?: string[] }) {
  // Default to 3 cards if no cardIds provided, otherwise use the actual length
  const numCards = Math.min(cardIds?.length || 3, 6);
  
  // Simple color palette
  const colors = [
    { bg: "#2563eb", text: "white" },   // Blue
    { bg: "#dc2626", text: "white" },   // Red
    { bg: "#16a34a", text: "white" },   // Green
    { bg: "#ea580c", text: "white" },   // Orange
    { bg: "#8b5cf6", text: "white" },   // Purple
    { bg: "#0d9488", text: "white" }    // Teal
  ];
  
  return (
    <div className="p-2">
      <div className="text-sm font-medium mb-2">
        {cardIds?.length ? `${cardIds.length} cards in this display case` : "No cards in this display case yet"}
      </div>
      
      {numCards > 0 ? (
        <div className="grid grid-cols-3 gap-2">
          {Array.from({ length: numCards }).map((_, idx) => {
            const color = colors[idx % colors.length];
            
            return (
              <div 
                key={idx}
                style={{
                  backgroundColor: color.bg,
                  color: color.text,
                  aspectRatio: '3/4',
                  borderRadius: '4px',
                  padding: '4px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  fontSize: '10px',
                  fontWeight: 'bold',
                  textAlign: 'center',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)'
                }}
              >
                <div style={{ fontSize: '8px' }}>Card {idx + 1}</div>
                <div style={{ fontSize: '14px' }}>#{idx + 1}</div>
                <div style={{ fontSize: '8px' }}>View Details</div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="p-4 text-center text-gray-500">No cards to display</div>
      )}
    </div>
  );
} 