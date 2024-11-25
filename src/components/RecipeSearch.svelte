<script lang="ts">
    import { pantry } from "../lib/stores/pantryStore";
    import { goto } from "$app/navigation";

    let searchQuery = "";
    let searchActive = false;
    let selectedIngredients: string[] = [];

    const recipes = [
        "Asian bowl",
        "Brunch",
        "Pancakes",
        "Spaghetti",
        "Salad",
        "Tacos",
        "Curry",
        "Stew",
        "Pizza",
        "Soup",
    ];
    const visibleRecipeCount = 6;

    let currentRecipeIndex1 = 0;
    let currentRecipeIndex2 = 0;

    // Trigger search function
    const searchRecipes = () => {
        if (!selectedIngredients.length) {
            alert(
                "Please select at least one ingredient to search for recipes.",
            );
        } else {
            const ingredientsParam = selectedIngredients.join(",");
            goto(`/search?ingredients=${ingredientsParam}`);
        }
    };

    // Fallback for broken image
    const handleImageError = (event: Event) => {
        const img = event.target as HTMLImageElement;
        img.src = "/images/placeholder.png";
    };

    // Recipe navigation functions for first section
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

    // Recipe navigation functions for second section
    const previousRecipes2 = () => {
        if (currentRecipeIndex2 > 0) {
            currentRecipeIndex2 -= 1;
        }
    };

    const nextRecipes2 = () => {
        if (currentRecipeIndex2 + visibleRecipeCount < recipes.length) {
            currentRecipeIndex2 += 1;
        }
    };
</script>

<div class="container mx-auto mt-8 px-4 lg:px-6 text-center">
    <h2 class="text-3xl font-bold text-green-800 italic mb-6">
        Hello, "username"!
    </h2>

    <!-- Search Bar Section -->
    <div class="search-bar-container flex items-center justify-center w-full relative mb-8">
        <div class="relative flex-grow max-w-2xl">
            <div class="relative">
                <input
                    type="text"
                    bind:value={searchQuery}
                    placeholder="Add ingredients/recipes"
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
                <div class="dropdown absolute top-full left-0 mt-2 bg-white shadow-md border border-gray-200 rounded-md w-full z-50 p-4">
                    <h3 class="font-bold mb-2">Select Ingredients</h3>
                    <ul>
                        {#each $pantry as item}
                        <li class="flex items-center mb-2">
                            <label class="flex items-center space-x-2">
                                <input
                                    type="checkbox"
                                    bind:group={selectedIngredients}
                                    value={item}
                                    class="mr-2"
                                />
                                <span>{item}</span>
                            </label>
                        </li>
                        {/each}
                    </ul>
                    <button
                        on:click={() => (searchActive = false)}
                        class="button-secondary mt-2 px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 focus:outline-none"
                    >
                        Close
                    </button>
                </div>
                {/if}
            </div>
        </div>

        <!-- Favourites Button -->
        <div class="ml-4">
            <button
                class="px-6 py-3 bg-green-500 text-white rounded-md hover:bg-green-600 focus:outline-none focus:ring focus:ring-green-300"
                on:click={() => goto("/favorite")}
            >
                Favourites
            </button>
        </div>
    </div>

    <!-- Expiring Ingredients Section -->
    <div class="expiring-ingredients-section mb-8 text-left">
        <h3 class="text-2xl font-semibold mb-4">Expiring Ingredients</h3>
        <div class="flex items-center space-x-4 overflow-x-auto">
            <button
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
                {#each ["Broccoli", "Cheese", "Beans", "Bread", "Garlic", "Banana"] as ingredient}
                    <div
                        class="ingredient-item w-12 h-12 rounded-full shadow-md flex items-center justify-center bg-gray-100"
                    >
                        <img
                            src={`/images/${ingredient.toLowerCase()}.png`}
                            alt={ingredient}
                            class="w-8 h-8"
                            on:error={handleImageError}
                        />
                    </div>
                {/each}
            </div>
            <button
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


   <!-- Leafs picture -->
   <img class="LeafBackgroundRemoved9 w-72 h-60 left-[-80.30px] top-[800px] absolute origin-top-left rotate-[0.0deg] rounded-xl" 
   src="../../../leaf-background2.png" 
   alt="Leaf Background" />

   <img class="LeafBackgroundRemoved9 w-72 h-60 right-[-90px] top-[250px] absolute origin-top-left rotate-[270deg] rounded-xl" 
   src="../../../leaf-background1.png" 
   alt="Leaf Background" />


    <!-- Recipes Section -->
    <div class="recipes-with-ingredients-section mb-8 text-left">
        <h3 class="text-2xl font-semibold mb-4">
            Recipes with Your Expiring Ingredients:
        </h3>
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
                            src="/images/recipe_placeholder.png"
                            alt={recipe}
                            class="w-full h-24 object-cover rounded-md mb-2"
                            on:error={handleImageError}
                        />
                        <p class="font-semibold text-lg mb-2">{recipe}</p>
                        <button
                            class="mt-2 bg-white hover:bg-red-500 hover:text-white border border-red-500 rounded-full p-2"
                        >
                            <i class="fas fa-heart"></i>
                        </button>
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
    </div>
    <div class="recipes-with-ingredients-section mb-8 text-left">
        <h3 class="text-2xl font-semibold mb-4">
            Recipes with Your Expiring Ingredients:
        </h3>
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
                            src="/images/recipe_placeholder.png"
                            alt={recipe}
                            class="w-full h-24 object-cover rounded-md mb-2"
                            on:error={handleImageError}
                        />
                        <p class="font-semibold text-lg mb-2">{recipe}</p>
                        <button
                            class="mt-2 bg-white hover:bg-red-500 hover:text-white border border-red-500 rounded-full p-2"
                        >
                            <i class="fas fa-heart"></i>
                        </button>
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
