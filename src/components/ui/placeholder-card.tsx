import { cn } from "@/lib/utils";

interface PlaceholderCardProps {
  className?: string;
}

export function PlaceholderCard({ className }: PlaceholderCardProps) {
  return (
    <div className={cn("relative aspect-[2/3] rounded-lg border bg-muted overflow-hidden", className)}>
      {/* Baseball diamond design */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="relative w-24 h-24">
          {/* Home plate */}
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-4 bg-muted-foreground/20 rotate-45" />
          
          {/* Base lines */}
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-24 bg-muted-foreground/20" />
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-24 h-1 bg-muted-foreground/20" />
          
          {/* Bases */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-4 h-4 bg-muted-foreground/20" />
          <div className="absolute bottom-0 left-0 w-4 h-4 bg-muted-foreground/20" />
          <div className="absolute bottom-0 right-0 w-4 h-4 bg-muted-foreground/20" />
        </div>
      </div>
      
      {/* Card text */}
      <div className="absolute bottom-4 left-4 right-4 text-center">
        <div className="text-xs text-muted-foreground">No Image Available</div>
      </div>
    </div>
  );
} 