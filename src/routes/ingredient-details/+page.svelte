<script>
  import { pantry } from '../../lib/stores/pantryStore';
  import { writable, get } from 'svelte/store';

  // Retrieve selected ingredients from the previous screen
  import { selectedIngredients } from '../../lib/stores/selectedIngredientsStore';

  let ingredients = get(selectedIngredients).map(name => ({
    name,
    weight: writable(0),
    expirationDate: writable('')
  }));

  const saveIngredients = () => {
    pantry.update((items) => {
      const newItems = [...items];
      ingredients.forEach(ingredient => {
        newItems.push({
          name: ingredient.name,
          weight: get(ingredient.weight),
          expirationDate: get(ingredient.expirationDate)
        });
      });
      return newItems;
    });
    // Clear selected ingredients after saving
    selectedIngredients.set([]);
  };
</script>

<div class="p-4 max-w-3xl mx-auto bg-white shadow-md rounded-lg">
  <h2 class="text-2xl font-bold text-green-600 mb-4">Set Ingredient Details</h2>
  
  {#each ingredients as ingredient}
    <div class="mb-4 flex items-center">
      <span class="w-1/3">{ingredient.name}</span>
      <input
        type="number"
        bind:value={ingredient.weight}
        placeholder="Weight (grams)"
        class="w-1/3 p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:outline-none"
      />
      <input
        type="date"
        bind:value={ingredient.expirationDate}
        class="w-1/3 p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:outline-none"
      />
    </div>
  {/each}

  <button on:click={saveIngredients} class="bg-green-500 text-white px-6 py-2 rounded-md hover:bg-green-600">
    Save
  </button>
</div>