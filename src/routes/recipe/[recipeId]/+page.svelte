<script lang="ts">
  import { authStore } from "./../../../lib/stores/authStore.js";
  import { goto } from "$app/navigation";
  import { pantryStore } from "./../../../lib/stores/pantryStore"; // Import pantry store
  import { searchedIngredients } from "./../../../lib/stores/ingredientStore.js";
  import { writable } from "svelte/store";
  import { onMount, onDestroy } from "svelte";

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
  let pantry = [];
  let showIngredientModal = writable<boolean>(false);
  let currentStepIndex = writable<number | null>(null);
  let name = writable<string>("");
  let amountUsed = writable<number>(0);
  let measurementUnit = writable<string>("grams");
  let selectedIngredient = writable<string>("");
  let selectedIngredientOriginal = writable<string>("");
  let selectedMeasurement = writable<string>("");
  let ingredient = writable<string>("");
  let selectedIngredients: { [key: string]: { amount: number, measurement: string } } = {}; // Initialize selectedIngredients
  let amount = writable<number>(0);

  interface Countdown {
    time: number;
    interval: NodeJS.Timeout | null;
    input: number;
  }

  // Subscribe to the pantry store to get pantry data
  const unsubscribe = pantryStore.subscribe((data) => {
    pantry = data;
  });

  onDestroy(() => {
    // Unsubscribe to avoid memory leaks
    unsubscribe();
  });

  // Fetch pantry items from backend when component mounts
  onMount(() => {
    fetchPantryItems();
  });

  async function fetchPantryItems() {
    try {
      const response = await fetch(
        `http://localhost:4010/pantry?user_id=${user_id}`,
      );
      const data = await response.json();
      if (response.ok) {
        pantry = data;
        pantryStore.set(pantry);
      } else {
        console.error("Error fetching pantry items:", data.error);
      }
    } catch (error) {
      console.error("Error fetching pantry items:", error);
    }
  }

  const saveUsedAmount = (): void => {
    const selectedIngredientValue = $selectedIngredient; // Get the value of selectedIngredient
    selectedIngredients[selectedIngredientValue] = {
      amount: $amountUsed,
      measurement: $measurementUnit,
    };

    // Close the form
    showIngredientModal.set(false);
  };

  const updateAllIngredients = async (): Promise<void> => {
    try {
      for (const [ingredientName, details] of Object.entries(selectedIngredients)) {
        const updateItem = {
          name: ingredientName,
          quantity: pantry.find(item => item.name === ingredientName)?.quantity - details.amount,
          measurement: details.measurement,
          user_id: user_id, // Automatically associate the logged-in user
        };

        const response = await fetch(
          `http://localhost:4010/pantry/update/${encodeURIComponent(ingredientName)}?user_id=${user_id}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(updateItem),
          },
        );

        const data = await response.json();

        if (response.ok) {
          console.log("Ingredient updated successfully:", data);
        } else {
          console.error("Error updating ingredient:", data.error);
        }
      }

      fetchPantryItems(); // Reload pantry items
      selectedIngredients = {}; // Reset selected ingredients
    } catch (error) {
      console.error("Error updating ingredients:", error);
    }
  };

  // Checking favorite status for recipe
  async function checkFavoriteStatus() {
    const response = await fetch(
      `http://localhost:3012/check-favorite/${recipe.id}?user_id=${user_id}`,
    );
    if (response.ok) {
      const data = await response.json();
      isFavorite = data.isFavorite;
    }
  }

  checkFavoriteStatus();

  const openIngredientModal = (item) => {
    selectedIngredient.set(item.name);
    amount.set(0);
    selectedMeasurement.set(item.measurement);
    showIngredientModal.set(true);
  };

  // Toggle favorite status
  export async function toggleFavorite() {
    if (isFavorite) {
      const response = await fetch(
        `http://localhost:3012/favorites/${recipe.id}`,
        {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ user_id }),
        },
      );
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

  function updateCountdownMinutes(index: number, minutes: string) {
    const value = parseInt(minutes, 10);
    if (!isNaN(value)) {
      countdowns[index] = {
        ...countdowns[index],
        minutes: value,
      };
    }
  }

  function updateCountdownSeconds(index: number, seconds: string) {
    const value = parseInt(seconds, 10);
    if (!isNaN(value)) {
      countdowns[index] = {
        ...countdowns[index],
        seconds: value,
      };
    }
  }

  let ingredients = [];
  searchedIngredients.subscribe((items) => {
    ingredients = items;
  });

  let message = "No ingredients from this recipe are in your pantry.";
</script>

{#if recipe}
  <div class="container w-full mx-auto px-4">
    <section class="flex flex-col lg:flex-row mt-5">
      <div
        class="basis-full lg:basis-2/6 bg-gray-100 rounded-lg p-4 lg:p-10 lg:mr-8 mb-4 lg:mb-0"
      >
        <img
          class="rounded-lg mb-5 w-full"
          src={recipe.image}
          alt={recipe.title}
        />
        <h2 class="text-2xl lg:text-4xl mt-3 mb-3">
          Ingredients in Your Pantry
        </h2>

        <!-- Button to add amount used -->
        <button
          class="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 w-full mb-4"
          on:click={() => showIngredientModal.set(true)}
        >
          Add Amount Used
        </button>

        <!-- Display selected ingredient details -->
        {#each Object.entries(selectedIngredients) as [ingredientName, details]}
          <div class="bg-white p-4 rounded-lg shadow-md mb-4">
            <p class="text-lg font-semibold">Selected Ingredient:</p>
            <p>Name: {ingredientName}</p>
            <p>Amount Used: {details.amount} {details.measurement}</p>
          </div>
        {/each}

        <!-- CO2 Calculation Button -->
        <div
          class="recipe-card mt-3 p-4 bg-white border border-gray-300 rounded-lg text-center"
        >
          <p class="text-lg font-semibold mb-4">
            If you finished this recipe, click below to calculate your CO2
            reduction.
          </p>
          <button
            class="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 w-full"
            on:click={updateAllIngredients}
          >
            Complete
          </button>
        </div>
      </div>

      <!-- Recipe details and instructions -->
      <div class="basis-full lg:basis-4/5 bg-gray-100 rounded-lg p-4 lg:p-10">
        <h1 class="text-2xl lg:text-4xl mt-3 mb-3">
          {recipe.title}
          <img
            src={isFavorite ? "/solid-heart.png" : "/blank-heart.png"}
            alt="Favorite"
            class="inline-block w-6 h-6 cursor-pointer ml-3"
            on:click={toggleFavorite}
          />
        </h1>

        <div class="flex flex-wrap gap-2 mb-4">
          {#each recipe.dishTypes as type}
            <span
              class="bg-white border border-gray-300 text-black px-3 py-1 rounded-lg text-sm"
              >{type}</span
            >
          {/each}
        </div>

        <h2 class="text-2xl lg:text-4xl mt-3 mb-1">Ingredients</h2>
        <div class="mb-5">
          <ul>
            {#each recipe.extendedIngredients as ingredient}
              <li>{ingredient.original}</li>
            {/each}
          </ul>
        </div>

        <h2 class="text-2xl lg:text-4xl mt-3 mb-1">Instructions</h2>
        <p class="mb-1 text-gray-500 text-sm">
          (Make sure to input the amount of ingredients used after every step so
          we can calculate how much CO2 and money you have saved.)
        </p>
        {#each getSteps(recipe.instructions) as step, index (step)}
          <div class="step flex flex-col lg:flex-row items-start gap-4 mb-4">
            <div class="flex items-left">
              <h3 class="text-lg lg:text-xl">Step {index + 1}</h3>
            </div>
            <div class="flex-2 text-left">
              <p class="mt-2">{step}.</p>

              {#if containsTime(step)}
                <div class="flex-3 items-left gap-2 mt-2 justify-end">
                  <span class="text-lg">⏰</span>
                  <input
                    type="number"
                    placeholder="Min"
                    min="0"
                    value={countdowns[index]?.minutes || ""}
                    on:input={(e) =>
                      updateCountdownMinutes(index, e.target.value)}
                    class="border border-gray-300 rounded px-2 w-20"
                  />
                  <span>:</span>
                  <input
                    type="number"
                    placeholder="Sec"
                    min="0"
                    max="59"
                    value={countdowns[index]?.seconds || ""}
                    on:input={(e) =>
                      updateCountdownSeconds(index, e.target.value)}
                    class="border border-gray-300 rounded px-2 w-20"
                  />
                  <button
                    on:click={() =>
                      startCountdown(
                        index,
                        Number(countdowns[index]?.minutes || 0) * 60 +
                          Number(countdowns[index]?.seconds || 0),
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
            <div class="flex-1">
              {#if selectedIngredients[index]}
                <p class="mt-2 text-green-600">
                  Used: {selectedIngredients[index].name}, {selectedIngredients[ index ].amount} {selectedIngredients[index].measurement}
                </p>
              {/if}
            </div>
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
      <div
        class="bg-white rounded-lg p-6 shadow-lg w-11/12 md:w-1/3 text-center"
      >
        <h2 class="text-2xl font-bold mb-4">Time to Go!</h2>
        <p>You've completed this step! Ready for the next?</p>
        <button
          class="bg-blue-500 text-white px-4 py-2 rounded mt-4"
          on:click={closeModal}
        >
          Close
        </button>
      </div>
    </div>
  {/if}

  <!-- Modal for Ingredient Selection -->
  {#if $showIngredientModal}
    <div
      class="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50"
    >
      <div class="bg-white p-6 rounded-lg shadow-lg w-11/12 md:max-w-md">
        <h2 class="text-2xl font-bold text-green-600 mb-4">
          Select an Ingredient and an Amount Used
        </h2>
        <div class="mb-4">
          <select
            bind:value={$selectedIngredient}
            class="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:outline-none"
          >
            <option value="">Select an ingredient</option>
            {#each pantry as ingredient}
              <option value={ingredient.name}>{ingredient.name}</option>
            {/each}
          </select>
        </div>
        <div class="mb-4">
          <input
            type="number"
            bind:value={$amountUsed}
            class="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:outline-none"
          />Amount
        </div>
        <div class="mb-4">
          <select
            bind:value={$measurementUnit}
            class="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:outline-none"
          >
            <option value="grams">Grams</option>
            <option value="milliliters">Milliliters</option>
            <option value="pieces">Pieces</option>
          </select>Measurement
        </div>
        <div class="flex justify-end space-x-4">
          <button
            on:click={() => showIngredientModal.set(false)}
            class="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600"
          >
            Cancel
          </button>
          <button
            on:click={saveUsedAmount}
            class="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  {/if}
{/if}

<style>
  /* Add your custom styles here */
  .step {
    margin-bottom: 1.5rem;
  }
</style>
