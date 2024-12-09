import { writable } from 'svelte/store';
import { authStore } from './authStore';

const pantry = writable([]);

let userId = null;

// Subscribe to authStore to get user ID
authStore.subscribe((state) => {
  if (state.isLoggedIn && state.user) {
    userId = state.user.id;
  }
});

// Fetch pantry data from the backend service
async function fetchPantry() {
  if (!userId) return;
  try {
    const response = await fetch('http://localhost:3000/pantry', {
      headers: {
        'x-user-id': userId
      }
    });
    if (!response.ok) {
      throw new Error(`Error fetching pantry data: ${response.statusText}`);
    }
    const data = await response.json();
    pantry.set(data);
  } catch (error) {
    console.error('Error fetching pantry data:', error);
  }
}

// Update pantry data on the backend service
async function updatePantry(newPantry) {
  if (!userId) return;
  try {
    const response = await fetch('http://localhost:3000/pantry', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-user-id': userId
      },
      body: JSON.stringify(newPantry)
    });
    if (!response.ok) {
      throw new Error(`Error updating pantry data: ${response.statusText}`);
    }
    pantry.set(newPantry);
  } catch (error) {
    console.error('Error updating pantry data:', error);
  }
}

// Fetch pantry data initially
fetchPantry();

// Load pantry data from localStorage if available
if (typeof localStorage !== 'undefined') {
  const savedPantry = JSON.parse(localStorage.getItem('pantry'));
  if (savedPantry) {
    pantry.set(savedPantry);
  }
}

// Subscribe to pantry store changes and update the backend service and localStorage
pantry.subscribe(async (value) => {
  await updatePantry(value);
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem('pantry', JSON.stringify(value));
  }
});

export { pantry, fetchPantry, updatePantry };
