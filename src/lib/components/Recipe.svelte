<script>
    import { onMount } from "svelte";

    const apiKey = "7e9812af07664d9cab95027605fc7484";
    let recipeId = "640803";
    let recipe = null;
    let error = null;

    let countdowns = [];
    let showModal = false; // Control modal visibility

    onMount(async () => {
        try {
            const response = await fetch(
                `https://api.spoonacular.com/recipes/${recipeId}/information?includeNutrition=false&apiKey=${apiKey}`,
            );
            const result = await response.json();
            recipe = result;
            countdowns = new Array(getSteps(recipe.instructions).length).fill({
                time: null,
                input: "",
            });
        } catch (err) {
            error = "Failed to load recipe details.";
            console.error(err);
        }
    });

    function getSteps(instructions) {
        return instructions.split(".").filter((step) => step.trim() !== "");
    }

    function containsTime(step) {
        return /\b(minutes?|hours?|seconds?|mins?)\b/i.test(step);
    }

    function startCountdown(index, timeInSeconds) {
        if (countdowns[index]?.interval)
            clearInterval(countdowns[index].interval);

        let time = timeInSeconds;
        const interval = setInterval(() => {
            countdowns = countdowns.map((cd, i) =>
                i === index ? { ...cd, time: --time } : cd,
            );
            if (time <= 0) {
                clearInterval(interval);
                showTimeUpModal(); // Show modal when time is up
            }
        }, 1000);

        countdowns = countdowns.map((cd, i) =>
            i === index ? { time, interval } : cd,
        );
    }

    function updateCountdownInput(index, value) {
        countdowns = countdowns.map((cd, i) =>
            i === index ? { ...cd, input: value } : cd,
        );
    }

    function showTimeUpModal() {
        showModal = true;
    }

    function closeModal() {
        showModal = false;
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

                <h2 class="text-4xl mt-3 mb-3">Ingredients</h2>
                <p>
                    {#if recipe.extendedIngredients.length > 0}
                        {recipe.extendedIngredients
                            .map((ingredient) => ingredient.original)
                            .join(", ")}.
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
                            <div class="flex items-center gap-2 mt-2">
                                <span class="text-lg">⏰</span>
                                <input
                                    type="number"
                                    placeholder="Enter time (s)"
                                    value={countdowns[index]?.input || ""}
                                    on:input={(e) =>
                                        updateCountdownInput(
                                            index,
                                            e.target.value,
                                        )}
                                    class="border border-gray-300 rounded px-2 w-36"
                                />
                                <button
                                    on:click={() =>
                                        startCountdown(
                                            index,
                                            Number(
                                                countdowns[index]?.input || 0,
                                            ),
                                        )}
                                    class="bg-blue-500 text-white px-3 py-1 rounded"
                                >
                                    Start
                                </button>
                                {#if countdowns[index]?.time !== null}
                                    <p class="text-gray-700">
                                        Time left: {countdowns[index].time}s
                                    </p>
                                {/if}
                            </div>
                        {/if}
                    </div>
                {/each}
            </div>
        </section>
    </div>

    <!-- Modal for Time Up -->
    {#if showModal}
        <div
            class="fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center z-50"
        >
            <div class="bg-white rounded-lg p-6 shadow-lg w-1/3 text-center">
                <h2 class="text-2xl font-bold mb-4">Time to Go!</h2>
                <p>You can move to the next step.</p>
                <div class="mt-4 flex justify-center gap-4">
                    <button
                        on:click={closeModal}
                        class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                    >
                        OK
                    </button>
                </div>
                <button
                    on:click={closeModal}
                    class="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
                >
                    ×
                </button>
            </div>
        </div>
    {/if}
{/if}

<style>
    .error {
        color: red;
        font-weight: bold;
    }

    .fixed {
        position: fixed;
    }

    .inset-0 {
        top: 0;
        right: 0;
        bottom: 0;
        left: 0;
    }

    .bg-opacity-50 {
        background-color: rgba(0, 0, 0, 0.5);
    }

    .rounded-lg {
        border-radius: 0.5rem;
    }

    .shadow-lg {
        box-shadow: 0 10px 15px rgba(0, 0, 0, 0.1);
    }

    .z-50 {
        z-index: 50;
    }
</style>
