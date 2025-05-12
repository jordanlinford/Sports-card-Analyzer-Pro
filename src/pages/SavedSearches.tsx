import { useSavedSearches } from '@/lib/hooks/useSavedSearches'
import { SavedSearchCard } from '@/components/SavedSearchCard'
import { Card, CardContent } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Skeleton } from '@/components/ui/skeleton'

export default function SavedSearchesPage() {
  const { data, isLoading, isError } = useSavedSearches()

  return (
    <ScrollArea className="p-4 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4 text-zinc-800 dark:text-zinc-100">Saved Searches</h1>
      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="p-4">
              <CardContent className="flex flex-col gap-2">
                <Skeleton className="h-6 w-1/2" />
                <Skeleton className="h-4 w-1/3" />
                <Skeleton className="h-4 w-1/4" />
                <div className="flex gap-2 mt-4">
                  <Skeleton className="h-8 w-1/2" />
                  <Skeleton className="h-8 w-1/2" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      {isError && (
        <div className="text-red-500 p-4 rounded-lg bg-red-50 dark:bg-red-900/20">
          Failed to load saved searches. Please try again later.
        </div>
      )}
      {!isLoading && data && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {data.map((search) => (
            <SavedSearchCard 
              key={search.id} 
              search={search}
              onEdit={() => console.log("Edit:", search)}
              onDelete={() => console.log("Delete:", search)}
            />
          ))}
        </div>
      )}
      {!isLoading && data && data.length === 0 && (
        <div className="text-center p-8 text-zinc-500 dark:text-zinc-400">
          You haven't saved any searches yet.
        </div>
      )}
    </ScrollArea>
  )
} 