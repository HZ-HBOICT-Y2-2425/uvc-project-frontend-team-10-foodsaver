<script lang="ts">
    import { onMount } from "svelte";
    import { goto } from "$app/navigation";

    let favoriteRecipeIds = [];
    let recipes = [];

    // get all favorite recipes' IDs
    async function fetchFavoriteRecipeIds() {
        const response = await fetch(
            "http://localhost:3012/favorite-recipe-ids",
        );
        if (response.ok) {
            favoriteRecipeIds = await response.json();
            // using recipes' IDs to fetch recipe
            fetchRecipes();
        } else {
            console.error("Failed to fetch favorite recipe IDs");
        }
    }

    // fetch recipe details
    async function fetchRecipes() {
        const apiKey = "4b94021e0008460490fb26e12c8ec0f0";
        const requests = favoriteRecipeIds.map((id) =>
            fetch(
                `https://api.spoonacular.com/recipes/${id}/information?apiKey=${apiKey}`,
            ),
        );

        const responses = await Promise.all(requests);

        const recipesData = await Promise.all(
            responses.map((response) => response.json()),
        );

        recipes = recipesData;
    }

    onMount(fetchFavoriteRecipeIds);

    // jump to recipe details page
    function goToRecipeDetails(recipeId: number) {
        goto(`/recipe/${recipeId}`);
    }
</script>

<!-- Main Content -->
<div class="container mx-auto mt-6 p-6">
    <h1 class="text-3xl font-bold mb-6">Your Favorite Recipes</h1>

    <!-- Display Recipes -->
    {#if recipes.length > 0}
        <div
            class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
        >
            {#each recipes as recipe}
                <div
                    class="recipe-card border p-4 rounded-lg text-center shadow hover:shadow-lg transition-all"
                >
                    <img
                        src={recipe.image}
                        alt={recipe.title}
                        class="w-full h-32 object-cover rounded-md mb-2"
                    />
                    <p class="font-semibold text-lg">{recipe.title}</p>
                    <button
                        class="mt-2 bg-white hover:bg-red-500 hover:text-white border border-red-500 rounded-full p-2"
                        on:click={() => goToRecipeDetails(recipe.id)}
                    >
                        <i class="fas fa-heart"></i>
                    </button>
                </div>
            {/each}
        </div>
    {:else}
        <p>Loading your favorite recipes...</p>
    {/if}
</div>

<style>
    .container {
        max-width: 1200px;
    }

    .recipe-card {
        border: 1px solid #ddd;
        padding: 1rem;
        border-radius: 8px;
        text-align: center;
    }

    .recipe-card img {
        width: 100%;
        height: 200px;
        object-fit: cover;
        border-radius: 8px;
    }

    .recipe-card p {
        margin-top: 1rem;
        font-weight: bold;
        font-size: 1.2rem;
    }

    .recipe-card button {
        margin-top: 1rem;
    }
</style>
