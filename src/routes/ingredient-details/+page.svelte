<script lang="ts">
    import { pantry } from '../../lib/stores/pantryStore';
    import { writable } from 'svelte/store';
  
    let ingredientName = writable<string>('');
    let weight = writable<number>(0);
    let expirationDate = writable<string>('');
  
    const addIngredientDetails = (): void => {
      pantry.update((items) => {
        const newItems = [...items];
        newItems.push({
          name: $ingredientName,
          weight: $weight,
          expirationDate: $expirationDate
        });
        return newItems;
      });
      ingredientName.set('');
      weight.set(0);
      expirationDate.set('');
    };
  </script>
  
  <div class="p-4 max-w-3xl mx-auto bg-white shadow-md rounded-lg">
    <h2 class="text-2xl font-bold text-green-600 mb-4">Add Ingredient Details</h2>
    
    <div class="mb-4">
      <input
        type="text"
        bind:value={$ingredientName}
        placeholder="Ingredient Name"
        class="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:outline-none"
      />
    </div>
    
    <div class="mb-4">
      <input
        type="number"
        bind:value={$weight}
        placeholder="Weight (grams)"
        class="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:outline-none"
      />
    </div>
    
    <div class="mb-4">
      <input
        type="date"
        bind:value={$expirationDate}
        class="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:outline-none"
      />
    </div>
    
    <button on:click={addIngredientDetails} class="bg-green-500 text-white px-6 py-2 rounded-md hover:bg-green-600">
      Add Ingredient
    </button>
  </div>