import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { CardGrid } from "@/components/cards/CardGrid";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { DisplayCase } from "@/types/display-case";
import { cn } from "@/lib/utils";

const themeStyles = {
  wood: "bg-amber-50 border-amber-200",
  velvet: "bg-purple-50 border-purple-200",
  glass: "bg-blue-50 border-blue-200",
} as const;

export default function PublicDisplayCasePage() {
  const { id } = useParams<{ id: string }>();
  const [caseData, setCaseData] = useState<DisplayCase | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchDisplayCase() {
      if (!id) {
        setError("No display case ID provided");
        setLoading(false);
        return;
      }

      try {
        const ref = doc(db, "public_display_cases", id);
        const snap = await getDoc(ref);
        
        if (!snap.exists()) {
          throw new Error("Display case not found");
        }

        setCaseData({
          ...snap.data(),
          id: snap.id,
        } as DisplayCase);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load display case");
      } finally {
        setLoading(false);
      }
    }

    fetchDisplayCase();
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <Skeleton className="h-8 w-64 mb-4" />
        <Skeleton className="h-4 w-48 mb-6" />
        <Skeleton className="h-[60vh] w-full" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!caseData) return null;

  return (
    <div className={cn(
      "min-h-screen py-8",
      themeStyles[caseData.theme]
    )}>
      <div className="max-w-6xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h1 className="text-3xl font-bold mb-4">{caseData.name}</h1>
          <p className="text-sm text-muted-foreground mb-2">
            Created on {new Date(caseData.createdAt?.seconds * 1000).toLocaleDateString()}
          </p>

          {caseData.tags && caseData.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {caseData.tags.map((tag) => (
                <span
                  key={tag}
                  className="text-xs bg-muted px-2 py-1 rounded-full border"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {caseData.description && (
            <p className="text-muted-foreground mb-6">{caseData.description}</p>
          )}
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <CardGrid cards={caseData.cardIds} />
        </div>
      </div>
    </div>
  );
} 