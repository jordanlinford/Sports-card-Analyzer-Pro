import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import LikeButton from '@/components/display/LikeButton';
import { useAuth } from '@/context/AuthContext';
import { LikeService } from '@/services/LikeService';

// Mock the authentication context
vi.mock('@/context/AuthContext', () => ({
  useAuth: vi.fn()
}));

// Mock Firebase
vi.mock('@/lib/firebase/config', () => ({
  db: {},
  auth: {}
}));

// Mock the LikeService
vi.mock('@/services/LikeService', () => ({
  LikeService: {
    addLike: vi.fn(() => Promise.resolve()),
    removeLike: vi.fn(() => Promise.resolve()),
    hasUserLiked: vi.fn(() => Promise.resolve(false)),
    getLikeCount: vi.fn(() => Promise.resolve(5)),
    onLikesChange: vi.fn((_, callback) => {
      // Simulate 5 likes in the snapshot
      callback({
        size: 5,
        docs: []
      });
      return () => {}; // Return unsubscribe function
    })
  }
}));

// Mock Firestore functions
vi.mock('firebase/firestore', () => ({
  doc: vi.fn(),
  getDoc: vi.fn(() => Promise.resolve({ 
    exists: () => true, 
    data: () => ({ name: 'Test Display Case' })
  })),
  updateDoc: vi.fn(),
  QuerySnapshot: vi.fn(),
  DocumentData: vi.fn(),
  getFirestore: vi.fn(),
  onSnapshot: vi.fn(),
  query: vi.fn(),
  where: vi.fn()
}));

// Test wrapper with router
const renderWithRouter = (ui) => {
  return render(
    <BrowserRouter>
      {ui}
    </BrowserRouter>
  );
};

describe('LikeButton Component', () => {
  // Test for unauthenticated user
  describe('When user is not authenticated', () => {
    let localStorageMock;
    
    beforeEach(() => {
      // Mock unauthenticated user
      useAuth.mockReturnValue({ user: null });
      
      // Mock localStorage getItem to return a UUID for anonymous users
      localStorageMock = {
        getItem: vi.fn(() => 'anonymous-uuid-123'),
        setItem: vi.fn(),
      };
      
      Object.defineProperty(window, 'localStorage', {
        value: localStorageMock
      });
      
      // Reset all mocks
      vi.clearAllMocks();
    });

    it('should show like button with proper count', async () => {
      renderWithRouter(
        <LikeButton displayCaseId="display123" />
      );

      // Should show the like count from the mock
      expect(screen.getByText('5')).toBeInTheDocument();
      
      // Should be a heart icon that's not filled
      const heartIcon = screen.getByLabelText('Like');
      expect(heartIcon).toBeInTheDocument();
    });

    it('should allow non-authenticated users to like by using anonymous ID', async () => {
      // Set up the hasUserLiked mock to return false (not liked yet)
      LikeService.hasUserLiked.mockResolvedValue(false);
      
      renderWithRouter(
        <LikeButton displayCaseId="display123" />
      );

      // Click the like button
      fireEvent.click(screen.getByLabelText('Like'));
      
      // Check if localStorage was accessed for an anonymous ID
      expect(localStorageMock.getItem).toHaveBeenCalledWith('anonymousUserId');
      
      // Check if addLike was called with the anonymous ID
      await waitFor(() => {
        expect(LikeService.addLike).toHaveBeenCalledWith(
          'display123', 
          'anonymous-uuid-123'
        );
      });
    });

    it('should generate a new anonymousUserId if one does not exist', async () => {
      // Mock localStorage to return null (no existing ID)
      localStorageMock.getItem.mockReturnValue(null);
      
      renderWithRouter(
        <LikeButton displayCaseId="display123" />
      );

      // Click the like button
      fireEvent.click(screen.getByLabelText('Like'));
      
      // Should create a new anonymous ID
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'anonymousUserId', 
        expect.any(String)
      );
      
      // Should call addLike with the newly created ID
      await waitFor(() => {
        expect(LikeService.addLike).toHaveBeenCalled();
      });
    });
  });

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

    it('should show like button with proper count for authenticated user', async () => {
      renderWithRouter(
        <LikeButton displayCaseId="display123" />
      );

      // Should show the like count
      expect(screen.getByText('5')).toBeInTheDocument();
    });

    it('should like a display case with the authenticated user ID', async () => {
      // Set up the hasUserLiked mock to return false (not liked yet)
      LikeService.hasUserLiked.mockResolvedValue(false);
      
      renderWithRouter(
        <LikeButton displayCaseId="display123" />
      );

      // Click the like button
      fireEvent.click(screen.getByLabelText('Like'));
      
      // Check if addLike was called with the authenticated user ID
      await waitFor(() => {
        expect(LikeService.addLike).toHaveBeenCalledWith(
          'display123', 
          'user123'
        );
      });
    });

    it('should unlike a display case that was previously liked', async () => {
      // Setup the hasUserLiked mock to return true (already liked)
      LikeService.hasUserLiked.mockResolvedValue(true);
      
      // Setup onLikesChange to show the user has liked
      LikeService.onLikesChange.mockImplementation((_, callback) => {
        callback({
          size: 5,
          docs: [{ data: () => ({ userId: 'user123' }) }]
        });
        return () => {};
      });
      
      renderWithRouter(
        <LikeButton displayCaseId="display123" />
      );

      // Button should show as liked (labeled "Unlike")
      expect(screen.getByLabelText('Unlike')).toBeInTheDocument();
      
      // Click the unlike button
      fireEvent.click(screen.getByLabelText('Unlike'));
      
      // Check if removeLike was called with the user ID
      await waitFor(() => {
        expect(LikeService.removeLike).toHaveBeenCalledWith(
          'display123', 
          'user123'
        );
      });
    });
  });
}); 