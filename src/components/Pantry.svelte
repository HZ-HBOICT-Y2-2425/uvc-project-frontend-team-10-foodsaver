<script lang="ts">
  import { onMount } from "svelte";
  import { writable } from "svelte/store";
  import { authStore } from "../lib/stores/authStore"; // Auth store for user authentication

  // Writable stores to manage input states
  let ingredient = writable<string>("");
  let weight = writable<number>(0);
  let expirationDate = writable<string>("");
  let addManually = writable<boolean>(false);
  let selectedIngredient = writable<string>("");
  let editMode = writable<boolean>(false);
  let editIndex = writable<number | null>(null);
  let removeManually = writable<boolean>(false);

  // Default user ID to 1, will be updated from the auth store
  let user_id = 1;

  // Subscribe to the auth store to get user ID and handle authentication state
  authStore.subscribe((state) => {
    console.log("Auth store state in home page: ", state);
    user_id = state.user?.id || 1;
    console.log("user id is: ", user_id);
  });

  let pantry = [];

  // get all favorite recipes' IDs
  async function fetchPantryItems() {
    const response = await fetch(
      `http://localhost:3016/pantry?user_id=${user_id}`,
    );
    const data = await response.json();
    if (response.ok) {
      pantry = data;
    } else {
      console.error("Error fetching pantry items:", data.error);
    }
  }

  // Fetch pantry items from backend when component mounts
  onMount(() => {
    fetchPantryItems(); // Fetch pantry items from the backend
  });

  // Save new ingredient details (Add item to backend)
  const saveIngredientDetails = async (): Promise<void> => {
    const newItem = {
      name: $selectedIngredient,
      quantity: $weight,
      expiration_date: $expirationDate,
      user_id: user_id, // Automatically associate the logged-in user
    };

    try {
      const response = await fetch(
        `http://localhost:3016/pantry/add?user_id=${user_id}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(newItem),
        },
      );

      const data = await response.json();

      if (response.ok) {
        console.log("Ingredient added successfully:", data);
        fetchPantryItems(); // Reload pantry items
      } else {
        console.error("Error adding ingredient:", data.error);
      }

      // Reset input fields and close the form
      ingredient.set("");
      weight.set(0);
      expirationDate.set("");
      addManually.set(false);
    } catch (error) {
      console.error("Error saving ingredient:", error);
    }
  };

  const saveEditedIngredientDetails = async (name): Promise<void> => {
    const updateItem = {
      name: $selectedIngredient,
      weight: $weight,
      expiration_date: $expirationDate,
      user_id: user_id, // Automatically associate the logged-in user
    };

    try {
      const response = await fetch(
        `http://localhost:3016/pantry/update/${name}?user_id=${user_id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updateItem),
        },
      );

      const data = await response.json();

      if (response.ok) {
        console.log("Ingredient updated successfully:", data);
        fetchPantryItems(); // Reload pantry items
      } else {
        console.error("Error updating ingredient:", data.error);
      }

      // Reset fields and close the form
      ingredient.set("");
      weight.set(0);
      expirationDate.set("");
      editMode.set(false);
      editIndex.set(null);
    } catch (error) {
      console.error("Error saving updated ingredient:", error);
    }
  };

  // Remove ingredient from pantry store (Delete item from backend)
  const removeIngredient = async (name: string): Promise<void> => {
    try {
      const response = await fetch(
        `http://localhost:3016/pantry/delete/${name}?user_id=${user_id}`,
        {
          method: "DELETE",
        },
      );

      const data = await response.json();

      if (response.ok) {
        console.log("Ingredient removed successfully:", data);
        fetchPantryItems(); // Reload pantry items
      } else {
        console.error("Error removing ingredient:", data.error);
      }
    } catch (error) {
      console.error("Error removing ingredient:", error);
    }
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
<div class="p-4 max-w-3xl mx-auto bg-white shadow-md rounded-lg">
  <!-- Top Section: Title and Buttons -->
  <div class="flex flex-col md:flex-row justify-between items-center mb-6">
    <h2 class="text-2xl font-bold text-green-600 mb-4 md:mb-0">Pantry</h2>
    <div class="flex flex-col sm:flex-row sm:space-x-4 space-y-4 sm:space-y-0">
      {#if pantry.length > 0}
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
    {#each pantry as item, index (index)}
      <div class="flex flex-col items-center space-y-2">
        <!-- Ingredient Circle with Placeholder Image -->
        <button
          on:click={() => saveEditedIngredientDetails(index)}
          class="bg-gray-200 w-16 h-16 rounded-full flex items-center justify-center"
        >
          <img
            src="/fridge-solid-24.png"
            alt={item.name}
            class="w-10 h-10 object-cover"
          />
        </button>
        <!-- Ingredient Name -->
        <span class="text-gray-700 text-sm">{item.name}</span>
        <!-- Ingredient Weight -->
        <span class="text-gray-500 text-xs">Weight: {item.weight}g</span>
        <!-- Ingredient Expiration Date -->
        <span class="text-gray-500 text-xs">Expires: {item.expirationDate}</span
        >
      </div>
    {/each}
  </div>
</div>

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
{#if $removeManually && pantry.length > 0}
  <div
    class="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50"
  >
    <div class="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
      <h2 class="text-2xl font-bold text-green-600 mb-4">Remove Ingredients</h2>
      <div class="grid grid-cols-2 gap-4">
        {#each pantry as item, index (index)}
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
          Close
        </button>
      </div>
    </div>
  </div>
{/if}
