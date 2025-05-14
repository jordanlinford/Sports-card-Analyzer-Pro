import { DisplayCase } from "@/types/display-case";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";

// Simple colored box to represent a card
const SimpleCardBox = ({ index }: { index: number }) => {
  // Different color palettes for variety
  const colorPalettes = [
    ["#0ea5e9", "#0284c7", "#0369a1"], // Blues
    ["#dc2626", "#b91c1c", "#991b1b"], // Reds
    ["#16a34a", "#15803d", "#166534"], // Greens
    ["#eab308", "#ca8a04", "#a16207"], // Yellows
    ["#7c3aed", "#6d28d9", "#5b21b6"]  // Purples
  ];
  
  // Select color palette and color based on the index
  const paletteIndex = index % colorPalettes.length;
  const colorIndex = Math.floor(Math.random() * 3);
  const backgroundColor = colorPalettes[paletteIndex][colorIndex];
  
  return (
    <div 
      style={{
        width: "80px",
        height: "120px",
        backgroundColor,
        borderRadius: "8px",
        border: "2px solid #333",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "white",
        fontWeight: "bold",
        fontSize: "14px",
        boxShadow: "0 2px 4px rgba(0,0,0,0.2)"
      }}
    >
      {index + 1}
    </div>
  );
};

interface DisplayCaseCardProps {
  displayCase: DisplayCase;
}

export default function DisplayCaseCard({ displayCase }: DisplayCaseCardProps) {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/display-case/${displayCase.id}`);
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return "";
    
    // Handle both Firestore Timestamp objects and regular Date objects
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return format(date, "MMM d, yyyy");
  };

  return (
    <div 
      className="rounded-2xl border p-4 shadow hover:shadow-lg transition cursor-pointer"
      onClick={handleClick}
    >
      <h3 className="text-lg font-semibold mb-1">{displayCase.name}</h3>
      <p className="text-sm text-muted-foreground mb-2">
        Created on {formatDate(displayCase.createdAt)}
      </p>

      {displayCase.tags && displayCase.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-2">
          {displayCase.tags.map((tag) => (
            <span
              key={tag}
              className="px-2 py-1 text-xs bg-muted rounded-full text-muted-foreground"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}

      {/* Display simple colored boxes instead of SVG cards */}
      <div className="h-32 relative border-t mt-2 pt-2 mb-2">
        <div className="flex gap-2 overflow-x-auto pb-2">
          {/* Use simple colored boxes for each card */}
          {Array.from({ length: Math.min(displayCase.cardIds?.length || 3, 3) }).map((_, idx) => (
            <div key={idx} className="mr-2">
              <SimpleCardBox index={idx} />
            </div>
          ))}
          
          {/* Show the +X indicator if more than 3 cards */}
          {(displayCase.cardIds?.length || 0) > 3 && (
            <div className="flex items-center justify-center h-24 w-16 bg-muted rounded-lg">
              <span className="text-sm text-muted-foreground">+{(displayCase.cardIds?.length || 0) - 3}</span>
            </div>
          )}
        </div>
      </div>
      
      {/* Stats display */}
      <div className="flex items-center space-x-4 mt-4 text-sm text-gray-500">
        <span title="Likes">❤️ {displayCase.likes || 0}</span>
        <span title="Comments">💬 {displayCase.comments?.length || 0}</span>
        <span title="Views">👁️ {displayCase.visits || 0}</span>
      </div>
    </div>
  );
} 