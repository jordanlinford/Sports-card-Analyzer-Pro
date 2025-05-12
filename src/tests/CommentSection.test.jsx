import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { MessageCenter } from '@/components/MessageCenter';
import { useAuth } from '@/context/AuthContext';

// Mock the authentication context
vi.mock('@/context/AuthContext', () => ({
  useAuth: vi.fn()
}));

// Mock Firebase
vi.mock('@/lib/firebase/config', () => ({
  db: {},
  auth: {}
}));

// Mock Firestore functions
vi.mock('firebase/firestore', () => {
  return {
    collection: vi.fn(),
    query: vi.fn(),
    where: vi.fn(),
    orderBy: vi.fn(),
    onSnapshot: vi.fn((_, callback) => {
      callback({ docs: [] });
      return () => {};
    }),
    doc: vi.fn(),
    getDoc: vi.fn(() => Promise.resolve({ 
      exists: () => true, 
      data: () => ({ 
        name: 'Test Display Case',
        comments: [{
          userId: 'user123',
          userName: 'Test User',
          text: 'Test comment',
          timestamp: { toDate: () => new Date() }
        }]
      })
    })),
    getDocs: vi.fn(() => Promise.resolve({
      docs: [
        {
          id: 'case1',
          data: () => ({
            name: 'Test Display Case',
            comments: [
              {
                userId: 'user123',
                userName: 'Test User',
                text: 'Test comment 1',
                timestamp: { toDate: () => new Date() }
              },
              {
                userId: 'other-user',
                userName: 'Other User',
                text: 'Test comment 2',
                timestamp: { toDate: () => new Date() }
              }
            ]
          })
        }
      ]
    })),
    updateDoc: vi.fn(() => Promise.resolve()),
    arrayRemove: vi.fn(comment => comment),
    QuerySnapshot: vi.fn(),
    DocumentData: vi.fn(),
    serverTimestamp: vi.fn(),
    getFirestore: vi.fn()
  };
});

// Test wrapper with router
const renderWithRouter = (ui) => {
  return render(
    <BrowserRouter>
      {ui}
    </BrowserRouter>
  );
};

describe('MessageCenter and Comment Management', () => {
  // Test for authenticated user
  describe('When user is authenticated', () => {
    beforeEach(() => {
      // Mock authenticated user
      useAuth.mockReturnValue({ 
        user: { 
          uid: 'user123', 
          displayName: 'Test User',
          email: 'test@example.com'
        } 
      });
      
      // Reset all mocks
      vi.clearAllMocks();
    });

    it('should display comments tab in the MessageCenter', async () => {
      renderWithRouter(
        <MessageCenter />
      );

      // Wait for comments to load
      await waitFor(() => {
        // Find tab by role with name that includes "Comments"
        const tabs = screen.getAllByRole('tab');
        const commentsTab = tabs.find(tab => tab.textContent.includes('Comments'));
        expect(commentsTab).toBeInTheDocument();
      });
    });

    it('should show Comments badge with count when comments are loaded', async () => {
      renderWithRouter(
        <MessageCenter />
      );

      // Wait for the Comments badge to show up with the count
      await waitFor(() => {
        const badge = screen.getByText('2');
        expect(badge).toBeInTheDocument();
      });
    });
  });

  // Test for unauthenticated user
  describe('When user is not authenticated', () => {
    beforeEach(() => {
      // Mock unauthenticated user
      useAuth.mockReturnValue({ user: null });
      
      // Reset all mocks
      vi.clearAllMocks();
    });

    it('should show sign-in prompt when not authenticated', async () => {
      renderWithRouter(
        <MessageCenter />
      );

      // Check for sign-in prompt
      expect(screen.getByText(/Please sign in to view your messages and notifications/i)).toBeInTheDocument();
    });
  });
}); 