<script>
    import { goto } from "$app/navigation";
    import { onMount } from "svelte";
  
    let savedShoppingLists = [];
    let user_id = null; // Initialize user_id
    let isLoading = true; // Loading state
    let selectedList = null; // Store the selected shopping list for display
  
    // Fetch shopping lists when the component mounts
    onMount(() => {
      const user = JSON.parse(localStorage.getItem("user"));
      user_id = user?.id || null;
      if (!user_id) {
        console.error("User not logged in or no user_id found in localStorage");
        return;
      }
      console.log("Retrieved user_id:", user_id);
      fetchShoppingLists();
    });
  
    // Function to fetch shopping lists from the backend
    async function fetchShoppingLists() {
      if (!user_id) {
        console.error("user_id is not defined. Cannot fetch shopping lists.");
        return;
      }
  
      try {
        const response = await fetch(`http://localhost:4053/shopping-lists?userId=${user_id}`);
        if (response.ok) {
          const lists = await response.json();
  
          // For each shopping list, fetch recipe details if available
          for (let list of lists) {
            if (list.recipe_id) {
              const recipeData = await fetchRecipeData(list.recipe_id);
              list.recipe_name = recipeData?.strMeal || "Unknown Recipe";
              list.recipe_image = recipeData?.strMealThumb || null;
            }
          }
  
          savedShoppingLists = lists;
        } else {
          console.error("Failed to fetch shopping lists:", await response.json());
        }
      } catch (error) {
        console.error("Error fetching shopping lists:", error);
      } finally {
        isLoading = false; // Stop loading once the data is fetched
      }
    }
  
    // Function to fetch recipe details based on the recipeId
    async function fetchRecipeData(recipeId) {
      if (!recipeId) {
        console.error('Invalid recipeId:', recipeId);
        return null;
      }
  
      try {
        const response = await fetch(`http://localhost:4053/proxy/mealdb?ingredient=${recipeId}`);
        if (response.ok) {
          const data = await response.json();
          return data?.meals?.[0] || null;
        } else {
          console.error('Failed to fetch recipe details:', response.statusText);
        }
      } catch (error) {
        console.error('Error fetching recipe details:', error);
      }
      return null;
    }
  
    // Handle click event to show details for the selected shopping list
    function handleSelectList(list) {
      selectedList = list; // Set the selected list for detailed view
    }
  
    // Close the selected list details
    function closeSelectedList() {
      selectedList = null;
    }
  </script>
  
  <div class="ml-4">

<div class="ml-4 mr-4">
    <button
        class="px-6 py-3 bg-green-500 text-white rounded-md hover:bg-green-600 focus:outline-none focus:ring focus:ring-green-300"
        on:click={() => goto("/favorite")}
    >
        Favourites
    </button>


    <button
      class="px-6 py-3 bg-green-500 text-white rounded-md hover:bg-green-600 focus:outline-none focus:ring focus:ring-green-300"
      on:click={() => goto("/community")}
    >
      Community
    </button>
  </div>
  
  {#if isLoading}
    <p>Loading your shopping lists...</p>
  {:else if savedShoppingLists.length > 0}
    <ul class="list-disc list-inside">
      {#each savedShoppingLists as list}
        <li class="cursor-pointer">
          <h3 
            class="text-lg font-semibold hover:bg-gray-100 p-2 rounded"
            on:click={() => handleSelectList(list)} 
          >
            {list.recipe_name || `Shopping List ${list.id}`}
          </h3>
        </li>
      {/each}
    </ul>
  
    {#if selectedList}
      <div class="mt-4 p-4 bg-white shadow-lg rounded-md">
        <div class="flex justify-between items-center">
          <h3 class="text-xl font-semibold">{selectedList.recipe_name || `Shopping List ${selectedList.id}`}</h3>
          <button
            class="text-red-500 font-bold"
            on:click={closeSelectedList}
          >
            Close
          </button>
        </div>
  
        {#if selectedList.recipe_image}
          <img
            src={selectedList.recipe_image}
            alt={selectedList.recipe_name}
            class="w-64 h-64 object-cover rounded-md mt-4 mx-auto"
          />
        {:else}
          <p class="text-gray-500 mt-4 text-center">No image available</p>
        {/if}
  
        <ul class="list-none mt-2">
          {#each selectedList.items as ingredient}
            <li class="text-gray-700">{ingredient.name} - {ingredient.quantity}g</li>
          {/each}
        </ul>
      </div>
    {/if}
  {:else}
    <p>No saved shopping lists yet.</p>
  {/if}
  
  <style>
    .cursor-pointer:hover {
      background-color: #f7fafc;
    }
  
    .text-red-500 {
      color: red;
    }
  
    .bg-white {
      background-color: #fff;
    }
  
    .shadow-lg {
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }
  
    .rounded-md {
      border-radius: 0.375rem;
    }
  
    .text-center {
      text-align: center;
    }
  
    .p-4 {
      padding: 1rem;
    }
  
    .mt-4 {
      margin-top: 1rem;
    }
  
    .text-xl {
      font-size: 1.25rem;
    }
  
    .font-semibold {
      font-weight: 600;
    }
  </style>
  