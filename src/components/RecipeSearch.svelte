<script lang="ts">
  import { goto } from "$app/navigation";
  import { onDestroy, onMount } from "svelte";
  import { authStore } from "../lib/stores/authStore";
  import { pantryStore } from "../lib/stores/pantryStore";
  import { searchedIngredients } from '../lib/stores/ingredientStore';
  import { derived } from 'svelte/store';

  import { writable } from "svelte/store";


  let pantry = [];
  const unsubscribe = pantryStore.subscribe((data) => {
    pantry = data;
  });

  onDestroy(() => {
    unsubscribe();
  });

  let searchQuery = "";
  let searchActive = false;
  let selectedIngredients: string[] = [];
  let recipes: any[] = [];
  let seasonalRecipes: any[] = [];
  let username = "";
  let ingredient = writable<string>("");
  let weight = writable<number>(0);
  let expirationDate = writable<string>("");
  let addManually = writable<boolean>(false);
  let warningMessage = writable<string>("");  
  let selectedIngredient = writable<string>("");
  let selectedMeasurement = writable<string>("grams");


  const visibleRecipeCount = 6;
  let currentRecipeIndex1 = 0;
  let currentRecipeIndex2 = 0;

  let user_id = 1;

  authStore.subscribe((state) => {
    user_id=state.user?.id || 1;

    console.log("Auth store state in home page: ", state);
    username = state.user?.username || "";
  });


  // Save new ingredient details (Add item to backend)
  const saveIngredientDetails = async (): Promise<void> => {
    const newItem = {
      name: $ingredient,
      quantity: $weight,
      expiration_date: $expirationDate,
      user_id: user_id, // Automatically associate the logged-in user
    };

    // Check if the expiration date is in the past
    if (new Date(newItem.expiration_date).getTime() < new Date().getTime()) {
      warningMessage.set("Please input a valid expiration date.");
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:4010/pantry/add?user_id=${user_id}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(newItem),
        }
      );

      const data = await response.json();

      if (response.ok) {
        console.log("Ingredient added successfully:", data);
        pantryStore.update((currentPantry) => [...currentPantry, newItem]);
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

  const openAddManually = () => {
    ingredient.set("");
    weight.set(0);
    expirationDate.set("");
    addManually.set(true);
  };


  const searchRecipes = () => {
    if (!selectedIngredients.length) {
      alert("Please select at least one ingredient to search for recipes.");
    } else {
      const ingredientsParam = selectedIngredients.join(",");
      searchedIngredients.set(selectedIngredients); // Update the store with selected ingredients
      goto(`/search?ingredients=${ingredientsParam}`);
    }
  };

  const handleImageError = (event: Event) => {
    const img = event.target as HTMLImageElement;
    img.src = "/images/placeholder.png";
  };

  const previousRecipes1 = () => {
    if (currentRecipeIndex1 > 0) {
      currentRecipeIndex1 -= 1;
    }
  };

  const nextRecipes1 = () => {
    if (currentRecipeIndex1 + visibleRecipeCount < recipes.length) {
      currentRecipeIndex1 += 1;
    }
  };

    // Recipe navigation functions for seasonal recipes
    const previousRecipes2 = () => {
        if (currentRecipeIndex2 > 0) {
            currentRecipeIndex2 -= 1;
        }
    };

    const nextRecipes2 = () => {
        if (currentRecipeIndex2 + visibleRecipeCount < seasonalRecipes.length) {
            currentRecipeIndex2 += 1;
        }
    };

    // Sort the pantry items by expiration date
    const sortedPantry = derived(pantryStore, ($pantry) => {
        // Check if $pantry is valid and an array, if not return an empty array
        if (!$pantry || !Array.isArray($pantry)) {
            return []; // Return an empty array if pantry is not yet initialized
        }

        // Sort the pantry by expiration date
        return $pantry
            .slice() // Creates a shallow copy of the array
            .sort(
                (a, b) =>
                    new Date(a.expiration_date).getTime() -
                    new Date(b.expiration_date).getTime(),
            );
    });

    // Reactive variables
    const visibleIngredientCount = 5; // Number of ingredients visible at a time
    const switchingIngredients = 1; //Number of ingredients switched each time the arrow is clicked
    const maxExpiredIngredients = 50; //Max number of ingredients stored in the home's expiring ingredients
    let currentIngredientIndex = 0; // Initial index

    // Ingredients list
    const nearestExpiringIngredients = derived(
        sortedPantry,
        ($sortedPantry) => {
            let result = [];
            let count = 0;

            for (let ingredient of $sortedPantry) {
                if (count >= maxExpiredIngredients) break;
                result.push(ingredient);
                count++;
            }

            return result;
        },
    );

    // Function to go to previous ingredients
    const previousIngredients = () => {
        if (currentIngredientIndex > 0) {
            currentIngredientIndex -= switchingIngredients; // Move backwards in blocks of switchingIngredients (1)
        }
    };

    // Function to go to the next ingredients
    const nextIngredients = () => {
        if (currentIngredientIndex + switchingIngredients < 20) {
            currentIngredientIndex += switchingIngredients; // Move backwards in blocks of switchingIngredients (1)
        }
    };

    // Subscribe to nearestExpiringIngredients and fetch recipes whenever it changes
    nearestExpiringIngredients.subscribe(async (ingredients) => {
        if (ingredients.length > 0) {
            await fetchRecipes(ingredients);
        } else {
            recipes = [];
        }
    });

    // Function to fetch recipes based on ingredients
    async function fetchRecipes(pantry) {
        const expiringIngredients = pantry.map((item) => item.name);
        let fetchedRecipes = new Set();

        for (const ingredient of expiringIngredients) {
            try {
                // Fetch recipes with the ingredient
                const response = await fetch(
                    `https://www.themealdb.com/api/json/v1/1/filter.php?i=${ingredient}`,
                );
                if (response.ok) {
                    const data = await response.json();
                    if (data.meals) {
                        // Loop through each meal to fetch detailed information
                        for (const meal of data.meals) {
                            try {
                                const mealResponse = await fetch(
                                    `https://www.themealdb.com/api/json/v1/1/lookup.php?i=${meal.idMeal}`,
                                );
                                if (mealResponse.ok) {
                                    const mealData = await mealResponse.json();
                                    if (
                                        mealData.meals &&
                                        mealData.meals[0]?.strInstructions
                                    ) {
                                        // Only add the recipe if instructions are available
                                        fetchedRecipes.add(
                                            JSON.stringify(mealData.meals[0]),
                                        );
                                    }
                                } else {
                                    console.error(
                                        "Failed to fetch detailed recipe info:",
                                        meal.idMeal,
                                        mealResponse.statusText,
                                    );
                                }
                            } catch (error) {
                                console.error(
                                    "Error fetching detailed recipe info:",
                                    meal.idMeal,
                                    error,
                                );
                            }
                        }
                    }
                } else {
                    console.error(
                        "Failed to fetch recipes for ingredient:",
                        ingredient,
                        response.statusText,
                    );
                }
            } catch (error) {
                console.error(
                    "Error fetching recipes for ingredient:",
                    ingredient,
                    error,
                );
            }
        }

        // Convert Set back to an array of objects, removing duplicates
        recipes = Array.from(fetchedRecipes).map((recipeStr) =>
            JSON.parse(recipeStr),
        );
    }

    // Fetch seasonal recipes on component mount
    onMount(async () => {
        try {
            // Determine the current season
            const month = new Date().getMonth() + 1; // Get current month (0-based, so add 1)
            let seasonalTag = "";

            // Assign tags based on the current month
            if (month >= 3 && month <= 5) {
                seasonalTag = "asparagus"; // Spring
            } else if (month >= 6 && month <= 8) {
                seasonalTag = "salad"; // Summer
            } else if (month >= 9 && month <= 11) {
                seasonalTag = "pumpkin"; // Fall
            } else {
                seasonalTag = "beef"; // Winter
            }

            // Fetch recipes with the seasonal tag
            const seasonalResponse = await fetch(
                `https://www.themealdb.com/api/json/v1/1/filter.php?i=${seasonalTag}`,
            );
            if (seasonalResponse.ok) {
                const seasonalData = await seasonalResponse.json();
                let seasonalRecipesSet = new Set();

                // Fetch detailed recipe info to check for instructions
                for (const meal of seasonalData.meals) {
                    try {
                        const mealResponse = await fetch(
                            `https://www.themealdb.com/api/json/v1/1/lookup.php?i=${meal.idMeal}`,
                        );
                        if (mealResponse.ok) {
                            const mealData = await mealResponse.json();
                            if (
                                mealData.meals &&
                                mealData.meals[0]?.strInstructions
                            ) {
                                seasonalRecipesSet.add(
                                    JSON.stringify(mealData.meals[0]),
                                );
                            }
                        } else {
                            console.error(
                                "Failed to fetch detailed seasonal recipe info:",
                                meal.idMeal,
                                mealResponse.statusText,
                            );
                        }
                    } catch (error) {
                        console.error(
                            "Error fetching detailed seasonal recipe info:",
                            meal.idMeal,
                            error,
                        );
                    }
                }

                // Update seasonalRecipes with those that have instructions
                seasonalRecipes = Array.from(seasonalRecipesSet).map(
                    (recipeStr) => JSON.parse(recipeStr),
                );
            } else {
                console.error(
                    "Failed to fetch seasonal recipes:",
                    seasonalResponse.statusText,
                );
            }
        } catch (error) {
            console.error("Error fetching seasonal recipes:", error);
        }
    });

    // jump to recipe details page
    function goToRecipeDetails(recipeId: number) {
        goto(`/recipe/${recipeId}`);
    }
</script>

<!-- Add Ingredient Form -->
{#if $addManually}
<div
class="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50"
>
<div class="bg-white p-6 rounded-lg shadow-lg max-w-md w-full relative">
  <h2 class="text-2xl font-bold text-green-600 mb-4">Add an Ingredient</h2>
  <div class="mb-4">
    <input
      type="string"
      bind:value={$selectedIngredient}
      class="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:outline-none"
    />
    Name
  </div>
  <div class="mb-4">
    <input
      type="number"
      bind:value={$weight}
      class="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:outline-none"
    />
    Select the amount
  </div>
  <div class="mb-4">
    <select
      bind:value={$selectedMeasurement}
      class="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:outline-none"
    >
      <option value="grams">Grams</option>
      <option value="milliliters">Milliliters</option>
      <option value="pieces">Pieces</option>
    </select>Measurement
  </div>
  <div class="mb-4">
    <input
      type="date"
      bind:value={$expirationDate}
      class="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:outline-none"
    />
    Select the expiration date
  </div>
  <div class="flex justify-end space-x-4">
    <button
      on:click={() => {
        addManually.set(false); // Aquí cerramos el formulario
      }}
      class="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600"
    >
      Cancel
    </button>
    <button
      on:click={saveIngredientDetails}
      class="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600"
    >
      Save
    </button>
  </div>
</div>
</div>
{/if}

<div class="container mx-auto mt-8 px-4 lg:px-6 text-center">
    <h2 class="text-3xl font-bold text-green-800 italic mb-6">
        Hello, {username}!
    </h2>

    <!-- Search Bar Section -->
    <div
        class="search-bar-container flex items-center justify-center w-full relative mb-8"
    >


    <div class="ml-4 mr-4">
        <button
            class="px-6 py-3 bg-green-500 text-white rounded-md hover:bg-green-600 focus:outline-none focus:ring focus:ring-green-300"
            on:click={() => addManually.set(true)}
        >
            Add Manually
        </button>
    </div>
        <!-- Favourites Button -->
        <div class="ml-4 mr-4">
            <button
                class="px-6 py-3 bg-green-500 text-white rounded-md hover:bg-green-600 focus:outline-none focus:ring focus:ring-green-300"
                on:click={() => goto("/favorite")}
            >
                Favourites
            </button>
        </div>


        <div class="relative flex-grow max-w-2xl">
            <div class="relative">
                <input
                    type="text"
                    bind:value={searchQuery}
                    placeholder="Select ingredients from your pantry"
                    on:focus={() => (searchActive = true)}
                    class="w-full p-4 pr-12 rounded-md shadow-md border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500"
                />
                <button
                    on:click={searchRecipes}
                    class="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center justify-center"
                >
                    <svg
                        class="w-6 h-6 text-gray-500 hover:text-green-500"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="M15 15l5.5 5.5M19 11a8 8 0 10-8 8 8 8 0 008-8z"
                        />
                    </svg>
                </button>

                <!-- Dropdown for pantry items -->
                {#if searchActive}
                    <div
                        class="dropdown absolute top-full left-0 mt-2 bg-white shadow-md border border-gray-200 rounded-md w-full z-50 p-4"
                    >
                        <h3 class="font-bold mb-2">Select Ingredients</h3>
                        <ul>
                            {#each pantry as item, index (item.id ? item.id : index)}
                                <li class="flex items-center mb-2">
                                    <label class="flex items-center space-x-2">
                                        <input
                                            type="checkbox"
                                            bind:group={selectedIngredients}
                                            value={item.name}
                                            class="mr-2"
                                        />
                                        <span>{item.name}</span>
                                    </label>
                                </li>
                            {/each}
                        </ul>
                        <button
                            on:click={() => (searchActive = false)}
                            class="button-secondary mt-2">Close</button
                        >
                    </div>
                {/if}
            </div>
        </div>
    </div>

    <div class="expiring-ingredients-section mb-8 text-left">
        <h3 class="text-2xl font-semibold mb-4">Ingredients Expiring Soon</h3>
        <div class="flex items-center space-x-4">
            <!-- Left Arrow Button -->
            <button
                on:click={previousIngredients}
                class="p-2 rounded-full border border-gray-300 bg-white hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={currentIngredientIndex === 0}
            >
                <svg
                    class="w-4 h-4"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                >
                    <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M15 19l-7-7 7-7"
                    />
                </svg>
            </button>

            <!-- List of Ingredients -->
            <div class="flex items-center space-x-4 h-40 overflow-x-auto">
                {#each $nearestExpiringIngredients.slice(currentIngredientIndex, currentIngredientIndex + visibleIngredientCount) as item}
                    {#if (new Date(item.expiration_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24) <= 3}
                        <div
                            class="flex flex-col items-center space-y-2 min-h-[120px]"
                        >
                            <div
                                class="bg-gray-200 w-20 h-20 rounded-full flex items-center justify-center"
                            >
                                <img
                                    src="/fridge-solid-24.png"
                                    alt={item.name}
                                    class="w-12 h-12 object-cover"
                                />
                            </div>

                            <span class="text-gray-700 text-sm">{item.name}</span>
                            <span class="text-gray-500 text-xs">Weight: {item.quantity}g</span>
                            <span class="text-gray-500 text-xs">Expires: {item.expiration_date}</span>
                            <span
                                class="text-red-500 text-xs invisible"
                            >
                                Expiring today!
                            </span>

                            <span class="text-gray-700 text-sm"
                                >{item.name}</span
                            >

                            {#if (new Date(item.expiration_date).getTime() - new Date().getTime()) / (1000 * 60 * 60) <= 24}
                                <span class="text-red-500 text-xs absolute visible">Expiring today!</span>
                            {/if}
                        </div>
                    {/if}
                {/each}
            </div>
            

            <!-- Right Arrow Button -->
            <button
                on:click={nextIngredients}
                class="p-2 rounded-full border border-gray-300 bg-white hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={currentIngredientIndex + visibleIngredientCount >=
                    $nearestExpiringIngredients.length}
            >
                <svg
                    class="w-4 h-4"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                >
                    <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M9 5l7 7-7 7"
                    />
                </svg>
            </button>
        </div>
    </div>

    <!-- Recipes Section -->
    <div class="recipes-with-ingredients-section mb-8 text-left">
        <h3 class="text-2xl font-semibold mb-4">
            Recipes with your expiring ingredients:
        </h3>
        {#if recipes.length > 0}
            <div class="flex items-center space-x-4 overflow-x-auto">
                <button
                    on:click={previousRecipes1}
                    class="p-2 rounded-full border border-gray-300 bg-white hover:bg-gray-100"
                >
                    <svg
                        class="w-4 h-4"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="M15 19l-7-7 7-7"
                        />
                    </svg>
                </button>
                <div class="flex space-x-4">
                    {#each recipes.slice(currentRecipeIndex1, currentRecipeIndex1 + visibleRecipeCount) as recipe}
                        <div
                            class="recipe-card border p-4 rounded-lg text-center shadow-md w-40"
                        >
                            <img
                                src={recipe.strMealThumb}
                                alt={recipe.strMeal}
                                class="w-full h-24 object-cover rounded-md mb-2"
                                on:error={handleImageError}
                                on:click={() =>
                                    goToRecipeDetails(recipe.idMeal)}
                            />
                            <p class="font-semibold text-lg mb-2">
                                {recipe.strMeal}
                            </p>
                        </div>
                    {/each}
                </div>
                <button
                    on:click={nextRecipes1}
                    class="p-2 rounded-full border border-gray-300 bg-white hover:bg-gray-100"
                >
                    <svg
                        class="w-4 h-4"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="M9 5l7 7-7 7"
                        />
                    </svg>
                </button>
            </div>
        {:else}
            <p class="text-gray-600">
                No recipes found for your expiring ingredients. Try adding more
                items to your pantry.
            </p>
        {/if}
    </div>

    <!-- Seasonal Recipes Section -->
    <div class="recipes-with-ingredients-section mb-8 text-left">
        <h3 class="text-2xl font-semibold mb-4">Seasonal Recipes:</h3>
        <div class="flex items-center space-x-4 overflow-x-auto">
            <button
                on:click={previousRecipes2}
                class="p-2 rounded-full border border-gray-300 bg-white hover:bg-gray-100"
            >
                <svg
                    class="w-4 h-4"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                >
                    <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M15 19l-7-7 7-7"
                    />
                </svg>
            </button>
            <div class="flex space-x-4">
                {#each seasonalRecipes.slice(currentRecipeIndex2, currentRecipeIndex2 + visibleRecipeCount) as recipe}
                    <div
                        class="recipe-card border p-4 rounded-lg text-center shadow-md w-40"
                    >
                        <img
                            src={recipe.strMealThumb}
                            alt={recipe.strMeal}
                            class="w-full h-24 object-cover rounded-md mb-2"
                            on:error={handleImageError}
                            on:click={() => goToRecipeDetails(recipe.idMeal)}
                        />
                        <p class="font-semibold text-lg mb-2">
                            {recipe.strMeal}
                        </p>
                    </div>
                {/each}
            </div>
            <button
                on:click={nextRecipes2}
                class="p-2 rounded-full border border-gray-300 bg-white hover:bg-gray-100"
            >
                <svg
                    class="w-4 h-4"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                >
                    <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M9 5l7 7-7 7"
                    />
                </svg>
            </button>
        </div>
    </div>
</div>

<style>
    .dropdown {
        max-height: 200px;
        overflow-y: auto;
    }

    .container {
        max-width: 1200px;
    }

    .ingredient-item {
        width: 48px;
        height: 48px;
    }

    .recipe-card {
        width: 160px;
    }
</style>
