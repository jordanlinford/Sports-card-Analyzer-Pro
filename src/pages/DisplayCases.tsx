import { useState } from 'react';
import { useDisplayCases } from '@/hooks/display/useDisplayCases';
import { CreateDisplayCaseModal } from '@/components/display-cases/CreateDisplayCaseModal';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useNavigate } from 'react-router-dom';
import { DisplayCaseDebugger } from '@/components/display-cases/DisplayCaseDebugger';

export default function DisplayCases() {
  const { displayCases, isLoading } = useDisplayCases();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [showDebugger, setShowDebugger] = useState(false);
  const navigate = useNavigate();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">Display Cases</h1>
        <div className="flex gap-2">
          <Button onClick={() => setIsCreateModalOpen(true)}>
            Create New
          </Button>
          <Button 
            variant="outline" 
            onClick={() => setShowDebugger(!showDebugger)}
          >
            {showDebugger ? "Hide Debugger" : "Debug Tools"}
          </Button>
        </div>
      </div>

      {showDebugger && (
        <div className="mb-6">
          <DisplayCaseDebugger />
        </div>
      )}

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-48 rounded-lg" />
          ))}
        </div>
      ) : displayCases?.length === 0 ? (
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold text-gray-600 mb-4">
            No display cases yet
          </h2>
          <p className="text-gray-500 mb-6">
            Create your first display case to showcase your favorite cards
          </p>
          <Button onClick={() => setIsCreateModalOpen(true)}>
            Create Display Case
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayCases?.map((displayCase) => (
            <div
              key={displayCase.id}
              className="border rounded-lg p-4 hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => navigate(`/display-case/${displayCase.id}`)}
            >
              <h2 className="text-xl font-semibold mb-2">{displayCase.name}</h2>
              <p className="text-gray-500">
                {displayCase.cardIds.length} cards
              </p>
              <div className="mt-4 flex justify-between items-center">
                <span className="text-sm text-gray-500">
                  {displayCase.isPublic ? "Public" : "Private"}
                </span>
                <span className="text-sm text-gray-500">
                  Created {new Date(displayCase.createdAt.toDate()).toLocaleDateString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      <CreateDisplayCaseModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />
    </div>
  );
} 