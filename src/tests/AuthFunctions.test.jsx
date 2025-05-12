import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { MessageSellerButton } from '../components/display/MessageSellerButton';
import { NewCommentSection } from '../components/display-cases/NewCommentSection';
import { useAuth } from '../context/AuthContext';

// Mock the authentication context
vi.mock('../context/AuthContext', () => ({
  useAuth: vi.fn()
}));

// Mock Firebase
vi.mock('@/lib/firebase/config', () => ({
  db: {},
  auth: {}
}));

// Mock Firestore functions
vi.mock('firebase/firestore', () => ({
  doc: vi.fn(),
  getDoc: vi.fn(() => Promise.resolve({ exists: () => true, data: () => ({ name: 'Test Display Case' })})),
  updateDoc: vi.fn(),
  arrayUnion: vi.fn(),
  collection: vi.fn(),
  addDoc: vi.fn(),
  serverTimestamp: vi.fn(),
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

describe('Authentication for Comments and Messages', () => {
  // Test for unauthenticated user
  describe('When user is not authenticated', () => {
    beforeEach(() => {
      // Mock unauthenticated user
      useAuth.mockReturnValue({ user: null });
    });

    it('should show sign-in button for MessageSellerButton', async () => {
      renderWithRouter(
        <MessageSellerButton 
          sellerId="seller123" 
          displayCaseId="display123" 
          sellerName="Test Seller" 
        />
      );

      // Find the Members Only button
      expect(screen.getByText(/Members Only/i)).toBeInTheDocument();
      
      // Click the button to show the auth dialog
      fireEvent.click(screen.getByText(/Members Only/i));
      
      // Check if sign-in dialog appears
      await waitFor(() => {
        expect(screen.getByText(/Sign in required/i)).toBeInTheDocument();
        expect(screen.getByText(/Please sign in or create an account to message/i)).toBeInTheDocument();
      });
    });

    it('should show sign-in prompt for NewCommentSection', async () => {
      renderWithRouter(
        <NewCommentSection displayCaseId="display123" />
      );

      // Check for sign-in placeholder in textarea
      expect(screen.getByPlaceholderText(/Sign in to leave a comment/i)).toBeInTheDocument();
      
      // Textarea should be disabled
      expect(screen.getByPlaceholderText(/Sign in to leave a comment/i)).toBeDisabled();
      
      // Button should say sign in
      expect(screen.getByRole('button', { name: /Sign in to comment/i })).toBeInTheDocument();
      
      // Click the textarea to trigger auth dialog
      fireEvent.focus(screen.getByPlaceholderText(/Sign in to leave a comment/i));
      
      // Check if sign-in dialog appears
      await waitFor(() => {
        expect(screen.getByText(/Sign in required/i)).toBeInTheDocument();
        expect(screen.getByText(/Please sign in or create an account to comment/i)).toBeInTheDocument();
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
    });

    it('should show message button for MessageSellerButton', () => {
      renderWithRouter(
        <MessageSellerButton 
          sellerId="seller123" 
          displayCaseId="display123" 
          sellerName="Test Seller" 
        />
      );

      // Find the Message Seller button
      expect(screen.getByText(/Message Seller/i)).toBeInTheDocument();
      
      // Button should not be disabled
      expect(screen.getByRole('button', { name: /Message Seller/i })).not.toBeDisabled();
    });

    it('should allow commenting in NewCommentSection', () => {
      renderWithRouter(
        <NewCommentSection displayCaseId="display123" />
      );

      // Check for comment placeholder in textarea
      expect(screen.getByPlaceholderText(/Add a comment.../i)).toBeInTheDocument();
      
      // Textarea should not be disabled
      expect(screen.getByPlaceholderText(/Add a comment.../i)).not.toBeDisabled();
      
      // Button should say Post Comment
      expect(screen.getByRole('button', { name: /Post Comment/i })).toBeInTheDocument();
    });
  });
}); 