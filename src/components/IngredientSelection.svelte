<script lang="ts">
  import { pantry } from '../lib/stores/pantryStore';
  import { onMount } from 'svelte';
  import { writable, derived } from 'svelte/store';

  let ingredients = writable<string[]>([]);
  let selectedIngredients = writable<string[]>([]);
  let searchQuery = writable<string>('');
  let currentPage = writable<number>(1);
  const itemsPerPage = 10;

  const API_KEY = 'ea8bbbce866540469291ee4bef92ec24'; // Replace with your actual API key

  // Fetch ingredients from the API
  onMount(async () => {
    try {
      const response = await fetch(`https://api.spoonacular.com/food/ingredients/search?apiKey=${API_KEY}&query=a&number=100`);
      if (response.ok) {
        const data = await response.json();
        console.log('Fetched ingredients:', data.results); // Debugging log
        ingredients.set(data.results.map((ingredient: any) => ingredient.name));
      } else {
        console.error('Failed to fetch ingredients:', response.statusText);
      }
    } catch (error) {
      console.error('Error fetching ingredients:', error);
    }
  });

  // Filter ingredients based on search query
  const filteredIngredients = derived([ingredients, searchQuery], ([$ingredients, $searchQuery]) => {
    return $ingredients.filter((ingredient) =>
      ingredient.toLowerCase().includes($searchQuery.toLowerCase())
    );
  });

  // Paginate filtered ingredients
  const paginatedIngredients = derived([filteredIngredients, currentPage], ([$filteredIngredients, $currentPage]) => {
    const start = ($currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    return $filteredIngredients.slice(start, end);
  });

  // Add selected ingredients to the pantry
  const addSelectedIngredients = (): void => {
    selectedIngredients.update((selected) => {
      pantry.update((items) => {
        const newItems = [...items];
        selected.forEach((ingredient) => {
          if (!newItems.includes(ingredient)) {
            newItems.push(ingredient);
          }
        });
        return newItems;
      });
      return [];
    });
  };

  // Navigate to the next page
  const nextPage = () => {
    currentPage.update(n => n + 1);
  };

  // Navigate to the previous page
  const prevPage = () => {
    currentPage.update(n => Math.max(n - 1, 1));
  };
</script>

<div class="p-4 max-w-3xl mx-auto bg-white shadow-md rounded-lg">
  <h2 class="text-2xl font-bold text-green-600 mb-4">Select Ingredients</h2>
  
  <!-- Search Bar -->
  <div class="mb-4">
    <input
      type="text"
      bind:value={$searchQuery}
      placeholder="Search ingredients"
      class="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:outline-none"
    />
  </div>

  <div class="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-4 mb-6">
    {#each $paginatedIngredients as ingredient}
      <div class="flex flex-col items-center space-y-2 cursor-pointer" on:click={() => selectedIngredients.update(selected => selected.includes(ingredient) ? selected.filter(i => i !== ingredient) : [...selected, ingredient])}>
        <div class="bg-gray-200 w-16 h-16 rounded-full flex items-center justify-center">
          <img src="/images/placeholder.png" alt="{ingredient}" class="w-10 h-10 object-cover" />
        </div>
        <span class="text-gray-700 text-sm">{ingredient}</span>
        {#if $selectedIngredients.includes(ingredient)}
          <span class="text-green-500 text-xs">Selected</span>
        {/if}
      </div>
    {/each}
  </div>

  <!-- Pagination Controls -->
  <div class="flex justify-between mb-4">
    <button on:click={prevPage} class="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600" disabled={$currentPage === 1}>
      Previous
    </button>
    <button on:click={nextPage} class="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600">
      Next
    </button>
  </div>

  <button on:click={addSelectedIngredients} class="bg-green-500 text-white px-6 py-2 rounded-md hover:bg-green-600">
    Add Selected Ingredients
  </button>
</div>