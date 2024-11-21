<script>
    import '../../app.css';

    // Recuperar las recetas favoritas desde localStorage
    import { onMount } from "svelte";

    let favoriteRecipes = []; // Lista de recetas favoritas

    onMount(() => {
        // Cargar las recetas favoritas desde localStorage
        const storedFavorites = JSON.parse(localStorage.getItem("favoriteRecipes")) || [];
        favoriteRecipes = storedFavorites;
    });

    function toggleFavorite(recipeName) {
        // Remover receta de favoritos
        favoriteRecipes = favoriteRecipes.filter(recipe => recipe.name !== recipeName);
        localStorage.setItem("favoriteRecipes", JSON.stringify(favoriteRecipes));
    }
</script>

<div class="w-full h-full bg-white p-8 font-[Kalam]">
    <!-- Encabezado -->
    <div class="text-center mb-8">
        <h1 class="text-green-900 text-5xl font-bold">Your Favorites</h1>
    </div>

    <!-- Lista de recetas favoritas -->
    <div class="text-center mb-8">
        <h2 class="text-black text-4xl mb-4">Favorite Recipes</h2>
        {#if favoriteRecipes.length > 0}
            <div class="flex justify-center gap-4 overflow-auto">
                {#each favoriteRecipes as recipe}
                    <div class="p-4 w-48 border border-gray-300 rounded-lg text-center">
                        <img
                            src={recipe.image}
                            alt="{recipe.name}"
                            class="w-full h-32 object-cover mb-2 rounded-md"
                        />
                        <p class="text-lg">{recipe.name}</p>
                        <button
                            class="text-red-500 text-2xl"
                            on:click={() => toggleFavorite(recipe.name)}
                        >
                            ❤️
                        </button>
                    </div>
                {/each}
            </div>
        {:else}
            <p class="text-lg text-gray-500">No favorites yet!</p>
        {/if}
    </div>
</div>

<style>
    h1,
    h2 {
        font-family: 'Kalam', cursive;
    }

    input::placeholder {
        font-style: italic;
        color: gray;
    }
</style>
