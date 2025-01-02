<script lang="ts">
  import { authStore } from './../../../lib/stores/authStore.js';
  import { pantryStore } from './../../../lib/stores/pantryStore.js'; // Import pantry store
  import { goto } from "$app/navigation";

  let user_id = 1;
  authStore.subscribe((state) => {
    user_id = state.user?.id || 1;
  });

  // Fetch recipe data from props
  export let data;
  const { recipe } = data.props;

  let isFavorite = false;
  let countdowns: Countdown[] = [];
  let showModal = false;

  interface Countdown {
    time: number;
    interval: NodeJS.Timeout | null;
    input: number;
  }

  let pantry = [];

  // Filter ingredients in recipe that exist in pantry
  function getPantryIngredients() {
    return recipe.extendedIngredients.filter((ingredient) =>
      pantry.some((pantryItem) => pantryItem.name.toLowerCase() === ingredient.name.toLowerCase())
    );
  }

  let usedIngredients = {}; // Store the amount of ingredients used

  // Handle input change for ingredient usage
  function updateUsedIngredient(ingredientName: string, value: number) {
    usedIngredients = {
      ...usedIngredients,
      [ingredientName]: value,
    };
  }

  // Checking favorite status for recipe
  async function checkFavoriteStatus() {
    const response = await fetch(
      `http://localhost:3012/check-favorite/${recipe.id}?user_id=${user_id}`
    );
    if (response.ok) {
      const data = await response.json();
      isFavorite = data.isFavorite;
    }
  }

  checkFavoriteStatus();

  // Toggle favorite status
  export async function toggleFavorite() {
    if (isFavorite) {
      const response = await fetch(`http://localhost:3012/favorites/${recipe.id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id }),
      });
      if (response.ok) {
        isFavorite = false;
      }
    } else {
      const response = await fetch("http://localhost:3012/favorites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ recipe_id: recipe.id, user_id }),
      });
      if (response.ok) {
        isFavorite = true;
      }
    }
    checkFavoriteStatus();
  }

  function startCountdown(index: number, timeInSeconds: number) {
    if (timeInSeconds <= 0) return;

    if (!countdowns[index]) {
      countdowns[index] = {
        time: timeInSeconds,
        interval: null,
        input: timeInSeconds,
      };
    }

    if (countdowns[index]?.interval) {
      clearInterval(countdowns[index].interval);
    }

    countdowns[index].time = timeInSeconds;
    countdowns[index].interval = setInterval(() => {
      if (countdowns[index].time > 0) {
        countdowns[index].time -= 1;
        countdowns = [...countdowns];
      } else {
        clearInterval(countdowns[index].interval!);
        countdowns[index].interval = null;
        showTimeUpModal();
      }
    }, 1000);

    countdowns = [...countdowns];
  }

  function showTimeUpModal() {
    showModal = true;
  }

  function closeModal() {
    showModal = false;
  }

  // Function to split recipe instructions into individual steps
  function getSteps(instructions: string) {
  if (!instructions) return [];
  
  // Remove HTML tags from the instructions string
  instructions = instructions.replace(/<\/?[^>]+(>|$)/g, "");
  
  // Split by periods or newlines to create steps
  return instructions
    .split(/(?:\r?\n|\.\s*)/g)
    .filter((step) => step.trim().length > 0);
}

// Function to check if a step contains any time references
function containsTime(step: string) {
  return /(\d+)(?:\s*min|\s*sec|\s*hour)/i.test(step);
}


</script>

{#if recipe}
  <div class="container w-full mx-auto">
    <section class="flex flex-col lg:flex-row mt-5">
      <div class="basis-2/6 bg-gray-100 rounded-lg p-10 lg:mr-8">
        <img class="rounded-lg mb-5" src={recipe.image} alt={recipe.title} />
        <h2 class="text-4xl mt-3 mb-3">Ingredients in Your Pantry</h2>
        {#if getPantryIngredients().length > 0}
          <div>
            <ul>
              {#each getPantryIngredients() as ingredient}
                <li>
                  <span>{ingredient.original}</span>
                  <input
                    type="number"
                    min="0"
                    value={usedIngredients[ingredient.name] || ''}
                    on:input={(e) => updateUsedIngredient(ingredient.name, e.target.value)}
                    placeholder="Amount used"
                    class="border border-gray-300 rounded px-2 ml-4 w-32" />
                </li>
              {/each}
            </ul>
          </div>
        {:else}
          <p>No ingredients from this recipe are in your pantry.</p>
        {/if}

        <!-- CO2 Calculation Button -->
        <div class="recipe-card mt-3 p-4 bg-white border border-gray-300 rounded-lg text-center">
          <p class="text-lg font-semibold mb-4">
            If you finished this recipe, click below to calculate your CO2 reduction.
          </p>
          <button class="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600">
            Complete
          </button>
        </div>
      </div>

      <div class="basis-4/6 bg-gray-100 rounded-lg p-10 lg:mr-8">
        <h1 class="text-4xl mt-3 mb-3">
          {recipe.title}
          <img
            src={isFavorite ? "/solid-heart.png" : "/blank-heart.png"}
            alt="Favorite"
            class="inline-block w-6 h-6 cursor-pointer ml-3"
            on:click={toggleFavorite}
          />
        </h1>

        <div class="flex flex-wrap gap-2">
          {#each recipe.dishTypes as type}
            <span
              class="bg-white border border-gray-300 text-black px-3 py-1 rounded-lg text-sm"
              >{type}</span
            >
          {/each}
        </div>

        <h2 class="text-4xl mt-3 mb-3">Ingredients</h2>
        <div class="mb-5">
          <ul>
            {#each recipe.extendedIngredients as ingredient}
              <li>{ingredient.original}</li>
            {/each}
          </ul>
        </div>

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
                  placeholder="Min"
                  min="0"
                  value={countdowns[index]?.minutes || ""}
                  on:input={(e) => updateCountdownMinutes(index, e.target.value)}
                  class="border border-gray-300 rounded px-2 w-20"
                />
                <span>:</span>
                <input
                  type="number"
                  placeholder="Sec"
                  min="0"
                  max="59"
                  value={countdowns[index]?.seconds || ""}
                  on:input={(e) => updateCountdownSeconds(index, e.target.value)}
                  class="border border-gray-300 rounded px-2 w-20"
                />
                <button
                  on:click={() =>
                    startCountdown(
                      index,
                      (Number(countdowns[index]?.minutes || 0) * 60) +
                      Number(countdowns[index]?.seconds || 0)
                    )}
                  class="bg-blue-500 text-white px-3 py-1 rounded"
                >
                  Start
                </button>
                {#if countdowns[index] && countdowns[index].time !== null}
                  <p class="text-gray-700">
                    Time left: {Math.floor(countdowns[index].time / 60)}m
                    {countdowns[index].time % 60}s
                  </p>
                {:else if countdowns[index]?.minutes || countdowns[index]?.seconds}
                  <p class="text-gray-700">
                    Time left: {countdowns[index].minutes || 0}m
                    {countdowns[index]?.seconds || 0}s
                  </p>
                {:else}
                  <p class="text-gray-700">Time left: 0m 0s</p>
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
    <div class="fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg p-6 shadow-lg w-1/3 text-center">
        <h2 class="text-2xl font-bold mb-4">Time to Go!</h2>
        <p>You've completed this step! Ready for the next?</p>
        <button class="bg-blue-500 text-white px-4 py-2 rounded mt-4" on:click={closeModal}>
          Close
        </button>
      </div>
    </div>
  {/if}
{/if}

<style>
  /* Add your custom styles here */
</style>
