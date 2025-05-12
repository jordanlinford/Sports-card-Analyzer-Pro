import { useState, useEffect } from 'react';
import { DirectFixer } from './DirectFixer';
import { Button } from '@/components/ui/button';
import { db } from '@/lib/firebase/config';
import { doc, getDoc } from 'firebase/firestore';

interface DisplayCaseLoadingProps {
  publicId: string | undefined;
  isLoading: boolean;
  isRecovering: boolean;
  onManualFix: () => void;
}

export function DisplayCaseLoading({ 
  publicId, 
  isLoading, 
  isRecovering,
  onManualFix
}: DisplayCaseLoadingProps) {
  const [loadingTimeout, setLoadingTimeout] = useState(false);
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const [showDebugInfo, setShowDebugInfo] = useState(false);

  // Set a timeout for loading
  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;
    
    if (isLoading) {
      console.log("DisplayCaseLoading: Setting up loading timeout");
      timer = setTimeout(() => {
        console.log("DisplayCaseLoading: Loading timeout reached, showing recovery options");
        setLoadingTimeout(true);
      }, 5000); // 5 seconds instead of 8
    } else {
      setLoadingTimeout(false);
    }
    
    return () => {
      if (timer) {
        console.log("DisplayCaseLoading: Clearing loading timeout");
        clearTimeout(timer);
      }
    };
  }, [isLoading]);

  const fetchDebugInfo = async () => {
    if (!publicId) return;
    
    try {
      console.log("DisplayCaseLoading: Fetching debug info for display case:", publicId);
      const publicDocRef = doc(db, 'public_display_cases', publicId);
      const publicDoc = await getDoc(publicDocRef);
      
      // Check both public and regular display case collections
      let regularData = null;
      try {
        const regularRef = doc(db, 'displayCases', publicId);
        const regularDoc = await getDoc(regularRef);
        if (regularDoc.exists()) {
          regularData = regularDoc.data();
        }
      } catch (error) {
        console.error("Error fetching from regular collection:", error);
      }
      
      const info = {
        exists: publicDoc.exists(),
        data: publicDoc.exists() ? publicDoc.data() : null,
        cardIds: publicDoc.exists() ? publicDoc.data().cardIds : null,
        regularExists: regularData !== null,
        regularData: regularData,
        timestamp: new Date().toISOString()
      };
      
      setDebugInfo(info);
      setShowDebugInfo(true);
      console.log("DisplayCaseLoading: Debug info:", info);
    } catch (error) {
      console.error("DisplayCaseLoading: Error fetching debug info:", error);
      setDebugInfo({ error: String(error) });
    }
  };

  if (isRecovering) {
    return (
      <div className="text-center mt-10">
        <div className="animate-spin h-8 w-8 border-4 border-blue-500 rounded-full border-t-transparent inline-block mb-2"></div>
        <p>Attempting to recover display case...</p>
      </div>
    );
  }

  if (isLoading) {
    if (loadingTimeout && publicId) {
      return (
        <div className="text-center mt-10 p-6 max-w-lg mx-auto bg-white rounded-xl shadow-sm">
          <h2 className="text-xl font-semibold mb-4">Taking longer than expected</h2>
          <p className="text-gray-500 mb-4">
            We're having trouble loading this display case. Would you like to try to fix it?
          </p>
          <div className="space-y-4">
            <Button 
              onClick={onManualFix} 
              variant="outline"
            >
              Try Auto-Fix
            </Button>
            
            <Button 
              onClick={fetchDebugInfo} 
              variant="outline"
              className="ml-2"
            >
              Show Debug Info
            </Button>
            
            {showDebugInfo && debugInfo && (
              <div className="mt-4 p-3 text-left text-xs font-mono bg-gray-100 rounded-md overflow-auto max-h-60">
                <pre>{JSON.stringify(debugInfo, null, 2)}</pre>
              </div>
            )}
            
            {publicId && (
              <div className="mt-6 border-t pt-4">
                <h3 className="font-medium mb-2">Advanced Options</h3>
                <DirectFixer displayCaseId={publicId} />
              </div>
            )}
          </div>
        </div>
      );
    }

    return (
      <div className="text-center mt-10">
        <div className="animate-spin h-8 w-8 border-4 border-blue-500 rounded-full border-t-transparent inline-block mb-2"></div>
        <p>Loading display case...</p>
      </div>
    );
  }

  return null;
} 