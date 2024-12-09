<script lang="ts">
  import { pantry, updatePantry } from "../lib/stores/pantryStore";
  import { onMount } from "svelte";
  import { writable } from "svelte/store";
  import { API_KEY } from "../lib/config";
  import { user } from "../lib/stores/authStore"; // Import user store

  let ingredient = writable<string>("");
  let weight = writable<number>(0);
  let expirationDate = writable<string>("");
  let ingredientsList = writable<string[]>([]);
  let addManually = writable<boolean>(false);
  let selectedIngredient = writable<string>("");
  let editMode = writable<boolean>(false);
  let editIndex = writable<number | null>(null);
  let removeManually = writable<boolean>(false);
  let isUserLoaded = false;
  let unsubscribe;

  // Fetch ingredients from the API
  onMount(async () => {
    try {
      const response = await fetch(
        `https://api.spoonacular.com/food/ingredients/search?apiKey=${API_KEY}&number=100`,
      );
      if (response.ok) {
        const data = await response.json();
        ingredientsList.set(
          data.results.map((ingredient: { name: string }) => ingredient.name),
        );
      } else {
        console.error("Failed to fetch ingredients:", response.statusText);
      }
    } catch (error) {
      console.error("Error fetching ingredients:", error);
    }
  });

  onMount(() => {
    unsubscribe = user.subscribe((value) => {
      if (value) {
        isUserLoaded = true;
        unsubscribe();
      }
    });
  });

  onMount(() => {
    // Load pantry data from localStorage if available
    if (typeof localStorage !== "undefined") {
      const savedPantry = JSON.parse(localStorage.getItem("pantry") || "[]");
      pantry.set(savedPantry); // Set pantry data from localStorage
    }
  });

  const saveIngredientDetails = async (): void => {
    if (!isUserLoaded) return;

    // Create new ingredient object
    const newIngredient = {
      name: $selectedIngredient,
      weight: $weight,
      expirationDate: $expirationDate,
      userId: $user.id, // Include user ID
    };

    // Update pantry store locally
    pantry.update((items) => {
      const updatedItems = [...items, newIngredient];
      return updatedItems;
    });

    // Clear input fields and reset state
    ingredient.set("");
    weight.set(0);
    expirationDate.set("");
    addManually.set(false);

    // Sync with backend and localStorage
    await updatePantry([...$pantry, newIngredient]);
  };

  const editIngredientDetails = (index: number): void => {
    if (!isUserLoaded) return;
    editIndex.set(index);
    const item = $pantry[index];
    selectedIngredient.set(item.name);
    weight.set(item.weight);
    expirationDate.set(item.expirationDate);
    editMode.set(true);
  };

  const saveEditedIngredientDetails = async (): void => {
    if (!isUserLoaded) return;
    pantry.update((items) => {
      const newItems = [...items];
      const index = $editIndex;
      if (index !== null) {
        newItems[index] = {
          name: $selectedIngredient,
          weight: $weight,
          expirationDate: $expirationDate,
          userId: $user.id, // Include user ID
        };
      }
      return newItems;
    });

    // Clear input fields and reset state
    ingredient.set("");
    weight.set(0);
    expirationDate.set("");
    editMode.set(false);
    editIndex.set(null);

    // Sync with backend and localStorage
    await updatePantry($pantry);
  };

  // Remove ingredient from pantry store
  const removeIngredient = async (itemName: string): void => {
    if (!isUserLoaded) return;

    // Remove the ingredient from pantry store
    pantry.update((items) => items.filter((item) => item.name !== itemName && item.userId === $user.id));

    // Close the remove modal
    removeManually.set(false);

    // Sync with backend and localStorage
    await updatePantry($pantry.filter((item) => item.name !== itemName && item.userId === $user.id));
  };

</script>

<!-- Leafs picture -->
<img
  class="LeafBackgroundRemoved9 w-72 h-60 left-[-80.30px] top-[800px] absolute origin-top-left rotate-[0.0deg] rounded-xl -z-10"
  src="../../../leaf-background2.png"
  alt="Leaf Background"
/>

<img
  class="LeafBackgroundRemoved9 w-72 h-60 right-[-90px] top-[250px] absolute origin-top-left rotate-[270deg] rounded-xl -z-10"
  src="../../../leaf-background1.png"
  alt="Leaf Background"
/>

<!-- Pantry Layout -->
{#if isUserLoaded}
  <div class="p-4 max-w-3xl mx-auto bg-white shadow-md rounded-lg">
    <!-- Top Section: Title and Buttons -->
    <div class="flex flex-col md:flex-row justify-between items-center mb-6">
      <h2 class="text-2xl font-bold text-green-600 mb-4 md:mb-0"></h2>
      <div
        class="flex flex-col sm:flex-row sm:space-x-4 space-y-4 sm:space-y-0"
      >
        {#if $pantry.length > 0}
          <button
            on:click={() => removeManually.set(true)}
            class="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-green-600 w-full sm:w-auto"
          >
            Remove Ingredients
          </button>
        {/if}
        <button
          on:click={() => addManually.set(true)}
          class="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 w-full sm:w-auto"
        >
          Add Manually
        </button>
      </div>
    </div>

    <!-- Pantry Ingredients List (Circular) -->
    <div class="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-4 mb-6">
      {#each $pantry.filter((item) => item.userId === $user.id) as item, index (item.name + item.expirationDate + item.weight)}
        <div class="flex flex-col items-center space-y-2">
          <button
            on:click={() => editIngredientDetails(index)}
            class="bg-gray-200 w-16 h-16 rounded-full flex items-center justify-center"
          >
            <img
              src="/fridge-solid-24.png"
              alt={item.name}
              class="w-10 h-10 object-cover"
            />
          </button>
          <span class="text-gray-700 text-sm">{item.name}</span>
          <span class="text-gray-500 text-xs">Weight: {item.weight}g</span>
          <span class="text-gray-500 text-xs"
            >Expires: {item.expirationDate}</span
          >
        </div>
      {/each}
    </div>
  </div>
{/if}

<!-- Add/Edit Ingredients Manually -->
{#if $addManually || $editMode}
  <div
    class="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50"
  >
    <div class="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
      <h2 class="text-2xl font-bold text-green-600 mb-4">
        {#if $editMode}
          Edit Ingredient
        {:else}
          Add an Ingredient
        {/if}
      </h2>
      <div class="mb-4">
        <input
          type="string"
          bind:value={$selectedIngredient}
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
      <div class="flex justify-end space-x-4">
        <button
          on:click={() => {
            addManually.set(false);
            editMode.set(false);
          }}
          class="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600"
        >
          Cancel
        </button>
        <button
          on:click={() => {
            $editMode ? saveEditedIngredientDetails() : saveIngredientDetails();
          }}
          class="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600"
        >
          Save
        </button>
      </div>
    </div>
  </div>
{/if}

<!-- Remove Ingredients Manually -->
{#if $removeManually && $pantry.length > 0}
  <div
    class="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50"
  >
    <div class="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
      <h2 class="text-2xl font-bold text-green-600 mb-4">Remove Ingredients</h2>
      <div class="grid grid-cols-2 gap-4">
        {#each $pantry.filter((item) => item.userId === $user.id) as item, index (item.name + item.expirationDate + index)}
          <div class="flex items-center justify-between p-2 border rounded-md">
            <span>{item.name}</span>
            <button
              on:click={() => removeIngredient(item.name)}
              class="bg-red-500 text-white px-3 py-1 text-xs rounded-full hover:bg-red-600"
            >
              Remove
            </button>
          </div>
        {/each}
      </div>
      <div class="flex justify-end mt-4">
        <button
          on:click={() => removeManually.set(false)}
          class="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600"
        >
          Cancel
        </button>
      </div>
    </div>
  </div>
{/if}
