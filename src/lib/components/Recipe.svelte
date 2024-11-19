<script>
    import { onMount } from "svelte";

    // API Key and Recipe ID as variables
    const apiKey = "7e9812af07664d9cab95027605fc7484";

    let recipeId = "640803"; // Default recipe ID, can be updated dynamically
    let recipe = null;
    let error = null;

    onMount(async () => {
        try {
            const response = await fetch(
                `https://api.spoonacular.com/recipes/${recipeId}/information?includeNutrition=false&apiKey=${apiKey}`,
            );
            const result = await response.json();
            recipe = result;
        } catch (err) {
            error = "Failed to load recipe details.";
            console.error(err);
        }
    });

    // Helper function to split instructions into steps
    function getSteps(instructions) {
        return instructions.split(".").filter((step) => step.trim() !== "");
    }

    // Helper function to check if a step contains time-related keywords
    function containsTime(step) {
        return /\b(minutes?|hours?|seconds?|mins?)\b/i.test(step);
    }
</script>


{#if error}
    <p class="error">{error}</p>
{:else if !recipe}
    <p>Loading...</p>
{:else}
    <div class="container w-full mx-auto">
        <section class="flex flex-col lg:flex-row mt-5">
            <div class="basis-2/6 bg-gray-100 rounded-lg p-10 lg:mr-8">
                <img src={recipe.image} alt={recipe.title} />
            </div>
            <div class="basis-4/6 bg-gray-100 rounded-lg p-10 lg:mr-8">
                <h1 class="text-4xl mt-3 mb-3">{recipe.title}</h1>
                
                <div class="flex flex-wrap gap-2">
                    {#each recipe.dishTypes as type}
                        <span
                            class="bg-white border border-gray-300 text-black px-3 py-1 rounded-lg text-sm"
                            >{type}</span
                        >
                    {/each}
                </div>

                <h2 class="text-4xl mt-3 mb-3">Description</h2>
                <p>{@html recipe.summary}</p>

                <h2 class="text-4xl mt-3 mb-3">Ingredients</h2>
                <!-- <ul>
                    {#each recipe.extendedIngredients as ingredient}
                        <li>{ingredient.original}</li>
                    {/each}
                </ul> -->
                <p>
                    {#if recipe.extendedIngredients.length > 0}
                        {recipe.extendedIngredients.map(ingredient => ingredient.original).join(', ')}.
                    {:else}
                        No ingredients found.
                    {/if}
                </p>

                <h2 class="text-4xl mt-3 mb-3">Instructions</h2>
                {#each getSteps(recipe.instructions) as step, index (step)}
                    <div class="step">
                        <h3 class="text-xl">Step {index + 1}</h3>
                        <p>{step}.</p>
                        {#if containsTime(step)}
                            <p class="text-lg">⏰</p>
                        {/if}
                    </div>
                {/each}

            </div>
        </section>
    </div>
{/if}

<style>
    .error {
        color: red;
        font-weight: bold;
    }
</style>
