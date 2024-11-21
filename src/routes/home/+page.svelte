<script>
    import '../../app.css';

    let username = "username";
    let expiringIngredients = ["🥦", "🧀", "🫘", "🍞", "🧄", "🍌"];
    let expiringRecipes = [
        { name: "Asian bowl", image: "../../asian-bowl.jpg", favorite: true },
        { name: "Brunch", image: "../../brunch.jpg", favorite: false },
        { name: "Pancakes", image: "../../pancakes.jpg", favorite: false },
        { name: "Asian bowl", image: "../../asian-bowl.jpg", favorite: true },
        { name: "Brunch", image: "../../brunch.jpg", favorite: false },
        { name: "Pancakes", image: "../../pancakes.jpg", favorite: false },
        { name: "Asian bowl", image: "../../asian-bowl.jpg", favorite: true },
        { name: "Brunch", image: "../../brunch.jpg", favorite: false },
        { name: "Pancakes", image: "../../pancakes.jpg", favorite: false },
    ];
    let SeasonalRecipes = [
        { name: "Christmas Turkey", image: "../../xmas-turkey.jpg", favorite: false },
        { name: "Egg Punch", image: "../../egg-punch.jpg", favorite: true },
        { name: "Chocolate Nougat", image: "../../chocolate-nougat.jpg", favorite: true },
        { name: "Christmas Turkey", image: "../../xmas-turkey.jpg", favorite: false },
        { name: "Egg Punch", image: "../../egg-punch.jpg", favorite: true },
        { name: "Chocolate Nougat", image: "../../chocolate-nougat.jpg", favorite: true },
          { name: "Christmas Turkey", image: "../../xmas-turkey.jpg", favorite: false },
        { name: "Egg Punch", image: "../../egg-punch.jpg", favorite: true },
        { name: "Chocolate Nougat", image: "../../chocolate-nougat.jpg", favorite: true },
    ];

    import { onMount, onDestroy } from "svelte";

    onMount(() => {
        const storedFavorites = JSON.parse(localStorage.getItem("favoriteRecipes")) || [];
        for (const recipe of [...expiringRecipes, ...SeasonalRecipes]) {
            recipe.favorite = storedFavorites.some(fav => fav.name === recipe.name);
        }
    });

    function toggleFavorite(recipe) {
        recipe.favorite = !recipe.favorite;
        const allFavorites = [
            ...expiringRecipes.filter(r => r.favorite),
            ...SeasonalRecipes.filter(r => r.favorite),
        ];
        localStorage.setItem("favoriteRecipes", JSON.stringify(allFavorites));
    }

    function goToFavorites() {
        window.location.href = '/favorites';
    }

    let pantryIngredients = [
        "Carrots", "Cheese", "Shrimps", "Leeks", "Corn", "Lobster",
        "Cabbage", "Milk", "Avocado", "Mushrooms", "Flour", "Peanuts",
        "Banana", "Spinach", "Noodles", "Butter", "Fish"
    ];

    let selectedIngredients = new Set();

    function toggleIngredient(ingredient) {
        if (selectedIngredients.has(ingredient)) {
            selectedIngredients.delete(ingredient);
        } else {
            selectedIngredients.add(ingredient);
        }
    }

    let isDropdownVisible = false;

    function toggleDropdown() {
        isDropdownVisible = !isDropdownVisible;
    }

    function hideDropdown() {
        isDropdownVisible = false;
    }

    function handleDocumentClick(event) {
        const clickedInsideInput =
            event.target.closest(".search-bar") || event.target.closest(".dropdown");
        if (!clickedInsideInput) {
            hideDropdown();
        }
    }

    onMount(() => {
        document.addEventListener("click", handleDocumentClick);
    });

    onDestroy(() => {
        document.removeEventListener("click", handleDocumentClick);
    });
</script>

<div class="w-full min-h-screen bg-white p-4 sm:p-8 font-[Kalam] bg-cover bg-center relative" style="background-image: url('../../plants-background.jpg');">
    <!-- Bienvenida -->
    <div class="text-center mb-6 z-10 relative">
        <h1 class="text-green-900 text-3xl sm:text-5xl font-bold">Hello, {username}!</h1>
    </div>

    <!-- Leafs picture -->
    <img class="LeafBackgroundRemoved9 w-72 h-60 left-[-80.30px] top-[800px] absolute origin-top-left rotate-[0.0deg] rounded-xl" 
         src="../../../leaf-background2.png" 
         alt="Leaf Background" />

         <img class="LeafBackgroundRemoved9 w-72 h-60 right-[-90px] top-[250px] absolute origin-top-left rotate-[270deg] rounded-xl" 
         src="../../../leaf-background1.png" 
         alt="Leaf Background" />


    <!-- Barra de búsqueda alargada -->
    <div class="relative flex flex-col sm:flex-row items-center justify-center mb-6 z-10 relative">
        <div class="relative w-full sm:w-1/2 lg:w-1/3 search-bar">
            <div class="flex items-center">
                <input
                    type="text"
                    placeholder="Add ingredients/recipes"
                    class="w-full p-3 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    on:focus="{toggleDropdown}"
                />
                <span class="absolute left-3 text-gray-500 text-xl">🔍</span>
            </div>
            {#if isDropdownVisible}
                <div class="absolute top-12 left-0 z-10 w-full bg-white border border-gray-300 rounded-lg shadow-lg max-h-64 overflow-auto dropdown">
                    <h3 class="text-lg font-bold px-4 py-2 bg-gray-100">Your current pantry</h3>
                    <ul class="p-4 space-y-2">
                        {#each pantryIngredients as ingredient}
                            <li class="flex items-center">
                                <input
                                    type="checkbox"
                                    id="{ingredient}"
                                    class="mr-2"
                                    checked="{selectedIngredients.has(ingredient)}"
                                    on:change="{() => toggleIngredient(ingredient)}"
                                />
                                <label for="{ingredient}" class="cursor-pointer">{ingredient}</label>
                            </li>
                        {/each}
                    </ul>
                </div>
            {/if}
        </div>
        <button
            class="mt-4 sm:mt-0 sm:ml-4 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition"
            on:click="{goToFavorites}"
        >
            Favorites
        </button>
    </div>

    <!-- Ingredientes que expiran con navegación horizontal -->
    <div class="text-start mb-6 z-10 relative">
        <h2 class="text-green-800 text-2xl sm:text-4xl mb-4 sm:ml-60">Expiring ingredients</h2>
        <div class="mx-left max-w-screen-lg overflow-x-auto flex gap-4 justify-start sm:ml-60">
            {#each expiringIngredients as ingredient}
                <div class="flex-shrink-0 w-20 sm:w-24 border border-gray-300 rounded-lg p-4 text-center">
                    <p class="text-lg">{ingredient}</p>
                </div>
            {/each}
        </div>
    </div>

    <!-- Recetas que expiran con navegación horizontal -->
    <div class="text-start mb-6 z-10 relative">
        <h2 class="text-green-800 text-2xl sm:text-4xl mb-4 sm:ml-60">Expiring Ingredients Recipes</h2>
        <div class="mx-auto max-w-screen-xl overflow-x-auto flex gap-4 justify-start">
            {#each expiringRecipes as recipe}
                <div class="flex-shrink-0 w-40 sm:w-48 border border-gray-300 rounded-lg p-4 text-center">
                    <img
                        src={recipe.image}
                        alt="{recipe.name}"
                        class="w-full h-40 object-cover mb-2 rounded-md"
                    />
                    <p class="text-lg">{recipe.name}</p>
                    <button
                        class="text-red-500 text-2xl"
                        on:click="{() => toggleFavorite(recipe)}"
                    >
                        {recipe.favorite ? "❤️" : "🤍"}
                    </button>
                </div>
            {/each}
        </div>
    </div>

    <!-- Recetas de temporada con navegación horizontal -->
    <div class="text-start mb-6 z-10 relative">
        <h2 class="text-green-800 text-2xl sm:text-4xl mb-4 sm:ml-60">Seasonal Recipes</h2>
        <div class="mx-auto max-w-screen-xl overflow-x-auto flex gap-4 justify-start">
            {#each SeasonalRecipes as recipe}
                <div class="flex-shrink-0 w-40 sm:w-48 border border-gray-300 rounded-lg p-4 text-center">
                    <img
                        src={recipe.image}
                        alt="{recipe.name}"
                        class="w-full h-40 object-cover mb-2 rounded-md"
                    />
                    <p class="text-lg">{recipe.name}</p>
                    <button
                        class="text-red-500 text-2xl"
                        on:click="{() => toggleFavorite(recipe)}"
                    >
                        {recipe.favorite ? "❤️" : "🤍"}
                    </button>
                </div>
            {/each}
        </div>
    </div>
</div>
