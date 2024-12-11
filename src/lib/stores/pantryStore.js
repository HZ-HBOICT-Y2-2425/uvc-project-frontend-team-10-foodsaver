import { writable } from "svelte/store";

export const pantry = writable([]);

const apiUrl = 'http://localhost:3016/pantry';  // Change to your backend URL

// Fetch all pantry items
export async function fetchPantryItems() {
  try {
    const response = await fetch(`${apiUrl}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}` // Assuming token is stored in localStorage
      }
    });

    if (!response.ok) {
      throw new Error('Failed to fetch pantry items');
    }

    const data = await response.json();
    pantry.set(data);
  } catch (error) {
    console.error(error);
  }
}

// Add a new pantry item
export async function addPantryItem(newItem) {
  try {
    const response = await fetch(`${apiUrl}/add`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify(newItem)
    });

    if (!response.ok) {
      throw new Error('Failed to add pantry item');
    }

    const data = await response.json();
    pantry.update(items => [...items, data.item]); // Update the store with the new item
  } catch (error) {
    console.error(error);
  }
}

// Update an existing pantry item
export async function updatePantryItem(index, updatedItem) {
  try {
    const response = await fetch(`${apiUrl}/update/${updatedItem.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify(updatedItem)
    });

    if (!response.ok) {
      throw new Error('Failed to update pantry item');
    }

    const data = await response.json();
    pantry.update(items => {
      items[index] = data.item;  // Update the item in the store
      return [...items];
    });
  } catch (error) {
    console.error(error);
  }
}

// Remove an item from pantry
export async function removePantryItem(itemName) {
  try {
    const item = $pantry.find(item => item.name === itemName);

    const response = await fetch(`${apiUrl}/delete/${item.id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });

    if (!response.ok) {
      throw new Error('Failed to delete pantry item');
    }

    pantry.update(items => items.filter(item => item.name !== itemName));
  } catch (error) {
    console.error(error);
  }
}
