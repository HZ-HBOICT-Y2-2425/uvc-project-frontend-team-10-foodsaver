import { writable } from 'svelte/store';

const defaultPantry = [
  { name: 'onion', weight: 100, expirationDate: '2024-01-01' },
  { name: 'garlic', weight: 50, expirationDate: '2024-01-05' },
  { name: 'salt', weight: 200, expirationDate: '2025-01-01' },
  { name: 'pepper', weight: 30, expirationDate: '2024-02-01' }
]; // Default pantry items with weight and expiration date

let storedPantry;

if (typeof window !== 'undefined') {
  try {
    // Safely parse the pantry data from localStorage
    const pantryData = localStorage.getItem('pantry');
    storedPantry = pantryData ? JSON.parse(pantryData) : defaultPantry;
  } catch (error) {
    console.error('Error parsing pantry from localStorage:', error);
    storedPantry = defaultPantry; // Fallback to default pantry
  }
} else {
  // Fallback for server-side rendering
  storedPantry = defaultPantry;
}

export const pantry = writable(storedPantry);

// Save to localStorage whenever the pantry changes
if (typeof window !== 'undefined') {
  pantry.subscribe((value) => {
    localStorage.setItem('pantry', JSON.stringify(value));
  });
}