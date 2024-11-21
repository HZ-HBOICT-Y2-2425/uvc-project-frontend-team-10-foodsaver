import { writable } from 'svelte/store';

const defaultPantry = ['onion', 'garlic', 'salt', 'pepper']; // Default pantry items
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
