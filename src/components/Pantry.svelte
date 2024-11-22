<script lang="ts">
  import { pantry } from '../lib/stores/pantryStore';
  import { goto } from '$app/navigation';

  let ingredient: string = '';

  // Add ingredient to pantry store
  const addIngredient = (): void => {
    if (ingredient.trim()) {
      pantry.update((items: string[]) => {
        if (!items.includes(ingredient.trim())) {
          return [...items, ingredient.trim()];
        } else {
          alert(`${ingredient.trim()} is already in your pantry!`);
          return items;
        }
      });
      ingredient = ''; // Clear the input field after adding
    }
  };

  // Remove ingredient from pantry store
  const removeIngredient = (item: string): void => {
    pantry.update((items: string[]) => items.filter((existingItem) => existingItem !== item));
  };

  // Navigate to the ingredient selection view
  const openIngredientSelection = (): void => {
    goto('/ingredient-selection');
  };

  // Placeholder for QR code functionality
  const scanQRCode = (): void => {
    alert('QR Code Scanning functionality will be added!');
  };
</script>

<!-- Pantry Layout -->
<div class="p-4 max-w-3xl mx-auto bg-white shadow-md rounded-lg">
  <!-- Top Section: Title and Buttons -->
  <div class="flex flex-col md:flex-row justify-between items-center mb-6">
    <h2 class="text-2xl font-bold text-green-600 mb-4 md:mb-0">My Pantry</h2>
    <div class="flex flex-col sm:flex-row sm:space-x-4 space-y-4 sm:space-y-0">
      <button on:click={openIngredientSelection} class="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 w-full sm:w-auto">
        Add Manually
      </button>
      <button on:click={scanQRCode} class="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600 w-full sm:w-auto">
        Add via QR Code
      </button>
    </div>
  </div>

  <!-- Pantry Ingredients List (Circular) -->
  <div class="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-4 mb-6">
    {#each $pantry as item}
      <div class="flex flex-col items-center space-y-2">
        <!-- Ingredient Circle with Placeholder Image -->
        <div class="bg-gray-200 w-16 h-16 rounded-full flex items-center justify-center">
          <img src="/images/placeholder.png" alt="{item}" class="w-10 h-10 object-cover" />
        </div>
        <!-- Ingredient Name -->
        <span class="text-gray-700 text-sm">{item}</span>
        <!-- Remove Button -->
        <button on:click={() => removeIngredient(item)} class="bg-red-500 text-white px-3 py-1 text-xs rounded-full hover:bg-red-600">
          Remove
        </button>
      </div>
    {/each}
  </div>

  <!-- Add Ingredient Section -->
  <h3 class="text-lg font-semibold text-gray-800 mb-4">Add Ingredients</h3>
  <div class="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
    <input
      type="text"
      bind:value={ingredient}
      placeholder="Add an ingredient"
      class="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:outline-none"
    />
    <button on:click={addIngredient} class="bg-green-500 text-white px-6 py-2 rounded-md hover:bg-green-600">
      Add
    </button>
  </div>
</div>