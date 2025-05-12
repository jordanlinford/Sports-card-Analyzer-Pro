import { useEffect } from "react";
import { useDisplayCases } from "@/hooks/display/useDisplayCases";
import { useAuth } from "@/context/AuthContext";
import { CardGrid } from "@/components/cards/CardGrid";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

const themeStyles = {
  wood: "bg-amber-50 border-amber-200",
  velvet: "bg-purple-50 border-purple-200",
  glass: "bg-blue-50 border-blue-200",
} as const;

export default function MyDisplayCases() {
  const { user } = useAuth();
  const {
    displayCases,
    isLoading,
    deleteDisplayCase,
    refetch,
  } = useDisplayCases();

  useEffect(() => {
    if (user) refetch();
  }, [user, refetch]);

  const handleDelete = async (id: string) => {
    try {
      await deleteDisplayCase(id);
      toast.success("Display case deleted");
    } catch {
      toast.error("Failed to delete display case");
    }
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <Skeleton className="h-8 w-48 mb-4" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-[200px] w-full rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="p-6">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Not logged in</AlertTitle>
          <AlertDescription>
            Please log in to view your display cases.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">My Display Cases</h1>
      
      {!isLoading && (!displayCases || displayCases.length === 0) && (
        <div className="text-center py-12 text-muted-foreground">
          You have no display cases yet.
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {displayCases?.map((dc) => (
          <div 
            key={dc.id} 
            className={cn(
              "border rounded-xl p-4 relative overflow-hidden",
              themeStyles[dc.theme]
            )}
          >
            <div className="absolute top-2 right-2 space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleDelete(dc.id)}
                className="hover:bg-destructive/10 hover:text-destructive"
              >
                Delete
              </Button>
            </div>
            
            <h2 className="text-lg font-semibold mb-2">{dc.name}</h2>
            
            {dc.tags && dc.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-4">
                {dc.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-xs bg-white/50 px-2 py-1 rounded-full border"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}

            <div className="bg-white rounded-lg p-2">
              <CardGrid cards={dc.cardIds} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 