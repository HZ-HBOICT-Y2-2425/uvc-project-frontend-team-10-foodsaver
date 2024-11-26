<script>
    import '../../app.css';

    let username = "username"; // Variable dinámica para el nombre del usuario
    let expiringIngredients = ["🥦", "🧀", "🫘", "🍞", "🧄", "🍌"]; // Ejemplo de ingredientes
    let expiringRecipes = [
        { name: "Asian bowl", image: "../../asian-bowl.jpg", favorite: true },
        { name: "Brunch", image: "../../brunch.jpg", favorite: false },
        { name: "Pancakes", image: "../../pancakes.jpg", favorite: false },
    ];
    let SeasonalRecipes = [
        { name: "Christmas Turkey", image: "../../xmas-turkey.jpg", favorite: false },
        { name: "Egg Punch", image: "../../egg-punch.jpg", favorite: true },
        { name: "Chocolate Nougat", image: "../../chocolate-nougat.jpg", favorite: true },
    ];

    // Cargar favoritos desde localStorage al iniciar la aplicación
    onMount(() => {
        const storedFavorites = JSON.parse(localStorage.getItem("favoriteRecipes")) || [];
        // Marcar recetas en expiringRecipes y SeasonalRecipes como favoritas según localStorage
        for (const recipe of [...expiringRecipes, ...SeasonalRecipes]) {
            recipe.favorite = storedFavorites.some(fav => fav.name === recipe.name);
        }
    });

    // Actualizar localStorage cuando cambien los favoritos
    function toggleFavorite(recipe) {
        recipe.favorite = !recipe.favorite;

        // Actualizar el estado en localStorage
        const allFavorites = [
            ...expiringRecipes.filter(r => r.favorite),
            ...SeasonalRecipes.filter(r => r.favorite),
        ];
        localStorage.setItem("favoriteRecipes", JSON.stringify(allFavorites));
    }

    // Redirigir a la página de favoritos
    function goToFavorites() {
        window.location.href = '/favorites';
    }

    // Ingredientes de la despensa actual
    let pantryIngredients = [
        "Carrots", "Cheese", "Shrimps", "Leeks", "Corn", "Lobster",
        "Cabbage", "Milk", "Avocado", "Mushrooms", "Flour", "Peanuts",
        "Banana", "Spinach", "Noodles", "Butter", "Fish"
    ];

    let selectedIngredients = new Set(); // Conjunto para los ingredientes seleccionados

    function toggleIngredient(ingredient) {
        if (selectedIngredients.has(ingredient)) {
            selectedIngredients.delete(ingredient);
        } else {
            selectedIngredients.add(ingredient);
        }
    }

    // Manejar la visibilidad del dropdown
    let isDropdownVisible = false;

    function toggleDropdown() {
        isDropdownVisible = !isDropdownVisible;
    }

    function hideDropdown() {
        isDropdownVisible = false;
    }

    // Detectar clics fuera del dropdown y la barra de búsqueda
    function handleDocumentClick(event) {
        const clickedInsideInput =
            event.target.closest(".search-bar") || event.target.closest(".dropdown");
        if (!clickedInsideInput) {
            hideDropdown();
        }
    }

    // Añadir y quitar el evento de clic en el documento
    import { onMount, onDestroy } from "svelte";
    onMount(() => {
        document.addEventListener("click", handleDocumentClick);
    });

    onDestroy(() => {
        document.removeEventListener("click", handleDocumentClick);
    });
</script>

<div class="w-full h-full bg-white p-8 font-[Kalam]">
    <!-- Encabezado -->
    <div class="text-center mb-8">
        <h1 class="text-green-900 text-5xl font-bold">Hello, "{username}"!</h1>
    </div>

    <!-- Barra de búsqueda -->
    <div class="relative flex items-center justify-center mb-8">
        <div class="relative flex flex-col w-full max-w-md search-bar">
            <div class="flex items-center">
                <input
                    type="text"
                    placeholder="Add ingredients/recipes"
                    class="flex-grow p-2 pl-10 border border-gray-400 rounded-lg"
                    on:focus="{toggleDropdown}"
                />
                <span class="absolute left-3 text-gray-500 text-xl">🔍</span>
            </div>
            {#if isDropdownVisible}
                <div
                    class="absolute top-12 left-0 z-10 w-full bg-white border border-gray-300 rounded-lg shadow-lg max-h-64 overflow-auto dropdown"
                >
                    <h3 class="text-lg font-bold px-4 py-2 bg-gray-100">Your current pantry</h3>
                    <ul class="p-4">
                        {#each pantryIngredients as ingredient}
                            <li class="flex items-center mb-2">
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
            class="ml-4 px-4 py-2 bg-green-500 text-white rounded-lg"
            on:click="{goToFavorites}"
        >
            Favorites
        </button>
    </div>

    <!-- Ingredientes que están por expirar -->
    <div class="text-center mb-8">
        <h2 class="text-black text-4xl mb-4">Expiring ingredients</h2>
        <div class="flex justify-center gap-4">
            {#each expiringIngredients as ingredient}
                <div class="w-12 h-12 flex items-center justify-center bg-zinc-300 rounded-full text-3xl">
                    {ingredient}
                </div>
            {/each}
        </div>
    </div>

    <!-- Recetas con los ingredientes -->
    <div class="text-center mb-8">
        <h2 class="text-black text-4xl mb-4">Recipes with your expiring ingredients:</h2>
        <div class="flex justify-center gap-4 overflow-auto">
            {#each expiringRecipes as recipe}
                <div class="p-4 w-48 border border-gray-300 rounded-lg text-center">
                    <img
                        src={recipe.image}
                        alt="{recipe.name}"
                        class="w-full h-32 object-cover mb-2 rounded-md"
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

    <!-- Recetas de temporada -->
    <div class="text-center mb-8">
        <h2 class="text-black text-4xl mb-4">Seasonal Recipes</h2>
        <div class="flex justify-center gap-4 overflow-auto">
            {#each SeasonalRecipes as recipe}
                <div class="p-4 w-48 border border-gray-300 rounded-lg text-center">
                    <img
                        src={recipe.image}
                        alt="{recipe.name}"
                        class="w-full h-32 object-cover mb-2 rounded-md"
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