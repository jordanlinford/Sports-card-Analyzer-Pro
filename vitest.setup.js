import '@testing-library/jest-dom';

// Mock window.location.href
Object.defineProperty(window, 'location', {
  writable: true,
  value: { href: 'http://localhost:3000/display/test123' }
});

// Mock localStorage
const localStorageMock = (() => {
  let store = {};
  return {
    getItem: (key) => store[key],
    setItem: (key, value) => { store[key] = value.toString(); },
    removeItem: (key) => { delete store[key]; },
    clear: () => { store = {}; }
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
});

// Setup global mocks
globalThis.vi = vi; 